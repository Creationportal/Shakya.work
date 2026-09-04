import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import LiveModules from "@/components/ailab/LiveModules";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "AI Lab", zh: "AI 实验室" },
    description: {
      en: "Shakya's AI Lab — live demos of AI agents, R&D experiments, projects, and the Office Live Twin simulator.",
      zh: "Shakya 的 AI 实验室——AI 智能体、研发实验、项目，以及 Office Live Twin 模拟器的实时演示。",
    },
  });
}

export default async function AilabPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  const WALL = [
    {
      title: t("ailab.rndTitle"),
      href: "/ailab/ai-rnd",
      desc: t("ailab.rndBody"),
    },
    {
      title: t("ailab.projectsTitle"),
      href: "/ailab/projects",
      desc: t("ailab.projectsBody"),
    },
    {
      title: t("agents.title"),
      href: "/ailab/agents",
      desc: t("agents.description"),
    },
  ];

  return (
    <div>
      <PageIntro
        eyebrow={t("ailab.eyebrow")}
        title={t("ailab.title")}
        description={t("ailab.description")}
      />

      {/* AI R&D live modules — TTS, ASR, RAG and Voice Ops, all on this page */}
      <section id="live-modules" className="mx-auto max-w-4xl px-5 pb-16">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {t("ailab.liveTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted">{t("ailab.liveBody")}</p>
        <div className="mt-6">
          <LiveModules />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {WALL.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
                {c.title}
              </h2>
              <p className="mt-3 text-sm text-muted">{c.desc}</p>
              <span className="mt-4 inline-block text-sm text-accent group-hover:underline">
                {t("ailab.open")} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {t("ailab.ideasWallTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted">{t("ailab.ideasWallBody")}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/ailab/simulation"
            className="group relative overflow-hidden rounded-md border border-line bg-paper p-0 transition-colors hover:border-accent"
          >
            <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                {t("ailab.simulationLabel")}
              </span>
              <span className="text-xs text-muted group-hover:text-accent">
                {t("ailab.open")} →
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-ink">
                {t("ailab.simulationTitle")}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {t("ailab.simulationBody")}
              </p>
            </div>
          </Link>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-line bg-paper p-4 text-sm text-muted"
            >
              {t("ailab.idea")} #{i + 2} — coming soon
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
