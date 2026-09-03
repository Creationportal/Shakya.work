export type Gender = "male" | "female";

export interface Milestone {
  id: number;
  bf: number;
  name: string;
  bmi: number;
  weight: number;
  waist: number;
  flag: string | null;
  what_changes: string;
}

export interface LogEntry {
  date: string; // YYYY-MM-DD (primary key)
  weight: number;
  waist?: number;
  bf?: number;
}

export interface Settings {
  baselineDate: string;
  baselineWeight: number;
  finalGoalWeight: number;
  idealWeeklyRate: number;
  heightCm: number;
  heightDivisor: number;
  gender: Gender;
  idealStartWeight: number;
  idealStartDate: string;
}

export type Aggregation = "D" | "W" | "M";
export type View = "dashboard" | "journey";
