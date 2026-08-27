import PageIntro from "@/components/PageIntro";
import { getLang, translate } from "@/lib/i18n/server";

export async function generateMetadata() {
  const lang = await getLang();
  return { title: lang === "zh" ? "聚合" : "Hub" };
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
