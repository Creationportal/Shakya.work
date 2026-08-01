import type { LogEntry, Milestone, Settings } from "./types";
import { DEFAULT_MILESTONES } from "./milestones";
import { SAMPLE_ENTRIES } from "./sampleEntries";

export const DEFAULT_SETTINGS: Settings = {
  baselineDate: "2026-03-01",
  baselineWeight: 87.5,
  finalGoalWeight: 80,
  idealWeeklyRate: 0.75,
  heightDivisor: 2.99,
  idealStartWeight: 89,
  idealStartDate: "2026-02-01",
};

export interface PersistedState {
  entries: LogEntry[];
  milestones: Milestone[];
  settings: Settings;
  celebrated: number[];
}

const KEY = "mwt.v1";

export function loadState(): PersistedState {
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed.entries && parsed.milestones && parsed.settings) return parsed;
      }
    } catch {
      /* fall through to seed */
    }
  }
  return {
    entries: SAMPLE_ENTRIES,
    milestones: DEFAULT_MILESTONES,
    settings: DEFAULT_SETTINGS,
    celebrated: [],
  };
}

export function saveState(state: PersistedState): void {
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }
}
