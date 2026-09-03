import SimulationView from "@/components/agents/simulation/SimulationView";
import { getLang } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "Agent Office Simulator", zh: "办公室实时模拟" },
    description: {
      en: "Office Live Twin — a Pokémon-style 2D simulation of humans and AI agents collaborating in an office, with day and night cycles.",
      zh: "Office Live Twin——宝可梦风格的 2D 办公室模拟，呈现人类员工与 AI 智能体协作及昼夜循环。",
    },
  });
}

export default async function SimulationPage() {
  const lang = await getLang();
  return (
    <>
      <h1 className="sr-only">
        {lang === "zh" ? "办公室实时模拟" : "Agent Office Simulator"}
      </h1>
      <SimulationView />
    </>
  );
}
