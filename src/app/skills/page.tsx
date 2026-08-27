import PageIntro from "@/components/PageIntro";
import { getLang, translate } from "@/lib/i18n/server";

export async function generateMetadata() {
  const lang = await getLang();
  return { title: lang === "zh" ? "技能" : "Skills" };
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
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
