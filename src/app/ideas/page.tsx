import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import SimulatorPreview from "@/components/agents/simulation/SimulatorPreview";
import { getLang, translate } from "@/lib/i18n/server";

export async function generateMetadata() {
  const lang = await getLang();
  return { title: lang === "zh" ? "创意" : "Ideas" };
}

export default async function IdeasPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  const IDEAS = [
    {
      key: "simulation",
      href: "/ailab/simulation",
      title: t("ideas.simulationTitle"),
      body: t("ideas.simulationBody"),
      label: t("ideas.simulationLabel"),
      preview: <SimulatorPreview className="h-full w-full" />,
    },
    {
      key: "trading",
      href: "/trading",
      title: t("ideas.tradingTitle"),
      body: t("ideas.tradingBody"),
      label: t("ideas.tradingLabel"),
      preview: null,
    },
  ];

  return (
    <div>
      <PageIntro
        eyebrow={t("ideas.eyebrow")}
        title={t("ideas.title")}
        description={t("ideas.description")}
      />
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {IDEAS.map((idea) => (
            <Link
              key={idea.key}
              href={idea.href}
              className="group relative overflow-hidden rounded-lg border border-line bg-surface p-0 transition-colors hover:border-accent"
            >
              {idea.preview && (
                <div className="aspect-[3/2] w-full border-b border-line bg-paper">
                  {idea.preview}
                </div>
              )}
              <div className="p-6">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                  {idea.label}
                </span>
                <h2 className="mt-2 text-base font-semibold text-ink">
                  {idea.title}
                </h2>
                <p className="mt-2 text-sm text-muted">{idea.body}</p>
                <span className="mt-4 inline-block text-sm text-accent group-hover:underline">
                  {t("ailab.open")} →
                </span>
              </div>
            </Link>
          ))}
          <div className="flex flex-col justify-center rounded-lg border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
            <p>{t("ideas.moreSoon")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
