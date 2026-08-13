/*
 * Market Data Layer — provider abstraction.
 *
 * The UI only ever talks to MarketDataProvider:
 *   getSymbols()              -> [{ symbol, base, quote, label, geckoId }]
 *   getTicker()               -> Promise<{ SYMBOL: {price,changePct,volume,high,low} }>
 *   getHistorical(s,i,l)      -> Promise<[{ t, price }]>
 *   subscribe(symbols, cb)     -> unsubscribe()   (cb gets normalized ticker)
 *   start() / stop()
 *   getStatus()               -> { state, lastUpdateTs }
 *
 * Providers are interchangeable. No API secrets are used — every source here is
 * a PUBLIC endpoint. Any future keyed provider MUST sit behind the site's own
 * backend/server route (see BackendProxyProvider stub) so keys never reach the
 * browser. The free public providers chosen:
 *   - Binance   : WebSocket @ticker (1s) + REST 24hr/klines  (primary, real-time)
 *   - CoinGecko : REST polling every 5s (CORS-friendly fallback)
 *   - Mock      : synthetic random-walk (tests + offline)
 *
 * Browser global (window.MarketData) + Node require() (Mock works headless).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MarketData = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SYMBOLS = [
    { symbol: 'BTCUSDT', base: 'BTC', quote: 'USD', label: 'BTC/USD', geckoId: 'bitcoin' },
    { symbol: 'ETHUSDT', base: 'ETH', quote: 'USD', label: 'ETH/USD', geckoId: 'ethereum' },
    { symbol: 'SOLUSDT', base: 'SOL', quote: 'USD', label: 'SOL/USD', geckoId: 'solana' },
    { symbol: 'BNBUSDT', base: 'BNB', quote: 'USD', label: 'BNB/USD', geckoId: 'binancecoin' },
    { symbol: 'XRPUSDT', base: 'XRP', quote: 'USD', label: 'XRP/USD', geckoId: 'ripple' },
    { symbol: 'DOGEUSDT', base: 'DOGE', quote: 'USD', label: 'DOGE/USD', geckoId: 'dogecoin' }
  ];

  var SEED_PRICES = {
    BTCUSDT: 63650, ETHUSDT: 1885, SOLUSDT: 76, BNBUSDT: 580, XRPUSDT: 0.62, DOGEUSDT: 0.12
  };

  function now() { return Date.now(); }
  function hasFetch() { return typeof fetch !== 'undefined'; }
  function hasWS() { return typeof WebSocket !== 'undefined'; }

  // ---------------- Binance (WS + REST) ----------------
  function BinanceProvider(symbols, opts) {
    this.symbols = symbols || SYMBOLS;
    this.opts = opts || {};
    this._cbs = [];
    this.state = 'idle';
    this.lastUpdateTs = 0;
    this._ws = null;
    this._poll = null;
    this._failed = false;
  }
  BinanceProvider.prototype.getSymbols = function () { return Promise.resolve(this.symbols); };
  BinanceProvider.prototype._emit = function (t) {
    this.lastUpdateTs = now();
    if (this.state !== 'polling') this.state = 'live';
    for (var i = 0; i < this._cbs.length; i++) {
      try { this._cbs[i].cb(t); } catch (e) {}
    }
  };
  BinanceProvider.prototype._restUrl = function () {
    var arr = this.symbols.map(function (s) { return s.symbol; });
    return 'https://api.binance.com/api/v3/ticker/24hr?symbols=' + encodeURIComponent(JSON.stringify(arr));
  };
  BinanceProvider.prototype._pollRest = function () {
    var self = this;
    if (!hasFetch()) { self.state = 'offline'; return; }
    fetch(self._restUrl()).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (rows) {
      if (!Array.isArray(rows)) return;
      rows.forEach(function (d) {
        self._emit({
          symbol: d.symbol, price: +d.lastPrice, changePct: +d.priceChangePercent,
          volume: +d.volume, high: +d.highPrice, low: +d.lowPrice, ts: now()
        });
      });
      if (self._ws === null) self.state = 'polling';
    }).catch(function () { self.state = 'offline'; });
  };
  BinanceProvider.prototype.start = function () {
    var self = this;
    if (hasWS()) {
      var streams = self.symbols.map(function (s) { return s.symbol.toLowerCase() + '@ticker'; }).join('/');
      try {
        self.state = 'connecting';
        var ws = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + streams);
        self._ws = ws;
        ws.onopen = function () { self.state = 'live'; };
        ws.onmessage = function (ev) {
          try {
            var msg = JSON.parse(ev.data);
            var d = msg.data; if (!d || !d.s) return;
            self._emit({
              symbol: d.s, price: +d.c, changePct: +d.P,
              volume: +d.v, high: +d.h, low: +d.l, ts: now()
            });
          } catch (e) {}
        };
        ws.onerror = function () { self._startPolling(); };
        ws.onclose = function () { self._startPolling(); };
      } catch (e) { self._startPolling(); }
    } else {
      self._startPolling();
    }
    // initial REST snapshot regardless
    self._pollRest();
  };
  BinanceProvider.prototype._startPolling = function () {
    var self = this;
    if (self._poll) return;
    self._pollRest();
    self._poll = setInterval(function () { self._pollRest(); }, 3000);
  };
  BinanceProvider.prototype.subscribe = function (symbols, cb) {
    var set = symbols ? symbols.reduce(function (m, s) { m[s.symbol || s] = true; return m; }, {}) : null;
    var entry = { cb: function (t) { if (!set || set[t.symbol]) cb(t); } };
    this._cbs.push(entry);
    return function () {
      var i = this._cbs.indexOf(entry); if (i >= 0) this._cbs.splice(i, 1);
    }.bind(this);
  };
  BinanceProvider.prototype.getTicker = function () {
    var self = this;
    return fetch(self._restUrl()).then(function (r) { return r.json(); }).then(function (rows) {
      var out = {};
      (rows || []).forEach(function (d) { out[d.symbol] = { price: +d.lastPrice, changePct: +d.priceChangePercent, volume: +d.volume, high: +d.highPrice, low: +d.lowPrice }; });
      return out;
    });
  };
  BinanceProvider.prototype.getHistorical = function (symbol, interval, limit) {
    limit = limit || 60;
    var url = 'https://api.binance.com/api/v3/klines?symbol=' + symbol + '&interval=' + (interval || '1m') + '&limit=' + limit;
    return fetch(url).then(function (r) { return r.json(); }).then(function (rows) {
      return (rows || []).map(function (k) { return { t: k[0], price: +k[4] }; });
    });
  };
  BinanceProvider.prototype.getState = function () { return this.state; };
  BinanceProvider.prototype.getStatus = function () { return { state: this.state, lastUpdateTs: this.lastUpdateTs }; };
  BinanceProvider.prototype.stop = function () {
    if (this._ws) { try { this._ws.close(); } catch (e) {} this._ws = null; }
    if (this._poll) { clearInterval(this._poll); this._poll = null; }
    this._cbs = []; this.state = 'offline';
  };

  // ---------------- CoinGecko (REST polling) ----------------
  function CoinGeckoProvider(symbols, opts) {
    this.symbols = symbols || SYMBOLS;
    this.opts = opts || {};
    this._cbs = []; this.state = 'idle'; this.lastUpdateTs = 0; this._poll = null;
  }
  CoinGeckoProvider.prototype.getSymbols = function () { return Promise.resolve(this.symbols); };
  CoinGeckoProvider.prototype._idMap = function () {
    var m = {}; this.symbols.forEach(function (s) { m[s.geckoId] = s; }); return m;
  };
  CoinGeckoProvider.prototype._emit = function (t) {
    this.lastUpdateTs = now(); this.state = 'polling';
    for (var i = 0; i < this._cbs.length; i++) { try { this._cbs[i].cb(t); } catch (e) {} }
  };
  CoinGeckoProvider.prototype._pollRest = function () {
    var self = this;
    if (!hasFetch()) { self.state = 'offline'; return; }
    var ids = self.symbols.map(function (s) { return s.geckoId; }).join(',');
    var url = 'https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=usd&include_24hr_change=true';
    fetch(url).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (data) {
      var map = self._idMap();
      self.symbols.forEach(function (s) {
        var d = data[s.geckoId]; if (!d) return;
        self._emit({ symbol: s.symbol, price: +d.usd, changePct: +(d.usd_24h_change || 0), volume: null, high: null, low: null, ts: now() });
      });
    }).catch(function () { self.state = 'offline'; });
  };
  CoinGeckoProvider.prototype.start = function () {
    if (!hasFetch()) { this.state = 'offline'; return; }
    this._pollRest();
    this._poll = setInterval(function () { this._pollRest(); }.bind(this), 5000);
  };
  CoinGeckoProvider.prototype.subscribe = function (symbols, cb) {
    var set = symbols ? symbols.reduce(function (m, s) { m[s.symbol || s] = true; return m; }, {}) : null;
    var entry = { cb: function (t) { if (!set || set[t.symbol]) cb(t); } };
    this._cbs.push(entry);
    return function () { var i = this._cbs.indexOf(entry); if (i >= 0) this._cbs.splice(i, 1); }.bind(this);
  };
  CoinGeckoProvider.prototype.getTicker = function () {
    var self = this;
    var ids = self.symbols.map(function (s) { return s.geckoId; }).join(',');
    return fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=usd&include_24hr_change=true')
      .then(function (r) { return r.json(); }).then(function (data) {
        var out = {};
        self.symbols.forEach(function (s) { var d = data[s.geckoId]; if (d) out[s.symbol] = { price: +d.usd, changePct: +(d.usd_24h_change || 0), volume: null, high: null, low: null }; });
        return out;
      });
  };
  CoinGeckoProvider.prototype.getHistorical = function (symbol, interval, limit) {
    limit = limit || 60;
    var meta = this.symbols.filter(function (s) { return s.symbol === symbol; })[0];
    if (!meta) return Promise.resolve([]);
    var url = 'https://api.coingecko.com/api/v3/coins/' + meta.geckoId + '/market_chart?vs_currency=usd&days=1';
    return fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      var prices = (data && data.prices) || [];
      // downsample to ~limit points
      var step = Math.max(1, Math.floor(prices.length / limit));
      var out = [];
      for (var i = 0; i < prices.length; i += step) out.push({ t: prices[i][0], price: +prices[i][1] });
      return out.slice(-limit);
    });
  };
  CoinGeckoProvider.prototype.getStatus = function () { return { state: this.state, lastUpdateTs: this.lastUpdateTs }; };
  CoinGeckoProvider.prototype.stop = function () { if (this._poll) { clearInterval(this._poll); this._poll = null; } this._cbs = []; this.state = 'offline'; };

  // ---------------- Mock (synthetic, headless-safe) ----------------
  function MockProvider(symbols, opts) {
    this.symbols = symbols || SYMBOLS;
    this.opts = opts || {};
    this._cbs = []; this.state = 'idle'; this.lastUpdateTs = 0; this._timer = null;
    this.prices = {}; this.startPrices = {};
    var self = this;
    this.symbols.forEach(function (s) {
      var p = (self.opts.seedPrices && self.opts.seedPrices[s.symbol]) || SEED_PRICES[s.symbol] || 100;
      self.prices[s.symbol] = p; self.startPrices[s.symbol] = p;
    });
  }
  MockProvider.prototype.getSymbols = function () { return Promise.resolve(this.symbols); };
  MockProvider.prototype._emit = function (t) {
    this.lastUpdateTs = now(); this.state = 'live';
    for (var i = 0; i < this._cbs.length; i++) { try { this._cbs[i].cb(t); } catch (e) {} }
  };
  MockProvider.prototype._step = function () {
    var self = this;
    self.symbols.forEach(function (s) {
      var p = self.prices[s.symbol];
      var drift = (Math.random() - 0.5) * 0.006;
      p = p * (1 + drift);
      if (p <= 0) p = self.startPrices[s.symbol];
      self.prices[s.symbol] = p;
      self._emit({ symbol: s.symbol, price: p, changePct: (p / self.startPrices[s.symbol] - 1) * 100, volume: Math.random() * 50000, high: p * 1.02, low: p * 0.98, ts: now() });
    });
  };
  MockProvider.prototype.start = function () {
    var self = this;
    if (this._timer) return;
    this._step();
    this._timer = setInterval(function () { self._step(); }, this.opts.intervalMs || 1000);
  };
  MockProvider.prototype.subscribe = function (symbols, cb) {
    var set = symbols ? symbols.reduce(function (m, s) { m[s.symbol || s] = true; return m; }, {}) : null;
    var entry = { cb: function (t) { if (!set || set[t.symbol]) cb(t); } };
    this._cbs.push(entry);
    // emit current snapshot immediately
    var self = this;
    this.symbols.forEach(function (s) {
      if (!set || set[s.symbol]) cb({ symbol: s.symbol, price: self.prices[s.symbol], changePct: (self.prices[s.symbol] / self.startPrices[s.symbol] - 1) * 100, volume: 0, high: null, low: null, ts: now() });
    });
    return function () { var i = this._cbs.indexOf(entry); if (i >= 0) this._cbs.splice(i, 1); }.bind(this);
  };
  MockProvider.prototype.getTicker = function () {
    var out = {}; var self = this;
    this.symbols.forEach(function (s) { out[s.symbol] = { price: self.prices[s.symbol], changePct: (self.prices[s.symbol] / self.startPrices[s.symbol] - 1) * 100, volume: null, high: null, low: null }; });
    return Promise.resolve(out);
  };
  MockProvider.prototype.getHistorical = function (symbol, interval, limit) {
    limit = limit || 60;
    var self = this;
    var cur = this.prices[symbol];
    var start = this.startPrices[symbol];
    var out = []; var t0 = now() - limit * 60000;
    for (var i = 0; i < limit; i++) {
      var frac = i / (limit - 1);
      var base = start + (cur - start) * frac;
      var noise = base * (Math.random() - 0.5) * 0.01;
      out.push({ t: t0 + i * 60000, price: Math.max(0.0001, base + noise) });
    }
    out[out.length - 1].price = cur;
    return Promise.resolve(out);
  };
  MockProvider.prototype.getStatus = function () { return { state: this.state, lastUpdateTs: this.lastUpdateTs }; };
  MockProvider.prototype.stop = function () { if (this._timer) { clearInterval(this._timer); this._timer = null; } this._cbs = []; this.state = 'offline'; };

  // ---------------- Factory ----------------
  function createProvider(name, opts) {
    opts = opts || {};
    var symbols = opts.symbols || SYMBOLS;
    if (name === 'coingecko') return new CoinGeckoProvider(symbols, opts);
    if (name === 'mock') return new MockProvider(symbols, opts);
    return new BinanceProvider(symbols, opts); // default: binance
  }

  /* Future: a keyed provider would call the site's own backend route, e.g.
     GET /api/market/ticker  -> the server holds the secret and proxies upstream.
     That keeps credentials out of the browser bundle entirely. */

  return {
    SYMBOLS: SYMBOLS,
    SEED_PRICES: SEED_PRICES,
    BinanceProvider: BinanceProvider,
    CoinGeckoProvider: CoinGeckoProvider,
    MockProvider: MockProvider,
    createProvider: createProvider
  };
});
