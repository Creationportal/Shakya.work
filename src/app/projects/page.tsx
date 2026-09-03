import PageIntro from "@/components/PageIntro";
import Link from "next/link";
import ProjectScreenshot from "@/components/projects/ProjectScreenshot";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "Projects", zh: "项目" },
    description: {
      en: "Shakya's product portfolio — AI trading analysis, the weight and milestone tracker, enterprise AI and interactive demos.",
      zh: "Shakya 的产品组合——AI 交易分析、体重与里程碑追踪器、企业级 AI 与交互式演示。",
    },
  });
}

export default async function ProjectsPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  const PROJECTS = [
    {
      key: "trading",
      title: t("projects.tradingTitle"),
      body: t("projects.tradingBody"),
      href: "/trading",
      cta: t("projects.openTrading"),
      screenshot: "/projects/unified-trading-analysis.png",
    },
    {
      key: "wt",
      title: t("projects.wtTitle"),
      body: t("projects.wtBody"),
      href: "/wt",
      cta: t("projects.openWt"),
      badge: t("projects.wtStatus"),
    },
  ];

  return (
    <div>
      <PageIntro
        eyebrow={t("projects.eyebrow")}
        title={t("projects.title")}
        description={t("projects.description")}
      />

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {PROJECTS.map((p) => (
            <div
              key={p.key}
              className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface"
            >
              <div className="border-b border-line bg-paper p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
                        {p.title}
                      </h2>
                      {p.badge && (
                        <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 max-w-md text-sm text-muted">{p.body}</p>
                  </div>
                  <Link
                    href={p.href}
                    className="inline-flex flex-none items-center justify-center rounded-md bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                  >
                    {p.cta}
                  </Link>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-end p-4 sm:p-5">
                {p.screenshot ? (
                  <ProjectScreenshot
                    src={p.screenshot}
                    alt={p.title}
                    label={t("projects.exploreScreenshot")}
                    closeLabel={t("projects.closePreview")}
                  />
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center rounded-md border border-dashed border-line bg-paper text-center">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted">
                      {p.badge ? t("projects.wtPlaceholder") : t("projects.wtStatus")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
