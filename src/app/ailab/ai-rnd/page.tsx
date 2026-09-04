import ProjectPage from "@/components/project/ProjectPage";
import ProjectGrid from "@/components/project/ProjectGrid";
import ProjectSection from "@/components/project/ProjectSection";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "AI R&D", zh: "AI 研发" },
    description: {
      en: "AI research and development notes from Shakya — retrieval, voice latency and cost, and the discipline of shipping AI that degrades gracefully.",
      zh: "Shakya 的 AI 研发笔记——检索、语音延迟与成本，以及让 AI 优雅降级的上线原则。",
    },
  });
}

export default async function AiRndPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  const NOTES = [
    { title: t("ailab.rndNote1Title"), body: t("ailab.rndNote1Body") },
    { title: t("ailab.rndNote2Title"), body: t("ailab.rndNote2Body") },
    { title: t("ailab.rndNote3Title"), body: t("ailab.rndNote3Body") },
  ];

  const NOW = [
    t("ailab.rndNow1"),
    t("ailab.rndNow2"),
    t("ailab.rndNow3"),
  ];

  return (
    <ProjectPage
      eyebrow={t("ailab.eyebrow")}
      title={t("ailab.rndTitle")}
      description={t("ailab.rndBody")}
    >
      <ProjectSection
        title={t("ailab.rndNotesTitle")}
        intro={t("ailab.rndIntro")}
      >
        <ProjectGrid>
          {NOTES.map((note) => (
            <article
              key={note.title}
              className="rounded-lg border border-line bg-surface p-6"
            >
              <h3 className="text-sm font-semibold leading-snug text-ink">
                {note.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {note.body}
              </p>
            </article>
          ))}
        </ProjectGrid>
      </ProjectSection>

      <ProjectSection title={t("ailab.rndNowTitle")}>
        <ul className="space-y-3">
          {NOW.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-lg border border-line bg-paper p-4 text-sm leading-relaxed text-ink"
            >
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </ProjectSection>
    </ProjectPage>
  );
}
