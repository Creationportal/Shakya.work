import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Aggregation, LogEntry, Milestone, Settings, View } from "./types";
import {
  aggregate,
  bmi,
  computeProjections,
  computeRequiredRate,
  computeStats,
  deriveBodyMetrics,
  generateMilestones,
  idealWeightOn,
  matchMilestone,
} from "./formulas";
import { diffDays, todayKey } from "./date";
import { loadState, saveState, DEFAULT_SETTINGS, STORAGE_KEY } from "./storage";
import { DEFAULT_MILESTONES } from "./milestones";
import { SAMPLE_ENTRIES } from "./sampleEntries";

export function useTracker() {
  // Initialise from constants only — never read localStorage during render, so
  // server and client first render match (avoids React hydration mismatch).
  const initial = useMemo(
    () => ({
      entries: SAMPLE_ENTRIES,
      milestones: DEFAULT_MILESTONES.length ? DEFAULT_MILESTONES : generateMilestones(DEFAULT_SETTINGS),
      settings: DEFAULT_SETTINGS,
      celebrated: [] as number[],
    }),
    [],
  );
  const [entries, setEntries] = useState<LogEntry[]>(initial.entries);
  const [milestones, setMilestones] = useState<Milestone[]>(initial.milestones);
  const [settings, setSettings] = useState<Settings>(initial.settings);
  const [celebrated, setCelebrated] = useState<number[]>(initial.celebrated);

  const [view, setView] = useState<View>("dashboard");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [celebration, setCelebration] = useState<Milestone | null>(null);

  // `today` is resolved AFTER mount (client clock) so server and client first
  // render match — reading new Date() during render causes hydration mismatch.
  const [today, setToday] = useState<string | null>(null);

  // Load any persisted state after mount (client only), then keep saving.
  // Must run in an effect (not during render) to avoid SSR hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const loaded = loadState();
    setEntries(loaded.entries);
    setMilestones(loaded.milestones.length ? loaded.milestones : generateMilestones(loaded.settings));
    setSettings(loaded.settings);
    setCelebrated(loaded.celebrated);
    // Re-sync the celebration ref from the loaded data so already-celebrated
    // milestones don't re-pop the modal on every page load.
    celebratedRef.current = loaded.celebrated.reduce((max, id) => {
      const idx = loaded.milestones.findIndex((m) => m.id === id);
      return idx > max ? idx : max;
    }, -1);
    setToday(todayKey());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

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
  const currentIndex = currentMilestone ? milestones.indexOf(currentMilestone) : -1;

  // progress over the milestone ladder
  const reachedCount = useMemo(() => {
    let n = 0;
    for (const m of milestones) {
      if (milestones.indexOf(m) <= currentIndex) n++;
    }
    return n;
  }, [milestones, currentIndex]);
  const progressPct = milestones.length ? (reachedCount / milestones.length) * 100 : 0;

  const bodyMetrics = useMemo(() => {
    if (latest?.bf != null && latest?.waist != null)
      return { bf: latest.bf, waist: latest.waist };
    return deriveBodyMetrics(currentWeight, milestones);
  }, [latest, currentWeight, milestones]);

  const bmiVal = bmi(currentWeight, settings.heightDivisor);
  const idealToday = idealWeightOn(today ?? settings.idealStartDate, settings);
  const deviationVal = currentWeight - idealToday;
  const requiredRate = computeRequiredRate(currentWeight, today ?? settings.idealStartDate, settings);
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
  // Initialised to -1; the post-mount load effect re-syncs it from persisted
  // data so already-celebrated milestones don't re-pop on every page load.
  const celebratedRef = useRef<number>(-1);
  const firstCelebrationRun = useRef(true);
  useEffect(() => {
    // Skip the initial mount run (state not yet loaded from localStorage).
    if (firstCelebrationRun.current) {
      firstCelebrationRun.current = false;
      return;
    }
    if (currentIndex > celebratedRef.current) {
      const m = milestones[currentIndex];
      if (m?.flag) {
        /* eslint-disable react-hooks/set-state-in-effect, react-hooks/immutability -- intentional: pop celebration + update ref when a flagged milestone is first reached */
        setCelebration(m);
        setCelebrated((c) => (c.includes(m.id) ? c : [...c, m.id]));
        celebratedRef.current = currentIndex;
        /* eslint-enable react-hooks/set-state-in-effect, react-hooks/immutability */
      }
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
    // Clear persisted data and return to the built-in defaults so the app
    // opens clean instead of reloading whatever was last saved.
    if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY);
    setEntries(SAMPLE_ENTRIES);
    setMilestones(DEFAULT_MILESTONES.length ? DEFAULT_MILESTONES : generateMilestones(DEFAULT_SETTINGS));
    setSettings(DEFAULT_SETTINGS);
    setCelebrated([]);
    /* eslint-disable-next-line react-hooks/immutability -- reset ref on full reset */
    celebratedRef.current = -1;
  }, []);

  // Update plan inputs, regenerate milestones from the new start/goal/height/gender,
  // and clear old logged entries so the chart reflects the new plan only.
  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      if (patch.heightCm != null) {
        next.heightDivisor = Math.pow(next.heightCm / 100, 2);
      }
      // When the starting weight changes, re-anchor the ideal trajectory to the
      // new start so "ideal today" / deviation / required-rate stay aligned.
      if (patch.baselineWeight != null) {
        next.idealStartWeight = next.baselineWeight;
        next.idealStartDate = todayKey();
      }
      setSettings(next);
      if (
        patch.baselineWeight != null ||
        patch.finalGoalWeight != null ||
        patch.heightCm != null ||
        patch.gender != null
      ) {
        setMilestones(generateMilestones(next));
        setEntries([]);
        setCelebrated([]);
      }
    },
    [settings],
  );

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
    updateSettings,
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
