import { useEffect, useState } from "react";
import { Calendar } from "./Calendar";
import { ScrollRuler } from "./ScrollRuler";
import { todayKey } from "../lib/date";
import type { LogEntry } from "../lib/types";

export function LogSheet({
  open,
  onClose,
  onCommit,
  defaultWeight,
  entries,
}: {
  open: boolean;
  onClose: () => void;
  onCommit: (date: string, weight: number, waist?: number) => void;
  defaultWeight: number;
  entries: LogEntry[];
}) {
  const [date, setDate] = useState<string>(todayKey());
  const [weight, setWeight] = useState<number>(defaultWeight);
  const [waist, setWaist] = useState<string>("");

  // when opening, seed date/weight from latest entry (or today) + any existing entry for that date
  useEffect(() => {
    if (!open) return;
    const entryForDate = entries.find((e) => e.date === date);
    if (entryForDate) {
      setWeight(entryForDate.weight);
      setWaist(entryForDate.waist != null ? String(entryForDate.waist) : "");
    } else {
      const latest = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1)).at(-1);
      setWeight(latest?.weight ?? defaultWeight);
      setWaist("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // when date changes, prefill if an entry exists for it
  const handleSelectDate = (d: string) => {
    setDate(d);
    const ex = entries.find((e) => e.date === d);
    if (ex) {
      setWeight(ex.weight);
      setWaist(ex.waist != null ? String(ex.waist) : "");
    }
  };

  if (!open) return null;

  const commit = () => {
    const w = parseFloat(waist);
    onCommit(date, weight, waist.trim() !== "" && !isNaN(w) ? w : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div
        className="absolute inset-0 bg-[rgba(4,7,14,0.66)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="animate-pop-in relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-card no-scrollbar md:max-w-md md:rounded-2xl">
        <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-[#2C3850] md:hidden" />
        <h3 className="py-4 text-center text-base font-bold text-fg">Log Weight</h3>

        <div className="space-y-4 px-5 pb-6">
          <div>
            <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-faint">Date</div>
            <Calendar selected={date} hasEntries={new Set(entries.map((e) => e.date))} onSelect={handleSelectDate} />
          </div>

          <div>
            <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-faint">Weight</div>
            <ScrollRuler value={weight} onChange={setWeight} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line bg-card2 px-3.5 py-3">
            <span className="text-[11px] text-muted">Waist (optional)</span>
            <span className="flex items-center gap-1.5">
              <input
                type="number"
                inputMode="decimal"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="—"
                className="w-16 bg-transparent text-right text-sm font-semibold text-fg outline-none"
              />
              <span className="text-[11px] text-muted">cm</span>
            </span>
          </div>

          <button
            onClick={commit}
            className="w-full rounded-xl bg-blue py-3.5 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(59,130,246,0.4)]"
          >
            Done
          </button>
          <p className="text-center text-[10px] leading-relaxed text-faint">
            Only date + weight are entered.
            <br />
            BMI · BF% · milestone · ideal · deviation · projections recalculate automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
