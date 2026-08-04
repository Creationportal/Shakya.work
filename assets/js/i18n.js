/* ==========================================================================
   i18n — bilingual EN / 中文 toggle
   Each translatable node carries data-i18n="key"; this swaps its text.
   Preference persists in localStorage('lang').
   ========================================================================== */
(function () {
  "use strict";

  const T = {
    /* Nav */
    "nav.projects":   { en: "Projects",     zh: "项目" },
    "nav.ailab":      { en: "AI Lab",       zh: "AI 实验室" },
    "nav.about":      { en: "About",        zh: "关于" },
    "nav.contact":    { en: "Contact",      zh: "联系" },
    "nav.status":     { en: "OPEN TO COLLABORATION", zh: "开放合作中" },
    "nav.lang.en":    { en: "EN",           zh: "EN" },
    "nav.lang.zh":    { en: "中文",         zh: "中文" },
    "nav.theme":      { en: "Dark",         zh: "深色" },

    /* Footer */
    "footer.projects":  { en: "PROJECTS",   zh: "项目" },
    "footer.ailab":     { en: "AI LAB",     zh: "AI 实验室" },
    "footer.about":     { en: "ABOUT",      zh: "关于" },
    "footer.contact":   { en: "CONTACT",    zh: "联系" },

    /* A11y */
    "a11y.skip":        { en: "Skip to content", zh: "跳到正文" },

    /* 404 */
    "e404.h1":          { en: "This page shipped, but not here.",   zh: "这个页面已发货，但不在这里。" },
    "e404.sub":         { en: "The link may be broken or the page moved. Try one of these instead:", zh: "链接可能已损坏或页面已移动。试试下面这些：" },
    "e404.projects":    { en: "View projects →", zh: "查看项目 →" },

    /* Home hero */
    "home.kicker":  { en: "VOICE · SEARCH · AGENTS",                zh: "语音 · 搜索 · 智能体" },
    "home.h1":      { en: "AI that people actually adopt.",         zh: "让人真正用起来的 AI。" },
    "home.lede":    { en: "Voice, search and agent systems — built to be adopted, not admired.", zh: "语音、搜索与智能体系统 —— 为落地而生，不为炫技。" },
    "home.link.projects": { en: "View projects ↓", zh: "查看项目 ↓" },
    "home.link.contact":  { en: "Let's talk →",    zh: "聊聊 →" },
    "home.orbit.note":    { en: "POINTER-REACTIVE · DRAG TO ORBIT · 24S LOOP", zh: "指针交互 · 拖拽旋转 · 24 秒循环" },
    "home.scroll":  { en: "SCROLL TO EXPLORE ↓", zh: "向下滚动探索 ↓" },

    /* Showcase */
    "show.kicker": { en: "WHAT WE BUILD", zh: "我们所构建的" },
    "show.title":  { en: "Four disciplines, one outcome.", zh: "四大能力，一个结果。" },
    "tile1.word":  { en: "Voice",    zh: "语音" },
    "tile1.tag":   { en: "VOICE AGENTS · ASR/LLM/TTS",          zh: "语音坐席 · ASR/LLM/TTS" },
    "tile1.cta":   { en: "Try it →", zh: "试一试 →" },
    "tile1.live":  { en: "LIVE WAVEFORM · TAP TO SPEAK",        zh: "实时波形 · 点击说话" },
    "tile2.word":  { en: "Search",   zh: "搜索" },
    "tile2.tag":   { en: "ENTERPRISE SEARCH · RAG",             zh: "企业搜索 · RAG" },
    "tile2.cta":   { en: "Try it →", zh: "试一试 →" },
    "tile2.hint":  { en: "TYPE TO SEARCH · CITED ANSWERS",      zh: "输入搜索 · 带引用的答案" },
    "tile2.ph":    { en: "Ask across contracts, SOPs, tickets…", zh: "搜索合同、SOP、工单……" },
    "tile2.count": { en: "1,247 RESULTS · 3 SHOWN",             zh: "共 1,247 条结果 · 显示 3 条" },
    "tile3.word":  { en: "Agents",  zh: "智能体" },
    "tile3.tag":   { en: "AI AGENTS · CALLING · COLLECTIONS",   zh: "AI 智能体 · 外呼 · 催收" },
    "tile3.cta":   { en: "Try it →", zh: "试一试 →" },
    "tile3.hint":  { en: "AGENT NETWORK · 5 NODES · 1 ACTIVE",  zh: "智能体网络 · 5 个节点 · 1 个活跃" },
    "tile4.word":  { en: "Workflow", zh: "工作流" },
    "tile4.tag":   { en: "WORKFLOW AUTOMATION · AGENT CHAINS",  zh: "工作流自动化 · 智能体链" },
    "tile4.cta":   { en: "Try it →", zh: "试一试 →" },
    "tile4.hint":  { en: "3-STEP PIPELINE · AGENT CHAIN",       zh: "三步流水线 · 智能体链" },
    "tile4.flow":  { en: "RUNS IN ORDER · 380MS LATENCY",       zh: "按序执行 · 延迟 380 毫秒" },
    "step.label":  { en: "Step",     zh: "步骤" },
    "pipe.in":     { en: "Input",    zh: "输入" },
    "pipe.agent":  { en: "Agent",    zh: "智能体" },
    "pipe.out":    { en: "Output",   zh: "输出" },

    /* Tile 2 interactive search */
    "tile2.r1":    { en: "Q2 renewal terms — Contract #1183", zh: "Q2 续约条款 — 合同 #1183" },
    "tile2.r2":    { en: "Onboarding SOP, latest revision",  zh: "入职 SOP，最新修订版" },
    "tile2.r3":    { en: "Ticket #4421 — invoice dispute",   zh: "工单 #4421 — 发票争议" },

    /* Explorer */
    "exp.kicker":  { en: "INTERACTIVE — TRY IT",        zh: "互动体验" },
    "exp.title":   { en: "Pick a discipline.",          zh: "选择一个方向。" },
    "exp.live":    { en: "LIVE · SYNTHETIC DATA",       zh: "实时 · 合成数据" },
    "exp.title.p": { en: "Voice agent — live",          zh: "语音智能体 · 实时" },
    "exp.trans":   { en: "“您好，请问有什么可以帮您？” → intent detected · routing to billing…", zh: "“您好，请问有什么可以帮您？” → 意图识别 · 正在转接账务……" },
    "exp.m1":      { en: "380MS LATENCY",   zh: "延迟 380 毫秒" },
    "exp.m2":      { en: "40+ DEPLOYMENTS", zh: "40+ 部署" },
    "exp.note":    { en: "TAP A TAB TO SWAP THE PANEL · WAVEFORM REACTS LIVE", zh: "点击标签切换面板 · 波形实时响应" },

    /* CTA */
    "cta.kicker":  { en: "COLLABORATE",        zh: "合作" },
    "cta.title":   { en: "Let's build what people actually use.", zh: "一起打造大家真正用起来的产品。" },
    "cta.contact": { en: "Go to Contact →",   zh: "前往联系 →" },
    "cta.email":   { en: "creationpanel@gmail.com", zh: "creationpanel@gmail.com" },

    /* Projects page */
    "proj.kicker": { en: "PROJECTS — CATALOGUE", zh: "项目 — 目录" },
    "proj.h1":     { en: "AI projects, shipped and scaled.", zh: "已落地、已规模化的人工智能项目。" },
    "proj.lede":   { en: "A catalogue of production AI systems across voice, search and agent automation — each one built to be adopted, not admired.", zh: "覆盖语音、搜索与智能体自动化的生产级 AI 系统目录 —— 每一个都为落地而生，不为炫技。" },
    "proj.c1.t":   { en: "Voice GPT",     zh: "Voice GPT" },
    "proj.c1.d":   { en: "Enterprise voice agents that run inbound service lines end-to-end — intent, escalation and CRM write-back.", zh: "企业级语音坐席平台 —— 意图识别、人工升级、CRM 回写，端到端处理呼入。" },
    "proj.c2.t":   { en: "AI Calling",    zh: "AI 外呼" },
    "proj.c2.d":   { en: "Outbound voice agents for sales qualification and renewals — bilingual, CRM-native, compliant.", zh: "面向销售与续费的外呼语音智能体 —— 双语、CRM 原生、合规话术。" },
    "proj.c3.t":   { en: "Debt Collection AI", zh: "催收 AI" },
    "proj.c3.d":   { en: "Compliant recovery agents with fully scripted, auditable conversations at scale.", zh: "合规催收智能体 —— 全程话术可审计、规模化外呼。" },
    "proj.c4.t":   { en: "Enterprise Search", zh: "企业搜索" },
    "proj.c4.d":   { en: "RAG over corporate knowledge — answers with citations you can audit across contracts and tickets.", zh: "基于企业知识库的 RAG —— 答案带引用，可审计合同与工单。" },
    "proj.c5.t":   { en: "Sales AI", zh: "销售 AI" },
    "proj.c5.d":   { en: "Pipeline copilot for B2B teams — research, outreach and follow-up on autopilot.", zh: "面向 B2B 团队的销售副驾 —— 调研、外联、跟进全自动。" },
    "proj.c6.t":   { en: "Workflow Automation", zh: "工作流自动化" },
    "proj.c6.d":   { en: "Natural-language requests compiled into executable agent chains that run in order.", zh: "自然语言请求编译为可执行的智能体链，按序运行。" },
    "proj.view":   { en: "View case →", zh: "查看案例 →" },

    /* AI Lab */
    "lab.kicker":  { en: "AI LAB — INTERACTIVE DEMOS",   zh: "AI 实验室 — 交互演示" },
    "lab.h1":      { en: "Try the systems, not just the story.", zh: "先上手，再决策。" },
    "lab.lede":    { en: "Three working demos taken from production systems — voice, workflow and search. Everything here runs on synthetic enterprise data; the behavior is real.", zh: "三个来自生产系统的工作演示 —— 语音、工作流与搜索。此处均运行于合成企业数据，行为真实。" },
    "lab.demo.label": { en: "DEMO 01 — VOICE AGENT PLAYGROUND", zh: "演示 01 — 语音坐席体验场" },
    "lab.a1":      { en: "Hello, this is the smart customer service at Shunfeng Logistics. How can I help you?", zh: "您好，这里是顺风物流的智能客服，请问有什么可以帮您？" },
    "lab.u1":      { en: "Can you check my invoice from March?", zh: "能查一下我三月的发票吗？" },
    "lab.a2":      { en: "Found it: March invoice #2043 was settled on March 14; a copy has been sent to your email.", zh: "已查到：3 月发票 #2043 已于 3 月 14 日结算，副本已发送至您的邮箱。" },
    "lab.mic":     { en: "TAP TO SPEAK",   zh: "点击说话" },
    "lab.latency": { en: "LATENCY 380MS · ASR → LLM → TTS", zh: "延迟 380 毫秒 · ASR → LLM → TTS" },
    "lab.d2.k":    { en: "DEMO 02",        zh: "演示 02" },
    "lab.d2.t":    { en: "Prompt → Workflow", zh: "提示词转工作流" },
    "lab.d2.d":    { en: "A natural-language request compiled into an executable agent chain — watch each step run in order.", zh: "自然语言请求编译为可执行的智能体链，逐步按序运行。" },
    "lab.d3.k":    { en: "DEMO 03",        zh: "演示 03" },
    "lab.d3.t":    { en: "Enterprise Search", zh: "企业搜索" },
    "lab.d3.d":    { en: "Ask a question across contracts, SOPs and tickets — answers arrive with citations you can audit.", zh: "跨合同、SOP 与工单提问，答案带可审计的引用。" },
    "lab.dep.k":   { en: "02 — IN PRODUCTION", zh: "02 — 生产环境" },
    "lab.dep.t":   { en: "Running in production",   zh: "已在生产环境运行" },
    "lab.note":    { en: "ALL DEMOS RUN ON SYNTHETIC ENTERPRISE DATA — NO CLIENT INFORMATION", zh: "所有演示均运行于合成企业数据 · 无客户信息" },

    /* Case */
    "case.kicker": { en: "CASE — 01 · VOICE AI · 2026",  zh: "案例 — 01 · 语音 AI · 2026" },
    "case.meta":   { en: "ROLE: PRODUCT LEAD · SCOPE: 0→1 → SCALE · STACK: ASR + LLM + TTS + CRM · STATUS: IN PRODUCTION", zh: "角色：产品负责人 · 范围：0→1 至规模化 · 技术栈：ASR + LLM + TTS + CRM · 状态：生产运行中" },
    "case.ov.l":   { en: "OVERVIEW",  zh: "背景" },
    "case.ov.r":   { en: "OUTCOME",   zh: "成果" },
    "case.app.k":  { en: "03 — APPROACH",     zh: "03 — 方法论" },
    "case.app.t":  { en: "How we shipped it", zh: "我们如何交付" },
    "case.next.k": { en: "NEXT CASE",         zh: "下一案例" },
    "case.next.t": { en: "AI Calling",        zh: "AI 外呼" },

    /* CV access */
    "cv.label":     { en: "CV ACCESS",        zh: "简历访问" },
    "cv.hint":      { en: "Enter the access code to view a private document.", zh: "输入访问码查看私人文档。" },
    "cv.placeholder": { en: "Enter code…",    zh: "输入访问码……" },
    "cv.submit":    { en: "ACCESS",           zh: "访问" },
    "cv.wrong":     { en: "Incorrect code. Try again.", zh: "代码错误，请重试。" },

    /* Contact */
    "contact.kicker": { en: "CONTACT — LET'S TALK", zh: "联系 — 聊聊" },
    "contact.h1":     { en: "Let's build what people actually use.", zh: "一起打造大家真正用起来的产品。" },
    "contact.form.h": { en: "Or send a note",       zh: "或留言给我" },
    "contact.send":   { en: "SEND MESSAGE",         zh: "发送留言" },
    "contact.thanks": { en: "✓ MESSAGE SENT — I'LL GET BACK TO YOU", zh: "✓ 留言已发送 — 我会尽快回复" },
    "contact.ph.name":  { en: "Your name",   zh: "你的姓名" },
    "contact.ph.email": { en: "Your email",  zh: "你的邮箱" },
    "contact.ph.msg":   { en: "Tell me about the problem you're solving", zh: "说说你想解决的问题" },

    /* Changelog */
    "chg.kicker": { en: "CHANGELOG — TRANSPARENT BY DEFAULT", zh: "更新日志 — 默认透明" },
    "chg.h1":     { en: "Every change, on record.",  zh: "每一次改动，皆有据可查。" },
  };

  const STORAGE = "shakya-lang";

  function apply(lang) {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const t = T[key];
      if (t && t[lang]) el.textContent = t[lang];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const key = el.getAttribute("data-i18n-ph");
      const t = T[key];
      if (t && t[lang]) el.setAttribute("placeholder", t[lang]);
    });
    document.querySelectorAll("[data-lang-toggle]").forEach((tg) => {
      const en = tg.querySelector(".en");
      const zh = tg.querySelector(".zh");
      if (en && zh) {
        en.classList.toggle("on", lang === "en");
        en.classList.toggle("off", lang !== "en");
        zh.classList.toggle("on", lang === "zh");
        zh.classList.toggle("off", lang !== "zh");
      }
    });
    localStorage.setItem(STORAGE, lang);
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  function current() {
    const stored = localStorage.getItem(STORAGE);
    if (stored) return stored;
    return location.pathname.startsWith("/zh/") ? "zh" : "en";
  }

  function toggle() {
    apply(current() === "en" ? "zh" : "en");
  }

  document.addEventListener("DOMContentLoaded", () => {
    apply(current());
    document.querySelectorAll("[data-lang-toggle]").forEach((tg) => {
      tg.addEventListener("click", toggle);
    });
  });

  window.i18n = { apply, current, toggle, T };
})();