import UnderDev from "@/components/UnderDev";
import { getLang, translate } from "@/lib/i18n/server";

export async function generateMetadata() {
  const lang = await getLang();
  return { title: lang === "zh" ? "AI 项目" : "AI Projects" };
}

export default async function AiProjectsPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);
  return (
    <UnderDev
      eyebrow={t("ailab.eyebrow")}
      title={t("ailab.projectsTitle")}
    />
  );
}
