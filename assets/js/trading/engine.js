/*
 * Trading Engine — pure, deterministic, framework-free.
 *
 * No React, no DOM, no network. Every function is a pure transform of
 * (state, inputs) -> (newState | result). This makes the portfolio math
 * unit-testable in Node and reusable on any future backend.
 *
 * Loaded as a browser global (window.TradingEngine) AND require()-able in Node.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TradingEngine = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var G = (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : this);
  var EPS = 1e-9;

  function round(n, dp) {
    if (dp === undefined) dp = 8;
    var f = Math.pow(10, dp);
    return Math.round((n + Number.EPSILON) * f) / f;
  }

  function defaultConfig() {
    return {
      feeRate: 0.001,          // 0.10% per side (exchange-style)
      maxPositionPct: 0.6,     // max 60% of portfolio in a single asset
      maxOrderUsd: 500,        // max notional per order
      minOrderUsd: 1,          // min notional per order
      stopLossPct: 0,          // 0 = disabled
      takeProfitPct: 0,        // 0 = disabled
      duplicateWindowMs: 1500,  // de-dupe rapid repeated orders
      staleMs: 5000            // price older than this is rejected
    };
  }

  function createInitialState(opts) {
    opts = opts || {};
    return {
      startCash: opts.startCash != null ? opts.startCash : 1000,
      cash: opts.startCash != null ? opts.startCash : 1000,
      positions: {},            // symbol -> { qty, avgPrice }
      trades: [],               // executed trade records
      feeRate: opts.feeRate != null ? opts.feeRate : defaultConfig().feeRate,
      config: opts.config || defaultConfig(),
      lastPrices: {},           // symbol -> last known price (fallback)
      startedAt: opts.startedAt || null
    };
  }

  // priceMap: { SYMBOL: number } (live prices). Falls back to last known.
  function priceOf(priceMap, symbol, lastPrices) {
    if (priceMap && priceMap[symbol] != null && isFinite(priceMap[symbol])) return priceMap[symbol];
    if (lastPrices && lastPrices[symbol] != null) return lastPrices[symbol];
    return 0;
  }

  function positionsValue(state, priceMap) {
    var v = 0;
    for (var s in state.positions) {
      if (!state.positions.hasOwnProperty(s)) continue;
      var p = state.positions[s];
      if (!p || p.qty <= 0) continue;
      v += p.qty * priceOf(priceMap, s, state.lastPrices);
    }
    return v;
  }

  function computePortfolioValue(state, priceMap) {
    return state.cash + positionsValue(state, priceMap);
  }

  function applyFee(notional, feeRate) {
    return round(notional * feeRate, 8);
  }

  /*
   * executeOrder — the single, authoritative mutation point.
   *
   * order: { symbol, side: 'BUY'|'SELL', qty?, amountUsd?, price?, priceTs?,
   *          reason?, source? }
   * ctx:   { priceMap, now, config, lastOrderSig? }
   *
   * Returns { ok, trade?, state?, realized?, reason? }.
   * Never throws. Validation is delegated to RiskEngine when present.
   */
  function executeOrder(state, order, ctx) {
    ctx = ctx || {};
    var priceMap = ctx.priceMap || {};
    var now = ctx.now != null ? ctx.now : Date.now();
    var config = ctx.config || state.config || defaultConfig();

    if (!order || !order.symbol) return fail('MISSING_SYMBOL', state);
    var side = (order.side || '').toUpperCase();
    if (side !== 'BUY' && side !== 'SELL') return fail('INVALID_SIDE', state);

    var price = order.price != null ? order.price : priceMap[order.symbol];
    if (!(price > 0)) return fail('INVALID_PRICE', state);

    var qty = order.qty;
    if (qty == null) {
      if (order.amountUsd == null) return fail('QTY_OR_AMOUNT_REQUIRED', state);
      qty = order.amountUsd / price;
    }
    qty = round(qty, 8);
    if (!(qty > 0)) return fail('INVALID_QTY', state);

    var notional = round(qty * price, 8);
    var fee = applyFee(notional, state.feeRate);

    // Risk gate (optional but recommended).
    if (G.RiskEngine) {
      var v = G.RiskEngine.validateOrder(state, {
        symbol: order.symbol, side: side, qty: qty, price: price,
        priceTs: order.priceTs, fee: fee, notional: notional, source: order.source
      }, { priceMap: priceMap, now: now, config: config, lastOrderSig: ctx.lastOrderSig });
      if (!v.ok) return { ok: false, reason: v.reason, state: state };
    }

    var positions = assign({}, state.positions);
    var pos = positions[order.symbol]
      ? assign({}, positions[order.symbol])
      : { qty: 0, avgPrice: 0 };

    var cash = state.cash;
    var realized = 0;

    if (side === 'BUY') {
      cash = round(cash - (notional + fee), 8);
      var newQty = round(pos.qty + qty, 8);
      var newAvg = newQty > 0 ? round((pos.qty * pos.avgPrice + qty * price) / newQty, 8) : price;
      pos.qty = newQty;
      pos.avgPrice = newAvg;
    } else {
      cash = round(cash + (notional - fee), 8);
      // realized P&L vs average cost basis
      realized = round((notional - fee) - qty * pos.avgPrice, 8);
      pos.qty = round(pos.qty - qty, 8);
      if (pos.qty <= EPS) pos.qty = 0;
    }
    positions[order.symbol] = pos;

    var lastPrices = assign({}, state.lastPrices);
    lastPrices[order.symbol] = price;

    var next = assign({}, state, {
      cash: cash, positions: positions, lastPrices: lastPrices
    });

    var valueAfter = computePortfolioValue(next, priceMap);
    var trade = {
      id: (now) + '-' + Math.random().toString(36).slice(2, 7),
      symbol: order.symbol,
      side: side,
      qty: qty,
      price: price,
      notional: notional,
      fee: fee,
      portfolioValueAfter: round(valueAfter, 8),
      timestamp: now,
      reason: order.reason || (order.source || 'manual'),
      source: order.source || 'manual',
      realized: side === 'SELL' ? realized : 0
    };
    next.trades = state.trades.concat([trade]);

    return { ok: true, trade: trade, state: next, realized: realized };
  }

  /* ----- analytics ----- */

  function summarize(trades, startCash, endValue) {
    var wins = 0, losses = 0, best = -Infinity, worst = Infinity, fees = 0, sells = 0;
    for (var i = 0; i < trades.length; i++) {
      var tr = trades[i];
      fees += tr.fee || 0;
      if (tr.side === 'SELL') {
        sells++;
        if (tr.realized > 0) wins++; else losses++;
        if (tr.realized > best) best = tr.realized;
        if (tr.realized < worst) worst = tr.realized;
      }
    }
    var netPnl = round(endValue - startCash, 8);
    var grossPnl = round(netPnl + fees, 8);
    return {
      tradesCount: trades.length,
      sellCount: sells,
      wins: wins,
      losses: losses,
      winRate: sells > 0 ? round((wins / sells) * 100, 2) : 0,
      bestTrade: isFinite(best) ? round(best, 2) : 0,
      worstTrade: isFinite(worst) ? round(worst, 2) : 0,
      totalFees: round(fees, 2),
      grossPnl: grossPnl,
      netPnl: netPnl,
      returnPct: startCash > 0 ? round((netPnl / startCash) * 100, 4) : 0
    };
  }

  // series: [{ t, value }] (chronological). Returns min drawdown as negative %.
  function maxDrawdown(series) {
    if (!series || series.length < 2) return 0;
    var peak = series[0].value, mdd = 0;
    for (var i = 0; i < series.length; i++) {
      var v = series[i].value;
      if (v > peak) peak = v;
      if (peak > 0) {
        var dd = (v - peak) / peak;
        if (dd < mdd) mdd = dd;
      }
    }
    return round(mdd * 100, 4);
  }

  // series: [{ t, value }]. Returns stdev of period returns as %.
  function volatility(series) {
    if (!series || series.length < 3) return 0;
    var rets = [];
    for (var i = 1; i < series.length; i++) {
      var a = series[i - 1].value, b = series[i].value;
      if (a > 0) rets.push((b - a) / a);
    }
    var n = rets.length;
    if (n < 2) return 0;
    var mean = rets.reduce(function (x, y) { return x + y; }, 0) / n;
    var varr = rets.reduce(function (s, r) { return s + (r - mean) * (r - mean); }, 0) / (n - 1);
    return round(Math.sqrt(varr) * 100, 4);
  }

  // Buy & hold benchmark: held the chosen asset from startPrice to endPrice.
  function benchmark(startCash, startPrice, endPrice, strategyEndValue) {
    var holdReturn = startPrice > 0 ? (endPrice / startPrice - 1) * 100 : 0;
    var stratReturn = (strategyEndValue / startCash - 1) * 100;
    return {
      cashReturnPct: 0,
      holdReturnPct: round(holdReturn, 4),
      strategyReturnPct: round(stratReturn, 4),
      alphaPct: round(stratReturn - holdReturn, 4)
    };
  }

  function fail(reason, state) { return { ok: false, reason: reason, state: state }; }

  function assign() {
    var o = {};
    for (var i = 0; i < arguments.length; i++) {
      var s = arguments[i];
      if (s) for (var k in s) if (s.hasOwnProperty(k)) o[k] = s[k];
    }
    return o;
  }

  return {
    round: round,
    defaultConfig: defaultConfig,
    createInitialState: createInitialState,
    priceOf: priceOf,
    positionsValue: positionsValue,
    computePortfolioValue: computePortfolioValue,
    applyFee: applyFee,
    executeOrder: executeOrder,
    summarize: summarize,
    maxDrawdown: maxDrawdown,
    volatility: volatility,
    benchmark: benchmark
  };
});
