import { useState } from "react";
import { addDays, monthLabel, parseDate, toKey, todayKey } from "../lib/date";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export function Calendar({
  selected,
  hasEntries,
  onSelect,
}: {
  selected: string;
  hasEntries: Set<string>;
  onSelect: (d: string) => void;
}) {
  const [monthAnchor, setMonthAnchor] = useState<string>(selected.slice(0, 7) + "-01");
  const today = todayKey();

  const first = parseDate(monthAnchor);
  const startOffset = first.getDay(); // Sunday = 0
  const cells: string[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(addDays(monthAnchor, i - startOffset));
  }

  const shift = (deltaMonths: number) => {
    const d = parseDate(monthAnchor);
    d.setMonth(d.getMonth() + deltaMonths);
    setMonthAnchor(toKey(d));
  };

  return (
    <div className="rounded-2xl border border-line bg-card2 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="px-2 text-muted" aria-label="Previous month">
          ‹
        </button>
        <span className="text-[13px] font-bold text-fg">{monthLabel(monthAnchor)}</span>
        <button onClick={() => shift(1)} className="px-2 text-muted" aria-label="Next month">
          ›
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7">
        {DOW.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-bold text-faint">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((c) => {
          const inMonth = c.slice(0, 7) === monthAnchor.slice(0, 7);
          const isSel = c === selected;
          const isToday = c === today;
          const has = hasEntries.has(c);
          return (
            <button
              key={c}
              onClick={() => onSelect(c)}
              className={`relative my-0.5 flex h-9 items-center justify-center rounded-xl text-xs ${
                isSel
                  ? "bg-blue font-bold text-white shadow-[0_4px_12px_rgba(59,130,246,0.45)]"
                  : inMonth
                    ? "text-fg hover:bg-card"
                    : "text-[#3A4358]"
              } ${!isSel && isToday ? "ring-1 ring-line" : ""}`}
            >
              {parseDate(c).getDate()}
              {has && !isSel && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#4C5B7A]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
