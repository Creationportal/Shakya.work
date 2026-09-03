import type { Aggregation } from "../lib/types";
import type { SeriesPoint } from "../lib/formulas";
import { chartCoords, toAreaPath, toLinePath, niceTicks, type Pad } from "./chartUtils";
import { formatShort } from "../lib/date";

const W = 340;
const H = 150;
const PAD: Pad = { l: 26, r: 10, t: 18, b: 22 };

export function WeightChart({
  points,
  mode,
  onMode,
}: {
  points: SeriesPoint[];
  mode: Aggregation;
  onMode: (m: Aggregation) => void;
}) {
  const coords = chartCoords(points, W, H, PAD);
  const { xs, ys, lo, hi } = coords;
  const gridY = niceTicks(lo, hi, 4);
  const labels = gridY.map((v) => Math.round(v));
  const last = points.length - 1;

  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13.5px] font-semibold text-fg">Weight</span>
        <div className="flex rounded-lg border border-line bg-card2 p-0.5">
          {(["D", "W", "M"] as Aggregation[]).map((m) => (
            <button
              key={m}
              onClick={() => onMode(m)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                mode === m ? "bg-blue text-white" : "text-muted"
              }`}
              aria-pressed={mode === m}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {points.length === 0 ? (
        <div className="flex h-[120px] items-center justify-center text-xs text-faint">
          No entries yet — tap ＋ to log your first weight.
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={120} className="block">
          <defs>
            <linearGradient id="wArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#A855F7" stopOpacity="0.28" />
              <stop offset="1" stopColor="#A855F7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridY.map((gy, i) => {
            const y = PAD.t + (H - PAD.t - PAD.b) * (1 - (gy - lo) / (hi - lo));
            return (
              <g key={i}>
                <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#1E2739" strokeWidth={1} />
                <text x={PAD.l - 4} y={y + 3} fill="#5A6579" fontSize={8} textAnchor="end">
                  {labels[i]}
                </text>
              </g>
            );
          })}

          <path d={toAreaPath(xs, ys, H, PAD)} fill="url(#wArea)" />
          <path d={toLinePath(xs, ys)} fill="none" stroke="#A855F7" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />

          {points.map((p, i) => (
            <g key={p.date + i}>
              <circle cx={xs[i]} cy={ys[i]} r={2.6} fill="#A855F7" />
              <text x={xs[i]} y={ys[i] - 5} fill="#C4B5FD" fontSize={7} textAnchor="middle">
                {p.weight.toFixed(1)}
              </text>
            </g>
          ))}

          {last >= 0 && (
            <>
              <circle cx={xs[last]} cy={ys[last]} r={5.5} fill="none" stroke="#A855F7" strokeWidth={2} />
              <circle cx={xs[last]} cy={ys[last]} r={2.8} fill="#fff" />
            </>
          )}

          {points.length > 1 && (
            <g fill="#5A6579" fontSize={7.5} textAnchor="middle">
              <text x={xs[0]} y={H - 6}>
                {formatShort(points[0].date)}
              </text>
              <text x={xs[Math.floor(last / 2)]} y={H - 6}>
                {formatShort(points[Math.floor(last / 2)].date)}
              </text>
              <text x={xs[last]} y={H - 6}>
                {formatShort(points[last].date)}
              </text>
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
