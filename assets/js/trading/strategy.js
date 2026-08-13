/*
 * Strategy Engine — the AI / agent control surface.
 *
 * Design principle from the spec: AI actions must NEVER execute raw natural
 * language. Every decision is a small, validated JSON object that is forced
 * through the risk layer (RiskEngine.validateOrder) before any order hits the
 * trading engine. A future external model (OpenAI-compatible / DeepSeek / Qwen /
 * Claude / LiteLLM) plugs in via setDecisionProvider() and returns the SAME
 * structured shape — nothing else is ever executed.
 *
 * Browser global (window.Strategy) + Node require().
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Strategy = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var G = (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : this);
  var MAX_ORDER_KEY = 'maxOrderUsd';

  // ---- Manual: no autonomous decisions ----
  function ManualStrategy() {
    return {
      name: 'manual',
      decide: function () { return null; }
    };
  }

  // ---- Rule-based momentum (deterministic, demo-friendly) ----
  function RuleBasedStrategy(opts) {
    opts = opts || {};
    var up = opts.upThreshold != null ? opts.upThreshold : 0.12;   // % change to enter
    var down = opts.downThreshold != null ? opts.downThreshold : -0.12; // % change to exit
    var alloc = opts.alloc != null ? opts.alloc : 0.25;             // fraction of cash per buy
    return {
      name: 'rule-based',
      decide: function (ctx) {
        var sym = ctx.symbol;
        var price = ctx.price;
        var pos = ctx.portfolio.positions[sym];
        var hasPos = pos && pos.qty > 0;
        var cash = ctx.portfolio.cash;
        var maxOrder = (ctx.config && ctx.config[MAX_ORDER_KEY]) || 500;

        if (!hasPos) {
          if (ctx.changePct > up && cash > 1) {
            var amt = Math.min(maxOrder, cash * alloc);
            if (amt < 1) return { action: 'HOLD' };
            return { action: 'BUY', symbol: sym, amount_usd: round2(amt), reason: 'Positive short-term momentum' };
          }
          return { action: 'HOLD' };
        }
        // In position: exit on reversal or small profit target
        if (ctx.changePct < down || price >= pos.avgPrice * 1.008) {
          return { action: 'SELL', symbol: sym, qty: pos.qty, reason: ctx.changePct < down ? 'Momentum reversal' : 'Profit target reached' };
        }
        return { action: 'HOLD' };
      }
    };
  }

  // ---- AI strategy (structured-JSON only) ----
  function AIStrategy(opts) {
    opts = opts || {};
    var provider = opts.provider || null; // async (ctx) => decisionJSON
    var fallback = RuleBasedStrategy(opts);
    return {
      name: 'ai',
      setDecisionProvider: function (fn) { provider = fn; },
      getDecisionProvider: function () { return provider; },
      decide: function (ctx) {
        if (!provider) {
          var d = fallback.decide(ctx);
          if (d.action !== 'HOLD') d.reason = (d.reason || '') + ' (AI provider not configured — fallback rule)';
          return d;
        }
        // Provider is invoked by the caller (async). This sync path returns HOLD
        // and the async path (applyAIDecision) handles the real call.
        return { action: 'HOLD', _async: true };
      },
      // Async decision path used by the UI for AI mode.
      decideAsync: function (ctx) {
        if (!provider) {
          var d = fallback.decide(ctx);
          if (d.action !== 'HOLD') d.reason = (d.reason || '') + ' (AI provider not configured — fallback rule)';
          return Promise.resolve(d);
        }
        return Promise.resolve(provider(ctx)).then(function (raw) {
          return normalizeDecision(raw, ctx);
        });
      }
    };
  }

  function normalizeDecision(raw, ctx) {
    if (!raw || typeof raw !== 'object') return { action: 'HOLD' };
    var action = (raw.action || '').toUpperCase();
    if (action !== 'BUY' && action !== 'SELL') return { action: 'HOLD' };
    var d = { action: action, symbol: raw.symbol || ctx.symbol, reason: raw.reason || 'AI decision' };
    if (raw.amount_usd != null) d.amount_usd = Number(raw.amount_usd);
    if (raw.qty != null) d.qty = Number(raw.qty);
    return d;
  }

  /*
   * applyDecision — the ONLY bridge from a strategy/AI decision to the engine.
   * Validates structure, builds the order, and relies on TradingEngine's risk
   * gate. Returns { ok, executed, trade?, state?, reason? }.
   */
  function applyDecision(state, decision, ctx) {
    if (!decision) return { ok: true, executed: false, state: state };
    var action = (decision.action || '').toUpperCase();
    if (action === 'HOLD' || !action) return { ok: true, executed: false, state: state };

    var sym = decision.symbol || ctx.symbol;
    if (sym !== ctx.symbol) {
      // This simulator trades the active market only; ignore cross-symbol calls.
      return { ok: false, executed: false, reason: 'CROSS_SYMBOL_IGNORED', state: state };
    }
    var price = ctx.priceMap[sym];
    if (!(price > 0)) return { ok: false, executed: false, reason: 'NO_PRICE', state: state };

    var order = {
      symbol: sym, side: action, price: price, priceTs: ctx.now,
      source: decision.source || 'strategy', reason: decision.reason || (decision.source || 'strategy')
    };
    if (decision.qty != null) order.qty = Number(decision.qty);
    else if (decision.amount_usd != null) order.amountUsd = Number(decision.amount_usd);
    else return { ok: false, executed: false, reason: 'NO_QTY_OR_AMOUNT', state: state };

    if (!G.TradingEngine) return { ok: false, executed: false, reason: 'ENGINE_MISSING', state: state };
    var res = G.TradingEngine.executeOrder(state, order, ctx);
    if (res.ok) return { ok: true, executed: true, trade: res.trade, state: res.state, realized: res.realized };
    return { ok: false, executed: false, reason: res.reason, state: state };
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  return {
    ManualStrategy: ManualStrategy,
    RuleBasedStrategy: RuleBasedStrategy,
    AIStrategy: AIStrategy,
    applyDecision: applyDecision,
    normalizeDecision: normalizeDecision
  };
});
