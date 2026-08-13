/*
 * Risk Engine — validation + automatic exit rules.
 *
 * Pure and framework-free. The trading engine calls validateOrder() before
 * mutating state, so no invalid trade can ever be executed. Strategy/AI
 * decisions are also forced through here.
 *
 * Browser global (window.RiskEngine) + Node require().
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RiskEngine = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var EPS = 1e-9;

  function defaultConfig() {
    return {
      feeRate: 0.001,
      maxPositionPct: 0.6,
      maxOrderUsd: 500,
      minOrderUsd: 1,
      stopLossPct: 0,      // 0 = disabled
      takeProfitPct: 0,    // 0 = disabled
      duplicateWindowMs: 1500,
      staleMs: 5000
    };
  }

  /*
   * validateOrder(state, order, ctx)
   * order: { symbol, side, qty, price, priceTs?, fee, notional, source? }
   * ctx:   { priceMap, now, config, lastOrderSig? }
   * Returns { ok, reason? }.
   */
  function validateOrder(state, order, ctx) {
    ctx = ctx || {};
    var config = ctx.config || defaultConfig();
    var now = ctx.now != null ? ctx.now : Date.now();

    if (!order || !order.symbol) return { ok: false, reason: 'MISSING_SYMBOL' };
    if (config.allowedSymbols && config.allowedSymbols.length &&
        config.allowedSymbols.indexOf(order.symbol) === -1) {
      return { ok: false, reason: 'SYMBOL_NOT_ALLOWED' };
    }
    if (!(order.price > 0)) return { ok: false, reason: 'INVALID_PRICE' };
    if (!(order.qty > 0)) return { ok: false, reason: 'INVALID_QTY' };

    var notional = order.notional != null ? order.notional : order.qty * order.price;
    if (notional < config.minOrderUsd - EPS) return { ok: false, reason: 'ORDER_TOO_SMALL' };
    if (notional > config.maxOrderUsd + EPS) return { ok: false, reason: 'ORDER_EXCEEDS_MAX_SIZE' };

    // Reject stale market data — never trade on old prices.
    if (config.staleMs && order.priceTs != null) {
      var ageMs = now - order.priceTs;
      if (ageMs > config.staleMs) return { ok: false, reason: 'STALE_PRICE' };
    }

    if (order.side === 'BUY') {
      if (notional + (order.fee || 0) > state.cash + EPS) {
        return { ok: false, reason: 'INSUFFICIENT_CASH' };
      }
      // max position size: new position notional / projected portfolio value
      var projValue = state.cash - (notional + (order.fee || 0)) + notional;
      var projPos = ((state.positions[order.symbol] && state.positions[order.symbol].qty) || 0) * order.price + notional;
      if (projValue > 0 && (projPos / projValue) > config.maxPositionPct + EPS) {
        return { ok: false, reason: 'EXCEEDS_MAX_POSITION' };
      }
    } else { // SELL
      var pos = state.positions[order.symbol];
      if (!pos || pos.qty < order.qty - EPS) {
        return { ok: false, reason: 'INSUFFICIENT_POSITION' };
      }
    }

    // Duplicate guard (rapid repeated clicks / model loops)
    if (config.duplicateWindowMs && ctx.lastOrderSig) {
      if (ctx.lastOrderSig.key === order.symbol + ':' + order.side &&
          (now - ctx.lastOrderSig.ts) < config.duplicateWindowMs) {
        return { ok: false, reason: 'DUPLICATE_ORDER' };
      }
    }
    return { ok: true };
  }

  /*
   * checkAutoExits(state, priceMap, config, now)
   * Returns an array of SELL orders to execute for held positions that hit
   * stop-loss / take-profit. Empty when none triggered.
   */
  function checkAutoExits(state, priceMap, config, now) {
    config = config || state.config || defaultConfig();
    now = now != null ? now : Date.now();
    var orders = [];
    for (var s in state.positions) {
      if (!state.positions.hasOwnProperty(s)) continue;
      var p = state.positions[s];
      if (!p || p.qty <= 0) continue;
      var px = priceMap[s] != null ? priceMap[s] : state.lastPrices[s];
      if (!(px > 0)) continue;
      var entry = p.avgPrice;
      if (config.stopLossPct > 0 && px <= entry * (1 - config.stopLossPct / 100) - EPS) {
        orders.push({ symbol: s, side: 'SELL', qty: p.qty, price: px, priceTs: now, source: 'stop-loss', reason: 'Stop-loss' });
      } else if (config.takeProfitPct > 0 && px >= entry * (1 + config.takeProfitPct / 100) + EPS) {
        orders.push({ symbol: s, side: 'SELL', qty: p.qty, price: px, priceTs: now, source: 'take-profit', reason: 'Take-profit' });
      }
    }
    return orders;
  }

  var REASON_TEXT = {
    MISSING_SYMBOL: 'Symbol missing',
    SYMBOL_NOT_ALLOWED: 'Symbol not supported',
    INVALID_PRICE: 'Invalid price',
    INVALID_QTY: 'Invalid quantity',
    ORDER_TOO_SMALL: 'Order below minimum size',
    ORDER_EXCEEDS_MAX_SIZE: 'Order exceeds max size',
    STALE_PRICE: 'Market data is stale — trade paused',
    INSUFFICIENT_CASH: 'Not enough virtual cash',
    EXCEEDS_MAX_POSITION: 'Would exceed max position size',
    INSUFFICIENT_POSITION: 'Not enough units to sell',
    DUPLICATE_ORDER: 'Duplicate order ignored',
    INVALID_SIDE: 'Invalid side'
  };
  function reasonText(code) { return REASON_TEXT[code] || code; }

  return {
    defaultConfig: defaultConfig,
    validateOrder: validateOrder,
    checkAutoExits: checkAutoExits,
    reasonText: reasonText
  };
});
