import ProjectPage from "@/components/project/ProjectPage";
import ProjectGrid from "@/components/project/ProjectGrid";
import ProjectEmptyCard from "@/components/project/ProjectEmptyCard";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "AI Projects", zh: "AI 项目" },
    description: {
      en: "Selected AI projects by Shakya — enterprise automation, voice GPT, sales AI and debt-collection agents.",
      zh: "Shakya 精选的 AI 项目——企业自动化、语音 GPT、销售 AI 与债务催收智能体。",
    },
  });
}

export default async function AiProjectsPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);
  return (
    <ProjectPage
      eyebrow={t("ailab.eyebrow")}
      title={t("ailab.projectsTitle")}
      description={t("ailab.projectsBody")}
    >
      <ProjectGrid>
        <ProjectEmptyCard
          title={t("ailab.projectsTitle")}
          note={t("ailab.comingSoon")}
        />
      </ProjectGrid>
    </ProjectPage>
  );
}
