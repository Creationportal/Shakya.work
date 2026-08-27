import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { recordCvVisit, type CvVisit } from "@/lib/cv-analytics";

/**
 * POST /api/cv/visit — called by the /cv page on load to record a visit.
 * Public (no auth): the page itself is intentionally reachable by direct link.
 * Rate-limited per IP so the counter can't be trivially spammed.
 */

// Best-effort geo cache keyed by IP (module-scoped, resets on restart).
const geoCache = new Map<string, Partial<CvVisit>>();

function isPrivateIp(ip: string): boolean {
  const v = ip.replace("::ffff:", "").trim();
  if (!v || v === "::1" || v === "127.0.0.1" || v === "localhost") return true;
  if (v.startsWith("10.") || v.startsWith("192.168.")) return true;
  if (v.startsWith("172.")) {
    const seg = Number(v.split(".")[1]);
    if (seg >= 16 && seg <= 31) return true;
  }
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
  return false;
}

function headerGeo(req: NextRequest): Partial<CvVisit> {
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    undefined;
  const region =
    req.headers.get("x-vercel-ip-country-region") ||
    req.headers.get("cf-ipregion") ||
    undefined;
  const city = req.headers.get("x-vercel-ip-city") || undefined;
  const org =
    req.headers.get("x-vercel-ip-as-organization") ||
    req.headers.get("cf-asn") ||
    undefined;
  return { country, region, city, org };
}

async function enrichGeo(ip: string): Promise<Partial<CvVisit>> {
  if (!ip || isPrivateIp(ip)) return {};
  // Optional external lookup (off by default to avoid external calls / PII egress).
  if (process.env.CV_GEO_LOOKUP !== "1") return {};
  if (geoCache.has(ip)) return geoCache.get(ip)!;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1200);
    const r = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: ctrl.signal,
      headers: { "User-Agent": "shakya-work/1.0" },
    });
    clearTimeout(timer);
    if (!r.ok) return {};
    const d = (await r.json()) as Record<string, unknown>;
    const geo: Partial<CvVisit> = {
      country: typeof d.country_name === "string" ? d.country_name : undefined,
      region: typeof d.region === "string" ? d.region : undefined,
      city: typeof d.city === "string" ? d.city : undefined,
      org: typeof d.org === "string" ? d.org : undefined,
    };
    geoCache.set(ip, geo);
    return geo;
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`cv-visit:${clientIp(req)}`, 200, 60 * 1000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown";

  let visit: CvVisit = {
    ip,
    userAgent: req.headers.get("user-agent") ?? undefined,
    referer: req.headers.get("referer") ?? undefined,
    at: new Date().toISOString(),
    ...headerGeo(req),
  };

  // Fill gaps from an optional external lookup (only if enabled).
  const missing = !visit.country && !visit.city;
  if (missing) {
    const extra = await enrichGeo(ip);
    visit = { ...visit, ...extra };
  }

  recordCvVisit(visit);
  return NextResponse.json({ ok: true });
}
