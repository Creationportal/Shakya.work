import type { Gender, Milestone, Settings } from "../lib/types";
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
  settings,
  onEdit,
  onUpdateSettings,
}: {
  milestones: Milestone[];
  currentIndex: number;
  reachedCount: number;
  progressPct: number;
  currentMilestone: Milestone | null;
  currentWeight: number;
  projections: Projection;
  settings: Settings;
  onEdit: (id: number, patch: Partial<Pick<Milestone, "weight" | "bf" | "waist">>) => void;
  onUpdateSettings: (patch: Partial<Settings>) => void;
}) {
  const prev = milestones[currentIndex - 1] ?? null;
  const next = milestones[currentIndex + 1] ?? null;
  const dailyRate = settings.idealWeeklyRate / 7;

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-28 pt-3">
      <div className="mb-3 rounded-2xl border border-line bg-card p-3">
        <div className="mb-2 text-[13.5px] font-semibold text-fg">Plan setup</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <NumberField
            label="Starting weight (kg)"
            value={settings.baselineWeight}
            step={0.1}
            onChange={(v) => onUpdateSettings({ baselineWeight: v })}
          />
          <NumberField
            label="Goal weight (kg)"
            value={settings.finalGoalWeight}
            step={0.1}
            onChange={(v) => onUpdateSettings({ finalGoalWeight: v })}
          />
          <NumberField
            label="Weekly burn (kg/wk)"
            value={settings.idealWeeklyRate}
            step={0.05}
            min={0.1}
            max={2.5}
            onChange={(v) => onUpdateSettings({ idealWeeklyRate: v })}
          />
          <NumberField
            label="Height (cm)"
            value={settings.heightCm}
            step={1}
            min={100}
            max={250}
            onChange={(v) => onUpdateSettings({ heightCm: v })}
          />
          <SelectField
            label="Gender"
            value={settings.gender}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
            onChange={(v) => onUpdateSettings({ gender: v as Gender })}
          />
          <div className="flex flex-col justify-end">
            <span className="text-[9px] uppercase tracking-wide text-muted">Daily target</span>
            <div className="mt-1 text-sm font-bold text-fg">
              {dailyRate.toFixed(2)}
              <span className="ml-0.5 text-[10px] font-medium text-muted">kg/day</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-baseline gap-2.5">
        <span className="text-[17px] font-semibold text-fg">Milestones</span>
        <span className="text-[11px] text-muted">
          {milestones.length ? `${reachedCount} of ${milestones.length} reached` : "No plan set"}
        </span>
      </div>
      {milestones.length > 0 && (
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-card2">
          <div
            className="h-full rounded-full"
            style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#2DD4BF,#A855F7)" }}
          />
        </div>
      )}

      <div className="space-y-3">
        <MilestoneCard current={currentMilestone} currentWeight={currentWeight} prev={prev} next={next} />
        <ProjectionCard projections={projections} weeklyRate={settings.idealWeeklyRate} />
        <Timeline milestones={milestones} currentIndex={currentIndex} onEdit={onEdit} />
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[9px] uppercase tracking-wide text-muted">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value);
          onChange(Number.isNaN(parsed) ? value : parsed);
        }}
        className="mt-1 w-full rounded-lg border border-line bg-card2 px-2.5 py-2 text-sm font-bold text-fg outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[9px] uppercase tracking-wide text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="mt-1 w-full rounded-lg border border-line bg-card2 px-2.5 py-2 text-sm font-bold text-fg outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
