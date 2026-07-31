/* ==========================================================================
   main — interactions: orbit canvas, mobile nav, tabs, scroll reveal,
   count-up metrics, tile search, contact form, scroll-to-top
   ========================================================================== */
(function () {
  "use strict";

  const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Skip link target ---------- */
  function initSkip() {
    const main = document.querySelector("main");
    if (main) main.setAttribute("tabindex", "-1");
  }

  /* ---------- Mobile nav ---------- */
  function initNav() {
    const nav = document.querySelector(".nav");
    const burger = nav && nav.querySelector(".nav__burger");
    if (!nav || !burger) return;

    function setOpen(open) {
      nav.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-locked", open);
    }

    burger.addEventListener("click", () => setOpen(!nav.classList.contains("open")));

    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setOpen(false))
    );
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- Pointer-reactive, draggable orbit ---------- */
  function initOrbit() {
    const canvas = document.querySelector("[data-orbit]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, cx, cy, dpr;
    const particles = [];
    const N = 26;
    const pointer = { x: 0, y: 0, active: false };
    let phase = 0;
    let drag = null;
    let raf = null;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2; cy = h / 2;
    }

    function build() {
      particles.length = 0;
      for (let i = 0; i < N; i++) {
        const r = 60 + Math.random() * (Math.min(w, h) / 2 - 70);
        particles.push({
          r, a: Math.random() * Math.PI * 2,
          speed: (0.0006 + Math.random() * 0.0012) * (Math.random() < 0.5 ? 1 : -1),
          size: 1.5 + Math.random() * 3,
          op: 0.25 + Math.random() * 0.6,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#6C5CE7";
      const text = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#FAFAFA";
      // rings
      [Math.min(w, h) / 2 - 10, Math.min(w, h) / 2 - 50, 70].forEach((rad, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(2, rad), 0, Math.PI * 2);
        ctx.strokeStyle = accent;
        ctx.globalAlpha = [0.25, 0.5, 0.7][i] || 0.4;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      // core
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      // particles
      particles.forEach((p) => {
        p.a += p.speed + phase;
        let px = cx + Math.cos(p.a) * p.r;
        let py = cy + Math.sin(p.a) * p.r;
        if (pointer.active) {
          const dx = px - pointer.x, dy = py - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < 90) {
            const f = (90 - d) / 90;
            px += (dx / d) * f * 22;
            py += (dy / d) * f * 22;
          }
        }
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() < 0.15 ? text : accent;
        ctx.globalAlpha = p.op;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (!RM) raf = requestAnimationFrame(draw);
    }

    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    });
    canvas.addEventListener("pointerleave", () => { pointer.active = false; });

    // drag to rotate the whole field
    canvas.addEventListener("pointerdown", (e) => {
      drag = { x: e.clientX, last: 0 };
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      drag.x = e.clientX;
      drag.last = dx * 0.002;
    });
    canvas.addEventListener("pointerup", () => { drag = null; });
    canvas.addEventListener("pointercancel", () => { drag = null; });

    (function tick() {
      if (drag) { phase += drag.last; drag.last *= 0.9; }
      if (!RM) raf = requestAnimationFrame(tick);
    })();

    resize(); build(); draw();
    window.addEventListener("resize", () => { resize(); build(); });
  }

  /* ---------- Explorer tabs (i18n-aware) ---------- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach((group) => {
      const tabs = Array.from(group.querySelectorAll(".tab"));
      const title = group.querySelector("[data-panel-title]");
      const trans = group.querySelector("[data-panel-trans]");
      const metrics = group.querySelector("[data-panel-metrics]");
      const visuals = group.querySelectorAll("[data-panel-visual]");
      let active = group.querySelector(".tab.active") || tabs[0];

      function lang() {
        return (window.i18n && window.i18n.current()) || "en";
      }

      function applyTab(tab) {
        tabs.forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        active = tab;
        const zh = lang() === "zh";
        if (title) title.textContent = zh ? (tab.dataset.titleZh || tab.dataset.title) : tab.dataset.title;
        if (trans) trans.textContent = zh ? (tab.dataset.transZh || tab.dataset.trans) : tab.dataset.trans;
        if (metrics) metrics.innerHTML = zh ? (tab.dataset.metricsZh || tab.dataset.metrics) : tab.dataset.metrics;
        const show = tab.dataset.visual;
        visuals.forEach((v) => v.classList.toggle("is-hidden", v.dataset.panelVisual !== show));
      }

      tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => applyTab(tab));
        tab.addEventListener("keydown", (e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          const next = e.key === "ArrowRight"
            ? tabs[(i + 1) % tabs.length]
            : tabs[(i - 1 + tabs.length) % tabs.length];
          applyTab(next);
          next.focus();
        });
      });
      if (active) applyTab(active);

      document.addEventListener("langchange", () => { if (active) applyTab(active); });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length || RM || !("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Count-up metrics ---------- */
  function initCountUp() {
    const els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    function run(el) {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      if (RM) { el.textContent = target + suffix; return; }
      const dur = 1200;
      const t0 = performance.now();
      (function step(now) {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Interactive tile search ---------- */
  function initTileSearch() {
    document.querySelectorAll("[data-tile-search]").forEach((box) => {
      const input = box.querySelector("input");
      if (!input) return;
      input.addEventListener("input", () => {
        box.classList.toggle("is-searching", input.value.trim().length > 0);
      });
    });
  }

  /* ---------- Contact form (mock with mailto fallback) ---------- */
  function initForm() {
    const form = document.querySelector("[data-form]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("button[type='submit']");
      const orig = btn ? btn.textContent : "";
      const state = form.querySelector("[data-form-state]");
      if (btn) btn.disabled = true;
      if (state) state.classList.add("show");
      setTimeout(() => {
        if (btn) { btn.disabled = false; }
        if (state) state.classList.remove("show");
        form.reset();
      }, 1800);
    });
  }

  /* ---------- Scroll-to-top ---------- */
  function initTop() {
    const btn = document.querySelector("[data-top]");
    if (!btn) return;
    function onScroll() {
      btn.classList.toggle("show", window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSkip();
    initNav();
    initOrbit();
    initTabs();
    initReveal();
    initCountUp();
    initTileSearch();
    initForm();
    initTop();
  });
})();
