export interface SkillItem {
  name: string;
  /** Filename under /public/skills, e.g. "figma.ico". Omit to render a letter avatar. */
  icon?: string;
}

export interface SkillCategory {
  /** i18n key suffix, e.g. "uiux" → t("skills.uiux") */
  key: string;
  items: SkillItem[];
}

export const SKILLS: SkillCategory[] = [
  {
    key: "uiux",
    items: [
      { name: "Figma" },
      { name: "CoDesign", icon: "codesign.ico" },
      { name: "Balsamiq" },
      { name: "Mockups" },
      { name: "3ds Max", icon: "autodesk.ico" },
      { name: "Unity", icon: "unity.ico" },
    ],
  },
  {
    key: "cloud",
    items: [{ name: "Azure", icon: "azure.ico" }],
  },
  {
    key: "coding",
    items: [
      { name: "Python", icon: "python.ico" },
      { name: "SQL" },
      { name: "R", icon: "rlang.ico" },
      { name: "Firebase", icon: "firebase.ico" },
      { name: "MySQL", icon: "mysql.ico" },
      { name: "MATLAB", icon: "matlab.ico" },
      { name: "Jupyter", icon: "jupyter.ico" },
      { name: "PyTorch", icon: "pytorch.ico" },
    ],
  },
  {
    key: "ai",
    items: [
      { name: "Vercel AI", icon: "vercel.ico" },
      { name: "Claude", icon: "claude.ico" },
      { name: "Ollama" },
      { name: "Hermes" },
      { name: "OpenClaw" },
      { name: "WorkBuddy" },
      { name: "NotebookLM", icon: "notebooklm.ico" },
      { name: "LangChain", icon: "langchain.ico" },
      { name: "GitHub Copilot", icon: "github.ico" },
      { name: "Replit" },
      { name: "ElevenLabs", icon: "elevenlabs.ico" },
      { name: "Fish Audio", icon: "fishaudio.ico" },
    ],
  },
  {
    key: "ads",
    items: [
      { name: "AppLovin", icon: "applovin.ico" },
      { name: "AdMob", icon: "admob.ico" },
      { name: "Meta Ads", icon: "meta.ico" },
      { name: "Unity Ads", icon: "unity.ico" },
      { name: "Mintegral", icon: "mintegral.ico" },
    ],
  },
  {
    key: "data",
    items: [
      { name: "Sensor Tower", icon: "sensortower.ico" },
      { name: "Diandian Data", icon: "diandian.ico" },
      { name: "ThinkingData", icon: "thinkingdata.ico" },
      { name: "Tableau", icon: "tableau.ico" },
      { name: "Power BI" },
    ],
  },
  {
    key: "pm",
    items: [
      { name: "Jira", icon: "atlassian.ico" },
      { name: "Notion" },
      { name: "HubSpot", icon: "hubspot.ico" },
      { name: "Microsoft Teams", icon: "microsoft.ico" },
      { name: "Lark", icon: "lark.ico" },
      { name: "DingTalk", icon: "dingtalk.ico" },
      { name: "Confluence", icon: "atlassian.ico" },
      { name: "Obsidian", icon: "obsidian.ico" },
    ],
  },
  {
    key: "testing",
    items: [{ name: "Postman", icon: "postman.ico" }],
  },
  {
    key: "trading",
    items: [
      { name: "TradingView", icon: "tradingview.ico" },
      { name: "MetaTrader 4", icon: "metatrader4.ico" },
      { name: "Seeking Alpha", icon: "seekingalpha.ico" },
      { name: "Binance" },
      { name: "Coinbase", icon: "coinbase.ico" },
      { name: "Bybit", icon: "bybit.ico" },
      { name: "OKX", icon: "okx.ico" },
      { name: "Uniswap", icon: "uniswap.ico" },
    ],
  },
];
