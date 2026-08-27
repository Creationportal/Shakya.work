import { MAP_DATA, ROSTER_DATA, type MapData, type FigureDef } from "./map-data";

export type Direction = "up" | "down" | "left" | "right";
export type FigureState =
  | "idle"
  | "moving"
  | "working"
  | "thinking"
  | "talking";

export interface Figure {
  id: string;
  type: "man" | "woman" | "robot";
  role: string | null;
  label: string;
  x: number;
  y: number;
  dir: Direction;
  tx: number;
  ty: number;
  path: { x: number; y: number }[] | null;
  wp: number;
  patrol: { x: number; y: number }[] | null;
  lastPt: { x: number; y: number } | null;
  seatTarget: boolean;
  conversing: boolean;
  partner: string | null;
  converseUntil: number;
  state: FigureState;
  pauseUntil: number;
  gone: boolean;
  leaving: boolean;
  exiting: boolean;
  instruction: string | null;
  thought: string | null;
}

export interface SimTime {
  clock: number;
  cycle: number;
  frac: number;
  darkness: number;
  isNight: boolean;
  region: "Daytime" | "Nightfall" | "Night" | "Dawn";
}

export interface SimSnapshot {
  world: { w: number; h: number; tile: number; exit: { x: number; y: number } };
  zones: {
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
  props: { type: string; x: number; y: number; w: number; h: number }[];
  walls: { x: number; y: number; w: number; h: number }[];
  figures: {
    id: string;
    type: "man" | "woman" | "robot";
    role: string | null;
    label: string;
    x: number;
    y: number;
    dir: Direction;
    state: FigureState;
    gone: boolean;
    leaving: boolean;
    exiting: boolean;
    instruction: string | null;
    thought: string | null;
  }[];
  time: SimTime;
}

const TILE = MAP_DATA.tileSize;
const COLS = MAP_DATA.width;
const ROWS = MAP_DATA.height;
const WORLD_W = COLS * TILE;
const WORLD_H = ROWS * TILE;
const CYCLE = 90;
const DAY_END = 0.58;
const DUSK_END = 0.64;
const NIGHT_END = 0.94;
const HUMAN_SPEED = 38;
const BOT_SPEED = 52;

const ROLE_ZONE: Record<string, string> = {
  helper: "workstations",
  printer: "printer",
  collaborator: "collaboration",
  fixer: "repair",
  general: "lounge",
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randint = (n: number) => Math.floor(Math.random() * n);
const key = (c: number, r: number) => r * COLS + c;
const cellOf = (x: number, y: number) => ({
  c: Math.floor(x / TILE),
  r: Math.floor(y / TILE),
});

class BinaryHeap<T> {
  heap: T[] = [];
  private score: (a: T) => number;
  constructor(score: (a: T) => number) {
    this.score = score;
  }
  push(v: T) {
    this.heap.push(v);
    this._up(this.heap.length - 1);
  }
  pop(): T | undefined {
    if (this.heap.length <= 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this._down(0);
    return top;
  }
  get length() {
    return this.heap.length;
  }
  private _up(i: number) {
    const v = this.heap[i];
    let p = Math.floor((i - 1) / 2);
    while (i > 0 && this.score(v) < this.score(this.heap[p])) {
      this.heap[i] = this.heap[p];
      this.heap[p] = v;
      i = p;
      p = Math.floor((i - 1) / 2);
    }
  }
  private _down(i: number) {
    const v = this.heap[i];
    const n = this.heap.length;
    while (true) {
      let min = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.score(this.heap[l]) < this.score(this.heap[min])) min = l;
      if (r < n && this.score(this.heap[r]) < this.score(this.heap[min])) min = r;
      if (min === i) break;
      this.heap[i] = this.heap[min];
      this.heap[min] = v;
      i = min;
    }
  }
}

export class SimulationEngine {
  private grid: boolean[][] = [];
  private figures: Figure[] = [];
  private clock = 0;
  private prevNight = false;
  private paused = true;
  private pausedAt = 0;
  private simNow = 0;

  constructor() {
    this.buildGrid();
    this.figures = this.spawnFigures();
  }

  private walkableCell(c: number, r: number) {
    return c >= 0 && r >= 0 && c < COLS && r < ROWS && !this.grid[r][c];
  }
  private walkableXY(x: number, y: number) {
    const { c, r } = cellOf(x, y);
    return this.walkableCell(c, r);
  }
  private center(c: number, r: number) {
    return { x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 };
  }

  private buildGrid() {
    for (let r = 0; r < ROWS; r++) {
      this.grid[r] = [];
      for (let c = 0; c < COLS; c++) {
        this.grid[r][c] =
          c === 0 || r === 0 || c === COLS - 1 || r === ROWS - 1;
      }
    }
    for (const w of MAP_DATA.walls) {
      const c0 = Math.floor(w.x / TILE);
      const c1 = Math.floor((w.x + w.w - 1) / TILE);
      const r0 = Math.floor(w.y / TILE);
      const r1 = Math.floor((w.y + w.h - 1) / TILE);
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          if (r >= 0 && r < ROWS && c >= 0 && c < COLS) this.grid[r][c] = true;
        }
      }
    }
    const doorC = Math.floor(COLS / 2);
    this.grid[ROWS - 1][doorC - 1] = false;
    this.grid[ROWS - 1][doorC] = false;
    this.grid[ROWS - 1][doorC + 1] = false;
  }

  private nearestWalkable(c: number, r: number) {
    if (this.walkableCell(c, r)) return { c, r };
    const q: [number, number][] = [[c, r]];
    const seen = new Set([key(c, r)]);
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
    let i = 0;
    while (i < q.length) {
      const [cc, rr] = q[i++];
      for (const [dc, dr] of dirs) {
        const nc = cc + dc;
        const nr = rr + dr;
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
        const k = key(nc, nr);
        if (seen.has(k)) continue;
        seen.add(k);
        if (this.walkableCell(nc, nr)) return { c: nc, r: nr };
        q.push([nc, nr]);
      }
    }
    return null;
  }

  private astar(sx: number, sy: number, tx: number, ty: number) {
    let s = cellOf(sx, sy);
    let t = cellOf(tx, ty);
    if (!this.walkableCell(s.c, s.r)) {
      const n = this.nearestWalkable(s.c, s.r);
      if (!n) return null;
      s = n;
    }
    if (!this.walkableCell(t.c, t.r)) {
      const n = this.nearestWalkable(t.c, t.r);
      if (!n) return null;
      t = n;
    }
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const h = (c: number, r: number) => Math.abs(c - t.c) + Math.abs(r - t.r);
    const startKey = key(s.c, s.r);
    const targetKey = key(t.c, t.r);
    const came: Record<number, number | undefined> = {};
    const g: Record<number, number> = {};
    const f: Record<number, number> = {};
    g[startKey] = 0;
    f[startKey] = h(s.c, s.r);
    const open = new BinaryHeap<{ c: number; r: number; k: number }>(
      (n) => f[n.k] ?? Infinity
    );
    open.push({ c: s.c, r: s.r, k: startKey });
    const closed = new Set<number>();

    while (open.length) {
      const cur = open.pop()!;
      const ck = cur.k;
      if (closed.has(ck)) continue;
      closed.add(ck);
      if (ck === targetKey) {
        const path: { x: number; y: number }[] = [];
        let k2: number | undefined = ck;
        while (k2 !== undefined) {
          const c = k2 % COLS;
          const r = Math.floor(k2 / COLS);
          path.push(this.center(c, r));
          k2 = came[k2];
        }
        return path.reverse();
      }
      for (const [dc, dr] of dirs) {
        const nc = cur.c + dc;
        const nr = cur.r + dr;
        if (!this.walkableCell(nc, nr)) continue;
        const nk = key(nc, nr);
        if (closed.has(nk)) continue;
        const ng = (g[ck] ?? Infinity) + 1;
        if (g[nk] === undefined || ng < g[nk]) {
          came[nk] = ck;
          g[nk] = ng;
          f[nk] = ng + h(nc, nr);
          open.push({ c: nc, r: nr, k: nk });
        }
      }
    }
    return null;
  }

  private planPath(f: Figure, tx: number, ty: number) {
    let p = this.astar(f.x, f.y, tx, ty);
    if (p) return p;
    for (let i = 0; i < 4; i++) {
      const c = this.nearestWalkable(
        Math.floor(tx / TILE) + randint(3) - 1,
        Math.floor(ty / TILE) + randint(3) - 1
      );
      if (c) {
        p = this.astar(
          f.x,
          f.y,
          c.c * TILE + TILE / 2,
          c.r * TILE + TILE / 2
        );
        if (p) return p;
      }
    }
    return null;
  }

  private goTo(f: Figure, x: number, y: number) {
    const p = this.planPath(f, x, y);
    if (p && p.length) {
      f.path = p;
      f.wp = 0;
      f.tx = x;
      f.ty = y;
      f.state = "moving";
    } else {
      f.path = null;
      f.state = "idle";
      f.pauseUntil = this.simNow + rand(800, 1800);
    }
  }

  private zoneRect(zone: MapData["zones"][number]) {
    return {
      x: zone.x * TILE,
      y: zone.y * TILE,
      w: zone.w * TILE,
      h: zone.h * TILE,
    };
  }

  private stationFor(role: string) {
    const zoneId = ROLE_ZONE[role] || "lounge";
    const zone = MAP_DATA.zones.find((z) => z.id === zoneId) || MAP_DATA.zones[0];
    const zr = this.zoneRect(zone);
    const inZone = (p: { x: number; y: number; w: number; h: number }) =>
      p.x >= zr.x - 30 &&
      p.x <= zr.x + zr.w + 30 &&
      p.y >= zr.y - 70 &&
      p.y <= zr.y + zr.h + 30;
    let prop: { x: number; y: number; w: number; h: number } | undefined;
    if (role === "printer")
      prop = MAP_DATA.props.find((p) => p.type === "printer" && inZone(p));
    else if (role === "fixer")
      prop = MAP_DATA.props.find((p) => p.type === "bench" && inZone(p));
    else if (role === "collaborator")
      prop = MAP_DATA.props.find((p) => p.type === "table" && inZone(p));
    else if (role === "general")
      prop = MAP_DATA.props.find((p) => p.type === "sofa" && inZone(p));
    if (prop)
      return this.center(
        Math.floor((prop.x + prop.w / 2) / TILE),
        Math.floor((prop.y + prop.h + 26) / TILE)
      );
    if (role === "helper" && MAP_DATA.seats.length) {
      const s = MAP_DATA.seats.find(
        (s) =>
          s.x >= zr.x - 30 &&
          s.x <= zr.x + zr.w + 30 &&
          s.y >= zr.y - 70 &&
          s.y <= zr.y + zr.h + 30
      );
      if (s) return { x: s.x, y: s.y + 8 };
    }
    return { x: zr.x + zr.w / 2, y: zr.y + zr.h / 2 };
  }

  private patrolFor(role: string) {
    const base = this.stationFor(role);
    const pts = [base];
    for (const [dc, dr] of [
      [2, 0],
      [-2, 0],
      [0, 2],
      [0, -2],
      [2, 2],
      [-2, -2],
    ]) {
      pts.push({ x: base.x + dc * TILE, y: base.y + dr * TILE });
    }
    return pts;
  }

  private pickHumanTarget() {
    if (Math.random() < 0.55) {
      const s = MAP_DATA.seats[randint(MAP_DATA.seats.length)];
      return { x: s.x, y: s.y, seat: true };
    }
    const zone = MAP_DATA.zones[randint(MAP_DATA.zones.length)];
    const r = this.zoneRect(zone);
    return {
      x: rand(r.x + 16, r.x + r.w - 16),
      y: rand(r.y + 16, r.y + r.h - 16),
      seat: false,
    };
  }

  private botAssign(f: Figure) {
    let target: { x: number; y: number };
    if (Math.random() < 0.35) {
      const z = MAP_DATA.zones[randint(MAP_DATA.zones.length)];
      const r = this.zoneRect(z);
      target = {
        x: rand(r.x + 16, r.x + r.w - 16),
        y: rand(r.y + 16, r.y + r.h - 16),
      };
    } else {
      const pts = f.patrol!;
      let pick = pts[randint(pts.length)];
      if (pick === f.lastPt) pick = pts[(randint(pts.length - 1) + 1) % pts.length];
      target = pick;
    }
    f.lastPt = target;
    this.goTo(f, target.x, target.y);
  }

  private spawnWalkable() {
    for (let i = 0; i < 30; i++) {
      const x = rand(40, WORLD_W - 40);
      const y = rand(40, WORLD_H - 40);
      if (this.walkableXY(x, y)) return { x, y };
    }
    return { x: WORLD_W / 2, y: WORLD_H / 2 };
  }

  private spawnFigures(): Figure[] {
    return ROSTER_DATA.figures.map((f: FigureDef) => {
      const isBot = f.type === "robot";
      const st = isBot ? this.stationFor(f.role || "general") : null;
      const pos = isBot ? st! : this.spawnWalkable();
      return {
        id: f.id,
        type: f.type,
        role: f.role || null,
        label: f.label || (f.type === "robot" ? f.role || "agent" : f.type),
        x: Math.round(pos.x),
        y: Math.round(pos.y),
        dir: "down",
        tx: pos.x,
        ty: pos.y,
        path: null,
        wp: 0,
        patrol: isBot ? this.patrolFor(f.role || "general") : null,
        lastPt: isBot ? st : null,
        seatTarget: false,
        conversing: false,
        partner: null,
        converseUntil: 0,
        state: "idle",
        pauseUntil: isBot ? rand(2000, 6000) : rand(500, 2000),
        gone: false,
        leaving: false,
        exiting: false,
        instruction: null,
        thought: null,
      };
    });
  }

  private moveToward(f: Figure, gx: number, gy: number, dt: number, speed: number) {
    const dx = gx - f.x;
    const dy = gy - f.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.001) return;
    const nx = f.x + (dx / d) * speed * dt;
    const ny = f.y + (dy / d) * speed * dt;
    if (this.walkableXY(nx, f.y)) f.x = nx;
    if (this.walkableXY(f.x, ny)) f.y = ny;
    if (Math.abs(dx) > Math.abs(dy)) f.dir = dx > 0 ? "right" : "left";
    else f.dir = dy > 0 ? "down" : "up";
  }

  private followPath(f: Figure, dt: number, speed: number) {
    if (!f.path || f.wp >= f.path.length) return false;
    const wp = f.path[f.wp];
    this.moveToward(f, wp.x, wp.y, dt, speed);
    if (Math.hypot(f.x - wp.x, f.y - wp.y) < 3) f.wp++;
    return true;
  }

  private startConversation() {
    const cand = this.figures.filter(
      (f) =>
        f.type !== "robot" &&
        !f.conversing &&
        !f.seatTarget &&
        !f.leaving &&
        !f.exiting &&
        (f.state === "idle" || f.state === "moving" || f.state === "working")
    );
    if (cand.length < 2) return;
    const a = cand[randint(cand.length)];
    let b: Figure | null = null;
    let bd = 1e9;
    for (const o of cand) {
      if (o === a) continue;
      const d = Math.hypot(o.x - a.x, o.y - a.y);
      if (d < bd) {
        bd = d;
        b = o;
      }
    }
    if (!b || bd > 220) return;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const until = this.simNow + rand(5000, 11000);
    a.conversing = true;
    a.partner = b.id;
    a.converseUntil = until;
    b.conversing = true;
    b.partner = a.id;
    b.converseUntil = until;
    this.goTo(a, mx - 20, my);
    this.goTo(b, mx + 20, my);
  }

  private computeTime(): SimTime {
    const frac = (this.clock % CYCLE) / CYCLE;
    let darkness: number;
    if (frac < DAY_END) darkness = 0;
    else if (frac < DUSK_END)
      darkness = (frac - DAY_END) / (DUSK_END - DAY_END);
    else if (frac < NIGHT_END) darkness = 1;
    else darkness = 1 - (frac - NIGHT_END) / (1 - NIGHT_END);
    const isNight = darkness > 0.5;
    let region: SimTime["region"] = "Daytime";
    if (frac >= DAY_END && frac < DUSK_END) region = "Nightfall";
    else if (frac >= DUSK_END && frac < NIGHT_END) region = "Night";
    else if (frac >= NIGHT_END) region = "Dawn";
    return {
      clock: this.clock,
      cycle: CYCLE,
      frac,
      darkness,
      isNight,
      region,
    };
  }

  private onNightfall() {
    const exit = { x: Math.floor(COLS / 2) * TILE + TILE / 2, y: (ROWS - 1) * TILE + TILE / 2 };
    for (const f of this.figures) {
      if (f.type === "robot") continue;
      if (f.gone) continue;
      f.conversing = false;
      f.partner = null;
      f.seatTarget = false;
      f.leaving = true;
      f.exiting = false;
      this.goTo(f, exit.x, exit.y);
      f.state = "moving";
    }
  }

  private onDaybreak() {
    const exit = { x: Math.floor(COLS / 2) * TILE + TILE / 2, y: (ROWS - 1) * TILE + TILE / 2 };
    for (const f of this.figures) {
      if (f.type === "robot") continue;
      if (f.gone) {
        f.gone = false;
        f.leaving = false;
        f.exiting = false;
        f.x = exit.x;
        f.y = exit.y - 6;
        f.path = null;
        f.state = "idle";
        f.pauseUntil = this.simNow + rand(300, 1300);
      } else {
        f.leaving = false;
        f.exiting = false;
      }
    }
  }

  private step(dt: number) {
    const t = this.computeTime();
    const nightNow = t.isNight;
    if (nightNow && !this.prevNight) this.onNightfall();
    if (!nightNow && this.prevNight) this.onDaybreak();
    this.prevNight = nightNow;

    if (Math.random() < 0.014) this.startConversation();

    for (const f of this.figures) {
      if (f.type !== "robot") {
        if (f.gone) continue;
        if (f.exiting) {
          f.y += HUMAN_SPEED * dt;
          if (f.y > WORLD_H + 22) f.gone = true;
          continue;
        }
        if (f.leaving) {
          const moving = this.followPath(f, dt, HUMAN_SPEED);
          if (!moving) {
            f.exiting = true;
            f.leaving = false;
            f.path = null;
          }
          continue;
        }
      }

      if (
        f.state === "idle" ||
        f.state === "working" ||
        f.state === "thinking" ||
        f.state === "talking"
      ) {
        if (this.simNow >= f.pauseUntil) {
          if (f.conversing) {
            f.conversing = false;
            f.partner = null;
          }
          if (f.type === "robot") this.botAssign(f);
          else {
            const tgt = this.pickHumanTarget();
            f.seatTarget = tgt.seat;
            this.goTo(f, tgt.x, tgt.y);
          }
        }
        continue;
      }

      if (f.state !== "moving") continue;

      if (f.type === "robot") {
        const moving = this.followPath(f, dt, BOT_SPEED);
        if (!moving) {
          f.state = Math.random() < 0.5 ? "working" : "thinking";
          f.pauseUntil = this.simNow + rand(3000, 7000);
          f.path = null;
        }
        continue;
      }

      const moving = this.followPath(f, dt, HUMAN_SPEED);
      if (!moving) {
        f.path = null;
        if (f.seatTarget) {
          f.state = "working";
          f.pauseUntil = this.simNow + rand(4000, 9000);
        } else if (f.conversing) {
          const p = this.figures.find((x) => x.id === f.partner);
          if (p) {
            const ddx = p.x - f.x;
            const ddy = p.y - f.y;
            f.dir =
              Math.abs(ddx) > Math.abs(ddy)
                ? ddx > 0
                  ? "right"
                  : "left"
                : ddy > 0
                  ? "down"
                  : "up";
          }
          f.state = "talking";
          f.pauseUntil = f.converseUntil;
        } else {
          f.state = "idle";
          f.pauseUntil = this.simNow + rand(800, 2500);
        }
      }
    }
  }

  update(dt: number) {
    if (this.paused) {
      // Advance simNow so pauseUntil remains relative to sim time when resumed.
      this.simNow += dt * 1000;
      return;
    }
    const safeDt = Math.min(0.05, dt);
    this.clock += safeDt;
    this.simNow += safeDt * 1000;
    this.step(safeDt);
  }

  start() {
    if (this.paused) {
      this.paused = false;
    }
  }

  stop() {
    if (!this.paused) {
      this.paused = true;
    }
  }

  reset() {
    this.clock = 0;
    this.simNow = 0;
    this.prevNight = false;
    this.paused = true;
    this.figures = this.spawnFigures();
  }

  get isRunning() {
    return !this.paused;
  }

  getState(): SimSnapshot {
    const time = this.computeTime();
    const exit = {
      x: Math.floor(COLS / 2) * TILE + TILE / 2,
      y: (ROWS - 1) * TILE + TILE / 2,
    };
    return {
      world: { w: WORLD_W, h: WORLD_H, tile: TILE, exit },
      zones: MAP_DATA.zones.map((z) => ({
        id: z.id,
        type: z.type,
        label: z.label,
        x: z.x * TILE,
        y: z.y * TILE,
        w: z.w * TILE,
        h: z.h * TILE,
      })),
      props: MAP_DATA.props,
      walls: MAP_DATA.walls,
      figures: this.figures.map((f) => ({
        id: f.id,
        type: f.type,
        role: f.role,
        label: f.label,
        x: Math.round(f.x),
        y: Math.round(f.y),
        dir: f.dir,
        state: f.state,
        gone: !!f.gone,
        leaving: !!f.leaving,
        exiting: !!f.exiting,
        instruction: f.instruction,
        thought: f.thought,
      })),
      time,
    };
  }

  getCounts() {
    const state = this.getState();
    let agents = 0;
    let humans = 0;
    for (const f of state.figures) {
      if (f.type === "robot") agents++;
      else if (!f.gone) humans++;
    }
    return { agents, humans, phase: state.time.isNight ? "Night" : "Day" };
  }
}
