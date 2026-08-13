/*
 * Trading Simulator UI — Binance-inspired dark terminal.
 *
 * Renders the /trading-simulator page. Talks ONLY to the engine/risk/strategy/
 * market-data/persistence modules (all global, loaded before this file). No React
 * state holds money math — portfolio values are recomputed from the engine state
 * on every tick via TradingEngine.computePortfolioValue.
 *
 * Browser-only (depends on React + canvas). Exposes window.TradingSimulatorPage.
 */
(function () {
  'use strict';
  var R = React;
  var h = R.createElement;
  var useState = R.useState, useEffect = R.useEffect, useRef = R.useRef, useCallback = R.useCallback;

  /* ---------------- i18n (kept local; does not touch the site's BASE_T) --------------- */
  var TL = {
    en: {
      paper: 'PAPER TRADING', nomoney: 'NO REAL MONEY',
      selectMarket: 'Select Market', search: 'Search markets',
      live: 'LIVE', stale: 'STALE', offline: 'OFFLINE', polling: 'POLLING', connecting: 'CONNECTING',
      lastUpdate: 'last update',
      marketInfo: 'MARKET INFORMATION', high: '24h High', low: '24h Low', vol24: '24h Volume', change: '24h Change',
      chartPrice: 'PRICE', chartPortfolio: 'PORTFOLIO VALUE', chartPnl: 'CUMULATIVE P&L',
      buySell: 'ORDER TICKET', amountUsd: 'Amount (USD)', orQty: 'or quantity', quick: 'Quick size',
      estQty: 'Est. quantity', fee: 'Est. fee',
      history: 'ORDER / TRADE HISTORY', time: 'TIME', side: 'SIDE', qty: 'QTY', price: 'PRICE', notional: 'NOTIONAL', pnl: 'P&L',
      portfolio: 'PORTFOLIO', cash: 'CASH', holdings: 'HOLDINGS', total: 'TOTAL VALUE', pnl: 'P&L', ret: 'RETURN %',
      experiment: 'EXPERIMENT', start: 'START SIMULATION', running: 'RUNNING', finished: 'COMPLETE',
      remaining: 'TIME REMAINING', startCap: 'STARTING CAPITAL', curVal: 'CURRENT VALUE', netPnl: 'NET P&L',
      mode: 'STRATEGY', manual: 'Manual', rule: 'AI Momentum', ai: 'AI (OpenAI-compatible)',
      risk: 'RISK CONTROLS', feeRate: 'Fee rate %', maxPos: 'Max position %', maxOrder: 'Max order $', stopLoss: 'Stop-loss %', takeProfit: 'Take-profit %',
      results: 'SIMULATION COMPLETE', starting: 'Starting Capital', ending: 'Ending Portfolio', net: 'Net Profit', retpct: 'Return',
      trades: 'Trades', win: 'Winning', loss: 'Losing', winRate: 'Win Rate', best: 'Best Trade', worst: 'Worst Trade', fees: 'Trading Fees', mdd: 'Max Drawdown', vol: 'Volatility',
      gross: 'Gross P&L', netPnlLabel: 'Net P&L (after fees)',
      strat: 'Strategy', hold: 'Buy & Hold', cashb: 'Cash', alpha: 'Strategy Alpha',
      benchmark: 'BENCHMARK', past: 'PAST EXPERIMENTS', none: 'No experiments yet.', review: 'Review',
      back: 'BACK TO TERMINAL', replay: 'NEW EXPERIMENT', config: 'CONFIGURE RISK', hide: 'HIDE RISK',
      paused: 'Trading paused — live market data is stale. Orders are not executed on old prices.',
      explainPnl: 'Net P&L = profit/loss after simulated fees vs the original $1,000.',
      explainAlpha: 'Alpha = strategy return minus simply holding the asset.',
      provider: 'FEED',
      emptyHistory: 'No trades yet. Start the simulation, then place orders.',
      emptyHold: 'No open positions.',
      buy: 'BUY', sell: 'SELL',
      example: 'Test any strategy, AI agent or human decisions against live market conditions — with virtual money only.',
      startNote: 'Starting Capital $1,000 · Duration 5 min · Live Data · Paper Trading',
      aiNote: 'AI mode returns structured JSON only and every action is force-validated by the risk layer. Wire a model via Strategy.AIStrategy().setDecisionProvider(fn).',
      viewResults: 'VIEW RESULTS'
    },
    zh: {
      paper: '模拟交易', nomoney: '无真实资金',
      selectMarket: '选择市场', search: '搜索市场',
      live: '实时', stale: '数据过期', offline: '离线', polling: '轮询', connecting: '连接中',
      lastUpdate: '更新于',
      marketInfo: '市场信息', high: '24h 最高', low: '24h 最低', vol24: '24h 成交量', change: '24h 涨跌',
      chartPrice: '价格', chartPortfolio: '组合价值', chartPnl: '累计盈亏',
      buySell: '下单面板', amountUsd: '金额（美元）', orQty: '或数量', quick: '快捷比例',
      estQty: '预计数量', fee: '预计手续费',
      history: '订单 / 成交记录', time: '时间', side: '方向', qty: '数量', price: '价格', notional: '名义价值', pnl: '盈亏',
      portfolio: '投资组合', cash: '现金', holdings: '持仓', total: '总价值', pnl: '盈亏', ret: '收益率',
      experiment: '实验', start: '开始模拟', running: '进行中', finished: '已完成',
      remaining: '剩余时间', startCap: '起始资金', curVal: '当前价值', netPnl: '净盈亏',
      mode: '策略', manual: '手动', rule: 'AI 动量', ai: 'AI（兼容 OpenAI）',
      risk: '风险控制', feeRate: '手续费率 %', maxPos: '最大仓位 %', maxOrder: '最大订单 $', stopLoss: '止损 %', takeProfit: '止盈 %',
      results: '模拟完成', starting: '起始资金', ending: '结束组合', net: '净利润', retpct: '收益率',
      trades: '交易次数', win: '盈利', loss: '亏损', winRate: '胜率', best: '最佳交易', worst: '最差交易', fees: '手续费', mdd: '最大回撤', vol: '波动率',
      gross: '毛利', netPnlLabel: '净盈亏（扣除手续费）',
      strat: '策略', hold: '买入持有', cashb: '现金', alpha: '策略超额收益',
      benchmark: '基准对比', past: '历史实验', none: '暂无实验记录。', review: '查看',
      back: '返回终端', replay: '新实验', config: '配置风险', hide: '收起风险',
      paused: '交易已暂停 — 行情数据已过期，不会用旧价格下单。',
      explainPnl: '净盈亏 = 扣除模拟手续费后，相对原始 $1,000 的盈亏。',
      explainAlpha: '超额收益 = 策略收益减去单纯持有该资产的收益。',
      provider: '数据源',
      emptyHistory: '暂无交易。开始模拟后即可下单。', emptyHold: '暂无持仓。',
      buy: '买入', sell: '卖出',
      example: '用虚拟资金在任何实时行情下测试策略、AI 智能体或人工决策。',
      startNote: '起始资金 $1,000 · 时长 5 分钟 · 实时数据 · 模拟交易',
      aiNote: 'AI 模式只返回结构化 JSON，且每个动作都强制经过风险层校验。可通过 Strategy.AIStrategy().setDecisionProvider(fn) 接入模型。',
      viewResults: '查看结果'
    }
  };
  function tl(key, lang) { return (TL[lang] && TL[lang][key]) || TL.en[key] || key; }

  /* ---------------- formatting ---------------- */
  function fmt(n, d) { d = d == null ? 2 : d; if (n == null || isNaN(n)) return '—'; return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function usd(n, d) { return '$' + fmt(n, d); }
  function sgn(n, d) { return (n > 0 ? '+' : '') + fmt(n, d); }
  function mmss(s) { s = Math.max(0, s | 0); var m = Math.floor(s / 60), x = s % 60; return (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x; }

  /* ---------------- canvas chart ---------------- */
  function prep(canvas) {
    if (!canvas) return null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || 600, ht = canvas.clientHeight || 320;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(ht * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(ht * dpr); }
    var ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, ht);
    return { ctx: ctx, w: w, h: ht };
  }
  function drawSeries(canvas, opts) {
    var p = prep(canvas); if (!p) return; var ctx = p.ctx, w = p.w, h = p.h;
    var pad = { l: 10, r: 10, t: 14, b: 18 };
    var series = opts.series, all = [];
    series.forEach(function (s) { all = all.concat(s.points); });
    if (!all.length) return;
    var ys = all.map(function (d) { return d.y; });
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    if (opts.baseline != null) { minY = Math.min(minY, opts.baseline); maxY = Math.max(maxY, opts.baseline); }
    if (maxY - minY < 1e-9) { maxY += 1; minY -= 1; }
    var xs = all.map(function (d) { return d.x; });
    var xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
    var X = function (x) { return pad.l + (xMax === xMin ? 0.5 : (x - xMin) / (xMax - xMin)) * (w - pad.l - pad.r); };
    var Y = function (y) { return pad.t + (1 - (y - minY) / (maxY - minY)) * (h - pad.t - pad.b); };
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (var i = 0; i <= 3; i++) { var yy = pad.t + (h - pad.t - pad.b) * i / 3; ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(w - pad.r, yy); ctx.stroke(); }
    if (opts.baseline != null) { ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(pad.l, Y(opts.baseline)); ctx.lineTo(w - pad.r, Y(opts.baseline)); ctx.stroke(); ctx.setLineDash([]); }
    series.forEach(function (s) {
      if (s.points.length < 2) return;
      if (s.fill) { var g = ctx.createLinearGradient(0, pad.t, 0, h - pad.b); g.addColorStop(0, s.fill); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.beginPath(); ctx.moveTo(X(s.points[0].x), Y(s.points[0].y)); s.points.forEach(function (d) { ctx.lineTo(X(d.x), Y(d.y)); }); ctx.lineTo(X(s.points[s.points.length - 1].x), h - pad.b); ctx.lineTo(X(s.points[0].x), h - pad.b); ctx.closePath(); ctx.fillStyle = g; ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(X(s.points[0].x), Y(s.points[0].y)); s.points.forEach(function (d) { ctx.lineTo(X(d.x), Y(d.y)); }); ctx.strokeStyle = s.color; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.stroke();
    });
    if (opts.markers) opts.markers.forEach(function (m) {
      var x = X(m.x), y = Y(m.y); ctx.fillStyle = m.color; ctx.beginPath();
      ctx.moveTo(x, m.up ? y - 6 : y + 6); ctx.lineTo(x - 4, m.up ? y + 1 : y - 1); ctx.lineTo(x + 4, m.up ? y + 1 : y - 1); ctx.closePath(); ctx.fill();
    });
  }

  /* ============================ main component ============================ */
  function TradingSimulatorPage(props) {
    var lang = props.lang || 'en';
    var L = function (k) { return tl(k, lang); };

    var SYMBOLS = (window.MarketData && window.MarketData.SYMBOLS) || [];

    var _conn = useState({ state: 'connecting', lastUpdate: 0 }), conn = _conn[0], setConn = _conn[1];
    var _ticker = useState({}), ticker = _ticker[0], setTicker = _ticker[1];
    var _selected = useState('BTCUSDT'), selected = _selected[0], setSelected = _selected[1];
    var _phase = useState('idle'), phase = _phase[0], setPhase = _phase[1];
    var _pv = useState({ cash: 1000, total: 1000, pnl: 0, ret: 0, positions: [] }), portfolioView = _pv[0], setPortfolioView = _pv[1];
    var _trades = useState([]), trades = _trades[0], setTrades = _trades[1];
    var _config = useState(null), config = _config[0], setConfig = _config[1];
    var _sm = useState('manual'), strategyMode = _sm[0], setStrategyMode = _sm[1];
    var _rem = useState(300), remaining = _rem[0], setRemaining = _rem[1];
    var _res = useState(null), results = _res[0], setResults = _res[1];
    var _sr = useState(false), showResults = _sr[0], setShowResults = _sr[1];
    var _exp = useState([]), experiments = _exp[0], setExperiments = _exp[1];
    var _banner = useState(null), banner = _banner[0], setBanner = _banner[1];
    var _stale = useState(false), stale = _stale[0], setStale = _stale[1];
    var _ou = useState(''), orderUsd = _ou[0], setOrderUsd = _ou[1];
    var _oq = useState(''), orderQty = _oq[0], setOrderQty = _oq[1];
    var _toast = useState(null), toast = _toast[0], setToast = _toast[1];
    var _pm = useState('binance'), providerMode = _pm[0], setProviderMode = _pm[1];
    var _sc = useState(false), showConfig = _sc[0], setShowConfig = _sc[1];
    var _ct = useState('price'), chartTab = _ct[0], setChartTab = _ct[1];
    var _search = useState(''), search = _search[0], setSearch = _search[1];

    var providerRef = useRef(null);
    var priceMapRef = useRef({});
    var tickerRef = useRef({});
    var engineRef = useRef(null);
    var histRef = useRef({});
    var valueSeriesRef = useRef([]);
    var benchSeriesRef = useRef([]);
    var lastOrderSigRef = useRef({ key: null, ts: 0 });
    var startPriceRef = useRef(null);
    var startCashRef = useRef(1000);
    var expStartRef = useRef(0);
    var durationRef = useRef(300000);
    var pausedRef = useRef(false);
    var phaseRef = useRef('idle');
    var strategyRef = useRef(null);
    var lastActionRef = useRef(0);
    var chartTickRef = useRef(0);
    var selectedRef = useRef('BTCUSDT');
    var strategyModeRef = useRef('manual');
    var priceCanvasRef = useRef(null);
    var benchCanvasRef = useRef(null);

    selectedRef.current = selected; strategyModeRef.current = strategyMode; phaseRef.current = phase;

    function computeView(state, priceMap, startCash) {
      var total = window.TradingEngine.computePortfolioValue(state, priceMap);
      var pnl = total - startCash;
      var positions = Object.keys(state.positions).map(function (s) {
        var p = state.positions[s];
        var px = priceMap[s] != null ? priceMap[s] : state.lastPrices[s] || 0;
        var val = p.qty * px, cost = p.qty * p.avgPrice;
        return { symbol: s, qty: p.qty, avg: p.avgPrice, price: px, value: val, upnl: val - cost };
      }).filter(function (p) { return p.qty > 0; });
      return { cash: state.cash, total: total, pnl: pnl, ret: startCash > 0 ? (pnl / startCash * 100) : 0, positions: positions };
    }

    var pushTrade = useCallback(function (trade) { setTrades(function (prev) { return [trade].concat(prev).slice(0, 200); }); }, []);

    /* ---------- init config + experiments ---------- */
    useEffect(function () {
      var saved = window.TradingStore ? window.TradingStore.loadConfig() : null;
      if (saved) setConfig(saved); else setConfig(window.RiskEngine.defaultConfig());
      setExperiments(window.TradingStore ? window.TradingStore.listExperiments() : []);
    }, []);

    /* ---------- provider lifecycle ---------- */
    useEffect(function () {
      if (!window.MarketData) return;
      var prov = window.MarketData.createProvider(providerMode, { symbols: SYMBOLS });
      providerRef.current = prov;
      setConn({ state: 'connecting', lastUpdate: 0 });
      var unsub = prov.subscribe(SYMBOLS, function (tk) {
        tickerRef.current[tk.symbol] = tk;
        priceMapRef.current[tk.symbol] = tk.price;
        var now = Date.now();
        if (now - chartTickRef.current > 400) {
          chartTickRef.current = now;
          setTicker(Object.assign({}, tickerRef.current));
          if (phaseRef.current === 'running' && !pausedRef.current && engineRef.current) {
            setPortfolioView(computeView(engineRef.current, priceMapRef.current, startCashRef.current));
          }
        }
      });
      prov.start();
      SYMBOLS.forEach(function (s) { prov.getHistorical(s.symbol, '1m', 60).then(function (hh) { histRef.current[s.symbol] = hh; }).catch(function () {}); });
      return function () { try { unsub(); } catch (e) {} prov.stop(); };
    }, [providerMode]);

    /* ---------- countdown + staleness ---------- */
    useEffect(function () {
      if (phase !== 'running') return;
      var id = setInterval(function () {
        var rem = Math.max(0, Math.ceil((expStartRef.current + durationRef.current - Date.now()) / 1000));
        setRemaining(rem);
        var stt = providerRef.current ? providerRef.current.getStatus() : { state: 'offline', lastUpdateTs: 0 };
        var age = stt.lastUpdateTs ? Date.now() - stt.lastUpdateTs : 999999;
        var staleMs = (config && config.staleMs) || 5000;
        var isStale = age > staleMs;
        if (isStale && !pausedRef.current) { pausedRef.current = true; setStale(true); setBanner({ type: 'warn', msg: L('paused') }); }
        else if (!isStale && pausedRef.current) { pausedRef.current = false; setStale(false); setBanner(null); }
        setConn({ state: isStale ? 'stale' : stt.state, lastUpdate: stt.lastUpdateTs });
        if (rem <= 0) finishExperiment();
      }, 250);
      return function () { clearInterval(id); };
    }, [phase, config]);

    /* ---------- strategy / auto-exit loop ---------- */
    useEffect(function () {
      if (phase !== 'running') return;
      var id = setInterval(function () {
        if (pausedRef.current || !engineRef.current) return;
        var now = Date.now();
        if (now - lastActionRef.current < 1000) return;
        var state = engineRef.current, priceMap = priceMapRef.current, sel = selectedRef.current;
        var ns = state;
        window.RiskEngine.checkAutoExits(state, priceMap, state.config, now).forEach(function (o) {
          var r = window.TradingEngine.executeOrder(ns, o, { priceMap: priceMap, now: now, config: ns.config, lastOrderSig: lastOrderSigRef.current });
          if (r.ok) { ns = r.state; lastOrderSigRef.current = { key: o.symbol + ':' + o.side, ts: now }; pushTrade(r.trade); }
        });
        if (strategyModeRef.current !== 'manual') {
          var px = priceMap[sel]; if (!(px > 0)) return;
          var ch = startPriceRef.current ? (px / startPriceRef.current - 1) * 100 : 0;
          var ctx = { symbol: sel, price: px, changePct: ch, portfolio: ns, config: ns.config };
          var apply = function (d) {
            if (!d || d.action === 'HOLD') return;
            var r = window.Strategy.applyDecision(ns, d, { symbol: sel, priceMap: priceMap, now: now, config: ns.config, lastOrderSig: lastOrderSigRef.current });
            if (r.ok && r.executed) { ns = r.state; lastOrderSigRef.current = { key: sel + ':' + d.action, ts: now }; pushTrade(r.trade); }
          };
          if (strategyRef.current && strategyRef.current.name === 'ai') strategyRef.current.decideAsync(ctx).then(apply);
          else if (strategyRef.current) apply(strategyRef.current.decide(ctx));
        }
        engineRef.current = ns;
        var total = window.TradingEngine.computePortfolioValue(ns, priceMap);
        valueSeriesRef.current.push({ t: now, value: total });
        if (startPriceRef.current) benchSeriesRef.current.push({ t: now, value: startCashRef.current * (priceMap[sel] / startPriceRef.current) });
        lastActionRef.current = now;
        setPortfolioView(computeView(ns, priceMap, startCashRef.current));
      }, 1000);
      return function () { clearInterval(id); };
    }, [phase]);

    /* ---------- chart redraw ---------- */
    useEffect(function () {
      if (!priceCanvasRef.current) return;
      if (chartTab === 'price') {
        var hist = histRef.current[selected] || [];
        var live = tickerRef.current[selected] ? [{ t: Date.now(), price: tickerRef.current[selected].price }] : [];
        var pts = hist.concat(live).map(function (d) { return { x: d.t, y: d.price }; });
        var markers = trades.filter(function (tr) { return tr.symbol === selected; }).map(function (tr) { return { x: tr.timestamp, y: tr.price, up: tr.side === 'BUY', color: tr.side === 'BUY' ? '#16C784' : '#EA3943' }; });
        drawSeries(priceCanvasRef.current, { series: [{ points: pts, color: '#6C5CE7', fill: 'rgba(108,92,231,0.18)' }], markers: markers });
      } else if (chartTab === 'portfolio') {
        drawSeries(priceCanvasRef.current, { series: [{ points: valueSeriesRef.current.map(function (d) { return { x: d.t, y: d.value }; }), color: '#16C784', fill: 'rgba(22,199,132,0.14)' }], baseline: startCashRef.current });
      } else {
        var ppts = valueSeriesRef.current.map(function (d) { return { x: d.t, y: d.value - startCashRef.current }; });
        var lastUp = ppts.length ? ppts[ppts.length - 1].y >= 0 : true;
        drawSeries(priceCanvasRef.current, { series: [{ points: ppts, color: lastUp ? '#16C784' : '#EA3943', fill: 'rgba(22,199,132,0.12)' }], baseline: 0 });
      }
    }, [chartTab, ticker, trades, portfolioView, phase, selected, showResults, results]);

    /* ---------- benchmark chart in results ---------- */
    useEffect(function () {
      if (!showResults || !benchCanvasRef.current || !results) return;
      var vs = results.valueSeries, bs = results.benchSeries;
      drawSeries(benchCanvasRef.current, {
        series: [
          { points: vs.map(function (d) { return { x: d.t, y: (d.value / results.startCash - 1) * 100 }; }), color: '#6C5CE7', fill: 'rgba(108,92,231,0.16)' },
          { points: bs.map(function (d) { return { x: d.t, y: (d.value / results.startCash - 1) * 100 }; }), color: '#16C784' }
        ], baseline: 0
      });
    }, [showResults, results]);

    /* ---------- actions ---------- */
    function strategyLabel() { return ({ manual: L('manual'), rule: L('rule'), ai: L('ai') })[strategyModeRef.current] || L('manual'); }

    var startExperiment = useCallback(function () {
      if (!window.TradingEngine || !window.RiskEngine) return;
      var startCash = 1000;
      var cfg = config || window.RiskEngine.defaultConfig();
      var state = window.TradingEngine.createInitialState({ startCash: startCash, feeRate: cfg.feeRate, config: cfg });
      engineRef.current = state;
      startCashRef.current = startCash;
      startPriceRef.current = priceMapRef.current[selected] || (tickerRef.current[selected] && tickerRef.current[selected].price) || null;
      expStartRef.current = Date.now(); durationRef.current = 300000;
      lastOrderSigRef.current = { key: null, ts: 0 };
      valueSeriesRef.current = [{ t: expStartRef.current, value: startCash }];
      benchSeriesRef.current = startPriceRef.current ? [{ t: expStartRef.current, value: startCash }] : [];
      pausedRef.current = false; setStale(false); setBanner(null);
      setTrades([]); setResults(null); setShowResults(false);
      setPortfolioView({ cash: startCash, total: startCash, pnl: 0, ret: 0, positions: [] });
      setRemaining(300);
      if (strategyMode === 'ai') strategyRef.current = window.Strategy.AIStrategy({});
      else if (strategyMode === 'rule') strategyRef.current = window.Strategy.RuleBasedStrategy({ alloc: 0.3 });
      else strategyRef.current = window.Strategy.ManualStrategy();
      setPhase('running');
    }, [config, selected, strategyMode]);

    var finishExperiment = useCallback(function () {
      if (phaseRef.current !== 'running') return;
      var state = engineRef.current, priceMap = priceMapRef.current, startCash = startCashRef.current;
      var endValue = window.TradingEngine.computePortfolioValue(state, priceMap);
      var sum = window.TradingEngine.summarize(state.trades, startCash, endValue);
      var mdd = window.TradingEngine.maxDrawdown(valueSeriesRef.current);
      var vol = window.TradingEngine.volatility(valueSeriesRef.current);
      var startP = startPriceRef.current || 1;
      var endP = priceMap[selectedRef.current] != null ? priceMap[selectedRef.current] : (state.lastPrices[selectedRef.current] || startP);
      var bench = window.TradingEngine.benchmark(startCash, startP, endP, endValue);
      var res = {
        startCash: startCash, endValue: endValue, netPnl: sum.netPnl, grossPnl: sum.grossPnl, returnPct: sum.returnPct,
        tradesCount: sum.tradesCount, wins: sum.wins, losses: sum.losses, winRate: sum.winRate,
        bestTrade: sum.bestTrade, worstTrade: sum.worstTrade, totalFees: sum.totalFees, mdd: mdd, vol: vol,
        benchmark: bench, strategy: strategyLabel(), durationMin: 5,
        valueSeries: valueSeriesRef.current.slice(), benchSeries: benchSeriesRef.current.slice(), trades: state.trades.slice()
      };
      setResults(res); setShowResults(true); setPhase('finished');
      if (window.TradingStore) {
        window.TradingStore.saveExperiment({
          id: 'exp-' + Date.now(), strategy: res.strategy, startCash: startCash, endCash: endValue,
          netPnl: sum.netPnl, returnPct: sum.returnPct, trades: sum.tradesCount, wins: sum.wins, losses: sum.losses,
          winRate: sum.winRate, durationMin: 5, startedAt: expStartRef.current, provider: providerMode
        });
        setExperiments(window.TradingStore.listExperiments());
      }
    }, []);

    var resetToIdle = useCallback(function () { setPhase('idle'); setResults(null); setShowResults(false); setBanner(null); setStale(false); pausedRef.current = false; }, []);

    var doTrade = useCallback(function (side) {
      if (phaseRef.current !== 'running') { flash('err', 'Start the simulation first'); return; }
      if (pausedRef.current) { flash('err', L('paused')); return; }
      var state = engineRef.current; if (!state) return;
      var price = priceMapRef.current[selected];
      if (!(price > 0)) { flash('err', 'No live price'); return; }
      var order = { symbol: selected, side: side, price: price, priceTs: Date.now(), source: 'manual' };
      if (orderQty && parseFloat(orderQty) > 0) order.qty = parseFloat(orderQty);
      else if (orderUsd && parseFloat(orderUsd) > 0) order.amountUsd = parseFloat(orderUsd);
      else { flash('err', 'Enter amount or quantity'); return; }
      var r = window.TradingEngine.executeOrder(state, order, { priceMap: priceMapRef.current, now: Date.now(), config: state.config, lastOrderSig: lastOrderSigRef.current });
      if (r.ok) {
        engineRef.current = r.state; lastOrderSigRef.current = { key: selected + ':' + side, ts: Date.now() }; pushTrade(r.trade);
        setPortfolioView(computeView(r.state, priceMapRef.current, startCashRef.current));
        flash('ok', (side === 'BUY' ? L('buy') : L('sell')) + ' ' + fmt(r.trade.qty, 4) + ' @ ' + usd(r.trade.price));
        setOrderUsd(''); setOrderQty('');
      } else { flash('err', window.RiskEngine ? window.RiskEngine.reasonText(r.reason) : r.reason); }
    }, [selected, orderUsd, orderQty, pushTrade]);

    var toastTimer = useRef(null);
    function flash(type, msg) { setToast({ type: type, msg: msg }); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(function () { setToast(null); }, 2600); }

    function updateConfig(key, val) {
      var c = Object.assign({}, config || window.RiskEngine.defaultConfig());
      c[key] = (key === 'feeRate' || key === 'maxPositionPct' || key === 'stopLossPct' || key === 'takeProfitPct') ? (parseFloat(val) / 100) : parseFloat(val);
      setConfig(c);
      if (window.TradingStore) window.TradingStore.saveConfig(c);
    }

    /* ============================ render helpers ============================ */
    function connLabel() {
      var st = conn.state;
      if (st === 'live') return L('live'); if (st === 'polling') return L('polling'); if (st === 'stale') return L('stale');
      if (st === 'offline') return L('offline'); return L('connecting');
    }
    var filtered = SYMBOLS.filter(function (s) { return !search || s.label.toLowerCase().indexOf(search.toLowerCase()) >= 0; });

    function renderBar() {
      return h('div', { className: 'ts-bar' },
        h('span', { className: 'ts-badge ts-badge--paper' }, h('span', { className: 'ts-dot', style: { background: '#FBBF24' } }), L('paper')),
        h('span', { className: 'ts-badge ts-badge--nomoney' }, L('nomoney')),
        h('div', { className: 'ts-pairsel' },
          h('select', { value: selected, onChange: function (e) { setSelected(e.target.value); } },
            filtered.map(function (s) { return h('option', { key: s.symbol, value: s.symbol }, s.label); }))
        ),
        h('div', { className: 'ts-search' },
          h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, h('circle', { cx: 11, cy: 11, r: 7 }), h('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })),
          h('input', { type: 'text', placeholder: L('search'), value: search, onChange: function (e) { setSearch(e.target.value); } })
        ),
        h('select', { className: 'ts-providerselect', value: providerMode, onChange: function (e) { setProviderMode(e.target.value); }, title: L('provider') },
          h('option', { value: 'binance' }, 'Binance'), h('option', { value: 'coingecko' }, 'CoinGecko'), h('option', { value: 'mock' }, 'Simulated')
        ),
        h('div', { className: 'ts-conn ts-conn--' + conn.state },
          h('span', { className: 'ts-dot' }),
          h('span', null, '● ' + connLabel()),
          h('span', { style: { color: 'var(--text-faint)' } }, L('lastUpdate') + ' ' + (conn.lastUpdate ? ((Date.now() - conn.lastUpdate) / 1000).toFixed(1) + 's' : '—'))
        )
      );
    }

    function renderMarket() {
      var tk = ticker[selected] || {};
      var price = tk.price;
      var ch = tk.changePct;
      var up = ch >= 0;
      return h('div', { className: 'ts-panel' },
        h('div', { className: 'ts-panel__head' }, h('span', { className: 'ts-panel__title' }, L('marketInfo'))),
        h('div', { className: 'ts-market' },
          h('div', null, h('div', { className: 'ts-market__pair' }, (SYMBOLS.filter(function (s) { return s.symbol === selected; })[0] || {}).label || selected),
            h('div', { className: 'ts-market__price ' + (up ? 'up' : 'down') }, price != null ? usd(price) : '—')),
          h('div', { className: 'ts-market__sub' },
            stat(L('change'), (ch != null ? sgn(ch, 2) + '%' : '—'), up ? 'up' : 'down'),
            stat(L('high'), tk.high != null ? usd(tk.high) : '—'),
            stat(L('low'), tk.low != null ? usd(tk.low) : '—'),
            stat(L('vol24'), tk.volume != null ? fmt(tk.volume, 0) : '—')
          )
        )
      );
    }
    function stat(label, val, cls) {
      return h('div', { className: 'ts-stat' }, h('div', { className: 'ts-stat__label' }, label), h('div', { className: 'ts-stat__val ' + (cls || '') }, val));
    }

    function renderChart() {
      return h('div', { className: 'ts-panel' },
        h('div', { className: 'ts-panel__head' },
          h('span', { className: 'ts-panel__title' }, chartTab === 'price' ? L('chartPrice') : chartTab === 'portfolio' ? L('chartPortfolio') : L('chartPnl')),
          h('div', { className: 'ts-chart-tabs' },
            tab('price', L('chartPrice')), tab('portfolio', L('chartPortfolio')), tab('pnl', L('chartPnl')))
        ),
        h('div', { className: 'ts-chart-wrap' }, h('canvas', { ref: priceCanvasRef }))
      );
    }
    function tab(key, label) { return h('button', { className: 'ts-chart-tab' + (chartTab === key ? ' active' : ''), onClick: function () { setChartTab(key); } }, label); }

    function renderTradePanel() {
      var tk = ticker[selected] || {};
      var price = tk.price || 0;
      var estQty = orderUsd && parseFloat(orderUsd) > 0 && price > 0 ? parseFloat(orderUsd) / price : (orderQty && parseFloat(orderQty) > 0 ? parseFloat(orderQty) : 0);
      var feeEst = (estQty * price) * ((config && config.feeRate) || 0.001);
      var pos = portfolioView.positions.filter(function (p) { return p.symbol === selected; })[0];
      return h('div', { className: 'ts-panel' },
        h('div', { className: 'ts-panel__head' }, h('span', { className: 'ts-panel__title' }, L('buySell'))),
        h('label', { className: 'ts-fieldlabel' }, L('amountUsd')),
        h('input', { className: 'ts-input', type: 'number', min: '0', step: '1', placeholder: '100', value: orderUsd, onChange: function (e) { setOrderUsd(e.target.value); setOrderQty(''); } }),
        h('label', { className: 'ts-fieldlabel', style: { marginTop: 10 } }, L('orQty')),
        h('input', { className: 'ts-input', type: 'number', min: '0', step: '0.0001', placeholder: '0.001', value: orderQty, onChange: function (e) { setOrderQty(e.target.value); setOrderUsd(''); } }),
        h('div', { className: 'ts-alloc' },
          [25, 50, 75, 100].map(function (p) {
            return h('button', { key: p, onClick: function () { setOrderUsd((portfolioView.cash * p / 100).toFixed(2)); setOrderQty(''); } }, p + '%');
          })),
        h('div', { className: 'ts-feerow' }, h('span', null, L('estQty')), h('span', null, fmt(estQty, 4) + ' ' + (SYMBOLS.filter(function (s) { return s.symbol === selected; })[0] || {}).base)),
        h('div', { className: 'ts-feerow' }, h('span', null, L('fee')), h('span', null, usd(feeEst))),
        h('div', { className: 'ts-sidebtns' },
          h('button', { className: 'ts-sidebtn ts-sidebtn--buy', disabled: phase !== 'running', onClick: function () { doTrade('BUY'); } }, L('buy')),
          h('button', { className: 'ts-sidebtn ts-sidebtn--sell', disabled: phase !== 'running' || !pos, onClick: function () { doTrade('SELL'); } }, L('sell'))
        ),
        showConfig ? renderConfig() : h('button', { className: 'ts-linkbtn', style: { marginTop: 12, display: 'block' }, onClick: function () { setShowConfig(true); } }, L('config') + ' ▾')
      );
    }

    function renderConfig() {
      if (!config) return null;
      var pct = function (v) { return (v * 100).toFixed(2); };
      return h('div', { className: 'ts-config' },
        h('div', { className: 'ts-toolbar', style: { justifyContent: 'space-between', marginBottom: 10 } },
          h('span', { className: 'ts-kicker' }, L('risk')),
          h('button', { className: 'ts-linkbtn', onClick: function () { setShowConfig(false); } }, L('hide') + ' ▴')),
        h('div', { className: 'ts-config__grid' },
          cfgField(L('feeRate'), pct(config.feeRate), function (v) { updateConfig('feeRate', v); }),
          cfgField(L('maxPos'), pct(config.maxPositionPct), function (v) { updateConfig('maxPositionPct', v); }),
          cfgField(L('maxOrder'), config.maxOrderUsd, function (v) { updateConfig('maxOrderUsd', v); }),
          cfgField(L('stopLoss'), pct(config.stopLossPct), function (v) { updateConfig('stopLossPct', v); }),
          cfgField(L('takeProfit'), pct(config.takeProfitPct), function (v) { updateConfig('takeProfitPct', v); })
        ),
        h('p', { className: 'ts-muted', style: { marginTop: 10 } }, L('explainPnl'))
      );
    }
    function cfgField(label, val, onC) {
      return h('label', null, h('span', null, label), h('input', { type: 'number', step: '0.01', value: val, onChange: function (e) { onC(e.target.value); } }));
    }

    function renderHistory() {
      return h('div', { className: 'ts-panel' },
        h('div', { className: 'ts-panel__head' }, h('span', { className: 'ts-panel__title' }, L('history'))),
        trades.length === 0
          ? h('div', { className: 'ts-empty' }, L('emptyHistory'))
          : h('div', { style: { overflowX: 'auto' } },
            h('table', { className: 'ts-table' },
              h('thead', null, h('tr', null,
                h('th', null, L('time')), h('th', null, L('side')), h('th', null, L('qty')), h('th', null, L('price')), h('th', null, L('notional')), h('th', null, L('pnl')))),
              h('tbody', null, trades.map(function (tr, i) {
                return h('tr', { key: tr.id || i },
                  h('td', null, new Date(tr.timestamp).toLocaleTimeString()),
                  h('td', null, h('span', { className: 'ts-tag ts-tag--' + tr.side.toLowerCase() }, tr.side)),
                  h('td', null, fmt(tr.qty, 4)),
                  h('td', null, usd(tr.price)),
                  h('td', null, usd(tr.notional)),
                  h('td', { className: tr.realized > 0 ? 'up' : (tr.realized < 0 ? 'down' : '') }, tr.side === 'SELL' ? sgn(tr.realized, 2) : '—')
                );
              }))
            ))
      );
    }

    function renderPortfolio() {
      var pv = portfolioView;
      return h('div', { className: 'ts-panel' },
        h('div', { className: 'ts-panel__head' }, h('span', { className: 'ts-panel__title' }, L('portfolio'))),
        h('div', { className: 'ts-pf' },
          pfItem(L('cash'), usd(pv.cash)),
          pfItem(L('total'), usd(pv.total)),
          pfItem(L('pnl'), sgn(pv.pnl), pv.pnl >= 0 ? 'up' : 'down'),
          pfItem(L('ret'), sgn(pv.ret, 2) + '%', pv.ret >= 0 ? 'up' : 'down'),
          pfItem(L('holdings'), pv.positions.length ? usd(pv.positions.reduce(function (a, p) { return a + p.value; }, 0)) : usd(0))
        ),
        pv.positions.length === 0
          ? h('div', { className: 'ts-muted', style: { marginTop: 12 } }, L('emptyHold'))
          : h('div', { className: 'ts-holdings' }, pv.positions.map(function (p) {
            return h('div', { className: 'ts-holding', key: p.symbol },
              h('span', null, (SYMBOLS.filter(function (s) { return s.symbol === p.symbol; })[0] || {}).label || p.symbol),
              h('span', null, fmt(p.qty, 4) + ' · ' + usd(p.value)),
              h('span', { className: p.upnl >= 0 ? 'up' : 'down' }, sgn(p.upnl, 2))
            );
          }))
      );
    }
    function pfItem(label, val, cls) {
      return h('div', { className: 'ts-pf__item' }, h('div', { className: 'ts-pf__label' }, label), h('div', { className: 'ts-pf__val ' + (cls || '') }, val));
    }

    function renderExperiment() {
      if (phase === 'running') {
        return h('div', { className: 'ts-panel' },
          h('div', { className: 'ts-panel__head' }, h('span', { className: 'ts-panel__title' }, L('experiment') + ' · ' + L('running')),
            h('span', { className: 'ts-conn ts-conn--' + (stale ? 'stale' : 'live') }, h('span', { className: 'ts-dot' }), stale ? L('stale') : L('live'))),
          h('div', { className: 'ts-exp' },
            h('div', null,
              h('div', { className: 'ts-timer' }, mmss(remaining)),
              h('div', { className: 'ts-exp__meta' },
                meta(L('startCap'), usd(startCashRef.current)),
                meta(L('curVal'), usd(portfolioView.total)),
                meta(L('netPnl'), sgn(portfolioView.pnl), portfolioView.pnl >= 0 ? 'up' : 'down')
              )
            ),
            h('div', null,
              h('div', { className: 'ts-modes' }, modeBtn('manual'), modeBtn('rule'), modeBtn('ai')),
              strategyMode === 'ai' ? h('p', { className: 'ts-muted', style: { marginBottom: 10 } }, L('aiNote')) : null,
              h('div', { className: 'ts-exp__meta' }, meta(L('strategy'), strategyLabel()))
            )
          )
        );
      }
      if (phase === 'finished') {
        return h('div', { className: 'ts-panel' },
          h('div', { className: 'ts-panel__head' }, h('span', { className: 'ts-panel__title' }, L('experiment') + ' · ' + L('finished'))),
          h('div', { className: 'ts-exp' },
            h('div', null, h('div', { className: 'ts-timer ts-timer--done' }, '00:00'),
              h('div', { className: 'ts-exp__meta' }, meta(L('ending'), usd(portfolioView.total)))),
            h('button', { className: 'ts-startbtn', style: { background: 'var(--bg-elev)', color: 'var(--text)', border: '1px solid var(--border)' }, onClick: function () { setShowResults(true); } }, L('viewResults'))
          ),
          h('button', { className: 'ts-linkbtn', style: { marginTop: 12, display: 'block' }, onClick: resetToIdle }, '↺ ' + L('replay'))
        );
      }
      // idle
      return h('div', { className: 'ts-panel' },
        h('div', { className: 'ts-panel__head' }, h('span', { className: 'ts-panel__title' }, L('experiment')),
          h('span', { className: 'ts-info', title: L('example') }, 'i')),
        h('p', { className: 'ts-muted', style: { marginBottom: 16 } }, L('example')),
        h('div', { className: 'ts-exp' },
          h('div', null,
            h('div', { className: 'ts-timer' }, '05:00'),
            h('div', { className: 'ts-exp__meta' }, meta(L('startCap'), usd(1000)), meta('Duration', '5 min'))
          ),
          h('div', null,
            h('div', { className: 'ts-modes' }, modeBtn('manual'), modeBtn('rule'), modeBtn('ai')),
            strategyMode === 'ai' ? h('p', { className: 'ts-muted', style: { marginBottom: 10 } }, L('aiNote')) : null,
            h('button', { className: 'ts-startbtn', onClick: startExperiment }, L('start'))
          )
        )
      );
    }
    function meta(label, val, cls) { return h('div', null, h('span', { style: { color: 'var(--text-dim)', marginRight: 6 } }, label + ':'), h('b', { className: cls || '' }, val)); }
    function endCapNote() { return L('ending'); }
    function modeBtn(m) { return h('button', { className: 'ts-mode' + (strategyMode === m ? ' active' : ''), onClick: function () { setStrategyMode(m); } }, ({ manual: L('manual'), rule: L('rule'), ai: L('ai') })[m]); }

    function renderResults() {
      if (!results) return null;
      var r = results;
      var verdictCls = r.netPnl > 0.01 ? 'up' : (r.netPnl < -0.01 ? 'down' : '');
      return h('div', { className: 'ts-modal', onClick: function (e) { if (e.target === e.currentTarget) setShowResults(false); } },
        h('div', { className: 'ts-modal__box' },
          h('div', { className: 'ts-kicker' }, L('results')),
          h('div', { className: 'ts-results__head', style: { marginTop: 6 } }, r.netPnl > 0.01 ? 'Net Positive' : (r.netPnl < -0.01 ? 'Net Negative' : 'Break-even')),
          h('div', { className: 'result-big ' + verdictCls }, sgn(r.netPnl) + ' (' + sgn(r.returnPct, 2) + '%)'),
          h('p', { className: 'ts-muted' }, L('starting') + ' ' + usd(r.startCash) + '  →  ' + L('ending') + ' ' + usd(r.endValue)),

          h('div', { className: 'ts-section-title' }, L('benchmark')),
          benchRow(L('strat'), r.returnPct, '#6C5CE7'),
          benchRow(L('hold'), r.benchmark.holdReturnPct, '#16C784'),
          benchRow(L('cashb'), 0, '#71717A'),
          h('div', { className: 'ts-pill', style: { background: 'var(--accent-soft)', color: 'var(--accent)', marginTop: 10 } }, L('alpha') + ': ' + sgn(r.benchmark.alphaPct, 2) + '%'),

          h('div', { className: 'ts-section-title' }, L('results')),
          h('div', { className: 'ts-results__grid' },
            rstat(L('starting'), usd(r.startCash)),
            rstat(L('ending'), usd(r.endValue)),
            rstat(L('gross'), sgn(r.grossPnl), r.grossPnl >= 0 ? 'up' : 'down'),
            rstat(L('netPnlLabel'), sgn(r.netPnl), verdictCls),
            rstat(L('trades'), r.tradesCount),
            rstat(L('winRate'), r.winRate + '%'),
            rstat(L('best'), sgn(r.bestTrade), 'up'),
            rstat(L('worst'), sgn(r.worstTrade), 'down'),
            rstat(L('fees'), usd(r.totalFees)),
            rstat(L('mdd'), r.mdd + '%', 'down'),
            rstat(L('vol'), r.vol + '%'),
            rstat(L('strategy'), r.strategy)
          ),
          h('div', { className: 'ts-chart-wrap', style: { marginTop: 8 } }, h('canvas', { ref: benchCanvasRef, style: { height: 200 } })),
          h('p', { className: 'ts-muted', style: { marginTop: 10 } }, L('explainAlpha')),

          h('div', { style: { display: 'flex', gap: 12, marginTop: 18 } },
            h('button', { className: 'ts-startbtn', style: { background: 'var(--bg-elev)', color: 'var(--text)', border: '1px solid var(--border)' }, onClick: function () { setShowResults(false); } }, L('back')),
            h('button', { className: 'ts-startbtn', onClick: function () { setShowResults(false); resetToIdle(); } }, '↺ ' + L('replay'))
          )
        )
      );
    }
    function rstat(label, val, cls) { return h('div', { className: 'ts-rstat' }, h('div', { className: 'ts-rstat__l' }, label), h('div', { className: 'ts-rstat__v ' + (cls || '') }, val)); }
    function benchRow(label, pct, color) {
      var w = Math.min(100, Math.abs(pct)) + '%';
      return h('div', { className: 'ts-bench__row' },
        h('span', { style: { width: 90 } }, label),
        h('div', { className: 'ts-bench__bar' }, h('div', { className: 'ts-bench__fill', style: { width: w, background: color } })),
        h('span', { className: pct >= 0 ? 'up' : 'down', style: { width: 70, textAlign: 'right' } }, sgn(pct, 2) + '%')
      );
    }

    function renderPast() {
      return h('div', { className: 'ts-panel', style: { marginTop: 16 } },
        h('div', { className: 'ts-panel__head' }, h('span', { className: 'ts-panel__title' }, L('past'))),
        experiments.length === 0
          ? h('div', { className: 'ts-empty' }, L('none'))
          : h('div', { className: 'ts-past' }, experiments.slice(0, 12).map(function (e) {
            var up = e.netPnl >= -0.01;
            return h('div', { className: 'ts-past__item', key: e.id },
              h('span', { className: 'ts-past__id' }, '#' + String(e.id).slice(-4)),
              h('span', { className: 'ts-past__strat' }, e.strategy),
              h('span', null, e.durationMin + 'm'),
              h('span', { className: 'ts-past__pnl ' + (up ? 'up' : 'down') }, sgn(e.netPnl) + ' (' + sgn(e.returnPct, 2) + '%)')
            );
          }))
      );
    }

    return h('main', { id: 'content', className: 'ts-wrap' },
      h('div', { className: 'container' },
        banner ? h('div', { className: 'ts-banner ts-banner--' + banner.type }, h('span', { className: 'ts-dot', style: { background: banner.type === 'warn' ? '#FBBF24' : 'var(--accent)' } }), banner.msg) : null,
        renderBar(),
        h('div', { className: 'ts-main' },
          h('div', { className: 'ts-col-left' }, renderMarket(), renderChart(), renderHistory()),
          h('div', { className: 'ts-col-right' }, renderTradePanel(), renderPortfolio(), renderExperiment())
        ),
        renderPast(),
        showResults ? renderResults() : null
      ),
      toast ? h('div', { className: 'ts-toast ts-toast--' + toast.type }, toast.msg) : null
    );
  }

  window.TradingSimulatorPage = TradingSimulatorPage;
})();
