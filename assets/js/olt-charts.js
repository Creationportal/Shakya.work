// Lightweight, dependency-free time-series chart for the office presence panel.
// Draws a scrolling window of AI-agent vs human counts and supports hover
// tooltips. No external libraries.
(function (global) {
  'use strict';

  class OfficeCharts {
    constructor(opts) {
      this.canvas = opts.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.tip = opts.tip || null;
      this.history = [];      // { t, agents, humans }
      this.maxSec = 75;       // seconds shown in the window
      this.dpr = Math.max(1, global.devicePixelRatio || 1);
      this.pad = { l: 40, r: 14, t: 14, b: 22 };
      this.hover = -1;
      this._bind();
      this._resize();
    }

    _resize() {
      const w = this.canvas.clientWidth || 720;
      const h = this.canvas.clientHeight || 300;
      this.canvas.width = Math.round(w * this.dpr);
      this.canvas.height = Math.round(h * this.dpr);
      this.W = w; this.H = h;
    }

    _bind() {
      global.addEventListener('resize', () => { this._resize(); this.render(); });
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this._hoverAt(e.clientX - rect.left);
      });
      this.canvas.addEventListener('mouseleave', () => {
        this.hover = -1; this.render();
        if (this.tip) this.tip.style.display = 'none';
      });
    }

    _hoverAt(x) {
      const n = this.history.length;
      if (n < 2) { this.render(); return; }
      const plot = this._plot();
      const fx = (x - plot.l) / plot.w;
      let idx = Math.round(fx * (n - 1));
      idx = Math.max(0, Math.min(n - 1, idx));
      this.hover = idx;
      this.render();
      this._showTip(idx, x);
    }

    _showTip(idx, x) {
      if (!this.tip) return;
      const s = this.history[idx];
      if (!s) return;
      const ago = Math.max(0, Math.round(this.history[this.history.length - 1].t - s.t));
      this.tip.style.display = 'block';
      this.tip.innerHTML =
        '<span>AI agents: <b>' + s.agents + '</b></span>' +
        '<span>Humans: <b>' + s.humans + '</b></span>' +
        '<span class="muted">' + (ago === 0 ? 'now' : ago + 's ago') + '</span>';
      const rect = this.canvas.getBoundingClientRect();
      let tx = x + 14;
      if (tx + 160 > rect.width) tx = x - 160;
      this.tip.style.left = tx + 'px';
      this.tip.style.top = '8px';
    }

    push(s) {
      this.history.push(s);
      const last = this.history[this.history.length - 1].t;
      while (this.history.length && this.history[0].t < last - this.maxSec) this.history.shift();
    }

    _plot() {
      const { l, r, t, b } = this.pad;
      return { l, r, t, b, w: this.W - l - r, h: this.H - t - b };
    }

    render() {
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.W, this.H);
      const p = this._plot();
      const n = this.history.length;

      let yMax = 1;
      for (const s of this.history) yMax = Math.max(yMax, s.agents, s.humans);
      yMax = Math.max(4, Math.ceil(yMax / 4) * 4);

      const yOf = (v) => p.t + p.h - (v / yMax) * p.h;

      // grid + y labels
      ctx.strokeStyle = 'rgba(16,24,40,0.08)';
      ctx.fillStyle = '#8a93a3';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const steps = 4;
      for (let i = 0; i <= steps; i++) {
        const v = (yMax / steps) * i;
        const y = yOf(v);
        ctx.beginPath(); ctx.moveTo(p.l, y); ctx.lineTo(p.l + p.w, y); ctx.stroke();
        ctx.fillText(String(Math.round(v)), p.l - 6, y);
      }
      ctx.strokeStyle = 'rgba(16,24,40,0.14)';
      ctx.beginPath(); ctx.moveTo(p.l, p.t + p.h); ctx.lineTo(p.l + p.w, p.t + p.h); ctx.stroke();

      if (n < 2) {
        ctx.fillStyle = '#9aa0a8';
        ctx.textAlign = 'center';
        ctx.fillText('collecting data…', p.l + p.w / 2, p.t + p.h / 2);
        return;
      }

      const xOf = (i) => p.l + (i / (n - 1)) * p.w;

      const series = (key, color, fill) => {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const x = xOf(i), y = yOf(this.history[i][key]);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.lineJoin = 'round';
        ctx.stroke();
        if (fill) {
          ctx.lineTo(xOf(n - 1), p.t + p.h);
          ctx.lineTo(xOf(0), p.t + p.h);
          ctx.closePath();
          ctx.fillStyle = fill;
          ctx.fill();
        }
      };
      series('humans', '#3b82c4', 'rgba(59,130,196,0.10)');
      series('agents', '#ef9f27', 'rgba(239,159,39,0.13)');

      ctx.fillStyle = '#8a93a3';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('-' + this.maxSec + 's', p.l, p.t + p.h + 6);
      ctx.textAlign = 'right';
      ctx.fillText('now', p.l + p.w, p.t + p.h + 6);

      if (this.hover >= 0 && this.hover < n) {
        const x = xOf(this.hover);
        ctx.strokeStyle = 'rgba(16,24,40,0.25)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(x, p.t); ctx.lineTo(x, p.t + p.h); ctx.stroke();
        ctx.setLineDash([]);
        const s = this.history[this.hover];
        const dot = (key, color) => {
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.arc(x, yOf(s[key]), 3.5, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
        };
        dot('humans', '#3b82c4');
        dot('agents', '#ef9f27');
      }
    }
  }

  global.OfficeCharts = OfficeCharts;
})(window);
