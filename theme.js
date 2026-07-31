/* ==========================================================================
   theme — light / dark toggle
   <html data-theme="dark|light">; persists in localStorage('shakya-theme').
   ========================================================================== */
(function () {
  "use strict";
  const STORAGE = "shakya-theme";

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE, theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((tg) => {
      const label = tg.querySelector(".t-label");
      const icon = tg.querySelector(".t-icon");
      if (label) label.textContent = theme === "dark" ? "Dark" : "Light";
      if (icon) icon.textContent = theme === "dark" ? "◐" : "◑";
      // localized label via i18n if present
      if (window.i18n) {
        const t = window.i18n.T["nav.theme"];
        if (t) label.textContent = theme === "dark" ? (t.en) : (window.i18n.current() === "zh" ? "浅色" : "Light");
      }
    });
  }

  function current() {
    return localStorage.getItem(STORAGE) || "dark";
  }

  function toggle() {
    apply(current() === "dark" ? "light" : "dark");
  }

  // apply immediately (avoid flash) — runs before DOMContentLoaded via placement
  apply(current());

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-theme-toggle]").forEach((tg) => {
      tg.addEventListener("click", toggle);
    });
    // keep label in sync on language change
    document.addEventListener("langchange", () => apply(current()));
  });

  window.theme = { apply, current, toggle };
})();
