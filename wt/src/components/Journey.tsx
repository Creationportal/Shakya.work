import type { Milestone } from "../lib/types";
import type { Projection } from "../lib/formulas";
import { MilestoneCard } from "./MilestoneCard";
import { ProjectionCard } from "./ProjectionCard";
import { Timeline } from "./Timeline";

export function Journey({
  milestones,
  currentIndex,
  reachedCount,
  progressPct,
  currentMilestone,
  currentWeight,
  projections,
  onEdit,
}: {
  milestones: Milestone[];
  currentIndex: number;
  reachedCount: number;
  progressPct: number;
  currentMilestone: Milestone;
  currentWeight: number;
  projections: Projection;
  onEdit: (id: number, patch: Partial<Pick<Milestone, "weight" | "bf" | "waist">>) => void;
}) {
  const prev = milestones[currentIndex - 1] ?? null;
  const next = milestones[currentIndex + 1] ?? null;

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-28 pt-3">
      <div className="mb-3 flex items-baseline gap-2.5">
        <span className="text-[17px] font-semibold text-fg">Milestones</span>
        <span className="text-[11px] text-muted">
          {reachedCount} of 18 reached · goal set
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-card2">
        <div
          className="h-full rounded-full"
          style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#2DD4BF,#A855F7)" }}
        />
      </div>

      <div className="space-y-3">
        <MilestoneCard current={currentMilestone} currentWeight={currentWeight} prev={prev} next={next} />
        <ProjectionCard projections={projections} />
        <Timeline milestones={milestones} currentIndex={currentIndex} onEdit={onEdit} />
      </div>
    </div>
  );
}
