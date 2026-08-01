import type { Aggregation, LogEntry, Milestone, Settings } from "./types";
import { diffDays, isoWeekStart } from "./date";

export function bmi(weight: number, divisor: number): number {
  return weight / divisor;
}

// Ideal trajectory: straight line at idealWeeklyRate from the plan start.
export function idealWeightOn(dateKey: string, settings: Settings): number {
  const days = diffDays(dateKey, settings.idealStartDate);
  return settings.idealStartWeight - settings.idealWeeklyRate * (days / 7);
}

export function deviation(weight: number, dateKey: string, settings: Settings): number {
  return weight - idealWeightOn(dateKey, settings);
}

// Current milestone = the milestone whose metric value is the largest value <= the current metric.
// Uses BF% when available, else weight. Can regress when weight/BF rises.
export function matchMilestone(weight: number, bf: number | null, milestones: Milestone[]): Milestone {
  const key: "bf" | "weight" = bf != null ? "bf" : "weight";
  const metric = bf != null ? bf : weight;
  for (const m of milestones) {
    if (m[key] <= metric) return m;
  }
  return milestones[milestones.length - 1];
}

// BF% + waist looked up from the milestone table by interpolating on current weight.
export function deriveBodyMetrics(
  weight: number,
  milestones: Milestone[],
): { bf: number; waist: number } {
  if (weight >= milestones[0].weight) return { bf: milestones[0].bf, waist: milestones[0].waist };
  const last = milestones[milestones.length - 1];
  if (weight <= last.weight) return { bf: last.bf, waist: last.waist };
  for (let i = 0; i < milestones.length - 1; i++) {
    const hi = milestones[i];
    const lo = milestones[i + 1];
    if (weight <= hi.weight && weight >= lo.weight) {
      const t = (hi.weight - weight) / (hi.weight - lo.weight);
      return {
        bf: hi.bf + t * (lo.bf - hi.bf),
        waist: hi.waist + t * (lo.waist - hi.waist),
      };
    }
  }
  return { bf: last.bf, waist: last.waist };
}

export interface SeriesPoint {
  date: string;
  weight: number;
}

export function aggregate(entries: LogEntry[], mode: Aggregation): SeriesPoint[] {
  if (entries.length === 0) return [];
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  if (mode === "D") return sorted.map((e) => ({ date: e.date, weight: e.weight }));
  const map = new Map<string, SeriesPoint>();
  for (const e of sorted) {
    const key = mode === "W" ? isoWeekStart(e.date) : e.date.slice(0, 7);
    const existing = map.get(key);
    if (!existing || e.date > existing.date) map.set(key, { date: e.date, weight: e.weight });
  }
  return [...map.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

export interface Stats {
  actual: number;
  change: number;
  trendWeek: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

export function computeStats(entries: LogEntry[], settings: Settings): Stats | null {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const last = sorted[sorted.length - 1];
  const actual = last.weight;
  const prev = sorted[sorted.length - 2];
  const change = prev ? actual - prev.weight : 0;

  const within7 = sorted.filter(
    (e) => e.date !== last.date && diffDays(last.date, e.date) >= 0 && diffDays(last.date, e.date) <= 7,
  );
  const trendWeek = within7.length ? actual - within7[within7.length - 1].weight : 0;

  const ws = isoWeekStart(last.date);
  const weekEntries = sorted.filter((e) => e.date >= ws);
  const thisWeek = weekEntries.length ? actual - weekEntries[0].weight : 0;

  const month = last.date.slice(0, 7);
  const monthEntries = sorted.filter((e) => e.date.startsWith(month));
  const thisMonth = monthEntries.length ? actual - monthEntries[0].weight : 0;

  const total = actual - settings.baselineWeight;
  return { actual, change, trendWeek, thisWeek, thisMonth, total };
}

// Rate required to both hit the goal and close the current gap (deviation) within the
// originally-allocated goal window. Amber when aggressive (> 1.0 kg/wk).
export function computeRequiredRate(weight: number, dateKey: string, settings: Settings): number {
  const idealToday = idealWeightOn(dateKey, settings);
  const gap = weight - idealToday;
  const weeksToGoal = Math.max((weight - settings.finalGoalWeight) / settings.idealWeeklyRate, 0.5);
  return gap / weeksToGoal;
}

export interface Projection {
  best: number;
  worst: number;
  bestBand: Milestone;
  worstBand: Milestone;
}

export function computeProjections(
  weight: number,
  entries: LogEntry[],
  settings: Settings,
  milestones: Milestone[],
): Projection {
  const best = weight - settings.idealWeeklyRate * (30 / 7);

  const wk = aggregate(entries, "W");
  let recentGain = 0;
  if (wk.length >= 2) {
    const deltas: number[] = [];
    for (let i = 1; i < wk.length; i++) deltas.push(wk[i].weight - wk[i - 1].weight);
    const last4 = deltas.slice(-4);
    recentGain = last4.reduce((a, b) => a + b, 0) / last4.length;
    if (recentGain < 0) recentGain = 0; // if losing, worst case = flat
  }
  const worst = weight + recentGain * (30 / 7);

  return {
    best,
    worst,
    bestBand: matchMilestone(best, null, milestones),
    worstBand: matchMilestone(worst, null, milestones),
  };
}
