"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * Agent Operation Flow — live demonstration
 *
 * Five agents collaborate on one project. Each agent performs a sequence
 * of distinct tasks (stints); as a stint executes it "registers" on the
 * Operation Sequence — a linearized snaking line that flows across
 * alternating-direction rows linked by smooth S-curve connectors.
 *
 * The layout, role palette and token-scaled segments replicate the
 * canonical agent-operation-flow skill (assets/Sequence.html):
 *   - segment length  ∝ output tokens
 *   - rows alternate L→R then R→L
 *   - transitions are S-curve connectors (outward U-loop on a shared edge)
 *   - shared legend highlights one role across the whole diagram
 * ------------------------------------------------------------------ */

type Role = "decision" | "architect" | "coding" | "testing" | "review";

const ROLE_COLOR: Record<Role, string> = {
  decision: "#f092c7",
  architect: "#7eb7f8",
  coding: "#7acc8f",
  testing: "#e6a23c",
  review: "#4fd1c7",
};
const ROLE_LABEL: Record<Role, string> = {
  decision: "Decision-making",
  architect: "Architecting",
  coding: "Coding",
  testing: "Testing",
  review: "Review",
};

const AGENTS: { key: string; name: string; role: Role }[] = [
  { key: "orchestrator", name: "Orchestrator", role: "decision" },
  { key: "architect", name: "Architect", role: "architect" },
  { key: "builder", name: "Builder", role: "coding" },
  { key: "tester", name: "Tester", role: "testing" },
  { key: "reviewer", name: "Reviewer", role: "review" },
];

interface Stint {
  agentKey: string;
  label: string;
  tokens: number;
  durationMs: number;
}

// Scripted product build: "Ship the Agent Operation Flow analytics panel".
const PLAN: Stint[] = [
  { agentKey: "orchestrator", label: "Define scope & acceptance criteria", tokens: 9000, durationMs: 6000 },
  { agentKey: "architect", label: "Design data schema & recorder", tokens: 14000, durationMs: 9000 },
  { agentKey: "builder", label: "Scaffold report module", tokens: 28000, durationMs: 18000 },
  { agentKey: "builder", label: "Implement snake-line renderer", tokens: 60000, durationMs: 38000 },
  { agentKey: "tester", label: "Unit tests for layout", tokens: 18000, durationMs: 12000 },
  { agentKey: "tester", label: "Snapshot regression tests", tokens: 14000, durationMs: 9000 },
  { agentKey: "reviewer", label: "Review renderer PR", tokens: 12000, durationMs: 8000 },
  { agentKey: "orchestrator", label: "Plan iteration 2: live mode", tokens: 7000, durationMs: 5000 },
  { agentKey: "architect", label: "Design real-time ingestion", tokens: 16000, durationMs: 10000 },
  { agentKey: "builder", label: "WebSocket telemetry feed", tokens: 42000, durationMs: 26000 },
  { agentKey: "builder", label: "Animated stint fill", tokens: 38000, durationMs: 24000 },
  { agentKey: "tester", label: "E2E playback test", tokens: 22000, durationMs: 14000 },
  { agentKey: "reviewer", label: "Review live-mode PR", tokens: 11000, durationMs: 7000 },
  { agentKey: "orchestrator", label: "QA kickoff & checklist", tokens: 6000, durationMs: 4000 },
  { agentKey: "tester", label: "Cross-browser QA pass", tokens: 20000, durationMs: 13000 },
  { agentKey: "tester", label: "Accessibility audit", tokens: 14000, durationMs: 9000 },
  { agentKey: "builder", label: "Fix QA findings", tokens: 26000, durationMs: 16000 },
  { agentKey: "reviewer", label: "Final review & merge", tokens: 10000, durationMs: 7000 },
  { agentKey: "orchestrator", label: "Write launch notes", tokens: 5000, durationMs: 4000 },
  { agentKey: "architect", label: "Document telemetry contract", tokens: 9000, durationMs: 6000 },
  { agentKey: "tester", label: "Validate sample dataset", tokens: 12000, durationMs: 8000 },
  { agentKey: "reviewer", label: "Sign-off & tag release", tokens: 8000, durationMs: 5000 },
];

const STINTS = PLAN.map((s) => {
  const a = AGENTS.find((x) => x.key === s.agentKey)!;
  return { ...s, role: a.role, color: ROLE_COLOR[a.role], agentName: a.name };
});

// ---- Static layout (snaking line) ----------------------------------------
const WIDTH = 920;
const PAD_X = 12;
const PAD_Y = 14;
const ROW_H = 16;
const CONNECTOR_H = 10;
const GAP = 2;
const MIN_SEG = 1.2;
const TARGET_LINES = 6;
const USABLE = WIDTH - PAD_X * 2;

const perLine = Math.max(1, Math.ceil(STINTS.length / TARGET_LINES));
const LINES: number[][] = [];
for (let i = 0; i < STINTS.length; i += perLine) {
  LINES.push(STINTS.slice(i, i + perLine).map((_, k) => i + k));
}

const SEG: Record<number, { x: number; y: number; w: number; dir: 1 | -1 }> = {};
const LINE_START: number[] = [];
const LINE_END: number[] = [];
LINES.forEach((idxs, li) => {
  const y = PAD_Y + li * (ROW_H + CONNECTOR_H);
  const dir: 1 | -1 = li % 2 === 0 ? 1 : -1;
  const total = idxs.reduce((s, idx) => s + STINTS[idx].tokens, 0);
  let cursor = dir === 1 ? PAD_X : PAD_X + USABLE;
  idxs.forEach((idx) => {
    const frac = total ? STINTS[idx].tokens / total : 0;
    const w = Math.max(frac * USABLE - GAP, MIN_SEG);
    const x = dir === 1 ? cursor : cursor - w;
    SEG[idx] = { x, y, w, dir };
    cursor = dir === 1 ? cursor + w + GAP : cursor - w - GAP;
  });
  LINE_START[li] = idxs[0];
  LINE_END[li] = idxs[idxs.length - 1];
});
const SVG_H = PAD_Y * 2 + LINES.length * ROW_H + (LINES.length - 1) * CONNECTOR_H;

const CONNECTORS: { d: string; nextLine: number }[] = [];
for (let li = 0; li < LINES.length - 1; li++) {
  const dirA = li % 2 === 0 ? 1 : -1;
  const startX = dirA === 1 ? PAD_X + USABLE : PAD_X;
  const startY = PAD_Y + li * (ROW_H + CONNECTOR_H) + ROW_H;
  const dirB = (li + 1) % 2 === 0 ? 1 : -1;
  const endX = dirB === 1 ? PAD_X : PAD_X + USABLE;
  const endY = PAD_Y + (li + 1) * (ROW_H + CONNECTOR_H);
  const loopDir = startX < WIDTH / 2 ? -1 : 1;
  const d = `M ${startX} ${startY} C ${startX + loopDir * 6} ${startY + CONNECTOR_H * 0.6}, ${
    endX + loopDir * 6
  } ${endY - CONNECTOR_H * 0.6}, ${endX} ${endY}`;
  CONNECTORS.push({ d, nextLine: li + 1 });
}

const TOTAL_DURATION = STINTS.reduce((s, x) => s + x.durationMs, 0);
const CUMULATIVE: number[] = [];
{
  let acc = 0;
  for (const s of STINTS) {
    CUMULATIVE.push(acc);
    acc += s.durationMs;
  }
}

function fmtTok(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(Math.round(n));
}
function fmtDur(ms: number): string {
  const s = ms / 1000;
  if (s < 60) return Math.round(s) + "s";
  return Math.floor(s / 60) + "m " + Math.round(s % 60) + "s";
}

const btn =
  "rounded-md border border-[#374151] bg-[#232630] px-3 py-1.5 text-xs font-medium text-[#f3f4f6] transition-colors hover:border-[#7eb7f8]";
const btnActive = "border-[#7eb7f8] text-[#7eb7f8]";

export default function AgentFlowDemo() {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; html: string } | null>(null);

  // Respect reduced-motion: jump to the finished state, no animation.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setElapsed(TOTAL_DURATION);
      setPlaying(false);
    }
  }, []);

  // Animation clock (requestAnimationFrame).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      setElapsed((e) => {
        const ne = e + dt * speed;
        if (ne >= TOTAL_DURATION) {
          setPlaying(false);
          return TOTAL_DURATION;
        }
        return ne;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  // Resolve revealed stints + the active (partially-filled) stint.
  let activeIndex = STINTS.length;
  let activeProgress = 0;
  for (let i = 0; i < STINTS.length; i++) {
    if (elapsed >= CUMULATIVE[i] + STINTS[i].durationMs) continue;
    activeIndex = i;
    activeProgress = Math.min(1, Math.max(0, (elapsed - CUMULATIVE[i]) / STINTS[i].durationMs));
    break;
  }
  const revealedCount = activeIndex;
  const done = activeIndex >= STINTS.length;
  const activeStint = done ? null : STINTS[activeIndex];

  // Accumulated output tokens per role (for the budget view).
  const tokensByRole: Record<Role, number> = {
    decision: 0,
    architect: 0,
    coding: 0,
    testing: 0,
    review: 0,
  };
  for (let i = 0; i < STINTS.length; i++) {
    if (i < revealedCount) tokensByRole[STINTS[i].role] += STINTS[i].tokens;
    else if (i === activeIndex) tokensByRole[STINTS[i].role] += STINTS[i].tokens * activeProgress;
    else break;
  }
  const grandTokens = Object.values(tokensByRole).reduce((s, v) => s + v, 0);

  function showTip(e: React.MouseEvent, s: (typeof STINTS)[number]) {
    const html = `<div style="display:flex;gap:6px;align-items:center;margin-bottom:2px"><span style="width:8px;height:8px;border-radius:2px;background:${s.color}"></span><strong>${ROLE_LABEL[s.role]}</strong></div><div style="color:#cbd5e1">${s.agentName} · ${s.label}</div><div style="color:#cbd5e1">${fmtTok(s.tokens)} tokens · ${fmtDur(s.durationMs)}</div>`;
    setTip({ x: e.clientX, y: e.clientY, html });
  }
  function moveTip(e: React.MouseEvent) {
    setTip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t));
  }

  const overallPct = Math.round((elapsed / TOTAL_DURATION) * 100);

  return (
    <div className="rounded-xl border border-line bg-[#1a1c23] p-5 text-[#f3f4f6]">
      {/* Status / current activity */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">
            {done ? "Project shipped" : "Now working"}
          </p>
          {activeStint ? (
            <p className="mt-1 truncate text-sm">
              <span style={{ color: activeStint.color }}>●</span>{" "}
              <span className="font-medium">{activeStint.agentName}</span>
              <span className="text-[#9ca3af]"> — {activeStint.label}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm font-medium text-[#7acc8f]">
              {STINTS.length} stints complete · {fmtTok(grandTokens)} tokens
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={btn}
            onClick={() => {
              if (done) setElapsed(0);
              setPlaying((p) => !p);
            }}
          >
            {done ? "↻ Replay" : playing ? "❚❚ Pause" : "▶ Play"}
          </button>
          <button type="button" className={btn} onClick={() => { setElapsed(0); setPlaying(true); }}>
            Restart
          </button>
          <div className="flex gap-1">
            {[1, 2, 4].map((sp) => (
              <button
                key={sp}
                type="button"
                className={`${btn} px-2 ${speed === sp ? btnActive : ""}`}
                onClick={() => setSpeed(sp)}
              >
                {sp}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[#2a2e3b]">
        <div
          className="h-full rounded-full bg-[#7eb7f8] transition-[width] duration-150"
          style={{ width: `${overallPct}%` }}
        />
      </div>

      {/* Snaking operation sequence */}
      <div className="overflow-x-auto rounded-lg border border-[#374151] bg-[#232630] p-2">
        <svg
          viewBox={`0 0 ${WIDTH} ${SVG_H}`}
          className="block w-full"
          style={{ height: "auto", minWidth: 520 }}
          role="img"
          aria-label="Operation sequence: five agents registering stints on a snaking line. Segment length is proportional to output tokens."
        >
          {Array.from({ length: LINES.length }, (_, li) => (
            <rect
              key={`row${li}`}
              x={PAD_X}
              y={PAD_Y + li * (ROW_H + CONNECTOR_H)}
              width={USABLE}
              height={ROW_H}
              rx={4}
              fill="#2a2e3b"
            />
          ))}

          {CONNECTORS.map((c) =>
            revealedCount >= LINE_START[c.nextLine] ? (
              <path key={c.nextLine} d={c.d} fill="none" stroke="#3f4554" strokeWidth={1.2} opacity={0.7} />
            ) : null,
          )}

          {STINTS.map((s, i) => {
            if (i > activeIndex) return null;
            const g = SEG[i];
            let w = g.w;
            let x = g.x;
            if (i === activeIndex) {
              w = Math.max(g.w * activeProgress, MIN_SEG);
              if (g.dir === -1) x = g.x + g.w - w;
            }
            const dim = activeRole && s.role !== activeRole;
            return (
              <rect
                key={i}
                x={x}
                y={g.y + 2}
                width={w}
                height={ROW_H - 4}
                rx={2}
                fill={s.color}
                opacity={dim ? 0.18 : 1}
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${ROLE_LABEL[s.role]} — ${s.agentName}: ${s.label}. ${fmtTok(s.tokens)} tokens, ${fmtDur(s.durationMs)}`}
                style={{ cursor: "pointer", transition: "opacity 150ms ease" }}
                onMouseEnter={(e) => showTip(e, s)}
                onMouseMove={moveTip}
                onMouseLeave={() => setTip(null)}
                onFocus={() => setActiveRole(s.role)}
                onBlur={() => setActiveRole(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors ${
              activeRole === r
                ? "border-[#7eb7f8] bg-white/10 text-[#f3f4f6]"
                : "border-transparent text-[#9ca3af] hover:bg-white/5"
            }`}
            onMouseEnter={() => setActiveRole(r)}
            onMouseLeave={() => setActiveRole(null)}
            onFocus={() => setActiveRole(r)}
            onBlur={() => setActiveRole(null)}
            onClick={() => setActiveRole((cur) => (cur === r ? null : r))}
          >
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: ROLE_COLOR[r] }} />
            {ROLE_LABEL[r]}
          </button>
        ))}
      </div>

      {/* Fleet Output Budget (live) */}
      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">
          Fleet output budget (live)
        </p>
        <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full border border-[#374151]">
          {AGENTS.map((a) => {
            const v = tokensByRole[a.role];
            const pct = grandTokens ? (v / grandTokens) * 100 : 0;
            return (
              <div
                key={a.key}
                style={{ width: `${pct}%`, background: ROLE_COLOR[a.role] }}
                title={`${a.name}: ${fmtTok(v)}`}
              />
            );
          })}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
          {AGENTS.map((a) => (
            <div key={a.key} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-[#cbd5e1]">
                <span className="h-2 w-2 rounded-sm" style={{ background: ROLE_COLOR[a.role] }} />
                {a.name}
              </span>
              <span className="text-[#9ca3af]">{fmtTok(tokensByRole[a.role])}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-[#9ca3af]">
        Live simulation of five agents. Each colored segment is one stint; its length is
        proportional to output tokens. Rows alternate direction and link via S-curve
        connectors — the canonical Operation Sequence from the agent-operation-flow skill.
      </p>

      {tip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md border border-[#374151] bg-[#11131a] px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{ left: tip.x, top: tip.y - 10 }}
          dangerouslySetInnerHTML={{ __html: tip.html }}
        />
      )}
    </div>
  );
}
