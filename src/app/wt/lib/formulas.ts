import type { Aggregation, Gender, LogEntry, Milestone, Settings } from "./types";
import { diffDays, isoWeekStart } from "./date";

export function bmi(weight: number, divisor: number): number {
  return weight / divisor;
}

// Estimate waist circumference (cm) from weight and gender using a simple linear model.
export function estimateWaist(weight: number, gender: Gender): number {
  return gender === "female" ? 0.52 * weight + 30 : 0.55 * weight + 32;
}

// Estimate body-fat percentage from BMI, adjusted by gender.
export function estimateBodyFat(weight: number, heightCm: number, gender: Gender): number {
  const bmiVal = weight / Math.pow(heightCm / 100, 2);
  return gender === "female" ? 1.39 * bmiVal + 3.5 : 1.39 * bmiVal - 6.5;
}

function describeChanges(bf: number, gender: Gender): string {
  const high = gender === "female" ? 32 : 25;
  const mid = gender === "female" ? 27 : 20;
  const lean = gender === "female" ? 22 : 15;
  if (bf >= high) return "Face and torso carry noticeable softness; neck and waist are at their fullest.";
  if (bf >= mid) return "Face starts to depuff; chest and lower back begin to look lighter.";
  if (bf >= lean) return "Jawline becomes visible in good light; shoulders and arms look firmer.";
  return "Very lean, athletic look with clear muscle separation and definition.";
}

// Build a milestone ladder from the user's start/goal/height/gender inputs.
export function generateMilestones(settings: Settings): Milestone[] {
  const { baselineWeight, finalGoalWeight, heightDivisor, heightCm, gender } = settings;
  const start = Math.max(baselineWeight, finalGoalWeight);
  const goal = Math.min(baselineWeight, finalGoalWeight);
  const count = 18;
  const step = (start - goal) / (count - 1);
  const flagIndices = new Set([
    Math.floor(count * 0.25),
    Math.floor(count * 0.5),
    Math.floor(count * 0.75),
    count - 1,
  ]);

  const milestones: Milestone[] = [];
  for (let i = 0; i < count; i++) {
    const weight = start - step * i;
    const bf = estimateBodyFat(weight, heightCm, gender);
    const waist = estimateWaist(weight, gender);
    const bmiVal = bmi(weight, heightDivisor);
    const name = i === 0 ? "Start" : i === count - 1 ? "Goal" : `Milestone ${i}`;
    milestones.push({
      id: i + 1,
      bf: Math.round(bf),
      name,
      bmi: Math.round(bmiVal * 10) / 10,
      weight: Math.round(weight * 10) / 10,
      waist: Math.round(waist * 10) / 10,
      flag: flagIndices.has(i) ? "🔥" : null,
      what_changes: describeChanges(bf, gender),
    });
  }
  return milestones;
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
// Returns null when there are no milestones (blank tracker).
export function matchMilestone(
  weight: number,
  bf: number | null,
  milestones: Milestone[],
): Milestone | null {
  if (milestones.length === 0) return null;
  const key: "bf" | "weight" = bf != null ? "bf" : "weight";
  const metric = bf != null ? bf : weight;
  for (const m of milestones) {
    if (m[key] <= metric) return m;
  }
  return milestones[milestones.length - 1];
}

// BF% + waist looked up from the milestone table by interpolating on current weight.
// Returns a safe zeroed fallback when there are no milestones (blank tracker).
export function deriveBodyMetrics(
  weight: number,
  milestones: Milestone[],
): { bf: number; waist: number } {
  if (milestones.length === 0) return { bf: 0, waist: 0 };
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
  bestBand: Milestone | null;
  worstBand: Milestone | null;
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
