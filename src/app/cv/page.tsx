import { getLang } from "@/lib/i18n/server";
import CvContent from "@/components/cv/CvContent";

export async function generateMetadata() {
  const lang = await getLang();
  return {
    title:
      lang === "zh" ? "Shakya Pranamya — 个人履历" : "Shakya Pranamya — CV",
    description:
      lang === "zh"
        ? "Shakya Pranamya (唐仲禹) 的个人履历：AI 产品管理、6 年以上企业级 AI 与国际化经验。"
        : "Curriculum vitae of Shakya Pranamya (唐仲禹) — AI product management, 6+ years of enterprise AI and international experience.",
    // Private page: never index or follow from search engines.
    robots: { index: false, follow: false },
  };
}

export default function CvPage() {
  return <CvContent />;
}
