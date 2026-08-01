import type { Projection } from "../lib/formulas";

export function ProjectionCard({ projections }: { projections: Projection }) {
  const { best, worst, bestBand, worstBand } = projections;
  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <div className="mb-2 text-[13.5px] font-semibold text-fg">30-day projection</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-green/30 bg-green/[0.08] p-2.5">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-green">Best case</div>
          <div className="mt-1 text-[18px] font-extrabold text-fg">
            {best.toFixed(1)}
            <span className="ml-0.5 text-[11px] font-medium text-muted">kg</span>
          </div>
          <div className="mt-1 text-[10px] leading-snug text-muted">
            Ideal burn −0.75 kg/wk
            <br />→ enters {bestBand.name} zone
          </div>
        </div>
        <div className="rounded-xl border border-red/30 bg-red/[0.07] p-2.5">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-red">Worst case</div>
          <div className="mt-1 text-[18px] font-extrabold text-fg">
            {worst.toFixed(1)}
            <span className="ml-0.5 text-[11px] font-medium text-muted">kg</span>
          </div>
          <div className="mt-1 text-[10px] leading-snug text-muted">
            Recent trend held
            <br />→ slips back to {worstBand.name} band
          </div>
        </div>
      </div>
      <div className="mt-2 text-center text-[10px] text-faint">
        Scenarios recalculate from any date + weight entry
      </div>
    </div>
  );
}
