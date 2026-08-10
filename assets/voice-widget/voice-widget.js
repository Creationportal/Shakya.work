/*!
 * shakya.work — AI Guide Widget
 * Standalone, framework-free. Compact bottom-left audio guide with section
 * narration + weekly AI-news playback in en / zh / yue / es / ne.
 * Uses Fish Audio mp3s from the manifest; falls back to Web Speech (English)
 * when an mp3 is missing. No React dependency — safe inside the SPA shell.
 *
 * Behaviour:
 *  - Language is a single synced value (dropdown) that drives all audio.
 *  - Clicking a main option (Guide / News tab) or a sub-option auto-plays.
 *  - Transport is pause-only (no play button); pause also resumes.
 *  - News has a configurable voice-type selector (FishAudio wired later).
 *  - Red "new" dot on the AI Guide label, dismissed on first open (localStorage).
 */
(function () {
  "use strict";

  var CFG = Object.assign(
    {
      manifestUrl: "assets/audio/manifest.json",
      defaultCollapsed: true,
      languages: ["en", "zh", "yue", "es", "ne"],
      // News voice types — mapped to OpenRouter TTS voices in scripts/config.json
      // (openrouter.voices). The pipeline generates one file per voice per language.
      newsVoiceTypes: [
        { id: "default", label: "Default voice" },
        { id: "anchor", label: "News anchor" },
        { id: "casual", label: "Casual" },
        { id: "calm", label: "Calm" },
      ],
    },
    window.VOICE_WIDGET_CONFIG || {}
  );

  var LANG = {
    en: { label: "English", speech: "en-US" },
    zh: { label: "中文", speech: "zh-CN" },
    yue: { label: "粤语", speech: "zh-HK" },
    es: { label: "Español", speech: "es-ES" },
    ne: { label: "नेपाली", speech: "ne-NP" },
  };

  var manifest = null;
  var newsDisabled = false;
  var clicked = localStorage.getItem("aiGuideClicked") === "1";
  var state = {
    lang: "en",
    open: false,
    tab: "guide",
    playing: null,
    newsVoice: (CFG.newsVoiceTypes[0] || { id: "default" }).id,
  };

  /* ---------- helpers ---------- */
  function getTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  function defaultLang() {
    var saved = (localStorage.getItem("shakya-lang") || "").toLowerCase();
    return CFG.languages.indexOf(saved) >= 0 ? saved : "en";
  }
  function currentSection() {
    var p = location.pathname.replace(/^\/+|\/+$/g, "");
    if (!p || p === "index.html") return "home";
    var last = p.split("/").pop().replace(/\.html$/, "");
    return last || "home";
  }
  function absUrl(rel) {
    return new URL(rel, location.origin + "/").href;
  }
  function markClicked() {
    if (clicked) return;
    clicked = true;
    try {
      localStorage.setItem("aiGuideClicked", "1");
    } catch (e) {}
    if (root) render();
  }

  /* ---------- DOM ---------- */
  var host = document.createElement("div");
  host.id = "ai-guide-widget";
  document.body.appendChild(host);
  var shadow = host.attachShadow({ mode: "open" });

  var style = document.createElement("style");
  style.textContent = CSS(getTheme());
  shadow.appendChild(style);

  var root = document.createElement("div");
  root.className = "vw-root collapsed";
  shadow.appendChild(root);

  /* ---------- audio + speech ---------- */
  var audioEl = new Audio();
  audioEl.preload = "none";

  function stopSpeech() {
    try {
      window.speechSynthesis && window.speechSynthesis.cancel();
    } catch (e) {}
  }
  function speakFallback(node, lang) {
    if (!("speechSynthesis" in window)) return;
    var text = (node.text && (node.text[lang] || node.text.en)) || "";
    if (!text) return;
    var u = new SpeechSynthesisUtterance(text);
    u.lang = (LANG[lang] || LANG.en).speech;
    u.rate = 1.02;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setNowPlaying(state.playing.kind, state.playing.key, lang, true);
    u.onend = function () {
      if (state.playing && state.playing.mode === "speech") {
        state.playing = null;
        renderPlayer();
        syncListActive();
      }
    };
  }

  function playItem(kind, key, voice) {
    var node = kind === "news" ? manifest.news : manifest.sections[key];
    if (!node) return;
    if (kind === "news" && voice) state.newsVoice = voice;
    state.playing = { kind: kind, key: key, mode: "audio", lang: state.lang };
    stopSpeech();
    audioEl.pause();
    var url = null;
    if (kind === "news" && node.voiceAudio && node.voiceAudio[state.lang]) {
      url = node.voiceAudio[state.lang][state.newsVoice] || node.audio[state.lang];
    } else if (node.audio) {
      url = node.audio[state.lang];
    }
    if (url) {
      audioEl.src = absUrl(url);
      audioEl.play().catch(function () {
        state.playing.mode = "speech";
        speakFallback(node, state.lang);
      });
    } else {
      state.playing.mode = "speech";
      speakFallback(node, state.lang);
    }
    renderPlayer();
    syncListActive();
  }

  function togglePause() {
    if (!state.playing) return;
    if (state.playing.mode === "speech") {
      if (window.speechSynthesis.speaking) window.speechSynthesis.pause();
      else window.speechSynthesis.resume();
      return;
    }
    if (audioEl.paused) audioEl.play();
    else audioEl.pause();
  }

  audioEl.addEventListener("timeupdate", function () {
    if (state.playing && state.playing.mode === "audio") renderProgress();
  });
  audioEl.addEventListener("ended", function () {
    state.playing = null;
    renderPlayer();
    syncListActive();
  });
  audioEl.addEventListener("error", function () {
    if (state.playing && state.playing.mode === "audio") {
      var node =
        state.playing.kind === "news"
          ? manifest.news
          : manifest.sections[state.playing.key];
      state.playing.mode = "speech";
      speakFallback(node, state.playing.lang);
    }
  });

  /* ---------- rendering ---------- */
  function render() {
    var cur = currentSection();
    var langOptions = CFG.languages
      .map(function (l) {
        return (
          '<option value="' +
          l +
          '"' +
          (l === state.lang ? " selected" : "") +
          ">" +
          LANG[l].label +
          "</option>"
        );
      })
      .join("");

    var voiceOptions = (CFG.newsVoiceTypes || [])
      .map(function (v) {
        return (
          '<option value="' +
          v.id +
          '"' +
          (v.id === state.newsVoice ? " selected" : "") +
          ">" +
          v.label +
          "</option>"
        );
      })
      .join("");

    var guideList = Object.keys(manifest.sections)
      .map(function (key) {
        var s = manifest.sections[key];
        var label = (s.label && (s.label[state.lang] || s.label.en)) || key;
        var here = cur === key ? ' <span class="vw-here">· you are here</span>' : "";
        return (
          '<button class="vw-row" data-kind="guide" data-key="' +
          key +
          '">' +
          '<span class="vw-status" aria-hidden="true"></span>' +
          '<span class="vw-rowlabel">' +
          label +
          here +
          "</span></button>"
        );
      })
      .join("");

    var news = manifest.news || {};
    var newsLabel =
      (news.label && (news.label[state.lang] || news.label.en)) || "Latest AI news";
    var newsUpdated = news.updated ? "Updated " + news.updated : "Not generated yet";
    var dot = clicked ? "" : '<span class="vw-dot" aria-hidden="true"></span>';
    var pillDot = clicked ? "" : '<span class="vw-dot vw-dot-pill" aria-hidden="true"></span>';

    root.innerHTML =
      '<div class="vw-pill" role="button" tabindex="0" aria-label="Open AI Guide">' +
      '<span class="vw-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
      '<span class="vw-pilllabel">AI Guide</span>' +
      pillDot +
      "</div>" +

      '<div class="vw-card" role="dialog" aria-label="AI Guide">' +
      '<div class="vw-head">' +
      '<div class="vw-title">AI Guide' + dot + "</div>" +
      '<div class="vw-head-actions">' +
      '<button class="vw-min" aria-label="Minimize">–</button>' +
      "</div></div>" +

      '<div class="vw-langwrap">' +
      '<select class="vw-lang-select" aria-label="Language">' +
      langOptions +
      "</select></div>" +

      '<div class="vw-tabs">' +
      '<button class="vw-tab active" data-tab="guide">Guide</button>' +
      '<button class="vw-tab" data-tab="news">News</button>' +
      "</div>" +

      '<div class="vw-body">' +
      '<div class="vw-pane vw-guide">' + guideList + "</div>" +
      '<div class="vw-pane vw-news" hidden>' +
      '<div class="vw-newscard" data-kind="news" data-key="news">' +
      '<div class="vw-newstitle">' + newsLabel + "</div>" +
      '<div class="vw-newsdate">' + newsUpdated + "</div>" +
      '<label class="vw-field"><span>Voice</span>' +
      '<select class="vw-voice" aria-label="News voice">' +
      voiceOptions +
      "</select></label>" +
      '<div class="vw-hint">Tap the title above to play the latest digest.</div>' +
      "</div></div>" +
      "</div>" +

      '<div class="vw-player" hidden>' +
      '<button class="vw-pp" aria-label="Pause">❚❚</button>' +
      '<div class="vw-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<div class="vw-meta"><div class="vw-now"></div>' +
      '<div class="vw-bar"><div class="vw-fill"></div></div></div>' +
      '<button class="vw-transcript" aria-label="Toggle transcript">“”</button>' +
      "</div>" +

      '<div class="vw-transbox" hidden></div>' +
      '<div class="vw-live" aria-live="polite"></div>' +
      "</div>";

    wire();
    applyNewsVisibility();
    renderPlayer();
  }

  function renderPlayer() {
    var player = root.querySelector(".vw-player");
    var pp = root.querySelector(".vw-pp");
    var now = root.querySelector(".vw-now");
    var wave = root.querySelector(".vw-wave");
    var transbox = root.querySelector(".vw-transbox");
    if (!player) return;
    if (!state.playing) {
      player.hidden = true;
      transbox.hidden = true;
      return;
    }
    player.hidden = false;
    var node =
      state.playing.kind === "news"
        ? manifest.news
        : manifest.sections[state.playing.key];
    var label =
      state.playing.kind === "news"
        ? (manifest.news.label && (manifest.news.label[state.lang] || manifest.news.label.en)) ||
          "Latest AI news"
        : (node.label && (node.label[state.lang] || node.label.en)) || state.playing.key;
    if (state.playing.mode === "speech") label += " · browser voice";
    now.textContent = label;
    var paused = isPaused();
    pp.textContent = "❚❚";
    pp.setAttribute("aria-label", paused ? "Resume" : "Pause");
    pp.classList.toggle("paused", paused);
    wave.classList.toggle("on", !paused);
    renderProgress();
    if (!transbox.hidden) renderTranscript();
  }

  function isPaused() {
    if (state.playing && state.playing.mode === "speech")
      return !window.speechSynthesis.speaking;
    return audioEl.paused;
  }

  function renderProgress() {
    var fill = root.querySelector(".vw-fill");
    if (!fill || !state.playing || state.playing.mode !== "audio") return;
    var pct = audioEl.duration ? (audioEl.currentTime / audioEl.duration) * 100 : 0;
    fill.style.width = pct + "%";
  }

  function renderTranscript() {
    var box = root.querySelector(".vw-transbox");
    if (!box || !state.playing) return;
    var node =
      state.playing.kind === "news"
        ? manifest.news
        : manifest.sections[state.playing.key];
    box.textContent = (node.text && (node.text[state.lang] || node.text.en)) || "";
  }

  function syncListActive() {
    root.querySelectorAll(".vw-row").forEach(function (b) {
      var on =
        state.playing &&
        state.playing.kind === "guide" &&
        b.getAttribute("data-key") === state.playing.key;
      b.classList.toggle("playing", !!on);
    });
  }

  function setOpen(open) {
    state.open = open;
    root.classList.toggle("collapsed", !open);
    if (open) markClicked();
    try {
      localStorage.setItem("voiceWidgetOpen", open ? "1" : "0");
    } catch (e) {}
  }

  function announce(msg) {
    var live = root.querySelector(".vw-live");
    if (live) live.textContent = msg;
  }

  /* ---------- events ---------- */
  function wire() {
    root.querySelector(".vw-pill").addEventListener("click", function () {
      setOpen(true);
    });
    root.querySelector(".vw-pill").addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
    });
    root.querySelector(".vw-min").addEventListener("click", function () {
      setOpen(false);
    });
    root.querySelector(".vw-title").addEventListener("click", markClicked);

    var langSel = root.querySelector(".vw-lang-select");
    langSel.addEventListener("change", function () {
      state.lang = langSel.value;
      render();
      announce("Language set to " + LANG[state.lang].label);
      if (state.playing) playItem(state.playing.kind, state.playing.key);
    });

    root.querySelectorAll(".vw-tab").forEach(function (b) {
      b.addEventListener("click", function () {
        state.tab = b.getAttribute("data-tab");
        root.querySelectorAll(".vw-tab").forEach(function (t) {
          t.classList.toggle("active", t === b);
        });
        root.querySelector(".vw-guide").hidden = state.tab !== "guide";
        root.querySelector(".vw-news").hidden = state.tab !== "news";
        // Main options auto-play on click.
        if (state.tab === "guide") {
          var cur = currentSection();
          playItem("guide", manifest.sections[cur] ? cur : "home");
        } else {
          playItem("news", "news");
        }
      });
    });

    root.querySelectorAll(".vw-row").forEach(function (b) {
      b.addEventListener("click", function () {
        // Sub-options auto-play on click.
        playItem("guide", b.getAttribute("data-key"));
      });
    });

    var newsCard = root.querySelector(".vw-newscard");
    newsCard.querySelector(".vw-newstitle").addEventListener("click", function () {
      playItem("news", "news");
    });
    var voiceSel = root.querySelector(".vw-voice");
    voiceSel.addEventListener("change", function () {
      state.newsVoice = voiceSel.value;
      if (state.playing && state.playing.kind === "news") playItem("news", "news");
    });

    root.querySelector(".vw-pp").addEventListener("click", togglePause);

    var bar = root.querySelector(".vw-bar");
    bar.addEventListener("click", function (e) {
      if (!state.playing || state.playing.mode !== "audio" || !audioEl.duration) return;
      var r = bar.getBoundingClientRect();
      audioEl.currentTime = ((e.clientX - r.left) / r.width) * audioEl.duration;
      renderProgress();
    });

    root.querySelector(".vw-transcript").addEventListener("click", function () {
      var box = root.querySelector(".vw-transbox");
      box.hidden = !box.hidden;
      if (!box.hidden) renderTranscript();
    });
  }

  /* ---------- keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
      setOpen(!state.open);
    } else if (e.key === "Escape" && state.open) {
      setOpen(false);
    }
  });

  /* ---------- SPA route awareness ---------- */
  function onRouteChange() {
    if (manifest) render();
  }
  window.addEventListener("popstate", onRouteChange);
  (function () {
    var ps = history.pushState, rs = history.replaceState;
    if (ps) {
      history.pushState = function () {
        var r = ps.apply(this, arguments);
        onRouteChange();
        return r;
      };
    }
    if (rs) {
      history.replaceState = function () {
        var r = rs.apply(this, arguments);
        onRouteChange();
        return r;
      };
    }
  })();

  /* ---------- theme live update ---------- */
  var obs = new MutationObserver(function () {
    style.textContent = CSS(getTheme());
  });
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  var mq = window.matchMedia("(prefers-color-scheme: light)");
  (mq.addEventListener || mq.addListener).call(mq, "change", function () {
    style.textContent = CSS(getTheme());
  });

  /* ---------- boot ---------- */
  function loadWSettings() {
    try { return JSON.parse(localStorage.getItem("shakya.settings") || "null"); }
    catch (e) { return null; }
  }
  function applyGuideOverrides(m) {
    try {
      var ov = JSON.parse(localStorage.getItem("shakya.guideOverrides") || "{}");
      if (ov.sections) {
        for (var sec in ov.sections) {
          if (m.sections && m.sections[sec]) m.sections[sec].text = Object.assign({}, m.sections[sec].text, ov.sections[sec]);
        }
      }
      if (ov.news && m.news) m.news.text = Object.assign({}, m.news.text, ov.news);
    } catch (e) {}
    return m;
  }
  function applyNewsVisibility() {
    if (!newsDisabled || !root) return;
    var nt = root.querySelector('.vw-tab[data-tab="news"]'); if (nt) nt.style.display = "none";
    var nc = root.querySelector(".vw-newscard"); if (nc) nc.style.display = "none";
  }
  function boot() {
    var s = loadWSettings();
    if (s && s.aiGuideEnabled === false) return; // disabled by backend config
    if (s && s.newsEnabled === false) { newsDisabled = true; state.tab = "guide"; }
    state.lang = defaultLang();
    var savedOpen = localStorage.getItem("voiceWidgetOpen");
    state.open = savedOpen === "1" ? true : !CFG.defaultCollapsed;
    fetch(absUrl(CFG.manifestUrl))
      .then(function (r) {
        return r.ok ? r.json() : Promise.reject();
      })
      .then(function (m) {
        manifest = applyGuideOverrides(m);
      })
      .catch(function () {
        manifest = FALLBACK;
        announce("Guide manifest unavailable; using built-in text.");
      })
      .finally(function () {
        render();
        setOpen(state.open);
      });
  }

  var FALLBACK = {
    sections: {
      home: { label: { en: "Home" }, text: { en: "Welcome to shakya.work." } },
    },
    news: { label: { en: "Latest AI news" }, text: {}, audio: {} },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* ---------- styles ---------- */
  function CSS(theme) {
    var dark = theme === "dark";
    var surface = dark ? "#1A1A1A" : "#FFFFFF";
    var surface2 = dark ? "#141414" : "#F7F7F8";
    var text = dark ? "#FAFAFA" : "#0A0A0A";
    var dim = dark ? "#A1A1AA" : "#71717A";
    var border = dark ? "#2A2A2A" : "#E5E5E5";
    var accent = "#6C5CE7";
    var shadow = dark
      ? "0 12px 40px rgba(0,0,0,.55)"
      : "0 12px 40px rgba(0,0,0,.16)";
    return (
      "" +
      ":host{all:initial;position:fixed;left:20px;bottom:20px;z-index:2147483000;}" +
      "*{box-sizing:border-box;font-family:'Inter Tight','Noto Sans SC',system-ui,sans-serif;}" +
      ".vw-root{position:relative;}" +
      ".vw-pill{display:flex;align-items:center;gap:8px;background:" +
      surface +
      ";color:" +
      text +
      ";border:1px solid " +
      border +
      ";border-radius:999px;padding:9px 14px;cursor:pointer;box-shadow:" +
      shadow +
      ";font-size:13px;font-weight:500;}" +
      ".vw-pill:hover{border-color:" +
      accent +
      ";}" +
      ".vw-eq{display:inline-flex;align-items:flex-end;gap:2px;height:14px;}" +
      ".vw-eq i{width:2px;background:" +
      accent +
      ";animation:vw-eq 1s ease-in-out infinite;}" +
      ".vw-eq i:nth-child(1){height:6px;animation-delay:0s;}" +
      ".vw-eq i:nth-child(2){height:13px;animation-delay:.15s;}" +
      ".vw-eq i:nth-child(3){height:9px;animation-delay:.3s;}" +
      ".vw-eq i:nth-child(4){height:14px;animation-delay:.45s;}" +
      "@keyframes vw-eq{0%,100%{transform:scaleY(.5);}50%{transform:scaleY(1);}}" +
      ".vw-dot{position:absolute;top:-3px;right:-3px;width:9px;height:9px;border-radius:50%;background:#FF3B30;box-shadow:0 0 0 2px " +
      surface +
      ";}" +
      ".vw-dot-pill{position:static;margin-left:2px;box-shadow:none;}" +
      ".vw-card{position:absolute;left:0;bottom:0;width:330px;max-width:calc(100vw - 40px);background:" +
      surface +
      ";color:" +
      text +
      ";border:1px solid " +
      border +
      ";border-radius:4px;box-shadow:" +
      shadow +
      ";overflow:hidden;}" +
      ".vw-root.collapsed .vw-card{display:none;}" +
      ".vw-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid " +
      border +
      ";}" +
      ".vw-title{position:relative;font-size:14px;font-weight:500;cursor:pointer;}" +
      ".vw-min{background:" +
      surface2 +
      ";border:1px solid " +
      border +
      ";color:" +
      dim +
      ";width:24px;height:24px;border-radius:4px;cursor:pointer;font-size:16px;line-height:1;}" +
      ".vw-langwrap{padding:10px 14px 4px;}" +
      ".vw-lang-select{width:100%;background:" +
      surface2 +
      ";border:1px solid " +
      border +
      ";color:" +
      text +
      ";border-radius:4px;padding:8px 10px;font-size:13px;cursor:pointer;appearance:none;}" +
      ".vw-lang-select:focus{outline:2px solid " +
      accent +
      ";}" +
      ".vw-tabs{display:flex;gap:4px;padding:8px 14px 0;}" +
      ".vw-tab{background:none;border:none;color:" +
      dim +
      ";padding:8px 4px;font-size:13px;cursor:pointer;border-bottom:2px solid transparent;}" +
      ".vw-tab.active{color:" +
      text +
      ";border-bottom-color:" +
      accent +
      ";}" +
      ".vw-body{max-height:300px;overflow:auto;padding:6px 8px 10px;}" +
      ".vw-row{display:flex;align-items:center;gap:10px;width:100%;background:none;border:none;color:" +
      text +
      ";padding:9px 8px;border-radius:4px;cursor:pointer;font-size:13px;text-align:left;}" +
      ".vw-row:hover{background:" +
      surface2 +
      ";}" +
      ".vw-row.playing{background:" +
      surface2 +
      ";}" +
      ".vw-status{flex:0 0 16px;height:16px;display:inline-flex;align-items:flex-end;gap:2px;}" +
      ".vw-row.playing .vw-status i{width:2px;background:" +
      accent +
      ";animation:vw-eq .9s ease-in-out infinite;}" +
      ".vw-row.playing .vw-status i:nth-child(1){height:5px;animation-delay:0s;}" +
      ".vw-row.playing .vw-status i:nth-child(2){height:12px;animation-delay:.15s;}" +
      ".vw-row.playing .vw-status i:nth-child(3){height:8px;animation-delay:.3s;}" +
      ".vw-row.playing .vw-status i:nth-child(4){height:13px;animation-delay:.45s;}" +
      ".vw-here{color:" +
      accent +
      ";font-size:11px;}" +
      ".vw-newscard{background:" +
      surface2 +
      ";border:1px solid " +
      border +
      ";border-radius:4px;padding:12px;cursor:pointer;}" +
      ".vw-newstitle{font-size:13px;font-weight:500;}" +
      ".vw-newsdate{font-size:11px;color:" +
      dim +
      ";margin:4px 0 10px;}" +
      ".vw-field{display:flex;align-items:center;justify-content:space-between;gap:10px;}" +
      ".vw-field span{font-size:12px;color:" +
      dim +
      ";}" +
      ".vw-voice{background:" +
      surface +
      ";border:1px solid " +
      border +
      ";color:" +
      text +
      ";border-radius:4px;padding:6px 8px;font-size:12px;cursor:pointer;flex:1;max-width:180px;}" +
      ".vw-hint{font-size:11px;color:" +
      dim +
      ";margin-top:10px;}" +
      ".vw-player{display:flex;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid " +
      border +
      ";}" +
      ".vw-pp{background:" +
      accent +
      ";color:#fff;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:10px;flex:0 0 30px;letter-spacing:-1px;}" +
      ".vw-pp.paused{opacity:.7;}" +
      ".vw-wave{display:none;align-items:flex-end;gap:2px;height:18px;}" +
      ".vw-wave.on{display:inline-flex;}" +
      ".vw-wave i{width:3px;background:" +
      accent +
      ";animation:vw-eq 1s ease-in-out infinite;}" +
      ".vw-wave i:nth-child(1){height:7px;animation-delay:0s;}" +
      ".vw-wave i:nth-child(2){height:15px;animation-delay:.12s;}" +
      ".vw-wave i:nth-child(3){height:10px;animation-delay:.24s;}" +
      ".vw-wave i:nth-child(4){height:16px;animation-delay:.36s;}" +
      ".vw-wave i:nth-child(5){height:9px;animation-delay:.48s;}" +
      ".vw-meta{flex:1;min-width:0;}" +
      ".vw-now{font-size:12px;color:" +
      text +
      ";white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" +
      ".vw-bar{height:4px;background:" +
      border +
      ";border-radius:2px;margin-top:6px;cursor:pointer;}" +
      ".vw-fill{height:100%;width:0;background:" +
      accent +
      ";border-radius:2px;}" +
      ".vw-transcript{background:none;border:1px solid " +
      border +
      ";color:" +
      dim +
      ";border-radius:4px;width:30px;height:30px;cursor:pointer;flex:0 0 30px;}" +
      ".vw-transbox{padding:10px 14px;font-size:12px;line-height:1.6;color:" +
      dim +
      ";border-top:1px solid " +
      border +
      ";max-height:160px;overflow:auto;white-space:pre-wrap;}" +
      ".vw-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}" +
      "@media (prefers-reduced-motion: reduce){.vw-eq i,.vw-wave i,.vw-row.playing .vw-status i{animation:none;}}"
    );
  }
})();
