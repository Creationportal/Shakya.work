/**
 * CV data — mapped from /Users/shakya/Desktop/NXXT/Master_CV.docx
 * (Shakya Pranamya / 唐仲禹 — bilingual EN/中文).
 *
 * The References section is preserved EXACTLY from the old CV
 * (SHAKYA CV 4.1.pdf) — same names, titles, and contact numbers.
 */

export interface Localized {
  en: string;
  zh: string;
}

export type EduKind = "university" | "course" | "certification";

export interface CvExperience {
  role: Localized;
  company: string;
  place: string;
  period: string;
  blurb: Localized;
  bullets: Localized[];
  logo?: string;
}

export interface CvEducation {
  school: string;
  place: string;
  degree: Localized;
  period: string;
  detail: Localized;
  kind: EduKind;
  logo?: string;
}

export interface CvLanguage {
  name: string;
  level: string;
}

export interface CvProject {
  title: string;
  company: string;
  period: string;
  blurb: Localized;
}

export interface CvCertification {
  name: string;
  issuer: string;
  logo?: string;
}

export interface CvAffiliation {
  name: string;
  nameZh?: string;
  logo: string;
}

export interface CvReference {
  name: string;
  title: string;
  contact: string;
}

export interface CvData {
  name: string;
  nameZh: string;
  title: Localized;
  location: string;
  contacts: {
    site: string;
    address: string;
    emailPrimary: string;
    emailSecondary: string;
    phone: string;
    phoneAlt: string;
    linkedin: string;
    wechat: string;
    bossZhipin: string;
    github: string;
  };
  summary: Localized;
  jobIntent: Localized;
  expertise: string[];
  expertiseZh: string[];
  experience: CvExperience[];
  projects: CvProject[];
  workPermit: string[];
  workPermitZh: string[];
  certifications: CvCertification[];
  education: CvEducation[];
  languages: CvLanguage[];
  chinaMarket: string[];
  chinaMarketZh: string[];
  portfolio: string;
  references: CvReference[];
  affiliations: CvAffiliation[];
}

export const CV_DATA: CvData = {
  name: "Shakya Pranamya",
  nameZh: "唐仲禹",
  title: {
    en: "AI Product Manager · International Markets",
    zh: "项目经理 ｜ 国际市场",
  },
  location: "Beijing, China · Lalitpur, Nepal",
  contacts: {
    site: "shakya.work",
    address: "Hou Sha Yu, Shunyi District, Beijing",
    emailPrimary: "creationpanel@gmail.com",
    emailSecondary: "tangshakya@163.com",
    phone: "+86 16600045527",
    phoneAlt: "+977 9840804857",
    linkedin: "", // empty string = do not show (consistent with /contact)
    wechat: "Shakyain",
    bossZhipin: "Shakya唐仲禹",
    github: "github.com/Creationportal",
  },
  summary: {
    en: "AI Product Manager with 6+ years leading 0-to-1 enterprise AI products, product operations and commercialization across China and global markets. Combines business acumen, bilingual fluency, a PMP mindset and cross-functional delivery — from GTM strategy to launch.",
    zh: "AI 产品经理，拥有 6 年以上 0-1 企业级 AI 产品、产品运营及商业化经验，业务覆盖中国及全球市场。具备商业思维、中英双语能力、PMP 项目管理思维与跨职能交付能力——从 GTM 策略到产品落地。",
  },
  jobIntent: {
    en: "Target role: AI Product Manager / PMO · Location: Beijing · Availability: employed, two-month notice period.",
    zh: "期望职位：AI 产品经理 / 项目管理办公室（PMO）｜期望城市：北京｜到岗时间：在职，2 个月内到岗。",
  },
  expertise: [
    "Agentic AI",
    "Value-Driven Design",
    "Business Acumen",
    "Agile Delivery",
    "Go-To-Market",
    "Digital Transformation",
    "Workflow Automation",
    "AI Solution Design",
    "Stakeholder Management",
    "Client Management",
  ],
  expertiseZh: [
    "智能体 AI",
    "价值驱动",
    "商业敏锐度",
    "敏捷交付",
    "市场进入策略",
    "数字化转型",
    "工作流自动化",
    "AI 解决方案设计",
    "干系人管理",
    "客户关系管理",
  ],
  experience: [
    {
      role: {
        en: "Project Management Office (PMO)",
        zh: "项目管理办公室（PMO）",
      },
      company: "Bairong AI Inc. （百融智能）",
      place: "Chaoyang, Beijing",
      period: "Apr 2025 – Present",
      logo: "/cv/logos/bairong.jpeg",
      blurb: {
        en: "HKEX-listed (6608.HK) enterprise AI leader in AI agents, proprietary BR-LLM, and AI-powered business solutions.",
        zh: "香港联交所上市企业（6608.HK），领先的企业级 AI 公司，专注于 AI 智能体、自研 BR-LLM 及 AI 驱动的企业解决方案。",
      },
      bullets: [
        {
          en: "Led cross-functional teams to design, build and maintain internal EX products: an AI announcement board, resource-collection agents, and a company-wide RAG with human-in-the-loop review.",
          zh: "组建并带领跨职能开发团队，设计、搭建并维护企业内部（EX）产品体系，包括 AI 公告板、资源聚合智能体及公司级“人在回路”资源 RAG 系统。",
        },
        {
          en: "Analyzed the China market and researched GTM entry strategy for intelligent agentic systems; supported WAIC, SFF and other industry events; produced and quality-controlled English-voice materials and reports.",
          zh: "研究中国智能体（Agentic）市场与行业进入 GTM 策略，参与 WAIC、SFF 等大型行业活动；负责公司全球运营相关的英文语音、物料与报告的质量把控与生产。",
        },
      ],
    },
    {
      role: {
        en: "Associate Project Manager (dual role)",
        zh: "副项目经理（双）",
      },
      company: "DYNA.AI",
      place: "Singapore (Remote)",
      period: "—",
      logo: "/cv/logos/dyna-ai.jpeg",
      blurb: {
        en: "Multinational AI-as-a-Service and enterprise-agent company across the US, Japan, HK, SEA, MEA and Latin America.",
        zh: "跨国 AI 即服务及企业级 AI 智能体公司，业务覆盖美国、日本、香港、东南亚、中东及非洲、拉丁美洲。",
      },
      bullets: [
        {
          en: "Managed client operations across 5 Southeast Asia markets (incl. Singapore): regional marketing, front-line resources, weekly syncs, and product adjustments via optimized SOPs and people management.",
          zh: "管理新加坡及东南亚 5 个市场的区域客户运营，统筹区域市场、一线资源与周度同步，通过优化 SOP 与人员管理提升效率。",
        },
        {
          en: "Designed and built the company's first real-time revenue tracker and product catalogue, enabling multi-region performance tracking, product positioning and GTM decisions while cutting routine reporting and approval work by 60%.",
          zh: "设计并搭建公司首个实时营收追踪系统及产品目录，支持多区域绩效追踪与 GTM 决策，将日常报告与审批瓶颈工作量降低 60% 以上。",
        },
        {
          en: "Standardized AI workflows for key partners (Huawei, AIS, FIS, Ejada) and led technical training and strategic coordination across international teams and 6 departments.",
          zh: "为华为、AIS、FIS、Ejada 等关键合作伙伴梳理 AI 业务线并标准化工作流，带领国际团队与 6 个部门的技术培训与战略协同。",
        },
        {
          en: "Advised on local market approach, value proposition and ROI modelling; designed an end-to-end Lark Base POC / Demo system supporting 18 concurrent POCs and 70+ clients, cutting manual work by ~33%.",
          zh: "就本地市场打法、价值主张与 ROI 模型测算提供建议；设计端到端 Lark Base POC/Demo 管理系统，支撑 18 个并发 POC 与 70+ 客户，人工工作量降低约 33%。",
        },
      ],
    },
    {
      role: {
        en: "Commercial Product Manager",
        zh: "商业化产品经理",
      },
      company: "APUS (麒麟合盛网络技术股份有限公司)",
      place: "Chaoyang, Beijing",
      period: "Sep 2024 – Apr 2025",
      logo: "/cv/logos/apus-group.jpeg",
      blurb: {
        en: "Global AI company specializing in AI models, IAP / IAA applications, and products for worldwide markets.",
        zh: "全球 AI 科技公司，专注于 AI 模型、IAP、IAA 应用及全球市场产品。",
      },
      bullets: [
        {
          en: "Applied a market-led approach to drive commercial and user-focused product development; prepared products for the US market and achieved positive ROI. Analyzed Admob, Meta and Unity ad-monetization data via ThinkingData and Tableau.",
          zh: "以市场驱动方式推进商业化与用户侧产品双线建设，筹备美国市场产品并实现正向 ROI；通过 ThinkingData、Tableau 分析 Admob、Meta、Unity 广告变现数据。",
        },
        {
        en: "Guided the prompt-engineering team to calibrate APIs for image recognition, evaluation and result verification, boosting LLM output.",
        zh: "指导提示词团队校准 API，实现图像识别、评估与结果验证，优化大模型效果。",
        },
      ],
    },
    {
      role: {
        en: "LLM Researcher (part-time)",
        zh: "LLM 研究员（兼职）",
      },
      company: "Beihang University — School of Computer Science",
      place: "Haidian, Beijing",
      period: "Nov 2023 – Jun 2024",
      logo: "/cv/logos/beihang-university.jpeg",
      blurb: {
        en: "Researched academic papers on LLM architecture and authored reports; fine-tuned local models and tested them via CLI.",
        zh: "研究大语言模型架构相关论文并撰写报告，参与本地模型微调训练与测试 CLI。",
      },
      bullets: [],
    },
    {
      role: {
        en: "Product Owner",
        zh: "产品负责人",
      },
      company: "F1Soft International Pvt. Ltd",
      place: "Kathmandu, Nepal",
      period: "Jan 2022 – Mar 2023",
      logo: "/cv/logos/f1soft.jpeg",
      blurb: {
        en: "Nepal's largest fintech company, providing digital banking, payments and lending solutions to banks and BFIs.",
        zh: "尼泊尔最大的金融科技公司，为银行及金融机构提供数字银行、支付及贷款解决方案。",
      },
      bullets: [
        {
          en: "Defined the product framework and led a 0-to-1 launch spanning design, strategy and development.",
          zh: "从 0 到 1 主导新产品的框架设计与落地（设计、战略、开发）。",
        },
        {
          en: "Led a 32-member team in market analysis, UX prototyping and testing, achieving a 15% efficiency boost and 12% faster delivery through Agile methodologies.",
          zh: "带领 32 人团队完成市场分析、UX 原型与测试，通过敏捷方法提升效率 15%、交付速度提升 12%。",
        },
      ],
    },
    {
      role: {
        en: "System Analyst / Product Owner",
        zh: "系统分析师 / 产品负责人",
      },
      company: "Treal Tech Sdn. Bhd.",
      place: "Kuala Lumpur, Malaysia",
      period: "Nov 2018 – Jun 2020",
      blurb: {
        en: "Multinational fintech company providing technology-enabled forex trading and customer-management solutions.",
        zh: "跨国金融科技公司，提供科技驱动的外汇交易及客户管理解决方案。",
      },
      bullets: [
        {
          en: "Contributed to upgrading a Forex platform with daily trade volume exceeding USD 1 million, leveraging blockchain expertise to integrate and ship new features live.",
          zh: "参与升级日交易量超 100 万美元的外汇平台，运用区块链集成并上线新功能。",
        },
        {
          en: "Collaborated with multinational teams on up to 3 simultaneous projects; transaction monitoring, security analysis and sales support for Malaysia and China markets.",
          zh: "与跨国团队协作（最多 3 个项目并行），针对马来西亚与中国市场进行交易监控、安全分析与销售支持。",
        },
      ],
    },
    {
      role: {
        en: "Business Development Intern",
        zh: "实习：商务拓展",
      },
      company: "Ying Lv Hui Investment Management Co. Ltd",
      place: "Shanghai, China",
      period: "Jul 2018 – Nov 2018",
      blurb: {
        en: "Investment-management firm — operations and partner coordination internship.",
        zh: "投资管理公司——运营与合作伙伴协调实习。",
      },
      bullets: [],
    },
    {
      role: {
        en: "Product Designer Intern",
        zh: "实习：产品设计师",
      },
      company: "Langzou Technologies",
      place: "Shanghai, China",
      period: "Apr 2018 – Jul 2018",
      blurb: {
        en: "Mobile-app development (e-learning) and WeChat mini-app UI design internship.",
        zh: "移动应用开发（在线教育）与微信小程序 UI 设计实习。",
      },
      bullets: [],
    },
  ],
  projects: [
    {
      title: "Real-Time Revenue Tracker & Product Catalogue",
      company: "DYNA.AI",
      period: "—",
      blurb: {
        en: "Multi-region performance tracking and GTM-decision platform across 6 global branches; routine reporting and approval work cut by 60%+.",
        zh: "搭建覆盖 6 个全球分支机构的多区域绩效追踪及 GTM 决策平台，报告与审批工作量降低 60% 以上。",
      },
    },
    {
      title: "FoneNxt Digital Bank (0→1)",
      company: "F1Soft",
      period: "—",
      blurb: {
        en: "Led 0-to-1 development and launch of Nepal's first neobanking product with a 32-member team.",
        zh: "主导尼泊尔首款新型数字银行（Neobanking）产品从 0 到 1 的开发与落地，带领 32 人团队完成产品交付。",
      },
    },
    {
      title: "US-Market AI Commercial Mobile Apps",
      company: "APUS",
      period: "—",
      blurb: {
        en: "Localized and commercialized consumer AI apps (PicPik OCR Solver, PlantJoy Plant Care) for the US market.",
        zh: "负责 PicPik OCR Solver、PlantJoy Plant Care 等消费级 AI 应用的本地化与商业化，推动产品进入美国市场。",
      },
    },
  ],
  workPermit: [
    "Holds a valid B-category Foreigner Work Permit and Residence Permit — 2-year validity.",
    "Recognized International Professional Qualification (Beijing).",
    "Education verifiable via CHESICC (学信网); social insurance enrolled.",
  ],
  workPermitZh: [
    "持有效 B 类外国人工作许可证及居留许可，有效期 2 年。",
    "持北京市认可的国际专业资格。",
    "学历信息可通过学信网核验；已参加社会保险。",
  ],
  certifications: [
    {
      name: "PMP — Project Management Professional",
      issuer: "PMI",
      logo: "/cv/logos/pmi.jpeg",
    },
    {
      name: "Global Innovative Talents Science Training Program 2024",
      issuer: "NEO Scholar",
      logo: "/cv/logos/neoscholar.jpeg",
    },
    {
      name: "Atlassian Agile Scrum Master",
      issuer: "Atlassian",
      logo: "/cv/logos/atlassian.jpeg",
    },
    { name: "Microsoft AI Apps and Agents Developer Associate (AI-103)", issuer: "Microsoft Certified" },
    {
      name: "IELTS — 8.5 (CEFR C2)",
      issuer: "British Council",
      logo: "/cv/logos/british-council.jpeg",
    },
    {
      name: "HSK 5 — Mandarin Chinese",
      issuer: "Hanban / Confucius Institute",
      logo: "/cv/logos/confucius-institute.jpeg",
    },
  ],
  education: [
    {
      school: "Beihang University",
      place: "Beijing, China",
      degree: {
        en: "MSc, Computer Science and Technology — GPA 3.57",
        zh: "计算机科学与技术 硕士（全日制）— GPA 3.57",
      },
      period: "Jun 2024",
      detail: {
        en: "Outstanding-Student CSC Scholarship. Career break of one year (2022–23).",
        zh: "CSC 中国优秀留学生奖学金。休学 1 年（2022–23）。",
      },
      kind: "university",
      logo: "/cv/logos/beihang-university.jpeg",
    },
    {
      school: "Fudan University — School of Management",
      place: "Shanghai, China",
      degree: {
        en: "Innovative China & Digital Entrepreneurship — Short-Term MBA course",
        zh: "创新中国与数字创业（短期 MBA 课程）",
      },
      period: "Nov 2018",
      detail: { en: "—", zh: "—" },
      kind: "course",
      logo: "/cv/logos/fudan-university.jpeg",
    },
    {
      school: "Bohai University",
      place: "Liaoning, China",
      degree: {
        en: "BSc, Software Engineering — Valedictorian 2019 — GPA 3.85",
        zh: "软件工程 学士（全日制）— 毕业生代表 2019 — GPA 3.85",
      },
      period: "Jan 2019",
      detail: { en: "—", zh: "—" },
      kind: "university",
      logo: "/cv/logos/bohai-university.jpeg",
    },
    {
      school: "GED High School (Remote)",
      place: "District of Columbia, USA",
      degree: {
        en: "High-School Equivalency — Grade A+",
        zh: "高中同等学力 — A+",
      },
      period: "Jun 2014",
      detail: { en: "—", zh: "—" },
      kind: "certification",
      logo: "/cv/logos/ged.jpeg",
    },
  ],
  languages: [
    {
      name: "English",
      level: "Full Professional Fluency · CEFR C2 · IELTS 8.5 · Neutral Accent",
    },
    {
      name: "Chinese (Mandarin)",
      level: "Professional Working Proficiency · HSK 5 equivalent · primary daily working language",
    },
    {
      name: "Nepali",
      level: "Full Working Proficiency",
    },
  ],
  chinaMarket: [
    "China–Global business strategy & market expansion: mainland workplace and cultural fluency, dual-ecosystem technology know-how (Aliyun, Qwen, Codex), cross-border innovation and technology operations.",
  ],
  chinaMarketZh: [
    "中国商业与职场适应力：熟悉中国大陆商业环境，具备本土化沟通、团队架构、工作节奏及跨部门工作流协作经验。",
    "中外技术生态整合：熟练掌握中国企业生态（飞书/钉钉、阿里云、Qwen）及全球技术栈（Git、Tableau、Vercel）。",
    "中外业务与沟通纽带：中英双语，深谙技术创新与全球化出海的跨国团队协同。",
  ],
  portfolio: "shakya.work/projects · github.com/Creationportal · Boss直聘: Shakya唐仲禹",
  // References — preserved EXACTLY from SHAKYA CV 4.1.pdf.
  references: [
    {
      name: "Prof. Dr. Li Bo",
      title: "Professor, College of Computer Science and Engineering, Beihang University, China.",
      contact: "Tel: +86 18510577378",
    },
    {
      name: "Prof. Dr. Zhao Xuhui",
      title: "Director, College of Information Technology, China.",
      contact: "Tel: +86 13941679319",
    },
    {
      name: "Mrs Pan Yi",
      title: "H.O.D, Customer relations, Treal Technologies ltd, Malaysia.",
      contact: "Tel: +86 13122532577",
    },
  ],
  affiliations: [
    { name: "Aptech", logo: "/cv/logos/aptech.jpeg" },
    { name: "UNDP", logo: "/cv/logos/undp.jpeg" },
    { name: "King's College Nepal", logo: "/cv/logos/kings-college-nepal.jpeg" },
    { name: "Rumsan Group", logo: "/cv/logos/rumsan-group.jpeg" },
  ],
};
