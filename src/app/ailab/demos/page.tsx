import UnderDev from "@/components/UnderDev";
import { getLang, translate } from "@/lib/i18n/server";

export async function generateMetadata() {
  const lang = await getLang();
  return { title: lang === "zh" ? "演示" : "Demos" };
}

export default async function DemosPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);
  return (
    <UnderDev eyebrow={t("ailab.eyebrow")} title={t("ailab.demosTitle")} />
  );
}
