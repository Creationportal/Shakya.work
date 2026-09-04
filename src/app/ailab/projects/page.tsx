import ProjectPage from "@/components/project/ProjectPage";
import ProjectGrid from "@/components/project/ProjectGrid";
import ProjectCard from "@/components/project/ProjectCard";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "AI Projects", zh: "AI 项目" },
    description: {
      en: "Selected AI projects by Shakya — enterprise retrieval, speech-to-text, text-to-speech, trading analysis and the hybrid-office agent simulator.",
      zh: "Shakya 精选的 AI 项目——企业检索、语音转文字、文字转语音、交易分析与混合办公智能体模拟器。",
    },
  });
}

export default async function AiProjectsPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  const CARDS = [
    {
      href: "/ailab#live-rag",
      label: t("ailab.labelRag"),
      title: t("projects.ragTitle"),
      body: t("projects.ragBody"),
    },
    {
      href: "/ailab#live-asr",
      label: t("ailab.labelAsr"),
      title: t("projects.asrTitle"),
      body: t("projects.asrBody"),
    },
    {
      href: "/ailab#live-tts",
      label: t("ailab.labelTts"),
      title: t("projects.ttsTitle"),
      body: t("projects.ttsBody"),
    },
    {
      href: "/ailab#live-voiceops",
      label: t("ailab.labelOps"),
      title: t("projects.voiceopsTitle"),
      body: t("projects.voiceopsBody"),
    },
    {
      href: "/ailab/simulation",
      label: t("ailab.simulationLabel"),
      title: t("ailab.simulationTitle"),
      body: t("ailab.simulationBody"),
    },
    {
      href: "/trading",
      label: t("ailab.labelTrading"),
      title: t("projects.tradingTitle"),
      body: t("projects.tradingBody"),
    },
    {
      href: "/wt",
      label: t("ailab.labelTracker"),
      title: t("projects.wtTitle"),
      body: t("projects.wtBody"),
    },
  ];

  return (
    <ProjectPage
      eyebrow={t("ailab.eyebrow")}
      title={t("ailab.projectsTitle")}
      description={t("ailab.projectsBody")}
    >
      <ProjectGrid>
        {CARDS.map((card) => (
          <ProjectCard
            key={card.href}
            href={card.href}
            label={card.label}
            title={card.title}
            body={card.body}
            cta={t("ailab.open")}
          />
        ))}
      </ProjectGrid>
    </ProjectPage>
  );
}
