/* Unit tests for the pure trading engine + risk engine (no browser needed). */
var path = require('path');
var E = require(path.join(__dirname, '..', '..', 'assets', 'js', 'trading', 'engine.js'));
var R = require(path.join(__dirname, '..', '..', 'assets', 'js', 'trading', 'risk.js'));
global.TradingEngine = E; global.RiskEngine = R; // engine reads root.RiskEngine at call-time

var pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log('  ok  - ' + name); }
  else { fail++; console.error('  FAIL- ' + name); }
}
function approx(a, b, eps) { return Math.abs(a - b) <= (eps == null ? 1e-6 : eps); }

var cfg = R.defaultConfig();
var now = 1000000;

console.log('\n# Buy / Sell / Fees / P&L');
(function () {
  // Use a config that allows a $1000 notional so we can test round numbers.
  var bigCfg = Object.assign({}, cfg, { maxOrderUsd: 100000, maxPositionPct: 0.99 });
  var s = E.createInitialState({ startCash: 2000, feeRate: 0.001 });
  var r1 = E.executeOrder(s, { symbol: 'BTCUSDT', side: 'BUY', qty: 10, price: 100, priceTs: now }, { priceMap: { BTCUSDT: 100 }, now: now, config: bigCfg });
  ok('buy ok', r1.ok === true);
  ok('buy fee = 1', approx(r1.trade.fee, 1));
  ok('buy cash = 2000 - 1001 = 999', approx(r1.state.cash, 999));
  ok('position qty = 10', approx(r1.state.positions.BTCUSDT.qty, 10));
  ok('position avg = 100', approx(r1.state.positions.BTCUSDT.avgPrice, 100));

  var r2 = E.executeOrder(r1.state, { symbol: 'BTCUSDT', side: 'SELL', qty: 10, price: 110, priceTs: now + 1 }, { priceMap: { BTCUSDT: 110 }, now: now + 1, config: bigCfg });
  ok('sell ok', r2.ok === true);
  ok('sell fee = 1.1', approx(r2.trade.fee, 1.1));
  ok('realized P&L = 98.9', approx(r2.realized, 98.9));
  ok('cash after sell = 2097.9', approx(r2.state.cash, 2097.9));
  ok('position cleared', r2.state.positions.BTCUSDT.qty === 0);

  var sum = E.summarize(r2.state.trades, 2000, 2097.9);
  ok('net P&L = 97.9', approx(sum.netPnl, 97.9));
  ok('gross P&L = 100', approx(sum.grossPnl, 100));
  ok('sell count = 1', sum.sellCount === 1);
  ok('win rate = 100', sum.winRate === 100);
  ok('best trade = 98.9', approx(sum.bestTrade, 98.9));
})();

console.log('\n# Portfolio valuation');
(function () {
  var s = E.createInitialState({ startCash: 500 });
  s.positions.BTCUSDT = { qty: 2, avgPrice: 100 };
  ok('value @100 = 700', approx(E.computePortfolioValue(s, { BTCUSDT: 100 }), 700));
  ok('value @150 = 800', approx(E.computePortfolioValue(s, { BTCUSDT: 150 }), 800));
  ok('value falls back to lastPrices', approx(E.computePortfolioValue(s, {}), 500));
})();

console.log('\n# Risk: insufficient funds');
(function () {
  var s = E.createInitialState({ startCash: 1000, feeRate: 0.001 });
  var c = Object.assign({}, cfg, { maxOrderUsd: 5000 }); // allow the order size; cash is the limiter
  var r = E.executeOrder(s, { symbol: 'BTCUSDT', side: 'BUY', qty: 10, price: 100, priceTs: now }, { priceMap: { BTCUSDT: 100 }, now: now, config: c });
  ok('rejected (1001 > 1000 cash)', r.ok === false && r.reason === 'INSUFFICIENT_CASH');
})();

console.log('\n# Risk: oversell');
(function () {
  var s = E.createInitialState({ startCash: 5000, feeRate: 0.001 });
  s.positions.BTCUSDT = { qty: 0.5, avgPrice: 100 };
  var r = E.executeOrder(s, { symbol: 'BTCUSDT', side: 'SELL', qty: 1, price: 100, priceTs: now }, { priceMap: { BTCUSDT: 100 }, now: now, config: cfg });
  ok('rejected (0.5 < 1)', r.ok === false && r.reason === 'INSUFFICIENT_POSITION');
})();

console.log('\n# Risk: max order size');
(function () {
  var s = E.createInitialState({ startCash: 100000, feeRate: 0.001 });
  var c = Object.assign({}, cfg, { maxOrderUsd: 500 });
  var r = E.executeOrder(s, { symbol: 'BTCUSDT', side: 'BUY', qty: 6, price: 100, priceTs: now }, { priceMap: { BTCUSDT: 100 }, now: now, config: c });
  ok('rejected (600 > 500)', r.ok === false && r.reason === 'ORDER_EXCEEDS_MAX_SIZE');
})();

console.log('\n# Risk: max position size');
(function () {
  var s = E.createInitialState({ startCash: 100000, feeRate: 0.001 });
  var c = Object.assign({}, cfg, { maxPositionPct: 0.5, maxOrderUsd: 200000 }); // order size allowed; position cap is the limiter
  var r = E.executeOrder(s, { symbol: 'BTCUSDT', side: 'BUY', amountUsd: 90000, price: 100, priceTs: now }, { priceMap: { BTCUSDT: 100 }, now: now, config: c });
  ok('rejected (90k position > 50% of ~100k)', r.ok === false && r.reason === 'EXCEEDS_MAX_POSITION');
})();

console.log('\n# Risk: stale price rejected');
(function () {
  var s = E.createInitialState({ startCash: 100000, feeRate: 0.001 });
  var c = Object.assign({}, cfg, { staleMs: 5000 });
  var r = E.executeOrder(s, { symbol: 'BTCUSDT', side: 'BUY', qty: 1, price: 100, priceTs: now - 6000 }, { priceMap: { BTCUSDT: 100 }, now: now, config: c });
  ok('rejected (price 6s old)', r.ok === false && r.reason === 'STALE_PRICE');
})();

console.log('\n# Risk: invalid orders');
(function () {
  var s = E.createInitialState({ startCash: 1000, feeRate: 0.001 });
  ok('missing symbol', E.executeOrder(s, { side: 'BUY', qty: 1, price: 100 }, { priceMap: {}, now: now, config: cfg }).reason === 'MISSING_SYMBOL');
  ok('invalid price', E.executeOrder(s, { symbol: 'X', side: 'BUY', qty: 1, price: 0 }, { priceMap: {}, now: now, config: cfg }).reason === 'INVALID_PRICE');
  ok('invalid qty', E.executeOrder(s, { symbol: 'X', side: 'BUY', price: 100 }, { priceMap: { X: 100 }, now: now, config: cfg }).reason === 'QTY_OR_AMOUNT_REQUIRED');
})();

console.log('\n# Risk: duplicate order guard');
(function () {
  var s = E.createInitialState({ startCash: 100000, feeRate: 0.001 });
  var ctx = { priceMap: { BTCUSDT: 100 }, now: now, config: cfg, lastOrderSig: { key: 'BTCUSDT:BUY', ts: now } };
  var r = E.executeOrder(s, { symbol: 'BTCUSDT', side: 'BUY', qty: 1, price: 100, priceTs: now }, ctx);
  ok('duplicate rejected', r.ok === false && r.reason === 'DUPLICATE_ORDER');
})();

console.log('\n# Auto stop-loss / take-profit');
(function () {
  var s = E.createInitialState({ startCash: 5000, feeRate: 0.001 });
  s.positions.BTCUSDT = { qty: 1, avgPrice: 100 };
  var c = Object.assign({}, cfg, { stopLossPct: 5, takeProfitPct: 10 });
  var sl = R.checkAutoExits(s, { BTCUSDT: 94 }, c, now);
  ok('stop-loss triggers @94', sl.length === 1 && sl[0].source === 'stop-loss');
  var tp = R.checkAutoExits(s, { BTCUSDT: 112 }, c, now);
  ok('take-profit triggers @112', tp.length === 1 && tp[0].source === 'take-profit');
  var none = R.checkAutoExits(s, { BTCUSDT: 100 }, c, now);
  ok('no trigger @100', none.length === 0);
})();

console.log('\n# Benchmarks + drawdown + volatility');
(function () {
  var b = E.benchmark(1000, 100, 110, 1050);
  ok('hold return = 10%', approx(b.holdReturnPct, 10));
  ok('strategy return = 5%', approx(b.strategyReturnPct, 5));
  ok('alpha = -5%', approx(b.alphaPct, -5));
  var series = [{ t: 1, value: 1000 }, { t: 2, value: 1100 }, { t: 3, value: 990 }, { t: 4, value: 1050 }];
  ok('max drawdown = -10%', approx(E.maxDrawdown(series), -10));
  ok('volatility > 0', E.volatility(series) > 0);
})();

console.log('\n========================================');
console.log('  ' + pass + ' passed, ' + fail + ' failed');
console.log('========================================');
process.exit(fail === 0 ? 0 : 1);
