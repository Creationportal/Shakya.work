/* Integration test: drive a full paper-trading experiment with the Mock feed
   + rule-based strategy, end-to-end through engine/risk/strategy. */
var path = require('path');
var E = require(path.join(__dirname, '..', '..', 'assets', 'js', 'trading', 'engine.js'));
var R = require(path.join(__dirname, '..', '..', 'assets', 'js', 'trading', 'risk.js'));
var S = require(path.join(__dirname, '..', '..', 'assets', 'js', 'trading', 'strategy.js'));
var M = require(path.join(__dirname, '..', '..', 'assets', 'js', 'trading', 'marketdata.js'));
var P = require(path.join(__dirname, '..', '..', 'assets', 'js', 'trading', 'persistence.js'));
global.TradingEngine = E; global.RiskEngine = R; global.Strategy = S;

var pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; console.log('  ok  - ' + name); } else { fail++; console.error('  FAIL- ' + name); } }

var provider = new M.MockProvider(M.SYMBOLS);
var SYM = 'BTCUSDT';
var state = E.createInitialState({ startCash: 1000, feeRate: 0.001 });
var strategy = S.RuleBasedStrategy({ alloc: 0.3 });
var valueSeries = [], benchSeries = [], trades = 0;
var startPrice = null;
var lastOrderSig = { key: null, ts: 0 };
var t = 0;

function priceMap() { var m = {}; M.SYMBOLS.forEach(function (s) { m[s.symbol] = provider.prices[s.symbol]; }); return m; }

for (var i = 0; i < 250; i++) {
  t += 1000;
  provider._step();
  var pm = priceMap();
  if (startPrice === null) startPrice = pm[SYM];
  var px = pm[SYM];

  // auto exits (SL/TP) — off by default, just exercises the path
  var exits = R.checkAutoExits(state, pm, state.config, t);
  exits.forEach(function (o) {
    var r = E.executeOrder(state, o, { priceMap: pm, now: t, config: state.config, lastOrderSig: lastOrderSig });
    if (r.ok) { lastOrderSig = { key: o.symbol + ':' + o.side, ts: t }; trades++; }
  });

  // strategy decision
  var decision = strategy.decide({ symbol: SYM, price: px, changePct: (px / startPrice - 1) * 100, portfolio: state, config: state.config });
  if (decision && decision.action !== 'HOLD') {
    var r = S.applyDecision(state, decision, { symbol: SYM, priceMap: pm, now: t, config: state.config, lastOrderSig: lastOrderSig });
    if (r.ok && r.executed) { state = r.state; lastOrderSig = { key: SYM + ':' + decision.action, ts: t }; trades++; }
  }
  var v = E.computePortfolioValue(state, pm);
  valueSeries.push({ t: t, value: v });
  benchSeries.push({ t: t, value: 1000 * (px / startPrice) });
}

var endPrice = priceMap()[SYM];
var finalValue = E.computePortfolioValue(state, priceMap());
var sum = E.summarize(state.trades, 1000, finalValue);
var mdd = E.maxDrawdown(valueSeries);
var vol = E.volatility(valueSeries);
var b = E.benchmark(1000, startPrice, endPrice, finalValue);

ok('experiment produced trades', trades > 0);
ok('state.trades matches count', state.trades.length === trades);
ok('summary tradesCount matches', sum.tradesCount === state.trades.length);
ok('max drawdown <= 0', mdd <= 0);
ok('volatility finite & >= 0', isFinite(vol) && vol >= 0);
ok('value series length = 250', valueSeries.length === 250);
ok('final value positive', finalValue > 0);
ok('start price was set', startPrice > 0);
ok('alpha is a number', typeof b.alphaPct === 'number');

// persistence round-trip
var exp = { id: 'test-1', strategy: 'rule-based', startCash: 1000, endCash: finalValue, netPnl: sum.netPnl, returnPct: sum.returnPct, startedAt: t };
P.saveExperiment(exp);
var list = P.listExperiments();
ok('experiment persisted', list.some(function (e) { return e.id === 'test-1'; }));
ok('getExperiment works', P.getExperiment('test-1').id === 'test-1');
P.deleteExperiment('test-1');
ok('experiment deleted', !P.listExperiments().some(function (e) { return e.id === 'test-1'; }));

provider.stop();

console.log('\n--- sample run stats ---');
console.log('  trades=' + trades + ' finalValue=' + finalValue.toFixed(2) +
  ' netPnL=' + sum.netPnl.toFixed(2) + ' return=' + sum.returnPct.toFixed(2) + '%' +
  ' hold=' + b.holdReturnPct.toFixed(2) + '% alpha=' + b.alphaPct.toFixed(2) + '% mdd=' + mdd.toFixed(2) + '%');

console.log('\n========================================');
console.log('  ' + pass + ' passed, ' + fail + ' failed');
console.log('========================================');
process.exit(fail === 0 ? 0 : 1);
