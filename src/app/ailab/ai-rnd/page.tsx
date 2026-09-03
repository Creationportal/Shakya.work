import ProjectPage from "@/components/project/ProjectPage";
import ProjectGrid from "@/components/project/ProjectGrid";
import ProjectEmptyCard from "@/components/project/ProjectEmptyCard";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "AI R&D", zh: "AI 研发" },
    description: {
      en: "AI research and development experiments from Shakya — prototypes, model evaluations and early-stage product concepts.",
      zh: "Shakya 的 AI 研发实验——原型、模型评测与早期产品概念。",
    },
  });
}

export default async function AiRndPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);
  return (
    <ProjectPage
      eyebrow={t("ailab.eyebrow")}
      title={t("ailab.rndTitle")}
      description={t("ailab.rndBody")}
    >
      <ProjectGrid>
        <ProjectEmptyCard
          title={t("ailab.rndTitle")}
          note={t("ailab.comingSoon")}
        />
      </ProjectGrid>
    </ProjectPage>
  );
}
