import SimulationView from "@/components/agents/simulation/SimulationView";
import { getLang } from "@/lib/i18n/server";

export async function generateMetadata() {
  const lang = await getLang();
  return {
    title: lang === "zh" ? "办公室模拟器" : "Agent Office Simulator",
  };
}

export default async function SimulationPage() {
  return <SimulationView />;
}
