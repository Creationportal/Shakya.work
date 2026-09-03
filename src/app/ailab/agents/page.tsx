import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "AI Agents", zh: "AI 智能体" },
    description: {
      en: "Meet the AI agents behind Shakya.work — voice, search, sales and simulation agents, with live capabilities and the office simulator.",
      zh: "了解 Shakya.work 背后的 AI 智能体——语音、搜索、销售与模拟智能体，含实时能力展示与办公室模拟器。",
    },
  });
}

export default async function AgentsPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  const CARDS = [
    { title: t("agents.agent1Title"), body: t("agents.agent1Body") },
    { title: t("agents.skillsTitle"), body: t("agents.skillsBody") },
    {
      title: t("agents.simulatorTitle"),
      body: t("agents.simulatorBody"),
      href: "/ailab/simulation",
    },
  ];

  return (
    <div>
      <PageIntro
        eyebrow={t("agents.eyebrow")}
        title={t("agents.title")}
        description={t("agents.description")}
      />

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) =>
            c.href ? (
              <Link
                key={c.title}
                href={c.href}
                className="group rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent"
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
                  {c.title}
                </h2>
                <p className="mt-3 text-sm text-muted">{c.body}</p>
                <span className="mt-4 inline-block text-sm text-accent group-hover:underline">
                  {t("ailab.open")} →
                </span>
              </Link>
            ) : (
              <div
                key={c.title}
                className="rounded-lg border border-line bg-surface p-6"
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
                  {c.title}
                </h2>
                <p className="mt-3 text-sm text-muted">{c.body}</p>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
