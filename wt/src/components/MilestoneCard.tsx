import type { Milestone } from "../lib/types";

export function MilestoneCard({
  current,
  currentWeight,
  prev,
  next,
}: {
  current: Milestone;
  currentWeight: number;
  prev: Milestone | null;
  next: Milestone | null;
}) {
  const lo = prev?.weight ?? current.weight;
  const hi = next?.weight ?? current.weight;
  const pct = hi === lo ? 100 : Math.max(0, Math.min(100, ((lo - currentWeight) / (lo - hi)) * 100));
  const distance = next ? currentWeight - next.weight : 0;

  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <div className="flex items-center gap-2.5">
        <span className="rounded-full border border-purple/40 bg-purple/20 px-2.5 py-1 text-[11px] font-bold text-[#C4B5FD]">
          {current.name} · {Math.round(current.bf)}% BF
        </span>
        {next && (
          <span className="ml-auto text-[11px] text-muted">
            <b className="text-fg">{distance.toFixed(1)} kg</b> to {next.name}
          </span>
        )}
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-card2">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#A855F7,#3B82F6)" }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[9.5px] text-faint">
        <span>
          {lo} kg · {prev?.name ?? current.name}
        </span>
        <span>{currentWeight.toFixed(1)} now</span>
        <span>
          {hi} kg · {next?.name ?? current.name}
        </span>
      </div>

      <blockquote className="mt-3 rounded-xl border-l-[3px] border-purple bg-card2 p-2.5 text-[11px] leading-relaxed text-[#C6CDDC]">
        {current.what_changes}
      </blockquote>
    </div>
  );
}
