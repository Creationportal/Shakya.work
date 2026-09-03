import PageIntro from "@/components/PageIntro";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "Skills", zh: "技能" },
    description: {
      en: "Shakya's skill set — AI product management, enterprise automation, voice AI, and China-market go-to-market expertise.",
      zh: "Shakya 的技能矩阵——AI 产品管理、企业自动化、语音 AI 与中国市场拓展经验。",
    },
  });
}

export default async function SkillsPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  const GROUPS = [
    { name: t("skills.technical"), items: ["—", "—", "—"] },
    { name: t("skills.management"), items: ["Fintech PM", "AI PM", "—"] },
    { name: t("skills.ecosystem"), items: ["Fintech", "AI", "China know-how"] },
  ];

  return (
    <div>
      <PageIntro
        eyebrow={t("skills.eyebrow")}
        title={t("skills.title")}
        description={t("skills.description")}
      />
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {GROUPS.map((g) => (
            <div
              key={g.name}
              className="rounded-lg border border-line bg-surface p-6"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
                {g.name}
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {g.items.map((i, idx) => (
                  <li key={`${g.name}-${idx}`}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
