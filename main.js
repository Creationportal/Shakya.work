/* ==========================================================================
   main — interactions: orbit canvas, mobile nav, tabs, scroll reveal
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  function initNav() {
    const nav = document.querySelector(".nav");
    const burger = nav && nav.querySelector(".nav__burger");
    if (!nav || !burger) return;
    burger.addEventListener("click", () => nav.classList.toggle("open"));
  }

  /* ---------- Pointer-reactive orbit ---------- */
  function initOrbit() {
    const canvas = document.querySelector("[data-orbit]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, cx, cy, dpr;
    const particles = [];
    const N = 26;
    const pointer = { x: 0, y: 0, active: false };

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
        p.a += p.speed;
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
      requestAnimationFrame(draw);
    }

    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    });
    canvas.addEventListener("pointerleave", () => { pointer.active = false; });

    resize(); build(); draw();
    window.addEventListener("resize", () => { resize(); build(); });
  }

  /* ---------- Explorer tabs ---------- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach((group) => {
      const tabs = group.querySelectorAll(".tab");
      const title = group.querySelector("[data-panel-title]");
      const trans = group.querySelector("[data-panel-trans]");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          if (title) title.textContent = tab.dataset.title || title.textContent;
          if (trans) trans.textContent = tab.dataset.trans || trans.textContent;
        });
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length || !("IntersectionObserver" in window)) {
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

  /* ---------- Contact form (mock) ---------- */
  function initForm() {
    const form = document.querySelector("[data-form]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("button");
      if (!btn) return;
      const orig = btn.textContent;
      btn.textContent = "✓";
      setTimeout(() => { btn.textContent = orig; form.reset(); }, 1600);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initOrbit();
    initTabs();
    initReveal();
    initForm();
  });
})();
