import type { SeriesPoint } from "../lib/formulas";

export interface Pad {
  l: number;
  r: number;
  t: number;
  b: number;
}

export interface Coords {
  xs: number[];
  ys: number[];
  lo: number;
  hi: number;
}

export function chartCoords(
  points: SeriesPoint[],
  w: number,
  h: number,
  pad: Pad,
  yMin?: number,
  yMax?: number,
): Coords {
  const n = points.length;
  const xs = points.map((_, i) => pad.l + (w - pad.l - pad.r) * (n === 1 ? 0.5 : i / (n - 1)));
  const ws = points.map((p) => p.weight);
  let lo = yMin ?? Math.min(...ws);
  let hi = yMax ?? Math.max(...ws);
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const margin = (hi - lo) * 0.12;
  lo -= margin;
  hi += margin;
  const range = hi - lo;
  const ys = ws.map((v) => pad.t + (h - pad.t - pad.b) * (1 - (v - lo) / range));
  return { xs, ys, lo, hi };
}

export function toLinePath(xs: number[], ys: number[]): string {
  return xs.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");
}

export function toAreaPath(xs: number[], ys: number[], h: number, pad: Pad): string {
  if (xs.length === 0) return "";
  const base = h - pad.b;
  const line = toLinePath(xs, ys);
  return `${line} L${xs[xs.length - 1].toFixed(1)} ${base} L${xs[0].toFixed(1)} ${base} Z`;
}

export function niceTicks(lo: number, hi: number, count: number): number[] {
  const step = (hi - lo) / count;
  return Array.from({ length: count + 1 }, (_, i) => lo + step * i);
}
