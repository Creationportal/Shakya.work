/*
 * Persistence — experiment history + config, stored client-side.
 *
 * Browser: localStorage (survives reloads, review past experiments).
 * Node / no-storage: in-memory fallback so tests don't crash.
 *
 * Browser global (window.TradingStore) + Node require().
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TradingStore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var KEY_EXP = 'shakya.trading.experiments.v1';
  var KEY_CFG = 'shakya.trading.config.v1';

  function hasLS() {
    try { return typeof localStorage !== 'undefined'; } catch (e) { return false; }
  }
  var mem = { exp: [], cfg: null };

  function read(key) {
    if (hasLS()) {
      try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
    }
    return mem[key === KEY_EXP ? 'exp' : 'cfg'];
  }
  function write(key, val) {
    if (hasLS()) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
    } else {
      mem[key === KEY_EXP ? 'exp' : 'cfg'] = val;
    }
  }

  function listExperiments() {
    var arr = read(KEY_EXP) || [];
    return arr.slice().sort(function (a, b) { return (b.startedAt || 0) - (a.startedAt || 0); });
  }
  function getExperiment(id) {
    var arr = read(KEY_EXP) || [];
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }
  function saveExperiment(exp) {
    var arr = read(KEY_EXP) || [];
    arr.push(exp);
    if (arr.length > 100) arr = arr.slice(-100); // keep last 100
    write(KEY_EXP, arr);
    return exp;
  }
  function deleteExperiment(id) {
    var arr = (read(KEY_EXP) || []).filter(function (e) { return e.id !== id; });
    write(KEY_EXP, arr);
  }
  function clearExperiments() { write(KEY_EXP, []); }

  function loadConfig() { return read(KEY_CFG); }
  function saveConfig(cfg) { write(KEY_CFG, cfg); return cfg; }

  return {
    listExperiments: listExperiments,
    getExperiment: getExperiment,
    saveExperiment: saveExperiment,
    deleteExperiment: deleteExperiment,
    clearExperiments: clearExperiments,
    loadConfig: loadConfig,
    saveConfig: saveConfig
  };
});
