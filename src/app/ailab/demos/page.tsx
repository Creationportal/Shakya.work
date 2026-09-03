import ProjectPage from "@/components/project/ProjectPage";
import ProjectGrid from "@/components/project/ProjectGrid";
import ProjectEmptyCard from "@/components/project/ProjectEmptyCard";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "Demos", zh: "演示" },
    description: {
      en: "Hands-on AI demos from Shakya.work — try voice agents, enterprise search and the office simulator in your browser.",
      zh: "Shakya.work 的实操 AI 演示——在浏览器中体验语音智能体、企业搜索与办公室模拟器。",
    },
  });
}

export default async function DemosPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);
  return (
    <ProjectPage
      eyebrow={t("ailab.eyebrow")}
      title={t("ailab.demosTitle")}
      description={t("ailab.demosBody")}
    >
      <ProjectGrid>
        <ProjectEmptyCard
          title={t("ailab.demosTitle")}
          note={t("ailab.comingSoon")}
        />
      </ProjectGrid>
    </ProjectPage>
  );
}
