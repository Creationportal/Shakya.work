export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toKey(new Date());
}

export function diffDays(a: string, b: string): number {
  return Math.round((parseDate(a).getTime() - parseDate(b).getTime()) / 86400000);
}

export function addDays(s: string, n: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function isoWeekStart(s: string): string {
  const d = parseDate(s);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return toKey(d);
}

export function formatShort(s: string): string {
  const [, m, d] = s.split("-");
  return `${m}-${d}`;
}

export function monthLabel(s: string): string {
  const [, m] = s.split("-").map(Number);
  const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${names[m - 1]} ${parseDate(s).getFullYear()}`;
}

export function weekdayShort(s: string): string {
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][parseDate(s).getDay()];
}
