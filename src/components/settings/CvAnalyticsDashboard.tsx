"use client";

import { useEffect, useState } from "react";
import type { CvAnalytics } from "@/lib/cv-analytics";

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return iso;
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <p className="text-3xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-widest text-muted">
        {label}
      </p>
    </div>
  );
}

function locationOf(v: {
  city?: string;
  region?: string;
  country?: string;
}): string {
  const parts = [v.city, v.region, v.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown";
}

export default function CvAnalyticsDashboard() {
  const [data, setData] = useState<CvAnalytics | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cv/analytics", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: CvAnalytics) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="rounded-lg border border-line bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">
          CV Visitor Analytics
        </h2>
        <p className="mt-4 text-sm text-muted">Loading…</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="rounded-lg border border-line bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">
          CV Visitor Analytics
        </h2>
        <p className="mt-4 text-sm text-red-500">
          Could not load analytics.
        </p>
      </section>
    );
  }

  const maxCountry = Math.max(1, ...data.byCountry.map((c) => c.count));

  return (
    <section className="rounded-lg border border-line bg-surface p-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">
        CV Visitor Analytics
      </h2>
      <p className="mt-1 text-xs text-muted">
        Visits to the private <code className="text-ink">/cv</code> link.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Total visits" value={data.total} />
        <Stat label="Unique visitors" value={data.uniqueVisitors} />
        <Stat label="Countries" value={data.byCountry.length} />
      </div>

      {/* By-country bar chart */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Visits by location
        </h3>
        <div className="mt-3 space-y-2">
          {data.byCountry.length === 0 && (
            <p className="text-sm text-muted">No visits yet.</p>
          )}
          {data.byCountry.map((c) => (
            <div key={c.country} className="flex items-center gap-3">
              <span className="w-32 truncate text-xs text-ink">{c.country}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-paper">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(c.count / maxCountry) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs tabular-nums text-muted">
                {c.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-visitor list */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Visitors (by originating IP)
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">IP</th>
                <th className="py-2 pr-4 font-medium">Location</th>
                <th className="py-2 pr-4 font-medium">Visits</th>
                <th className="py-2 font-medium">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {data.perVisitor.map((v) => (
                <tr key={v.ip} className="border-b border-line/60">
                  <td className="py-2 pr-4 font-mono text-xs text-ink">{v.ip}</td>
                  <td className="py-2 pr-4 text-muted">{locationOf(v)}</td>
                  <td className="py-2 pr-4 tabular-nums text-ink">{v.count}</td>
                  <td className="py-2 text-muted">{timeAgo(v.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Note: visitor IP addresses are recorded for the site owner&apos;s own
        analytics on this private page. In production, country/city are derived
        from platform geo headers; set <code>CV_GEO_LOOKUP=1</code> to enrich
        via an external IP geolocation service.
      </p>
    </section>
  );
}
