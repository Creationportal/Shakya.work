import fs from "node:fs";
import path from "node:path";

/**
 * Lightweight, file-backed analytics for the private /cv page.
 *
 * Records every visit (IP + coarse geo + user-agent + referer + timestamp) to
 * .data/cv-visits.json. The dashboard under /settings reads aggregates only.
 * This is intentionally dependency-free and never blocks the page render.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const VISITS_PATH = path.join(DATA_DIR, "cv-visits.json");
const MAX_VISITS = 10_000; // rolling cap to bound disk growth

export interface CvVisit {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  org?: string;
  userAgent?: string;
  referer?: string;
  at: string; // ISO timestamp
}

export interface CvVisitor {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  org?: string;
  lastSeen: string;
  count: number;
}

export interface CountryCount {
  country: string;
  count: number;
}

export interface CvAnalytics {
  total: number;
  uniqueVisitors: number;
  perVisitor: CvVisitor[];
  byCountry: CountryCount[];
}

export function getCvVisits(): CvVisit[] {
  try {
    if (!fs.existsSync(VISITS_PATH)) return [];
    const raw = JSON.parse(fs.readFileSync(VISITS_PATH, "utf8"));
    return Array.isArray(raw) ? (raw as CvVisit[]) : [];
  } catch {
    return [];
  }
}

export function recordCvVisit(visit: CvVisit): void {
  const visits = getCvVisits();
  visits.push(visit);
  const trimmed =
    visits.length > MAX_VISITS ? visits.slice(visits.length - MAX_VISITS) : visits;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(VISITS_PATH, JSON.stringify(trimmed, null, 2));
  } catch {
    // Analytics must never break the request.
  }
}

export function getCvAnalytics(): CvAnalytics {
  const visits = getCvVisits();
  const byIp = new Map<string, CvVisit[]>();
  for (const v of visits) {
    const arr = byIp.get(v.ip);
    if (arr) arr.push(v);
    else byIp.set(v.ip, [v]);
  }

  const perVisitor: CvVisitor[] = [...byIp.entries()].map(([ip, vs]) => {
    const last = vs[vs.length - 1];
    return {
      ip,
      country: last.country,
      region: last.region,
      city: last.city,
      org: last.org,
      lastSeen: last.at,
      count: vs.length,
    };
  });
  perVisitor.sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));

  const countryCounts = new Map<string, number>();
  for (const v of visits) {
    const c = v.country || "Unknown";
    countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
  }
  const byCountry: CountryCount[] = [...countryCounts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: visits.length,
    uniqueVisitors: byIp.size,
    perVisitor,
    byCountry,
  };
}
