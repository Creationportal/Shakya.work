// Client-side simulation engine (browser port of the Node server sim).
// Owns figure state, runs the live tick, and produces snapshots for the renderer.
// No server, no fetch, no dependencies — reads window.MAP_DATA / window.ROSTER_DATA.
//
// Spatial model:
//  - The world is a tile grid (40 x 28). Walls (perimeter + interior) block cells.
//  - Both humans and robots pathfind on the grid (A*) and are blocked by walls
//    (per-step collision: a step into a blocked cell is cancelled).
//  - Robots actively patrol (pathfinding around walls); humans wander, sit, converse.
//
// Day / night cycle:
//  - A compressed clock loops every CYCLE seconds. Lights are on in the day and
//    off at night. At nightfall every human walks to the single door and leaves
//    (gone). Robots keep working 24/7 and carry a head torch at night. At dawn the
//    humans return through the same door.
(function (global) {
  'use strict';

  const MAP = global.MAP_DATA;
  const ROSTER = global.ROSTER_DATA;

  const TILE = MAP.tileSize;
  const COLS = MAP.width;
  const ROWS = MAP.height;
  const WORLD_W = COLS * TILE;
  const WORLD_H = ROWS * TILE;
  const SEATS = MAP.seats || [];
  const WALLS = MAP.walls || [];

  // --- Day / night timing (compressed for the showcase) ---
  const CYCLE = 90;      // seconds for a full day -> night -> day loop
  const DAY_END = 0.58;  // day -> dusk (lights begin to fade)
  const DUSK_END = 0.64; // dusk -> night (lights fully off)
  const NIGHT_END = 0.94; // night -> dawn (lights begin to return)
  // DAWN_END = 1.0

  let CLOCK = 0;          // sim seconds elapsed
  let PREV_NIGHT = false; // for edge detection of night<->day

  const ROLE_ZONE = {
    helper: 'workstations',
    printer: 'printer',
    collaborator: 'collaboration',
    fixer: 'repair',
    general: 'lounge',
  };
  const HUMAN_ZONES = ['workstations', 'lounge', 'collaboration', 'offices', 'reception', 'workstations2'];

  const SPEED = 38; // human px/s
  const BOT_SPEED = 52; // robot px/s (orthogonal, along grid paths)
  const rand = (min, max) => min + Math.random() * (max - min);
  const randint = (n) => Math.floor(Math.random() * n);

  function zoneRect(zone) {
    return { x: zone.x * TILE, y: zone.y * TILE, w: zone.w * TILE, h: zone.h * TILE };
  }

  // ---------------------------------------------------------------------------
  // Walkability grid (true = blocked by a wall)
  // ---------------------------------------------------------------------------
  const grid = [];
  function buildGrid() {
    for (let r = 0; r < ROWS; r++) {
      grid[r] = [];
      for (let c = 0; c < COLS; c++) {
        grid[r][c] = c === 0 || r === 0 || c === COLS - 1 || r === ROWS - 1; // perimeter
      }
    }
    for (const w of WALLS) {
      const c0 = Math.floor(w.x / TILE);
      const c1 = Math.floor((w.x + w.w - 1) / TILE);
      const r0 = Math.floor(w.y / TILE);
      const r1 = Math.floor((w.y + w.h - 1) / TILE);
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          if (r >= 0 && r < ROWS && c >= 0 && c < COLS) grid[r][c] = true;
        }
      }
    }
    // carve the single entry/exit door at the bottom-center (matches renderer gap)
    const doorC = Math.floor(COLS / 2);
    grid[ROWS - 1][doorC - 1] = false;
    grid[ROWS - 1][doorC] = false;
    grid[ROWS - 1][doorC + 1] = false;
  }
  buildGrid();

  const EXIT = { x: Math.floor(COLS / 2) * TILE + TILE / 2, y: (ROWS - 1) * TILE + TILE / 2 };

  const key = (c, r) => r * COLS + c;
  const walkableCell = (c, r) => c >= 0 && r >= 0 && c < COLS && r < ROWS && !grid[r][c];
  const cellOf = (x, y) => ({ c: Math.floor(x / TILE), r: Math.floor(y / TILE) });
  const walkableXY = (x, y) => { const { c, r } = cellOf(x, y); return walkableCell(c, r); };
  const center = (c, r) => ({ x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 });

  // nearest walkable cell via BFS (used to snap targets that land on a wall)
  function nearestWalkable(c, r) {
    if (walkableCell(c, r)) return { c, r };
    const q = [[c, r]];
    const seen = new Set([key(c, r)]);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    let i = 0;
    while (i < q.length) {
      const [cc, rr] = q[i++];
      for (const [dc, dr] of dirs) {
        const nc = cc + dc, nr = rr + dr;
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
        const k = key(nc, nr);
        if (seen.has(k)) continue;
        seen.add(k);
        if (walkableCell(nc, nr)) return { c: nc, r: nr };
        q.push([nc, nr]);
      }
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // A* on the 4-connected grid -> list of pixel waypoints (cell centers)
  // ---------------------------------------------------------------------------
  function astar(sx, sy, tx, ty) {
    let s = cellOf(sx, sy);
    let t = cellOf(tx, ty);
    if (!walkableCell(s.c, s.r)) { const n = nearestWalkable(s.c, s.r); if (!n) return null; s = n; }
    if (!walkableCell(t.c, t.r)) { const n = nearestWalkable(t.c, t.r); if (!n) return null; t = n; }
    const open = new Map();
    const came = {};
    const g = {};
    const f = {};
    const h = (c, r) => Math.abs(c - t.c) + Math.abs(r - t.r);
    const sk = key(s.c, s.r);
    g[sk] = 0; f[sk] = h(s.c, s.r); open.set(sk, { c: s.c, r: s.r });
    const closed = new Set();
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (open.size) {
      let cur = null, best = 1e9;
      for (const [k, v] of open) if (f[k] < best) { best = f[k]; cur = v; }
      const ck = key(cur.c, cur.r);
      if (cur.c === t.c && cur.r === t.r) {
        const path = [];
        let k = ck;
        while (k !== undefined) {
          const c = k % COLS, r = Math.floor(k / COLS);
          path.push(center(c, r));
          k = came[k];
        }
        return path.reverse();
      }
      open.delete(ck); closed.add(ck);
      for (const [dc, dr] of dirs) {
        const nc = cur.c + dc, nr = cur.r + dr;
        if (!walkableCell(nc, nr)) continue;
        const nk = key(nc, nr);
        if (closed.has(nk)) continue;
        const ng = g[ck] + 1;
        if (g[nk] === undefined || ng < g[nk]) {
          came[nk] = ck; g[nk] = ng; f[nk] = ng + h(nc, nr);
          open.set(nk, { c: nc, r: nr });
        }
      }
    }
    return null;
  }

  // Plan a path; on failure retry with a few nearby targets, then give up.
  function planPath(f, tx, ty) {
    let p = astar(f.x, f.y, tx, ty);
    if (p) return p;
    for (let i = 0; i < 4; i++) {
      const c = nearestWalkable(Math.floor(tx / TILE) + randint(3) - 1, Math.floor(ty / TILE) + randint(3) - 1);
      if (c) { p = astar(f.x, f.y, c.c * TILE + TILE / 2, c.r * TILE + TILE / 2); if (p) return p; }
    }
    return null;
  }

  function goTo(f, x, y) {
    const p = planPath(f, x, y);
    if (p && p.length) {
      f.path = p; f.wp = 0; f.tx = x; f.ty = y; f.state = 'moving';
    } else {
      f.path = null; f.state = 'idle'; f.pauseUntil = Date.now() + rand(800, 1800);
    }
  }

  // ---------------------------------------------------------------------------
  // Targets
  // ---------------------------------------------------------------------------
  function pickHumanTarget() {
    if (Math.random() < 0.55) {
      const s = SEATS[randint(SEATS.length)];
      return { x: s.x, y: s.y, seat: true };
    }
    const zone = MAP.zones[randint(MAP.zones.length)];
    const r = zoneRect(zone);
    return { x: rand(r.x + 16, r.x + r.w - 16), y: rand(r.y + 16, r.y + r.h - 16), seat: false };
  }

  // A robot's fixed work station inside its role zone (near the relevant gear).
  function stationFor(role) {
    const zoneId = ROLE_ZONE[role] || 'lounge';
    const zone = MAP.zones.find((z) => z.id === zoneId) || MAP.zones[0];
    const zr = zoneRect(zone);
    const inZone = (p) => p.x >= zr.x - 30 && p.x <= zr.x + zr.w + 30 && p.y >= zr.y - 70 && p.y <= zr.y + zr.h + 30;
    let prop = null;
    if (role === 'printer') prop = MAP.props.find((p) => p.type === 'printer' && inZone(p));
    else if (role === 'fixer') prop = MAP.props.find((p) => p.type === 'bench' && inZone(p));
    else if (role === 'collaborator') prop = MAP.props.find((p) => p.type === 'table' && inZone(p));
    else if (role === 'general') prop = MAP.props.find((p) => p.type === 'sofa' && inZone(p));
    if (prop) return center(Math.floor((prop.x + prop.w / 2) / TILE), Math.floor((prop.y + prop.h + 26) / TILE));
    if (role === 'helper' && SEATS.length) {
      const s = SEATS.find((s) => inZone(s));
      if (s) return { x: s.x, y: s.y + 8 };
    }
    return { x: zr.x + zr.w / 2, y: zr.y + zr.h / 2 };
  }

  // Patrol points around a robot's station, plus occasional cross-office jaunts.
  function patrolFor(role) {
    const base = stationFor(role);
    const pts = [base];
    for (const [dc, dr] of [[2, 0], [-2, 0], [0, 2], [0, -2], [2, 2], [-2, -2]]) {
      pts.push({ x: base.x + dc * TILE, y: base.y + dr * TILE });
    }
    return pts;
  }

  function botAssign(f) {
    let target;
    if (Math.random() < 0.35) {
      // cross-office errand: go to a random zone (pathfinding routes around walls)
      const z = MAP.zones[randint(MAP.zones.length)];
      const r = zoneRect(z);
      target = { x: rand(r.x + 16, r.x + r.w - 16), y: rand(r.y + 16, r.y + r.h - 16) };
    } else {
      const pts = f.patrol;
      let pick = pts[randint(pts.length)];
      if (pick === f.lastPt) pick = pts[(randint(pts.length - 1) + 1) % pts.length];
      target = pick;
    }
    f.lastPt = target;
    goTo(f, target.x, target.y);
  }

  // ---------------------------------------------------------------------------
  // Movement (collision-aware)
  // ---------------------------------------------------------------------------
  function moveToward(f, gx, gy, dt, speed) {
    const dx = gx - f.x, dy = gy - f.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.001) return;
    const nx = f.x + (dx / d) * speed * dt;
    const ny = f.y + (dy / d) * speed * dt;
    // per-axis collision: cancel the axis that would enter a wall
    if (walkableXY(nx, f.y)) f.x = nx;
    if (walkableXY(f.x, ny)) f.y = ny;
    if (Math.abs(dx) > Math.abs(dy)) f.dir = dx > 0 ? 'right' : 'left';
    else f.dir = dy > 0 ? 'down' : 'up';
  }

  function followPath(f, dt, speed) {
    if (!f.path || f.wp >= f.path.length) return false;
    const wp = f.path[f.wp];
    moveToward(f, wp.x, wp.y, dt, speed);
    if (Math.hypot(f.x - wp.x, f.y - wp.y) < 3) f.wp++;
    return true;
  }

  // ---------------------------------------------------------------------------
  // Conversation orchestration
  // ---------------------------------------------------------------------------
  function startConversation(now) {
    const cand = figures.filter(
      (f) => f.type !== 'robot' && !f.conversing && !f.seatTarget && !f.leaving && !f.exiting && (f.state === 'idle' || f.state === 'moving' || f.state === 'working')
    );
    if (cand.length < 2) return;
    const a = cand[randint(cand.length)];
    let b = null, bd = 1e9;
    for (const o of cand) {
      if (o === a) continue;
      const d = Math.hypot(o.x - a.x, o.y - a.y);
      if (d < bd) { bd = d; b = o; }
    }
    if (!b || bd > 220) return;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const until = now + rand(5000, 11000);
    a.conversing = true; a.partner = b.id; a.converseUntil = until;
    b.conversing = true; b.partner = a.id; b.converseUntil = until;
    goTo(a, mx - 20, my);
    goTo(b, mx + 20, my);
  }

  // ---------------------------------------------------------------------------
  // Day / night transitions
  // ---------------------------------------------------------------------------
  function computeTime(clock) {
    const tf = (clock % CYCLE) / CYCLE; // 0..1 within the loop
    let darkness;
    if (tf < DAY_END) darkness = 0;
    else if (tf < DUSK_END) darkness = (tf - DAY_END) / (DUSK_END - DAY_END);
    else if (tf < NIGHT_END) darkness = 1;
    else darkness = 1 - (tf - NIGHT_END) / (1 - NIGHT_END);
    const isNight = darkness > 0.5;
    let region = 'Daytime';
    if (tf >= DAY_END && tf < DUSK_END) region = 'Nightfall';
    else if (tf >= DUSK_END && tf < NIGHT_END) region = 'Night';
    else if (tf >= NIGHT_END) region = 'Dawn';
    return { clock, cycle: CYCLE, frac: tf, darkness, isNight, region };
  }

  // Nightfall: every present human heads for the single door and leaves.
  function onNightfall() {
    for (const f of figures) {
      if (f.type === 'robot') continue;
      if (f.gone) continue;
      f.conversing = false; f.partner = null; f.seatTarget = false;
      f.leaving = true; f.exiting = false;
      goTo(f, EXIT.x, EXIT.y);
      f.state = 'moving';
    }
  }

  // Dawn: humans return through the same door; anyone still mid-exit resumes normal.
  function onDaybreak() {
    for (const f of figures) {
      if (f.type === 'robot') continue;
      if (f.gone) {
        f.gone = false; f.leaving = false; f.exiting = false;
        f.x = EXIT.x; f.y = EXIT.y - 6;
        f.path = null; f.state = 'idle';
        f.pauseUntil = Date.now() + rand(300, 1300);
      } else {
        f.leaving = false; f.exiting = false;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Init figures
  // ---------------------------------------------------------------------------
  function spawnWalkable() {
    for (let i = 0; i < 30; i++) {
      const x = rand(40, WORLD_W - 40), y = rand(40, WORLD_H - 40);
      if (walkableXY(x, y)) return { x, y };
    }
    return { x: WORLD_W / 2, y: WORLD_H / 2 };
  }

  let figures = ROSTER.figures.map((f) => {
    const isBot = f.type === 'robot';
    const st = isBot ? stationFor(f.role) : null;
    const pos = isBot ? st : spawnWalkable();
    return {
      id: f.id,
      type: f.type,
      role: f.role || null,
      label: f.label || (f.type === 'robot' ? f.role : f.type),
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      dir: 'down',
      tx: pos.x, ty: pos.y,
      path: null, wp: 0,
      patrol: isBot ? patrolFor(f.role) : null,
      lastPt: isBot ? st : null,
      seatTarget: false,
      conversing: false,
      partner: null,
      converseUntil: 0,
      state: 'idle',
      pauseUntil: isBot ? Date.now() + rand(2000, 6000) : Date.now() + rand(500, 2000),
      instruction: null,
      thought: null,
      // day/night lifecycle
      gone: false,
      leaving: false,
      exiting: false,
      present: true,
    };
  });

  // ---------------------------------------------------------------------------
  // Tick + snapshot
  // ---------------------------------------------------------------------------
  function step(dt, now) {
    const t = computeTime(CLOCK);
    const nightNow = t.isNight;
    if (nightNow && !PREV_NIGHT) onNightfall();
    if (!nightNow && PREV_NIGHT) onDaybreak();
    PREV_NIGHT = nightNow;

    if (Math.random() < 0.014) startConversation(now);

    for (const f of figures) {
      // robots: nothing special for day/night — they work around the clock
      if (f.type !== 'robot') {
        if (f.gone) continue;
        if (f.exiting) {
          f.y += SPEED * dt; // walk straight out through the door, ignoring walls
          if (f.y > WORLD_H + 22) f.gone = true;
          continue;
        }
        if (f.leaving) {
          const moving = followPath(f, dt, SPEED);
          if (!moving) { f.exiting = true; f.leaving = false; f.path = null; }
          continue;
        }
      }

      if (f.state === 'idle' || f.state === 'working' || f.state === 'thinking' || f.state === 'talking') {
        if (now >= f.pauseUntil) {
          if (f.conversing) { f.conversing = false; f.partner = null; }
          if (f.type === 'robot') botAssign(f);
          else {
            const tgt = pickHumanTarget();
            f.seatTarget = tgt.seat;
            goTo(f, tgt.x, tgt.y);
          }
        }
        continue;
      }

      if (f.state !== 'moving') continue;

      if (f.type === 'robot') {
        const moving = followPath(f, dt, BOT_SPEED);
        if (!moving) {
          f.state = Math.random() < 0.5 ? 'working' : 'thinking';
          f.pauseUntil = now + rand(3000, 7000);
          f.path = null;
        }
        continue;
      }

      // human (daytime)
      const moving = followPath(f, dt, SPEED);
      if (!moving) {
        f.path = null;
        if (f.seatTarget) { f.state = 'working'; f.pauseUntil = now + rand(4000, 9000); }
        else if (f.conversing) {
          const p = figures.find((x) => x.id === f.partner);
          if (p) {
            const ddx = p.x - f.x, ddy = p.y - f.y;
            f.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 'right' : 'left') : (ddy > 0 ? 'down' : 'up');
          }
          f.state = 'talking'; f.pauseUntil = f.converseUntil;
        } else { f.state = 'idle'; f.pauseUntil = now + rand(800, 2500); }
      }
    }
  }

  function getState() {
    const time = computeTime(CLOCK);
    return {
      world: { w: WORLD_W, h: WORLD_H, tile: TILE, exit: { x: EXIT.x, y: EXIT.y } },
      zones: MAP.zones.map((z) => ({
        id: z.id, type: z.type, label: z.label,
        x: z.x * TILE, y: z.y * TILE, w: z.w * TILE, h: z.h * TILE,
      })),
      props: MAP.props || [],
      walls: WALLS,
      figures: figures.map((f) => ({
        id: f.id, type: f.type, role: f.role, label: f.label,
        x: Math.round(f.x), y: Math.round(f.y), dir: f.dir, state: f.state,
        instruction: f.instruction, thought: f.thought,
        gone: !!f.gone, leaving: !!f.leaving, exiting: !!f.exiting,
      })),
      time,
    };
  }

  function instruct({ id, text }) {
    const f = figures.find((x) => x.id === id);
    if (!f) return { ok: false };
    f.instruction = text;
    f.thought = 'thinking…';
    f.state = 'thinking';
    f.pauseUntil = Date.now() + 4000;
    setTimeout(() => {
      if (f && f.thought === 'thinking…') f.thought = '(' + (text || '').slice(0, 48) + ')';
    }, 300);
    return { ok: true };
  }

  class Sim {
    constructor() {
      this._last = Date.now();
      this.paused = false;
    }
    update() {
      const now = Date.now();
      const dt = Math.min(0.05, (now - this._last) / 1000);
      this._last = now;
      if (!this.paused) { CLOCK += dt; step(dt, now); }
    }
    getState() { return getState(); }
    instruct(req) { return instruct(req); }
    togglePause() { this.paused = !this.paused; return this.paused; }
  }

  global.Sim = Sim;
})(window);
