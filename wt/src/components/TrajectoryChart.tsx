import type { SeriesPoint } from "../lib/formulas";
import { chartCoords, toLinePath, type Pad } from "./chartUtils";

const W = 340;
const H = 116;
const PAD: Pad = { l: 24, r: 10, t: 10, b: 14 };

export function TrajectoryChart({
  actual,
  ideal,
  idealToday,
  deviation,
  requiredRate,
}: {
  actual: SeriesPoint[];
  ideal: SeriesPoint[];
  idealToday: number;
  deviation: number;
  requiredRate: number;
}) {
  const allW = [...actual.map((p) => p.weight), ...ideal.map((p) => p.weight)];
  const lo = Math.min(...allW);
  const hi = Math.max(...allW);
  const a = chartCoords(actual, W, H, PAD, lo, hi);
  const b = chartCoords(ideal, W, H, PAD, lo, hi);

  const gridCount = 4;
  const gridY = Array.from({ length: gridCount + 1 }, (_, i) => lo + ((hi - lo) * i) / gridCount);
  const yOf = (v: number, loV: number, hiV: number) =>
    PAD.t + (H - PAD.t - PAD.b) * (1 - (v - loV) / (hiV - loV));

  // shaded gap between actual and ideal
  const gapPath =
    actual.length && ideal.length
      ? `${toLinePath(a.xs, a.ys)} L${b.xs[b.xs.length - 1].toFixed(1)} ${b.ys[b.ys.length - 1].toFixed(1)} ` +
        b.xs
          .slice()
          .reverse()
          .map((x, i) => `L${x.toFixed(1)} ${b.ys[b.ys.length - 1 - i].toFixed(1)}`)
          .join(" ") +
        " Z"
      : "";

  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <span className="text-[13.5px] font-semibold text-fg">Trajectory · actual vs ideal</span>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={92} className="mt-1 block">
        {gridY.map((gy, i) => {
          const y = yOf(gy, lo, hi);
          return (
            <g key={i}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#1E2739" strokeWidth={1} />
              <text x={PAD.l - 4} y={y + 3} fill="#5A6579" fontSize={7.5} textAnchor="end">
                {Math.round(gy)}
              </text>
            </g>
          );
        })}

        {gapPath && <path d={gapPath} fill="rgba(168,85,247,0.13)" />}

        {ideal.length > 0 && (
          <path
            d={toLinePath(b.xs, b.ys)}
            fill="none"
            stroke="#2DD4BF"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
        )}
        {actual.length > 0 && (
          <path
            d={toLinePath(a.xs, a.ys)}
            fill="none"
            stroke="#A855F7"
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
      </svg>

      <div className="mt-2 flex items-center gap-4 text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-[3px] w-3.5 rounded" style={{ background: "#A855F7" }} />
          Actual
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-[3px] w-3.5 rounded" style={{ background: "#2DD4BF" }} />
          Ideal (0.75 kg/wk)
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Num label="Ideal today" value={idealToday.toFixed(1)} unit="kg" />
        <Num label="Deviation" value={(deviation >= 0 ? "+" : "") + deviation.toFixed(1)} unit="kg" warn={deviation > 0} />
        <Num
          label="Required rate"
          value={requiredRate.toFixed(1)}
          unit="kg/wk"
          warn={requiredRate > 1.0}
        />
      </div>
    </div>
  );
}

function Num({ label, value, unit, warn }: { label: string; value: string; unit: string; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-card2 p-2 text-center">
      <div className="text-[9.5px] text-muted">{label}</div>
      <div className={`mt-0.5 text-[13.5px] font-bold ${warn ? "text-amber" : "text-fg"}`}>
        {value}
        <span className="ml-0.5 text-[10px] font-medium text-muted">{unit}</span>
      </div>
    </div>
  );
}
