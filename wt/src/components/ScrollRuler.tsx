import { useEffect, useRef, useState } from "react";

const PX_PER_KG = 44;
const MIN = 50;
const MAX = 110;

export function ScrollRuler({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState(value);

  const totalPx = (MAX - MIN) * PX_PER_KG;

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = (value - MIN) * PX_PER_KG;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    const v = MIN + el.scrollLeft / PX_PER_KG;
    const snapped = Math.min(MAX, Math.max(MIN, Math.round(v * 10) / 10));
    setCenter(snapped);
    onChange(snapped);
  };

  const ticks: { x: number; kg: number; major: boolean; mid: boolean }[] = [];
  for (let kg = MIN; kg <= MAX + 0.001; kg += 0.1) {
    const r = Math.round(kg * 10) / 10;
    const major = Math.abs(r - Math.round(r)) < 0.001;
    const mid = !major && Math.abs(r * 2 - Math.round(r * 2)) < 0.001;
    ticks.push({ x: (r - MIN) * PX_PER_KG, kg: r, major, mid });
  }

  return (
    <div>
      <div className="mb-1 text-center">
        <span className="text-[46px] font-extrabold leading-none tracking-tight text-fg">{center.toFixed(1)}</span>
        <span className="ml-1 text-base font-medium text-muted">kg</span>
      </div>
      <div className="relative">
        <div
          ref={ref}
          onScroll={handleScroll}
          className="ruler-track no-scrollbar relative overflow-x-auto"
          style={{ scrollSnapType: "x mandatory" }}
        >
          <div className="relative h-14" style={{ width: totalPx, paddingLeft: "50%", paddingRight: "50%", boxSizing: "content-box" }}>
            <svg width={totalPx} height={56} className="block">
              {ticks.map((t, i) => {
                const h = t.major ? 20 : t.mid ? 14 : 10;
                const y = 42 - h;
                const color = t.major ? "#3A4A6E" : t.mid ? "#2E3B58" : "#27314A";
                return (
                  <g key={i}>
                    <line x1={t.x} y1={y} x2={t.x} y2={42} stroke={color} strokeWidth={t.major ? 2 : 1} />
                    {t.major && (
                      <text x={t.x} y={54} fill="#5A6579" fontSize={8} textAnchor="middle">
                        {Math.round(t.kg)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        {/* center needle */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-14 -translate-x-1/2">
          <div className="mx-auto h-3 w-0 border-l-2 border-blue" />
          <div className="mx-auto h-9 w-0.5 bg-blue" />
          <div
            className="mx-auto -mt-1 h-0 w-0"
            style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "6px solid #3B82F6" }}
          />
        </div>
        {/* edge fades */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-14 w-12"
          style={{ background: "linear-gradient(90deg,#151B29,rgba(21,27,41,0))" }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 h-14 w-12"
          style={{ background: "linear-gradient(270deg,#151B29,rgba(21,27,41,0))" }}
        />
      </div>
      <div className="mt-1 text-center text-[9.5px] tracking-wide text-faint">‹ scroll · 0.1 kg steps ›</div>
    </div>
  );
}
