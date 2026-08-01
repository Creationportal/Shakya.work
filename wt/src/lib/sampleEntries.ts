import type { LogEntry } from "./types";

// Real dataset reconstructed from the source system, through 14 Jul (last logged = 82.6 kg).
// Matches the dashboard chart + stats in mockup.html (Total lost = 4.9 kg vs 87.5 baseline).
export const SAMPLE_ENTRIES: LogEntry[] = [
  { date: "2026-03-02", weight: 86.8 },
  { date: "2026-03-09", weight: 86.6 },
  { date: "2026-03-16", weight: 86.4 },
  { date: "2026-03-23", weight: 85.2 },
  { date: "2026-03-30", weight: 85.2 },
  { date: "2026-04-06", weight: 84.5 },
  { date: "2026-04-13", weight: 82.3 },
  { date: "2026-04-20", weight: 82.8 },
  { date: "2026-04-27", weight: 82.4 },
  { date: "2026-05-04", weight: 82.5 },
  { date: "2026-05-11", weight: 81.9 },
  { date: "2026-05-18", weight: 81.5 },
  { date: "2026-05-25", weight: 82.0 },
  { date: "2026-06-01", weight: 81.3 },
  { date: "2026-06-08", weight: 81.7 },
  { date: "2026-06-15", weight: 82.6 },
  { date: "2026-06-22", weight: 83.5 },
  { date: "2026-06-29", weight: 82.6 },
  { date: "2026-07-06", weight: 83.0 },
  { date: "2026-07-13", weight: 83.4 },
  { date: "2026-07-14", weight: 82.6 },
];
