import TradingDashboard from "@/components/trading/TradingDashboard";
import { getLang } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "Unified Trading Analysis", zh: "统一交易分析" },
    description: {
      en: "An interactive trading-analysis workspace by Shakya — visualize positions, scenarios and risk in one place. Illustrative only, not financial advice.",
      zh: "Shakya 的交互式交易分析工作台——在一处可视化持仓、情景与风险。仅供参考，不构成投资建议。",
    },
  });
}

export default function TradingPage() {
  return <TradingDashboard />;
}
