import { useEffect } from "react";
import type { Milestone } from "../lib/types";

export function Celebration({ milestone, onClose }: { milestone: Milestone; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [milestone, onClose]);

  const pieces = Array.from({ length: 28 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: (i % 7) * 0.12,
    color: ["#34D399", "#A855F7", "#3B82F6", "#FBBF24", "#2DD4BF"][i % 5],
    dur: 1.6 + (i % 5) * 0.25,
  }));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(4,7,14,0.72)] backdrop-blur-sm">
      <div className="animate-pop-in relative mx-6 max-w-sm rounded-3xl border border-purple/40 bg-card p-7 text-center shadow-[0_-12px_40px_rgba(0,0,0,0.5)]">
        <div className="text-5xl">{milestone.flag ?? "🎉"}</div>
        <div className="mt-3 text-xl font-extrabold text-fg">Milestone reached!</div>
        <div className="mt-1 text-sm font-semibold text-[#C4B5FD]">
          {milestone.name} · {Math.round(milestone.bf)}% BF
        </div>
        <blockquote className="mt-3 rounded-xl border-l-[3px] border-purple bg-card2 p-3 text-[11.5px] leading-relaxed text-[#C6CDDC]">
          {milestone.what_changes}
        </blockquote>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-blue py-3 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(59,130,246,0.4)]"
        >
          Nice!
        </button>
      </div>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "8%",
            width: 8,
            height: 12,
            borderRadius: 2,
            background: p.color,
            animation: `confetti-fall ${p.dur}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
