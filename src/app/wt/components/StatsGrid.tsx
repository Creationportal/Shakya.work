import type { Stats } from "../lib/formulas";

function Stat({ label, value, unit, signed }: { label: string; value: number; unit: string; signed?: boolean }) {
  const down = signed && value < 0;
  const up = signed && value > 0;
  const color = down ? "text-green" : up ? "text-red" : "text-fg";
  const arrow = down ? "▼" : up ? "▲" : "";
  return (
    <div className="border-b border-r border-line p-3 text-center last:border-r-0 [&:nth-child(3n)]:border-r-0 md:[&:nth-child(3n)]:border-r md:[&:nth-child(6n)]:border-r-0">
      <div className="text-[10.5px] text-muted">{label}</div>
      <div className={`mt-1 text-base font-bold ${color}`}>
        {arrow}
        {Math.abs(value).toFixed(1)}
        <span className="ml-0.5 text-[11px] font-medium text-muted">{unit}</span>
      </div>
    </div>
  );
}

export function StatsGrid({ stats }: { stats: Stats | null }) {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-line bg-card md:grid-cols-6">
      {stats ? (
        <>
          <Stat label="Actual" value={stats.actual} unit="kg" />
          <Stat label="Change" value={stats.change} unit="kg" signed />
          <Stat label="Trend (week)" value={stats.trendWeek} unit="kg" signed />
          <Stat label="This Week" value={stats.thisWeek} unit="kg" signed />
          <Stat label="This Month" value={stats.thisMonth} unit="kg" signed />
          <Stat label="Total" value={stats.total} unit="kg" signed />
        </>
      ) : (
        <div className="col-span-3 p-6 text-center text-xs text-faint md:col-span-6">
          No data yet — log your first weight to see stats.
        </div>
      )}
    </div>
  );
}
