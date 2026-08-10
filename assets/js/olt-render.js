// Canvas renderer for the top-down office (browser global, no modules).
//
// Monochrome office (one white/gray family); figures stay color-coded.
// - Humans: realistic man/woman with walk bob + arm swing; speech bubbles when talking.
// - Robots: metal body + visor; glowing work halo above; role label.
// - Rooms read by function via decor (no text labels).
class Renderer {
  constructor(cv) {
    this.cv = cv;
    this.ctx = cv.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.night = document.createElement('canvas'); // darkness layer for night
  }

  draw({ world, zones, props, walls, figures, display, selected, time }) {
    const ctx = this.ctx;
    const W = world.w || 800;
    const H = world.h || 576;
    const T = world.tile || 32;
    const tNow = performance.now();
    const darkness = (time && time.darkness) || 0;
    const isNight = darkness > 0.5;
    const exit = world.exit || null;

    ctx.clearRect(0, 0, W, H);

    // office flooring: subtle two-tone vinyl tiles + seams (monochrome)
    ctx.fillStyle = FLOOR_A;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = FLOOR_B;
    for (let gy = 0; gy < H; gy += T) {
      for (let gx = 0; gx < W; gx += T) {
        if (((gx / T) + (gy / T)) % 2 === 0) ctx.fillRect(gx, gy, T, T);
      }
    }
    ctx.strokeStyle = SEAM;
    ctx.lineWidth = 1;
    for (let x = T; x < W; x += T) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
    for (let y = T; y < H; y += T) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }

    this.drawWalls(ctx, W, H);
    this.drawInteriorWalls(ctx, walls);

    // zones (subtle outline only — function shown via decor, not text)
    for (const z of zones) {
      ctx.fillStyle = ZONE_FILL;
      ctx.fillRect(z.x, z.y, z.w, z.h);
      ctx.strokeStyle = ZONE_LINE;
      ctx.lineWidth = 1;
      ctx.strokeRect(z.x + 0.5, z.y + 0.5, z.w - 1, z.h - 1);
      this.drawZoneDecor(ctx, z);
    }

    // equipment + greenery (behind figures)
    for (const p of props || []) this.drawProp(ctx, p);

    // figures — robots always; humans only in daytime (they leave at night)
    for (const f of figures) {
      if (f.gone) continue;
      const d = display.get(f.id) || f;
      if (f.type === 'robot') {
        this.drawFigure(ctx, d.x, d.y, f, tNow);
        if (selected === f.id) this.drawSelect(ctx, d.x, d.y);
      } else if (!isNight) {
        this.drawFigure(ctx, d.x, d.y, f, tNow);
        if (selected === f.id) this.drawSelect(ctx, d.x, d.y);
      }
    }

    // night: darkness layer + robot head torches + humans stepping out
    if (darkness > 0) this.drawNight(ctx, W, H, figures, display, exit, darkness, tNow);
  }

  drawSelect(ctx, x, y) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 14, 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Build a darkness overlay (offscreen), punch light holes for robot torches
  // and the exit, then composite it over the scene. Robots stay visible inside
  // their cone; humans walking out are drawn on top so they read clearly.
  drawNight(ctx, W, H, figures, display, exit, darkness, tNow) {
    const ncv = this.night;
    ncv.width = W; ncv.height = H;
    const nctx = ncv.getContext('2d');
    nctx.clearRect(0, 0, W, H);
    nctx.fillStyle = 'rgba(9,12,28,' + (0.84 * darkness).toFixed(3) + ')';
    nctx.fillRect(0, 0, W, H);

    // punch light holes (reveal what's underneath)
    nctx.globalCompositeOperation = 'destination-out';
    if (exit) this.punchRadial(nctx, exit.x, exit.y - 12, 130, 1);
    for (const f of figures) {
      if (f.type !== 'robot' || f.gone) continue;
      const d = display.get(f.id) || f;
      this.punchCone(nctx, d.x, d.y - 26, f.dir || 'down', 168, 0.42);
    }
    nctx.globalCompositeOperation = 'source-over';

    ctx.drawImage(ncv, 0, 0);

    // warm torch tint (additive) + a bright bulb at each robot head
    for (const f of figures) {
      if (f.type !== 'robot' || f.gone) continue;
      const d = display.get(f.id) || f;
      const hx = d.x, hy = d.y - 26;
      this.tintCone(ctx, hx, hy, f.dir || 'down', 168, 0.42, darkness);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,228,150,' + (0.85 * darkness).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(hx, hy, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // faint cool pool at the exit so the single door is easy to spot
    if (exit) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(exit.x, exit.y - 12, 4, exit.x, exit.y - 12, 130);
      g.addColorStop(0, 'rgba(150,180,255,' + (0.18 * darkness).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(150,180,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(exit.x, exit.y - 12, 130, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // leaving humans drawn on top, fading as they step through the door
    ctx.save();
    for (const f of figures) {
      if (f.type === 'robot' || f.gone) continue;
      if (!(f.leaving || f.exiting)) continue;
      const d = display.get(f.id) || f;
      let a = 1;
      if (f.exiting) a = Math.max(0, Math.min(1, 1 - (d.y - (H - 80)) / 100));
      ctx.globalAlpha = a;
      this.drawFigure(ctx, d.x, d.y, f, tNow);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  punchRadial(nctx, x, y, r, strength) {
    nctx.save();
    const g = nctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,' + strength + ')');
    g.addColorStop(0.7, 'rgba(0,0,0,' + (strength * 0.7) + ')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    nctx.fillStyle = g;
    nctx.beginPath(); nctx.arc(x, y, r, 0, Math.PI * 2); nctx.fill();
    nctx.restore();
  }

  conePath(c, x, y, dir, len, spread) {
    const ang = { down: Math.PI / 2, up: -Math.PI / 2, left: Math.PI, right: 0 }[dir] || Math.PI / 2;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(ang - spread) * len, y + Math.sin(ang - spread) * len);
    c.lineTo(x + Math.cos(ang + spread) * len, y + Math.sin(ang + spread) * len);
    c.closePath();
  }

  punchCone(nctx, x, y, dir, len, spread) {
    nctx.save();
    this.conePath(nctx, x, y, dir, len, spread);
    nctx.clip();
    const g = nctx.createRadialGradient(x, y, 3, x, y, len);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.75, 'rgba(0,0,0,0.82)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    nctx.fillStyle = g;
    nctx.fillRect(x - len, y - len, len * 2, len * 2);
    nctx.restore();
  }

  tintCone(ctx, x, y, dir, len, spread, darkness) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.conePath(ctx, x, y, dir, len, spread);
    ctx.clip();
    const g = ctx.createRadialGradient(x, y, 3, x, y, len);
    g.addColorStop(0, 'rgba(255,214,130,' + (0.34 * darkness).toFixed(3) + ')');
    g.addColorStop(0.6, 'rgba(255,190,90,' + (0.16 * darkness).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - len, y - len, len * 2, len * 2);
    ctx.restore();
  }

  drawZoneDecor(ctx, z) {
    const x = z.x, y = z.y, w = z.w, h = z.h;
    ctx.save();
    ctx.fillStyle = PROP_FILL;
    ctx.strokeStyle = PROP_LINE;
    ctx.lineWidth = 1.5;
    switch (z.id) {
      case 'offices': {
        // glass partition walls dividing into 3 private offices (door gaps)
        for (let i = 1; i < 3; i++) {
          const lx = x + (w * i) / 3;
          ctx.fillStyle = '#e3e3dd';
          ctx.fillRect(lx - 2, y + 4, 4, h / 2 - 24);
          ctx.fillRect(lx - 2, y + h / 2 + 24, 4, h / 2 - 28);
        }
        break;
      }
      case 'collaboration': {
        ctx.fillStyle = 'rgba(0,0,0,0.035)';
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w * 0.44, h * 0.42, 0, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'printer': {
        this.shadeBox(ctx, x + 4, y + 4, w - 8, 10, 3); // print-station counter
        break;
      }
      case 'repair': {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(x + 10, y + 10, w - 20, h - 20); // equipment mat
        ctx.strokeStyle = 'rgba(0,0,0,0.08)'; // pegboard
        for (let px = x + 14; px < x + w - 10; px += 14) { ctx.beginPath(); ctx.moveTo(px, y + 12); ctx.lineTo(px, y + 40); ctx.stroke(); }
        for (let py = y + 14; py < y + 40; py += 12) { ctx.beginPath(); ctx.moveTo(x + 12, py); ctx.lineTo(x + w - 12, py); ctx.stroke(); }
        break;
      }
      case 'lounge': {
        ctx.fillStyle = 'rgba(0,0,0,0.035)';
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w * 0.4, h * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        this.shadeBox(ctx, x + 6, y + h - 22, w - 12, 16, 3); // kitchenette counter
        this.px(ctx, x + 20, y + h - 16, 10, 8, '#ededea'); ctx.strokeRect(x + 20, y + h - 16, 10, 8);
        this.px(ctx, x + 40, y + h - 16, 10, 8, '#ededea'); ctx.strokeRect(x + 40, y + h - 16, 10, 8);
        break;
      }
      case 'reception': {
        ctx.fillStyle = 'rgba(0,0,0,0.035)';
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h - 30, w * 0.35, 40, 0, 0, Math.PI * 2); ctx.fill();
        this.shadeBox(ctx, x + w / 2 - 30, y + 6, 60, 16, 3); // logo panel
        break;
      }
      case 'workstations':
      case 'workstations2':
      default: {
        ctx.fillStyle = 'rgba(60,80,110,0.025)';
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4); // faint carpet tint
      }
    }
    ctx.restore();
  }

  drawWalls(ctx, W, H) {
    const wt = 8;
    ctx.fillStyle = WALL;
    ctx.fillRect(0, 0, W, wt);
    ctx.fillRect(0, H - wt, W, wt);
    ctx.fillRect(0, 0, wt, H);
    ctx.fillRect(W - wt, 0, wt, H);
    ctx.strokeStyle = WALL_LINE;
    ctx.lineWidth = 1;
    ctx.strokeRect(wt - 0.5, wt - 0.5, W - 2 * wt + 1, H - 2 * wt + 1);
    ctx.fillStyle = FLOOR_A;
    ctx.fillRect(W / 2 - 26, H - wt, 52, wt); // door gap
  }

  drawInteriorWalls(ctx, walls) {
    if (!walls) return;
    for (const w of walls) {
      // solid wall body (matches perimeter) + outline + top highlight
      ctx.fillStyle = WALL;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = WALL_LINE;
      ctx.lineWidth = 1;
      ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      if (w.w >= w.h) ctx.fillRect(w.x, w.y, w.w, 2);
      else ctx.fillRect(w.x, w.y, 2, w.h);
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      if (w.w >= w.h) ctx.fillRect(w.x, w.y + w.h - 2, w.w, 2);
      else ctx.fillRect(w.x + w.w - 2, w.y, 2, w.h);
    }
  }

  rr(ctx, x, y, w, h, r) {
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    else { ctx.beginPath(); ctx.rect(x, y, w, h); }
  }

  px(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  }

  shadeBox(ctx, x, y, w, h, r) {
    this.rr(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(x, y, w, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.fillRect(x, y + h - 2, w, 2);
    ctx.restore();
  }

  drawProp(ctx, p) {
    const x = p.x, y = p.y, w = p.w, h = p.h;
    ctx.save();
    ctx.strokeStyle = PROP_LINE;
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 1, w / 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PROP_FILL;
    switch (p.type) {
      case 'desk': {
        this.px(ctx, x + 3, y + 8, 4, h - 8, PROP_DARK);
        this.px(ctx, x + w - 7, y + 8, 4, h - 8, PROP_DARK);
        this.shadeBox(ctx, x, y, w, 10, 3);
        this.px(ctx, x + w / 2 - 12, y - 22, 24, 4, PROP_DARK);
        this.rr(ctx, x + w / 2 - 16, y - 40, 32, 22, 3); ctx.fill(); ctx.stroke();
        this.px(ctx, x + w / 2 - 12, y - 36, 24, 14, '#dadad6');
        this.px(ctx, x + w / 2 - 14, y + 12, 28, 6, '#ececea'); ctx.strokeRect(x + w / 2 - 14, y + 12, 28, 6);
        break;
      }
      case 'chair': {
        this.px(ctx, x + w / 2 - 2, y + 6, 4, h - 6, PROP_DARK);
        this.shadeBox(ctx, x, y - 6, w, 10, 3);
        this.shadeBox(ctx, x, y + 4, w, h - 6, 3);
        ctx.strokeStyle = PROP_LINE;
        ctx.beginPath(); ctx.moveTo(x + 4, y + 4 + (h - 6) / 2); ctx.lineTo(x + w - 4, y + 4 + (h - 6) / 2); ctx.stroke();
        break;
      }
      case 'printer': {
        this.shadeBox(ctx, x, y, w, h, 3);
        this.px(ctx, x + 6, y + h - 14, w - 12, 4, PROP_DARK);
        this.px(ctx, x + w / 2 - 12, y + h - 8, 24, 6, '#fbfbf9'); ctx.strokeRect(x + w / 2 - 12, y + h - 8, 24, 6);
        this.px(ctx, x + 8, y + 8, 10, 6, PROP_DARK);
        break;
      }
      case 'table': {
        const legs = [[4, 4], [w - 8, 4], [4, h - 8], [w - 8, h - 8]];
        for (const [lx, ly] of legs) this.px(ctx, x + lx, y + ly, 4, 6, PROP_DARK);
        this.shadeBox(ctx, x, y, w, h - 4, 6);
        break;
      }
      case 'bench': {
        const legs = [[4, h - 8], [w - 8, h - 8]];
        for (const [lx, ly] of legs) this.px(ctx, x + lx, y + ly, 5, 8, PROP_DARK);
        this.shadeBox(ctx, x, y, w, h - 6, 3);
        this.px(ctx, x + w - 22, y - 8, 16, 8, PROP_DARK);
        this.px(ctx, x + w - 10, y - 4, 6, 4, '#e6e6e2');
        break;
      }
      case 'toolbox': {
        this.shadeBox(ctx, x, y + 4, w, h - 4, 3);
        this.px(ctx, x, y, w, 6, '#ededea'); ctx.strokeRect(x, y, w, 6);
        ctx.beginPath(); ctx.arc(x + w / 2, y + 2, 8, Math.PI, 0); ctx.stroke();
        this.px(ctx, x + 8, y + 10, 5, 4, PROP_DARK);
        this.px(ctx, x + w - 13, y + 10, 5, 4, PROP_DARK);
        break;
      }
      case 'sofa': {
        this.shadeBox(ctx, x, y, w, h - 6, 8);
        this.shadeBox(ctx, x, y, 12, h, 4);
        this.shadeBox(ctx, x + w - 12, y, 12, h, 4);
        this.shadeBox(ctx, x + 12, y - 6, w - 24, 12, 4);
        ctx.strokeStyle = PROP_LINE;
        ctx.beginPath(); ctx.moveTo(x + w / 2, y + 2); ctx.lineTo(x + w / 2, y + h - 8); ctx.stroke();
        break;
      }
      case 'cooler': {
        this.shadeBox(ctx, x, y + 10, w, h - 10, 3);
        this.rr(ctx, x + w / 2 - 7, y - 6, 14, 18, 5); ctx.fill(); ctx.stroke();
        this.px(ctx, x + w / 2 - 4, y - 2, 8, 12, '#ededea');
        this.px(ctx, x + w / 2 - 2, y + h - 8, 4, 5, PROP_DARK);
        break;
      }
      case 'plant': {
        ctx.fillStyle = '#ededea';
        const cx = x + w / 2;
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i - 2) * 0.5;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * (w * 0.32), y + h * 0.4 + Math.sin(a) * (h * 0.28), w * 0.18, h * 0.22, a, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = PROP_LINE;
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i - 2) * 0.5;
          ctx.beginPath(); ctx.moveTo(cx, y + h * 0.55); ctx.lineTo(cx + Math.cos(a) * (w * 0.32), y + h * 0.4 + Math.sin(a) * (h * 0.28)); ctx.stroke();
        }
        ctx.fillStyle = PROP_FILL;
        this.rr(ctx, x + w / 2 - 9, y + h - 14, 18, 13, 2); ctx.fill(); ctx.stroke();
        break;
      }
      case 'whiteboard': {
        this.px(ctx, x, y, w, h, '#f2f2ef');
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        ctx.strokeStyle = PROP_LINE;
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 4); ctx.lineTo(x + w - 6, y + 4);
        ctx.moveTo(x + 6, y + 8); ctx.lineTo(x + w - 14, y + 8);
        ctx.stroke();
        this.px(ctx, x + 4, y + h - 2, w - 8, 2, PROP_DARK);
        break;
      }
      case 'shelf': {
        this.shadeBox(ctx, x, y, w, h, 3);
        ctx.strokeStyle = PROP_LINE;
        const rows = Math.max(2, Math.round(h / 22));
        for (let i = 1; i < rows; i++) { const ly = y + (h * i) / rows; ctx.beginPath(); ctx.moveTo(x + 2, ly); ctx.lineTo(x + w - 2, ly); ctx.stroke(); }
        break;
      }
      case 'rack': {
        this.shadeBox(ctx, x, y, w, h, 3);
        ctx.strokeStyle = PROP_LINE;
        for (let sy = y + 8; sy < y + h - 6; sy += 12) {
          this.px(ctx, x + 5, sy, w - 10, 5, '#e7e7e3');
          ctx.strokeRect(x + 5, sy, w - 10, 5);
          this.px(ctx, x + w - 12, sy + 1, 3, 3, '#5dcaa5');
        }
        break;
      }
      case 'reception': {
        this.shadeBox(ctx, x, y, w, h, 8);
        this.px(ctx, x, y + h - 10, w, 10, PROP_DARK);
        this.px(ctx, x + 10, y + 8, w - 20, 4, '#fbfbf9');
        break;
      }
      default:
        this.shadeBox(ctx, x, y, w, h, 3);
    }
    ctx.restore();
  }

  drawFigure(ctx, x, y, f, tNow) {
    const moving = f.state === 'moving';
    const fr = moving ? Math.floor(tNow / 160) % 2 : 0;
    const dir = f.dir || 'down';

    // contact shadow (no bob)
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // body with subtle walk bob
    const bob = moving ? (fr ? -1 : 0) : 0;
    ctx.save();
    ctx.translate(0, bob);
    if (f.type === 'robot') this.drawRobot(ctx, x, y, dir, fr);
    else this.drawHuman(ctx, x, y, PAL[f.type] || PAL.man, dir, fr, f.type === 'woman');
    ctx.restore();

    // indicators (above, not bobbed)
    if (f.type === 'robot') {
      if (f.label) this.drawLabel(ctx, x, y - 60, f.label);
      this.drawHalo(ctx, x, y - 46, tNow);
    } else if (f.state === 'talking') {
      this.drawSpeech(ctx, x, y - 52, tNow);
    } else {
      const sc = STATE_COLOR[f.state] || '#9aa0a8';
      ctx.fillStyle = sc;
      ctx.beginPath(); ctx.arc(x, y - 36, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; ctx.stroke();
    }
  }

  drawHalo(ctx, x, y, tNow) {
    const pulse = 0.5 + 0.5 * Math.sin(tNow / 320);
    const r = 6.5 + pulse * 2.5;
    const g = ctx.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, 'rgba(245,190,70,0.95)');
    g.addColorStop(0.5, 'rgba(245,190,70,0.35)');
    g.addColorStop(1, 'rgba(245,190,70,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  drawSpeech(ctx, x, y, tNow) {
    const w = 22, h = 14;
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = 1;
    this.rr(ctx, x - w / 2, y - 14, w, h, 5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.lineTo(x, y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const ph = (tNow / 320 + i * 0.33) % 1;
      const dy = -2 - (1 - ph) * 2;
      ctx.fillStyle = '#444';
      ctx.beginPath(); ctx.arc(x - 6 + i * 6, y + 4 + dy, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawLabel(ctx, x, y, text) {
    ctx.font = '10px system-ui';
    const w = ctx.measureText(text).width + 10;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    this.rr(ctx, x - w / 2, y - 6, w, 13, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }

  drawHuman(ctx, x, y, p, dir, fr, isWoman) {
    const step = fr ? 2 : 0;
    const armSwing = fr ? 1 : -1;
    // legs / shoes (man: trousers; woman: dress hides legs)
    if (!isWoman) {
      this.px(ctx, x - 6, y - 7 - step, 5, 9, p.shoe);
      this.px(ctx, x + 1, y - 7 - (fr ? 0 : 2), 5, 9, p.shoe);
    } else {
      // dress hem to knees
      this.px(ctx, x - 7, y - 9, 14, 8, p.cloth);
      this.px(ctx, x - 5, y - 1, 4, 3, p.shoe);
      this.px(ctx, x + 1, y - 1, 4, 3, p.shoe);
    }
    // torso / clothing with shoulders + collar
    this.px(ctx, x - 7, y - 22, 14, 13, p.cloth);
    this.px(ctx, x - 7, y - 22, 14, 2, p.clothL);     // top highlight
    this.px(ctx, x - 7, y - 10, 14, 2, p.clothD);      // hem shadow
    this.px(ctx, x - 7, y - 12, 2, 8, p.clothD);       // left shade
    this.px(ctx, x + 5, y - 12, 2, 8, p.clothL);       // right light
    this.px(ctx, x - 2, y - 20, 4, 2, p.clothD);       // collar
    // arms (swing while walking)
    this.px(ctx, x - 10, y - 21 + (armSwing > 0 ? 1 : 0), 3, 11, p.clothD);
    this.px(ctx, x + 7, y - 21 + (armSwing < 0 ? 1 : 0), 3, 11, p.clothD);
    // neck
    this.px(ctx, x - 2, y - 25, 4, 3, p.skinD);
    // head
    const hy = y - 27;
    if (dir === 'up') {
      ctx.fillStyle = p.hair;
      ctx.beginPath(); ctx.arc(x, hy, 7, 0, Math.PI * 2); ctx.fill();
    } else if (dir === 'left') {
      this.px(ctx, x - 7, hy - 6, 8, 14, p.hair);
    } else if (dir === 'right') {
      this.px(ctx, x - 1, hy - 6, 8, 14, p.hair);
    } else {
      ctx.fillStyle = p.hair;
      ctx.beginPath(); ctx.arc(x, hy - 1, 7, Math.PI, 0); ctx.fill();
      this.px(ctx, x - 7, hy - 1, 14, 3, p.hair);
    }
    // face
    this.px(ctx, x - 5, hy - 1, 10, 8, p.skin);
    this.px(ctx, x + 2, hy - 1, 3, 8, p.skinD);
    ctx.fillStyle = '#2b2b2b';
    if (dir === 'down') {
      this.px(ctx, x - 3, hy + 1, 2, 2, '#2b2b2b');
      this.px(ctx, x + 1, hy + 1, 2, 2, '#2b2b2b');
      this.px(ctx, x - 1, hy + 5, 2, 1, p.skinD);
    } else if (dir === 'left') {
      this.px(ctx, x - 1, hy + 1, 2, 2, '#2b2b2b');
    } else if (dir === 'right') {
      this.px(ctx, x + 2, hy + 1, 2, 2, '#2b2b2b');
    }
    if (isWoman) {
      this.px(ctx, x - 7, hy - 2, 3, 13, p.hair);
      this.px(ctx, x + 4, hy - 2, 3, 13, p.hair);
    }
  }

  drawRobot(ctx, x, y, dir, fr) {
    const p = PAL.robot;
    const step = fr ? 2 : 0;
    this.px(ctx, x - 6, y - 7 - step, 5, 9, p.metalD);
    this.px(ctx, x + 1, y - 7 - (fr ? 0 : 2), 5, 9, p.metalD);
    this.px(ctx, x - 6, y - 1, 5, 3, p.shoe);
    this.px(ctx, x + 1, y - 1, 5, 3, p.shoe);
    this.px(ctx, x - 7, y - 21, 14, 14, p.metal);
    this.px(ctx, x - 7, y - 21, 14, 2, p.metalL);
    this.px(ctx, x - 7, y - 9, 14, 2, p.metalD);
    this.px(ctx, x - 1, y - 18, 2, 8, p.metalD);
    this.px(ctx, x - 3, y - 16, 2, 2, '#5dcaa5');
    this.px(ctx, x - 10, y - 20, 3, 11, p.metalD);
    this.px(ctx, x + 7, y - 20, 3, 11, p.metalD);
    const hy = y - 26;
    this.px(ctx, x - 5, hy - 5, 10, 12, p.metal);
    this.px(ctx, x - 5, hy - 5, 10, 2, p.metalL);
    this.px(ctx, x - 0.5, hy - 11, 1, 5, p.metalD);
    this.px(ctx, x - 1.5, hy - 12, 3, 3, '#ef9f27');
    if (dir === 'up') {
      this.px(ctx, x - 5, hy - 5, 10, 5, p.metalD);
    } else {
      const vx = dir === 'right' ? x + 1 : dir === 'left' ? x - 5 : x - 4;
      this.px(ctx, vx, hy - 2, 8, 4, p.screen);
      this.px(ctx, vx + 1, hy - 1, 2, 2, p.visor);
      this.px(ctx, vx + 5, hy - 1, 2, 2, p.visor);
    }
  }
}

// palette + color constants (kept on the class scope)
const FLOOR_A = '#f4f4f1';
const FLOOR_B = '#efefeb';
const SEAM = '#e2e2dc';
const WALL = '#e6e6e1';
const WALL_LINE = '#d2d2cb';
const ZONE_FILL = 'rgba(255,255,255,0.45)';
const ZONE_LINE = '#d7d7d2';
const PROP_FILL = '#ffffff';
const PROP_LINE = '#c4c4bd';
const PROP_DARK = '#9a9a93';
const PAL = {
  man: {
    skin: '#e8b58c', skinD: '#caa074', hair: '#3a2e22',
    cloth: '#3b82c4', clothD: '#2b629a', clothL: '#7fb0e0', shoe: '#2a2a2a',
  },
  woman: {
    skin: '#f0c19e', skinD: '#d6a079', hair: '#4a3525',
    cloth: '#d4537e', clothD: '#a83c61', clothL: '#ec84a8', shoe: '#7a3b54',
  },
  robot: {
    metal: '#ef9f27', metalD: '#c47e12', metalL: '#f9c96a',
    screen: '#23262b', visor: '#bfe9ff', shoe: '#555',
  },
};
const STATE_COLOR = {
  thinking: '#ef9f27',
  working: '#5dcaa5',
  moving: '#9aa0a8',
  idle: '#9aa0a8',
};

window.Renderer = Renderer;
