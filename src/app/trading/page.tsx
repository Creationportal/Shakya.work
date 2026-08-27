import TradingDashboard from "@/components/trading/TradingDashboard";
import { getLang } from "@/lib/i18n/server";

export async function generateMetadata() {
  const lang = await getLang();
  return { title: lang === "zh" ? "统一交易分析" : "Unified Trading Analysis" };
}

export default function TradingPage() {
  return <TradingDashboard />;
}
