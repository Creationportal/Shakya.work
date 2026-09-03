import PageIntro from "@/components/PageIntro";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "Hub", zh: "聚合" },
    description: {
      en: "A centralized hub of Shakya.work — quick links to AI demos, projects, the agent simulator and contact.",
      zh: "Shakya.work 的聚合入口——快速访问 AI 演示、项目、智能体模拟器与联系页面。",
    },
  });
}

export default async function HubPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  return (
    <div>
      <PageIntro
        eyebrow={t("hub.eyebrow")}
        title={t("hub.title")}
        description={t("hub.description")}
      />
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
          <p className="font-medium text-ink">{t("hub.emptyTitle")}</p>
          <p className="mt-2">{t("hub.emptyBody")}</p>
        </div>
      </section>
    </div>
  );
}
