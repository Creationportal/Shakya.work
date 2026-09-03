import { readFileSync } from "fs";
import path from "path";
import { headers } from "next/headers";
import Image from "next/image";
import PageIntro from "@/components/PageIntro";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";
import AgentFlowDemo from "./AgentFlowDemo";
import CopyBlock from "./CopyBlock";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "Agent Operation Flow — AI Labs", zh: "智能体操作流 — AI 实验室" },
    description: {
      en: "A product that visualizes how agents spend effort over time — a linearized Operation Sequence snaking line plus a live fleet output budget.",
      zh: "将智能体随时间投入的精力可视化的产品——线性化操作序列蛇形图与实时产出预算。",
    },
  });
}

const SKILL_PATH = path.join(process.cwd(), "public/agent-operation-flow/SKILL.md");

/**
 * Read the skill definition. On a normal Node/dev server we read it from disk.
 * On read-only edge runtimes (Cloudflare Pages) the file ships as a static asset,
 * so we fall back to fetching it from the same origin — this avoids a hard
 * "Skill file not found." on deployment.
 */
async function loadSkillText(): Promise<string> {
  try {
    return readFileSync(SKILL_PATH, "utf8");
  } catch {
    // fall through to network read
  }
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const res = await fetch(`https://${host}/agent-operation-flow/SKILL.md`, {
        cache: "no-store",
      });
      if (res.ok) return await res.text();
    }
  } catch {
    // ignore — final fallback below
  }
  return "Skill file not found.";
}

export default async function AgentOperationFlowPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  const skillText = await loadSkillText();

  return (
    <div>
      <PageIntro
        eyebrow={`${t("ailab.eyebrow")} · Ideas`}
        title="Agent Operation Flow"
        description="Package any multi-agent run as a shareable report: see what each agent was doing and how many output tokens each activity cost."
      />

      <section className="mx-auto max-w-6xl space-y-12 px-5 pb-20">
        {/* Short description + screenshot */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-ink">What it is</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Agent Operation Flow turns cheap, structured stint records — one per block of
              focused activity — into an interactive, dark-theme report. Two linked views share
              one legend: a linearized Operation Sequence that snakes across alternating-direction
              lines (segment length ∝ output tokens), and a Fleet Output Budget showing where the
              fleet&apos;s output tokens went. Roles appear on the board only while the agent is
              actively working and has explicitly reported its status.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              It is deliberately non-LLM: a harness hook measures tokens and duration, so the
              report never invents telemetry. Use it to monitor, audit, or demo a fleet, or to
              render <code>osm/records.jsonl</code> stints into a shareable visual.
            </p>
          </div>
          <div>
            <Image
              src="/agent-operation-flow/screenshot.png"
              alt="Agent Operation Flow report showing the Operation Sequence snaking line"
              width={730}
              height={514}
              className="w-full rounded-lg border border-line"
            />
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-xl font-semibold text-ink">How it works</h2>
          <ol className="mt-4 space-y-4">
            <li className="rounded-lg border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-ink">1 · Record</p>
              <p className="mt-1 text-sm text-muted">
                The harness writes one atomic JSONL line per stint: agent id, role, task type,
                tokens in/out, duration and timestamps. Tokens are derived from real artifact size
                or command wall-clock — never hand-guessed.
              </p>
            </li>
            <li className="rounded-lg border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-ink">2 · Aggregate</p>
              <p className="mt-1 text-sm text-muted">
                A passive reader filters by agent, classifies the current activity, and buckets the
                11 task types (decision-making, architecting, coding, testing, review, QA, memory
                recall, tool use, invoke skill, split sub-agents, ask for permissions), summing
                tokens and time — pure I/O, no re-prompt.
              </p>
            </li>
            <li className="rounded-lg border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-ink">3 · Report</p>
              <p className="mt-1 text-sm text-muted">
                The data is assigned to <code>window.OPS_DATA</code> and rendered into the snaking
                Operation Sequence plus the Fleet Output Budget. The report always prints provenance
                and a SAMPLE / RECONSTRUCTED badge so measured vs synthetic is never ambiguous.
              </p>
            </li>
          </ol>
        </div>

        {/* Live demo */}
        <div>
          <h2 className="text-xl font-semibold text-ink">Live demonstration</h2>
          <p className="mt-2 text-sm text-muted">
            Five agents collaborate on one product. Watch each register stints on the sequence as
            the project completes.
          </p>
          <div className="mt-4">
            <AgentFlowDemo />
          </div>
        </div>

        {/* Copyable skill block */}
        <div>
          <h2 className="text-xl font-semibold text-ink">Install the skill</h2>
          <p className="mt-2 text-sm text-muted">
            The full, copyable skill definition — drop it into your own WorkBuddy skills folder.
          </p>
          <div className="mt-4">
            <CopyBlock text={skillText} filename="agent-operation-flow/SKILL.md" />
          </div>
        </div>

        <div className="pt-2">
          <a href="/ideas" className="text-sm text-accent hover:underline">
            ← Back to Ideas
          </a>
        </div>
      </section>
    </div>
  );
}
