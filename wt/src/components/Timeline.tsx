import { useState } from "react";
import type { Milestone } from "../lib/types";

export function Timeline({
  milestones,
  currentIndex,
  onEdit,
}: {
  milestones: Milestone[];
  currentIndex: number;
  onEdit: (id: number, patch: Partial<Pick<Milestone, "weight" | "bf" | "waist">>) => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ weight: "", bf: "", waist: "" });

  const startEdit = (m: Milestone) => {
    setEditingId(m.id);
    setDraft({ weight: String(m.weight), bf: String(m.bf), waist: String(m.waist) });
  };
  const save = (id: number) => {
    onEdit(id, {
      weight: parseFloat(draft.weight),
      bf: parseFloat(draft.bf),
      waist: parseFloat(draft.waist),
    });
    setEditingId(null);
  };

  return (
    <div className="relative px-1 pb-6">
      <div className="absolute bottom-6 left-[11px] top-2 w-0.5 bg-[#263049]" />
      {milestones.map((m, i) => {
        const done = i < currentIndex;
        const now = i === currentIndex;
        const next = milestones[i + 1];
        const editing = editingId === m.id;
        return (
          <div key={m.id} className="relative py-1.5 pl-6">
            <span
              className={`absolute left-0 top-3 h-3 w-3 rounded-full border-2 ${
                done
                  ? "border-teal bg-teal"
                  : now
                    ? "left-[-2px] top-2 h-4 w-4 border-[#C4B5FD] bg-purple shadow-[0_0_0_5px_rgba(168,85,247,0.22)]"
                    : "border-[#3A4763] bg-[#263049]"
              }`}
            />
            <div className="flex items-baseline gap-2">
              <span className={`w-7 text-[11px] font-bold ${done ? "text-[#6FCBAE]" : "text-muted"}`}>
                {Math.round(m.bf)}%
              </span>
              <span className={`text-[12.5px] font-semibold ${now ? "text-[#C4B5FD]" : done ? "text-[#9AA6BC]" : "text-fg"}`}>
                {m.name}
              </span>
              {m.flag && <span className="text-[11px]">{m.flag}</span>}
              <span className="ml-auto text-[11px] text-faint">{m.weight} kg</span>
              <button
                onClick={() => (editing ? setEditingId(null) : startEdit(m))}
                className="text-[10px] text-faint hover:text-muted"
                aria-label={`Edit ${m.name}`}
              >
                {editing ? "✕" : "✎"}
              </button>
            </div>

            {now && !editing && (
              <div className="mt-2 rounded-xl border border-purple/40 bg-card p-2.5">
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#C4B5FD]">What changes here</div>
                <div className="mt-1 text-[11px] leading-relaxed text-[#C6CDDC]">{m.what_changes}</div>
                {next && (
                  <div className="mt-1.5 text-[10px] font-semibold text-amber">
                    → {(m.weight - next.weight).toFixed(1)} kg to {next.name} · {Math.round(next.bf)}% BF · {next.weight} kg
                  </div>
                )}
              </div>
            )}

            {editing && (
              <div className="mt-2 rounded-xl border border-blue/45 bg-[#101726] p-3">
                <div className="mb-2 text-[11.5px] font-bold text-fg">
                  Editing {m.name}
                  <span className="ml-1.5 text-[10px] font-normal text-muted">tap Save to apply</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <LabeledInput label="Weight · kg" value={draft.weight} onChange={(v) => setDraft((d) => ({ ...d, weight: v }))} />
                  <LabeledInput label="Body fat · %" value={draft.bf} onChange={(v) => setDraft((d) => ({ ...d, bf: v }))} />
                  <LabeledInput label="Waist · cm" value={draft.waist} onChange={(v) => setDraft((d) => ({ ...d, waist: v }))} />
                </div>
                <div className="mt-2.5 flex gap-2">
                  <button
                    onClick={() => save(m.id)}
                    className="flex-1 rounded-lg bg-blue py-2 text-[12px] font-bold text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-line bg-card2 px-3.5 py-2 text-[12px] font-semibold text-muted"
                  >
                    Cancel
                  </button>
                </div>
                <div className="mt-2 text-[9.5px] leading-relaxed text-faint">
                  Saving recalculates: current milestone match · weeks left · required rate · ideal line · 30-day projections · progress bar.
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[9px] uppercase tracking-wide text-muted">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-blue/50 bg-card2 p-2 text-center text-sm font-bold text-fg outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
      />
    </label>
  );
}
