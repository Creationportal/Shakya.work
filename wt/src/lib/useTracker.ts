import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Aggregation, LogEntry, Milestone, Settings, View } from "./types";
import {
  aggregate,
  bmi,
  computeProjections,
  computeRequiredRate,
  computeStats,
  deriveBodyMetrics,
  idealWeightOn,
  matchMilestone,
} from "./formulas";
import { diffDays, todayKey } from "./date";
import { loadState, saveState } from "./storage";

export function useTracker() {
  const initial = useMemo(() => loadState(), []);
  const [entries, setEntries] = useState<LogEntry[]>(initial.entries);
  const [milestones, setMilestones] = useState<Milestone[]>(initial.milestones);
  const [settings] = useState<Settings>(initial.settings);
  const [celebrated, setCelebrated] = useState<number[]>(initial.celebrated);

  const [view, setView] = useState<View>("dashboard");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [celebration, setCelebration] = useState<Milestone | null>(null);

  const today = useMemo(() => todayKey(), []);

  // persist
  useEffect(() => {
    saveState({ entries, milestones, settings, celebrated });
  }, [entries, milestones, settings, celebrated]);

  // ---- derived ----
  const stats = useMemo(() => computeStats(entries, settings), [entries, settings]);
  const latest = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? -1 : 1)).at(-1) ?? null,
    [entries],
  );
  const currentWeight = stats?.actual ?? settings.baselineWeight;
  const latestBf = latest?.bf ?? null;

  const currentMilestone = useMemo(
    () => matchMilestone(currentWeight, latestBf, milestones),
    [currentWeight, latestBf, milestones],
  );
  const currentIndex = milestones.indexOf(currentMilestone);

  // progress over the 18 real milestones (ids 4..21)
  const reachedCount = useMemo(() => {
    let n = 0;
    for (const m of milestones) {
      if (m.id >= 4 && milestones.indexOf(m) <= currentIndex) n++;
    }
    return n;
  }, [milestones, currentIndex]);
  const progressPct = (reachedCount / 18) * 100;

  const bodyMetrics = useMemo(() => {
    if (latest?.bf != null && latest?.waist != null)
      return { bf: latest.bf, waist: latest.waist };
    return deriveBodyMetrics(currentWeight, milestones);
  }, [latest, currentWeight, milestones]);

  const bmiVal = bmi(currentWeight, settings.heightDivisor);
  const idealToday = idealWeightOn(today, settings);
  const deviationVal = currentWeight - idealToday;
  const requiredRate = computeRequiredRate(currentWeight, today, settings);
  const projections = useMemo(
    () => computeProjections(currentWeight, entries, settings, milestones),
    [currentWeight, entries, settings, milestones],
  );

  const series = useMemo(() => {
    const mk = (mode: Aggregation) => aggregate(entries, mode);
    return { D: mk("D"), W: mk("W"), M: mk("M") };
  }, [entries]);

  // trajectory: actual weekly series + ideal line across the date span (+ a little future)
  const trajectory = useMemo(() => {
    const actual = aggregate(entries, "W");
    if (actual.length === 0) return { actual: [], ideal: [] as { date: string; weight: number }[] };
    const first = actual[0].date;
    const lastDate = actual[actual.length - 1].date;
    const spanDays = Math.max(diffDays(lastDate, first), 1);
    const ideal: { date: string; weight: number }[] = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const d = addDaysLocal(first, Math.round((spanDays * i) / steps));
      ideal.push({ date: d, weight: idealWeightOn(d, settings) });
    }
    return { actual, ideal };
  }, [entries, settings]);

  const calendarHas = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);

  // ---- celebration on first reach of a flagged milestone ----
  const celebratedRef = useRef<number>(
    celebrated.reduce((max, id) => {
      const idx = milestones.findIndex((m) => m.id === id);
      return idx > max ? idx : max;
    }, -1),
  );
  useEffect(() => {
    if (currentIndex > celebratedRef.current) {
      const m = milestones[currentIndex];
      if (m?.flag) {
        setCelebration(m);
        setCelebrated((c) => (c.includes(m.id) ? c : [...c, m.id]));
      }
      celebratedRef.current = currentIndex;
    }
  }, [currentIndex, milestones]);

  // ---- actions ----
  const logWeight = useCallback(
    (date: string, weight: number, waist?: number) => {
      setEntries((prev) => {
        const others = prev.filter((e) => e.date !== date);
        return [...others, { date, weight, waist }].sort((a, b) => (a.date < b.date ? -1 : 1));
      });
      setSheetOpen(false);
    },
    [],
  );

  const updateMilestone = useCallback(
    (id: number, patch: Partial<Pick<Milestone, "weight" | "bf" | "waist">>) => {
      setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    },
    [],
  );

  const resetAll = useCallback(() => {
    const s = loadState();
    setEntries(s.entries);
    setMilestones(s.milestones);
    setCelebrated(s.celebrated);
  }, []);

  return {
    // state
    entries,
    milestones,
    settings,
    view,
    setView,
    sheetOpen,
    setSheetOpen,
    celebration,
    setCelebration,
    today,
    // derived
    stats,
    currentWeight,
    latestBf,
    currentMilestone,
    currentIndex,
    reachedCount,
    progressPct,
    bodyMetrics,
    bmiVal,
    idealToday,
    deviationVal,
    requiredRate,
    projections,
    series,
    trajectory,
    calendarHas,
    // actions
    logWeight,
    updateMilestone,
    resetAll,
  };
}

function addDaysLocal(s: string, n: number): string {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export type Tracker = ReturnType<typeof useTracker>;
