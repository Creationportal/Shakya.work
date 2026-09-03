/**
 * Site settings — single schema for everything a non-developer can adjust
 * from the /settings backend page. Values live in .data/settings.json
 * (gitignored) and default to DEFAULT_SETTINGS below.
 */

export type ThemeFont = "sans" | "serif" | "mono";
export type RadiusScale = "sm" | "md" | "lg" | "xl" | "full";
export type VoiceLang = "en" | "zh" | "yue" | "es" | "ne";

export interface LocalizedText {
  en: string;
  zh: string;
}

export interface SiteSettings {
  site: {
    name: string; // header brand (en)
    nameZh: string; // header brand (zh) e.g. "Shakya 唐仲禹"
    tagline: string;
    taglineZh: string;
    metaTitle: string;
    metaDescription: string;
  };
  design: {
    accent: string; // light-mode accent
    accentInk: string; // light-mode accent (stronger / hover)
    accentDark: string; // dark-mode accent
    accentInkDark: string;
    glowOpacity: number; // 0..1 orb/section glow strength
    radius: RadiusScale; // base corner radius
    font: ThemeFont; // base font stack
    darkModeDefault: boolean; // when no saved preference
    showScrollHint: boolean; // home hero scroll hint
  };
  home: {
    heroTitle: LocalizedText;
    heroBody: LocalizedText;
    summaryTitle: LocalizedText;
    orbLabel: LocalizedText;
  };
  cv: {
    pdfPath: string; // public URL of the CV PDF
    pdfFilename: string; // download filename
  };
  voiceGuide: {
    defaultLang: VoiceLang;
    defaultNewsVoice: string; // matches manifest newsVoiceTypes id
    speechRate: number; // 0.5 .. 2.0
    enableNews: boolean;
  };
  contact: {
    emailPrimary: string;
    emailSecondary: string;
    emailAliases: string[]; // extra public contact emails shown on /contact
    linkedin: string; // full URL
    phone: string;
    wechat: string; // empty string = "on request"
    github: string; // empty string = "on request"
  };
  banner: {
    enabled: boolean;
    text: LocalizedText;
  };
  robots: {
    allowAll: boolean; // whether robots.txt allows full crawling
  };
}

export const DEFAULT_SETTINGS: SiteSettings = {
  site: {
    name: "shakya",
    nameZh: "Shakya 唐仲禹",
    tagline: "Fintech · AI · China",
    taglineZh: "金融科技 · 人工智能 · 中国",
    metaTitle: "Shakya.work",
    metaDescription:
      "Shakya — Fintech & AI product management, technical and ecosystem expertise with China know-how. AI projects you can use, an interactive CV, and a private portal for recruiters and clients.",
  },
  design: {
    accent: "#7c3aed",
    accentInk: "#6d28d9",
    accentDark: "#a78bfa",
    accentInkDark: "#8b5cf6",
    glowOpacity: 0.22,
    radius: "lg",
    font: "sans",
    darkModeDefault: false,
    showScrollHint: true,
  },
  home: {
    heroTitle: {
      en: "Product portfolio — fintech, AI agents, search & automation.",
      zh: "产品作品集 — 金融科技、AI 智能体、搜索与自动化。",
    },
    heroBody: {
      en: "Real-world systems across fintech, enterprise search and agent workflows — built for production, designed for people.",
      zh: "横跨金融科技、企业搜索与智能体工作流的实战系统 — 为生产环境而构建，为真实用户而设计。",
    },
    summaryTitle: {
      en: "Fintech & AI product management, with China know-how.",
      zh: "金融科技与 AI 产品管理，兼具中国经验。",
    },
    orbLabel: {
      en: "POINTER-REACTIVE · DRAG TO ORBIT",
      zh: "跟随指针 · 拖拽旋转",
    },
  },
  cv: {
    pdfPath: "/cv/shakya-cv.pdf",
    pdfFilename: "Shakya-Pranamya-CV.pdf",
  },
  voiceGuide: {
    defaultLang: "en",
    defaultNewsVoice: "default",
    speechRate: 1.02,
    enableNews: true,
  },
  robots: {
    allowAll: true,
  },
  contact: {
    emailPrimary: "creationpanel@gmail.com",
    emailSecondary: "tangshakya@163.com",
    emailAliases: ["shakya@dyna.ai", "shakya@agent.qq.com"],
    linkedin: "https://www.linkedin.com/in/shakya-pranamya",
    phone: "+977 9840804857",
    wechat: "",
    github: "",
  },
  banner: {
    enabled: false,
    text: {
      en: "",
      zh: "",
    },
  },
};
