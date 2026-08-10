Object.assign(window,{React,ReactDOM,PropTypes:void 0});
const {createElement:h,useState,useEffect,useRef,useCallback,createContext,useContext} = React;

const BASE_T = {
  nav:{projects:{en:"Projects",zh:"项目"},ailab:{en:"AI Lab",zh:"AI实验室"},agents:{en:"Agents",zh:"智能体"},about:{en:"About",zh:"关于"},contact:{en:"Contact",zh:"联系"}},
  status:{en:"OPEN TO COLLABORATION",zh:"开放合作中"},
  home:{kicker:{en:"VOICE \u00B7 SEARCH \u00B7 AGENTS",zh:"语音 \u00B7 搜索 \u00B7 智能体"},h1:{en:"AI portfolio \u2014 voice, agents, search & automation.",zh:"AI 作品集 \u2014 语音、智能体、搜索与自动化。"},lede:{en:"AI systems built for production \u2014 voice agents, enterprise search, agent networks and workflow automation.",zh:"为生产环境构建的 AI 系统 \u2014 语音坐席、企业搜索、智能体网络与工作流自动化。"},view:{en:"View projects \u2193",zh:"查看项目 \u2193"},talk:{en:"Let's talk \u2192",zh:"聊聊 \u2192"}},
  footer:{projects:{en:"PROJECTS",zh:"项目"},ailab:{en:"AI LAB",zh:"AI实验室"},agents:{en:"AGENTS",zh:"智能体"},about:{en:"ABOUT",zh:"关于"},contact:{en:"CONTACT",zh:"联系"}},
  proj:{kicker:{en:"PROJECTS \u2014 CATALOGUE",zh:"项目 \u2014 目录"},h1:{en:"AI projects, shipped and scaled.",zh:"已落地、已规模化的 AI 项目。"},lede:{en:"A catalogue of production AI systems across voice, search and agent automation.",zh:"覆盖语音、搜索与智能体自动化的生产级 AI 系统目录。"}},
  lab:{kicker:{en:"AI LAB \u2014 INTERACTIVE DEMOS",zh:"AI 实验室 \u2014 交互演示"},h1:{en:"Try the systems, not just the story.",zh:"先上手，再决策。"},lede:{en:"Three working demos taken from production systems \u2014 voice, workflow and search.",zh:"三个来自生产系统的工作演示 \u2014 语音、工作流与搜索。"}},
  agents:{kicker:{en:"AGENT DASHBOARD",zh:"智能体面板"},h1:{en:"Agent network dashboard.",zh:"智能体网络面板。"},lede:{en:"Monitor, manage and deploy AI agents across calling, collections and operations.",zh:"监控、管理和部署跨外呼、催收与运营的 AI 智能体。"}},
  about:{kicker:{en:"ABOUT \u2014 PRANAMYYA SHAKYA",zh:"关于 \u2014 Pranamyya Shakya"},h1:{en:"Product & AI Transformation Leader.",zh:"产品与 AI 转型负责人。"}},
  contact:{kicker:{en:"CONTACT \u2014 LET'S TALK",zh:"联系 \u2014 聊聊"},h1:{en:"Let's build what people actually use.",zh:"一起打造大家真正用起来的产品。"}},
  cv:{kicker:{en:"CV \u2014 CONFIDENTIAL",zh:"简历 \u2014 保密"},h1:{en:"Curriculum Vitae",zh:"简历"}},
  cta:{kicker:{en:"COLLABORATE",zh:"合作"},title:{en:"Let's build what people actually use.",zh:"一起打造大家真正用起来的产品。"},go:{en:"Go to Contact \u2192",zh:"前往联系 \u2192"}},
  lab_demo:{en:"DEMO 01 \u2014 VOICE AGENT PLAYGROUND",zh:"演示 01 \u2014 语音坐席体验场"},
  lab_a1:{en:"Hello, this is the smart customer service at Shunfeng Logistics. How can I help you?",zh:"您好，这里是顺风物流的智能客服，请问有什么可以帮您？"},
  lab_u1:{en:"Can you check my invoice from March?",zh:"能查一下我三月的发票吗？"},
  lab_a2:{en:"Found it: March invoice #2043 was settled on March 14; a copy has been sent to your email.",zh:"已查到：3 月发票 #2043 已于 3 月 14 日结算，副本已发送至您的邮箱。"},
  lab_mic:{en:"TAP TO SPEAK",zh:"点击说话"},
  lab_latency:{en:"LATENCY 380MS \u00B7 ASR \u2192 LLM \u2192 TTS",zh:"延迟 380 毫秒 \u00B7 ASR \u2192 LLM \u2192 TTS"},
  lab_d2k:{en:"DEMO 02",zh:"演示 02"},lab_d2t:{en:"Prompt \u2192 Workflow",zh:"提示词转工作流"},
  lab_d2d:{en:"A natural-language request compiled into an executable agent chain.",zh:"自然语言请求编译为可执行的智能体链。"},
  lab_d3k:{en:"DEMO 03",zh:"演示 03"},lab_d3t:{en:"Enterprise Search",zh:"企业搜索"},
  lab_d3d:{en:"Ask a question across contracts, SOPs and tickets \u2014 answers with citations.",zh:"跨合同、SOP 与工单提问，答案带可审计的引用。"},
  lab_depk:{en:"IN PRODUCTION",zh:"生产环境"},lab_dept:{en:"Running in production",zh:"已在生产环境运行"},
  contact_form:{en:"Or send a note",zh:"或留言给我"},
  contact_send:{en:"SEND MESSAGE",zh:"发送留言"},
  contact_thanks:{en:"\u2713 MESSAGE SENT \u2014 I'LL GET BACK TO YOU",zh:"\u2713 留言已发送 \u2014 我会尽快回复"},
  contact_ph_name:{en:"Your name",zh:"你的姓名"},
  contact_ph_email:{en:"Your email",zh:"你的邮箱"},
  contact_ph_msg:{en:"Tell me about the problem you're solving",zh:"说说你想解决的问题"},
  login_btn:{en:"LOGIN",zh:"登录"},
  orbit_note:{en:"POINTER-REACTIVE \u00B7 DRAG TO ORBIT",zh:"指针交互 \u00B7 拖拽旋转"},
  project_cards:[
    {kicker:{en:"VOICE AI \u00B7 2026",zh:"语音 AI \u00B7 2026"},title:{en:"Voice GPT",zh:"Voice GPT"},desc:{en:"Enterprise voice agents that run inbound service lines end-to-end.",zh:"企业级语音坐席平台，端到端处理呼入服务。"}},
    {kicker:{en:"CONVERSATIONAL AI \u00B7 2025",zh:"对话 AI \u00B7 2025"},title:{en:"AI Calling",zh:"AI 外呼"},desc:{en:"Outbound voice agents for sales qualification and renewals.",zh:"面向销售与续费的外呼语音智能体。"}},
    {kicker:{en:"FINTECH \u00B7 AGENTS \u00B7 2025",zh:"金融科技 \u00B7 智能体 \u00B7 2025"},title:{en:"Debt Collection AI",zh:"催收 AI"},desc:{en:"Compliant recovery agents with auditable conversations at scale.",zh:"合规催收智能体，全程话术可审计。"}},
    {kicker:{en:"KNOWLEDGE \u00B7 RAG \u00B7 2024",zh:"知识库 \u00B7 RAG \u00B7 2024"},title:{en:"Enterprise Search",zh:"企业搜索"},desc:{en:"RAG over corporate knowledge \u2014 answers with citations.",zh:"基于企业知识库的 RAG \u2014 答案带引用。"}},
    {kicker:{en:"SALES AI \u00B7 2024",zh:"销售 AI \u00B7 2024"},title:{en:"Sales AI",zh:"销售 AI"},desc:{en:"Pipeline copilot for B2B teams \u2014 research, outreach and follow-up.",zh:"面向 B2B 团队的销售副驾。"}},
    {kicker:{en:"WORKFLOW \u00B7 2024",zh:"工作流 \u00B7 2024"},title:{en:"Workflow Automation",zh:"工作流自动化"},desc:{en:"Natural-language requests compiled into executable agent chains.",zh:"自然语言请求编译为可执行的智能体链。"}},
  ],
  lab_deployments:[
    {year:"2026",title:{en:"Voice GPT \u2014 tier-1 bank service lines",zh:"Voice GPT \u2014 一级银行服务线"},outcome:{en:"62% COST \u2193",zh:"成本降低 62%"}},
    {year:"2025",title:{en:"AI Calling \u2014 logistics renewals program",zh:"AI 外呼 \u2014 物流续费项目"},outcome:{en:"1M+ CALLS / YR",zh:"年通话量 100 万+"}},
    {year:"2025",title:{en:"Debt Collection AI \u2014 consumer finance",zh:"催收 AI \u2014 消费金融"},outcome:{en:"3.2\u00d7 RECOVERY",zh:"回收率 3.2 倍"}},
    {year:"2024",title:{en:"Enterprise Search \u2014 manufacturing group",zh:"企业搜索 \u2014 制造集团"},outcome:{en:"12 TEAMS ONBOARDED",zh:"12 个团队已接入"}},
  ],
  about_body1:{en:"I'm a Product & AI Transformation Leader working at the intersection of voice, search and autonomous agents. My focus is narrow and practical: take AI from impressive demo to production system that real teams use every day \u2014 in finance, logistics, healthcare and enterprise operations.",zh:"我是一名产品与 AI 转型负责人，专注于语音、搜索与自主智能体的交叉领域。我的目标狭窄而务实：将 AI 从令人印象深刻的演示转变为真实团队每天使用的生产系统。"},
  about_body2:{en:"Across the ventures I lead, the pattern is consistent. Voice agents that handle live inbound at sub-400ms latency. Enterprise search that answers from contracts, SOPs and tickets with citations. Agent networks that route work across calling, collections and operations. The through-line isn't the model \u2014 it's adoption.",zh:"在我领导的各个项目中，模式是一致的。延迟低于 400 毫秒的语音坐席处理实时呼入。从合同、SOP 和工单中检索并带引用回答的企业搜索。在外呼、催收和运营之间路由工作的智能体网络。主线不是模型 \u2014 而是落地。"},
  about_principle:{en:"Shipped beats impressive.",zh:"交付胜过惊艳。"},
  about_principle_body:{en:"A system finished and deployed \u2014 imperfect but real \u2014 always outlasts the one endlessly polished in the lab.",zh:"一个完成并部署的系统 \u2014 不完美但真实 \u2014 总是比在实验室里不断打磨的版本更持久。"},
  about_disciplines:{en:"Four disciplines, one outcome.",zh:"四大能力，一个结果。"},
  about_focus:[
    {tag:{en:"VOICE AGENTS",zh:"语音坐席"},desc:{en:"ASR, LLM and TTS wired into live inbound and outbound calling.",zh:"ASR、LLM 和 TTS 集成到实时呼入与呼出通话中。"}},
    {tag:{en:"ENTERPRISE SEARCH",zh:"企业搜索"},desc:{en:"RAG over contracts, SOPs and tickets \u2014 answers with citations.",zh:"基于合同、SOP 和工单的 RAG \u2014 带引用的答案。"}},
    {tag:{en:"AI AGENTS",zh:"AI 智能体"},desc:{en:"Calling, collections and operations run by agent networks.",zh:"由智能体网络运行的外呼、催收与运营。"}},
    {tag:{en:"WORKFLOW",zh:"工作流"},desc:{en:"Agent chains that turn a policy into an automated pipeline.",zh:"将政策转化为自动化流水线的智能体链。"}},
  ],
  cv_summary:{en:"Product and project leader with experience taking AI systems from pitch deck to production \u2014 across voice, search and agent automation. Track record of shipping enterprise-grade conversational systems, RAG platforms, and workflow automation that teams actually adopt.",zh:"产品与项目负责人，拥有将 AI 系统从提案到生产的经验 \u2014 涵盖语音、搜索与智能体自动化。交付企业级对话系统、RAG 平台和工作流自动化的实战记录。"},
  cv_experience:[
    {title:{en:"Product Lead \u2014 Voice AI Platform",zh:"产品负责人 \u2014 语音 AI 平台"},date:{en:"2024 \u2013 Present",zh:"2024 至今"},desc:{en:"Led 0\u21921 development of enterprise voice agent platform. Designed and shipped ASR/LLM/TTS pipelines handling inbound service, outbound sales, and collections across finance, logistics, and healthcare verticals. Scaled from pilot to 40+ production deployments.",zh:"领导企业级语音坐席平台从 0 到 1 的开发。设计并交付了处理呼入服务、外呼销售和催收的 ASR/LLM/TTS 流水线，覆盖金融、物流和医疗行业。从试点扩展到 40+ 生产部署。"}},
    {title:{en:"AI Product Manager \u2014 Enterprise Search & RAG",zh:"AI 产品经理 \u2014 企业搜索与 RAG"},date:{en:"2023 \u2013 2024",zh:"2023 \u2013 2024"},desc:{en:"Built enterprise search platform on RAG architecture with cited answers across contracts, SOPs, and ticket systems. Defined roadmap, managed stakeholder alignment across ops and engineering, drove adoption to 12 teams.",zh:"基于 RAG 架构构建企业搜索平台，跨合同、SOP 和工单系统提供带引用的答案。定义路线图，协调运营和工程团队，推动 12 个团队采用。"}},
    {title:{en:"Product Manager \u2014 Workflow Automation",zh:"产品经理 \u2014 工作流自动化"},date:{en:"2022 \u2013 2023",zh:"2022 \u2013 2023"},desc:{en:"Designed natural-language-to-workflow compiler that translated user requests into executable agent chains. Shipped compliance-aware automation for fintech debt collection, achieving 3.2\u00d7 recovery rate improvement.",zh:"设计自然语言到工作流的编译器，将用户请求转化为可执行的智能体链。为金融科技催收交付合规感知自动化，实现 3.2 倍回收率提升。"}},
  ],
  cv_certs:[{en:"PMP (Project Management Professional) \u00b7 2024",zh:"PMP（项目管理专业人士）\u00b7 2024"}],
  cv_domains:[{en:"Voice AI",zh:"语音 AI"},{en:"RAG & Search",zh:"RAG 与搜索"},{en:"Agent Automation",zh:"智能体自动化"},{en:"Product Strategy",zh:"产品策略"},{en:"Enterprise GTM",zh:"企业市场推广"}],
  cv_lang:{en:"English (Fluent) \\u00b7 Chinese / \\u4e2d\\u6587 (Native)",zh:"\\u82f1\\u8bed\\uff08\\u6d41\\u5229\\uff09\\u00b7 \\u4e2d\\u6587\\uff08\\u6bcd\\u8bed\\uff09"},
  sim_back:{en:"\\u2190 BACK TO AGENTS",zh:"\\u2190 \\u8fd4\\u56de\\u667a\\u80fd\\u4f53\\u9762\\u677f"},
  sim_kicker:{en:"SIMULATION AGENT",zh:"\\u6a21\\u62df\\u667a\\u80fd\\u4f53"},
  sim_h1:{en:"Simulation Agent Dashboard",zh:"\\u6a21\\u62df\\u667a\\u80fd\\u4f53\\u9762\\u677f"},
  sim_lede:{en:"Test scenario execution and monitoring for voice agent pipelines.",zh:"\\u8bed\\u97f3\\u5ea7\\u5e2d\\u6d41\\u6c34\\u7ebf\\u7684\\u6d4b\\u8bd5\\u573a\\u666f\\u6267\\u884c\\u4e0e\\u76d1\\u63a7\\u3002"},
  sim_scenario:{en:"CURRENT SCENARIO",zh:"\\u5f53\\u524d\\u573a\\u666f"},
  sim_scenario_name:{en:"Test Scenario #42 \\u2014 Inbound Call Routing",zh:"\\u6d4b\\u8bd5\\u573a\\u666f #42 \\u2014 \\u547c\\u5165\\u8def\\u7531"},
  sim_controls:{en:"CONTROLS",zh:"\\u63a7\\u5236"},
  sim_console:{en:"SIMULATION CONSOLE",zh:"\\u6a21\\u62df\\u63a7\\u5236\\u53f0"},
  sim_log:{en:"ACTIVITY LOG",zh:"\\u6d3b\\u52a8\\u65e5\\u5fd7"},
  sim_run:{en:"RUN SCENARIO",zh:"\\u8fd0\\u884c\\u573a\\u666f"},
  sim_stop:{en:"STOP",zh:"\\u505c\\u6b62"},
  sim_idle:{en:"Idle \\u2014 ready to run",zh:"\\u7a7a\\u95f2 \\u2014 \\u51c6\\u5907\\u8fd0\\u884c"},
  sim_running:{en:"Running scenario...",zh:"\\u6b63\\u5728\\u8fd0\\u884c\\u573a\\u666f..."},
  sim_steps:[
    {en:"ASR initialized \\u2014 microphone input detected",zh:"ASR \\u521d\\u59cb\\u5316 \\u2014 \\u68c0\\u6d4b\\u5230\\u9ea6\\u514b\\u98ce\\u8f93\\u5165"},
    {en:"Audio transcribed: \\u201cI need to check my invoice\\u201d",zh:"\\u97f3\\u9891\\u8f6c\\u5f55\\u5b8c\\u6210\\uff1a\\u201c\\u6211\\u9700\\u8981\\u67e5\\u4e00\\u4e0b\\u53d1\\u7968\\u201d"},
    {en:"LLM invoked \\u2014 intent classification: invoice_query",zh:"LLM \\u8c03\\u7528 \\u2014 \\u610f\\u56fe\\u5206\\u7c7b\\uff1ainvoice_query"},
    {en:"CRM lookup \\u2014 invoice #2043 found, status: settled",zh:"CRM \\u67e5\\u8be2 \\u2014 \\u53d1\\u7968 #2043 \\u5df2\\u627e\\u5230\\uff0c\\u72b6\\u6001\\uff1a\\u5df2\\u7ed3\\u7b97"},
    {en:"TTS response generated \\u2014 380ms latency",zh:"TTS \\u54cd\\u5e94\\u751f\\u6210 \\u2014 380ms \\u5ef6\\u8fdf"},
    {en:"Response delivered to caller \\u2014 call duration 2m14s",zh:"\\u54cd\\u5e94\\u5df2\\u9001\\u8fbe \\u2014 \\u901a\\u8bdd\\u65f6\\u957f 2 \\u5206 14 \\u79d2"},
  ],
};

/* ============================================================
   Backend control-panel override system
   - shakya.siteConfig : deep-merged over BASE_T (site copy)
   - shakya.settings   : { defaultTheme, defaultLang, aiGuideEnabled, newsEnabled }
   - shakya.guideOverrides : { sections:{sec:{lang:text}}, news:{lang:text} }
   Applied at boot; the /backend page writes these keys.
   ============================================================ */
function cloneObj(o){ return (typeof structuredClone==='function') ? structuredClone(o) : JSON.parse(JSON.stringify(o)); }
function deepMerge(base, over){
  const out = cloneObj(base);
  for (const k in over){
    const ov = over[k];
    if (Array.isArray(ov)) out[k] = cloneObj(ov);
    else if (ov && typeof ov==='object' && base[k] && typeof base[k]==='object' && !Array.isArray(base[k]))
      out[k] = deepMerge(base[k], ov);
    else out[k] = ov;
  }
  return out;
}
function loadOverrides(){ try{ return JSON.parse(localStorage.getItem('shakya.siteConfig')||'{}'); }catch(e){ return {}; } }
function loadSettings(){ try{ return JSON.parse(localStorage.getItem('shakya.settings')||'null'); }catch(e){ return null; } }
function getPath(obj, path){ return path.split('.').reduce((o,k)=> (o && o[k]!==undefined)? o[k] : undefined, obj); }
function setPath(obj, path, val){
  const parts = path.split('.'); let o = obj;
  for (let i=0;i<parts.length-1;i++){ o[parts[i]] = o[parts[i]] || {}; o = o[parts[i]]; }
  o[parts[parts.length-1]] = val;
}
function collectStringKeys(obj, prefix, acc){
  acc = acc || [];
  for (const k in obj){
    const v = obj[k], path = (prefix?prefix+'.':'')+k;
    if (v && typeof v==='object' && !Array.isArray(v)){
      if (('en' in v) || ('zh' in v)) acc.push(path);
      else collectStringKeys(v, path, acc);
    }
  }
  return acc;
}
const ARRAY_KEYS = ['project_cards','lab_deployments','cv_experience','cv_certs','cv_domains','about_focus','sim_steps'];
const SITE_OVERRIDES = loadOverrides();
let T = deepMerge(cloneObj(BASE_T), SITE_OVERRIDES);

/* ---- backend access token (client-side gate; see summary note) ---- */
const BACKEND_TOKEN = btoa('shakya::backend::access');
function grantBackendAccess(){ try{ sessionStorage.setItem('shakya.auth', BACKEND_TOKEN); }catch(e){} }
function clearBackendAccess(){ try{ sessionStorage.removeItem('shakya.auth'); }catch(e){} }
function hasBackendAccess(){ try{ return sessionStorage.getItem('shakya.auth') === BACKEND_TOKEN; }catch(e){ return false; } }

function _t(key, lang) {
  const parts = key.split('.'); let obj = T;
  for (const p of parts) { if (!obj||!obj[p]) return key; obj = obj[p]; }
  if (obj&&typeof obj==='object'&&obj[lang]) return obj[lang];
  if (obj&&typeof obj==='object'&&obj.en) return obj.en;
  return key;
}

const NAV_ITEMS = [
  {id:'home', path:'/', label:'home'},
  {id:'ai-lab', path:'/ai-lab', label:'ailab'},
  {id:'projects', path:'/projects', label:'projects'},
  {id:'agents', path:'/agents', label:'agents'},
  {id:'about', path:'/about', label:'about'},
  {id:'contact', path:'/contact', label:'contact'},
];

function App() {
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('en');
  const [route, setRoute] = useState(window.location.pathname.replace(/\/+$/,'')||'/');
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(()=>{
    const s = loadSettings();
    const stored = (s && s.defaultTheme) ? s.defaultTheme : (localStorage.getItem('shakya-theme')||'dark');
    setTheme(stored); document.documentElement.setAttribute('data-theme',stored);
  },[]);
  useEffect(()=>{
    const s = loadSettings();
    const stored = (s && s.defaultLang) ? s.defaultLang : (localStorage.getItem('shakya-lang')||'en');
    setLang(stored); document.documentElement.lang=stored==='zh'?'zh-CN':'en';
  },[]);
  useEffect(()=>{
    const onPop = ()=>setRoute(window.location.pathname.replace(/\/+$/,'')||'/');
    window.addEventListener('popstate',onPop);
    return ()=>window.removeEventListener('popstate',onPop);
  },[]);

  const toggleTheme = useCallback(()=>{
    setTheme(prev=>{const next=prev==='dark'?'light':'dark';localStorage.setItem('shakya-theme',next);document.documentElement.setAttribute('data-theme',next);return next;});
  },[]);
  const toggleLang = useCallback(()=>{
    setLang(prev=>{const next=prev==='en'?'zh':'en';localStorage.setItem('shakya-lang',next);document.documentElement.lang=next==='zh'?'zh-CN':'en';return next;});
  },[]);
  const navigate = useCallback((path)=>{window.history.pushState({},'',path);setRoute(path);window.scrollTo({top:0,behavior:'auto'});},[]);
  const match = useCallback((path)=>route===path,[route]);
  const t = useCallback((key)=>_t(key,lang),[lang]);
  const showLogin = route === '/about';                 // login button ONLY on About

  // Access gate: /backend requires a valid session token. Resolve BEFORE render so the
  // control panel is never painted to the DOM without authorization (no flash, no leak).
  const locked = (route === '/backend' && !hasBackendAccess());
  const effectiveRoute = locked ? '/about' : route;
  const isBackend = effectiveRoute === '/backend';

  useEffect(()=>{
    // Direct hit on /backend without a token: bounce the URL bar to /about too.
    if (route === '/backend' && !hasBackendAccess()) navigate('/about');
  },[route,navigate]);

  const page = (()=>{
    if (effectiveRoute==='/') return h(HomePage,{navigate,t,lang,key:'home'});
    if (effectiveRoute==='/ai-lab') return h(AiLabPage,{navigate,t,lang,key:'ailab'});
    if (effectiveRoute==='/projects') return h(ProjectsPage,{navigate,t,lang,key:'projects'});
    if (effectiveRoute==='/agents/simulation') return h(SimulationAgentPage,{navigate,t,lang,key:'sim'});
    if (effectiveRoute==='/agents') return h(AgentsPage,{navigate,t,lang,key:'agents'});
    if (effectiveRoute==='/about') return h(AboutPage,{navigate,t,lang,key:'about'});
    if (effectiveRoute==='/contact') return h(ContactPage,{navigate,t,lang,key:'contact'});
    if (effectiveRoute==='/cv') return h(CvPage,{navigate,t,lang,key:'cv'});
    if (effectiveRoute==='/backend') return h(BackendPage,{navigate,t,lang});
    return h(NotFoundPage,{navigate,t,lang,key:'404'});
  })();

  return h('div',{style:{display:'flex',flexDirection:'column',minHeight:'100vh'}},
    !isBackend && h(Nav,{navigate,match,lang,toggleLang,theme,toggleTheme,t,route,showLogin,setLoginOpen}),
    h('div',{style:{flex:1,display:'flex',flexDirection:'column'}}, page),
    !isBackend && h(Footer,{navigate,t}),
    !isBackend && h(ScrollTop),
    loginOpen && h(LoginModal,{onClose:()=>setLoginOpen(false),lang})
  );
}

function Nav({navigate,match,lang,toggleLang,theme,toggleTheme,t,route,showLogin,setLoginOpen}) {
  const [open,setOpen] = useState(false);
  const navRef = useRef(null);
  useEffect(()=>{
    if(!open)return;
    const handler=(e)=>{if(navRef.current&&!navRef.current.contains(e.target))setOpen(false);};
    const esc=(e)=>{if(e.key==='Escape')setOpen(false);};
    document.addEventListener('click',handler);document.addEventListener('keydown',esc);
    return ()=>{document.removeEventListener('click',handler);document.removeEventListener('keydown',esc);};
  },[open]);

  const isActive = (path) => match(path) ? 'active' : '';

  return h('header',{className:`nav${open?' open':''}`,ref:navRef},
    h('a',{href:'/',className:'nav__brand',onClick:(e)=>{e.preventDefault();navigate('/');setOpen(false);}},'shakya'),
    h('nav',{className:'nav__links','aria-label':'Primary'},
      NAV_ITEMS.filter(i=>i.id!=='home').map(item=>
        h('a',{key:item.id,href:item.path,onClick:(e)=>{e.preventDefault();navigate(item.path);setOpen(false);},className:isActive(item.path)},t(item.label))
      )
    ),
    h('div',{className:'nav__right'},
      h('a',{className:'nav__status',href:'/contact',onClick:(e)=>{e.preventDefault();navigate('/contact');}},
        h('span',{className:'dot'}),h('span',null,t('status'))
      ),
      showLogin && h('button',{className:'login-btn',onClick:()=>setLoginOpen(true),'aria-label':'Login to backend'},
        t('login_btn')
      ),
      h('button',{className:'toggle',onClick:toggleTheme,'aria-label':'Toggle theme'},
        h('span',null,theme==='dark'?'\u25D0':'\u25D1'),
        h('span',{style:{fontSize:'10px'}},theme==='dark'?'Dark':'Light')
      ),
      h('button',{className:'toggle',onClick:toggleLang,'aria-label':'Toggle language'},
        h('span',{className:lang==='en'?'on':'off'},'EN'),
        h('span',{style:{margin:'0 2px',color:'var(--text-faint)'}},'/'),
        h('span',{className:lang==='zh'?'on':'off'},'\u4e2d\u6587')
      ),
      h('button',{className:'nav__burger','aria-label':'Menu','aria-expanded':open,onClick:()=>setOpen(o=>!o)},
        h('span'),h('span'),h('span')
      )
    )
  );
}

function Footer({navigate,t}) {
  return h('footer',{className:'footer'},
    h('div',{className:'container'},
      h('div',{className:'footer__top'},
        h('a',{href:'/',className:'footer__brand',onClick:(e)=>{e.preventDefault();navigate('/');}},'shakya'),
        h('div',{className:'footer__links'},
          NAV_ITEMS.filter(i=>i.id!=='home').map(item=>
            h('a',{key:item.id,href:item.path,onClick:(e)=>{e.preventDefault();navigate(item.path);}},t(item.label))
          )
        )
      )
    )
  );
}

function ScrollTop() {
  const [show,setShow]=useState(false);
  useEffect(()=>{const h=()=>setShow(window.scrollY>600);window.addEventListener('scroll',h,{passive:true});return ()=>window.removeEventListener('scroll',h);},[]);
  return h('button',{className:`top--btn${show?' show':''}`,onClick:()=>window.scrollTo({top:0,behavior:'smooth'}),'aria-label':'Back to top'},'\u2191');
}

function LoginModal({onClose,lang}) {
  const [code,setCode]=useState('');
  const [error,setError]=useState('');
  const handleSubmit=(e)=>{
    e.preventDefault();
    if (code.trim()==='1234') {
      grantBackendAccess();          // sets sessionStorage token
      setError('');
      onClose();
      window.history.pushState({},'', '/backend');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      setError(lang==='zh'?'访问码错误，请重试。':'Incorrect code. Try again.');
    }
  };
  return h('div',{style:{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)'},onClick:onClose},
    h('div',{style:{background:'var(--bg-elev)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:32,maxWidth:400,width:'90%'},onClick:e=>e.stopPropagation()},
      h('h3',{style:{fontFamily:'var(--font-display)',fontSize:20,fontWeight:500,marginBottom:8}},lang==='zh'?'\u540E\u53F0\u767B\u5F55':'Backend Sign In'),
      h('p',{style:{fontSize:13,color:'var(--text-dim)',marginBottom:20}},lang==='zh'?'输入访问码以进入配置后台。':'Enter the access code to open the configuration panel.'),
      h('form',{onSubmit:handleSubmit},
        h('input',{type:'text',value:code,onChange:e=>setCode(e.target.value),placeholder:lang==='zh'?'输入访问码...':'Enter access code...',style:{width:'100%',padding:12,border:'1px solid var(--border)',borderRadius:2,background:'var(--bg)',color:'var(--text)',fontSize:14,outline:'none',marginBottom:12},className:'field'}),
        error && h('p',{style:{fontSize:11,color:'#EF4444',marginBottom:8,fontFamily:'var(--font-mono)'}},error),
        h('div',{style:{display:'flex',gap:12,justifyContent:'flex-end'}},
          h('button',{type:'button',onClick:onClose,className:'btn btn--ghost',style:{padding:'10px 18px'}},lang==='zh'?'关闭':'CLOSE'),
          h('button',{type:'submit',className:'btn btn--primary',style:{padding:'10px 18px'}},lang==='zh'?'访问':'ACCESS')
        )
      )
    )
  );
}

function Orbit() {
  const ref = useRef(null);
  useEffect(()=>{
    const canvas=ref.current; if(!canvas)return;
    const ctx=canvas.getContext('2d'); let w,h,cx,cy,dpr;
    const particles=[]; const N=26; const pointer={x:0,y:0,active:false}; let phase=0; let drag=null; let raf=null;
    const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const resize=()=>{dpr=Math.min(window.devicePixelRatio||1,2);const r=canvas.getBoundingClientRect();w=r.width;h=r.height;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);cx=w/2;cy=h/2;};
    const build=()=>{particles.length=0;for(let i=0;i<N;i++){const r=60+Math.random()*(Math.min(w,h)/2-70);particles.push({r,a:Math.random()*Math.PI*2,speed:(0.0006+Math.random()*0.0012)*(Math.random()<0.5?1:-1),size:1.5+Math.random()*3,op:0.25+Math.random()*0.6});}};
    const draw=()=>{
      ctx.clearRect(0,0,w,h);const a=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#6C5CE7';const t=getComputedStyle(document.documentElement).getPropertyValue('--text').trim()||'#FAFAFA';
      [Math.min(w,h)/2-10,Math.min(w,h)/2-50,70].forEach((r,i)=>{ctx.beginPath();ctx.arc(cx,cy,Math.max(2,r),0,Math.PI*2);ctx.strokeStyle=a;ctx.globalAlpha=[0.25,0.5,0.7][i];ctx.lineWidth=1;ctx.stroke();});
      ctx.globalAlpha=1;ctx.beginPath();ctx.arc(cx,cy,10,0,Math.PI*2);ctx.fillStyle=a;ctx.fill();
      particles.forEach(p=>{p.a+=p.speed+phase;let px=cx+Math.cos(p.a)*p.r,py=cy+Math.sin(p.a)*p.r;if(pointer.active){const dx=px-pointer.x,dy=py-pointer.y,d=Math.hypot(dx,dy);if(d<90){const f=(90-d)/90;px+=(dx/d)*f*22;py+=(dy/d)*f*22;}}ctx.beginPath();ctx.arc(px,py,p.size,0,Math.PI*2);ctx.fillStyle=Math.random()<0.15?t:a;ctx.globalAlpha=p.op;ctx.fill();});
      ctx.globalAlpha=1;if(!RM)raf=requestAnimationFrame(draw);
    };
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.active=true;});
    canvas.addEventListener('pointerleave',()=>{pointer.active=false;});
    canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,last:0};canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{if(!drag)return;drag.last=(e.clientX-drag.x)*0.002;drag.x=e.clientX;});
    canvas.addEventListener('pointerup',()=>{drag=null;}); canvas.addEventListener('pointercancel',()=>{drag=null;});
    (function tick(){if(drag){phase+=drag.last;drag.last*=0.9;}if(!RM)raf=requestAnimationFrame(tick);})();
    resize();build();draw();
    window.addEventListener('resize',()=>{resize();build();});
    return ()=>raf&&cancelAnimationFrame(raf);
  },[]);
  return h('div',{className:'orbit'},h('canvas',{ref,width:460,height:460,'aria-label':'Interactive particle orbit'}));
}

function HomePage({navigate,t}) {
  const [search,setSearch]=useState('');
  return h('main',{id:'content'},
    h('section',{className:'hero','data-od-id':'hero-section'},
      h('div',{className:'orbs','aria-hidden':'true'},h('div',{className:'orb orb--1'}),h('div',{className:'orb orb--2'})),
      h('div',{className:'container'},
        h('div',{className:'hero__grid'},
          h('div',null,
            h('p',{className:'kicker'},t('home.kicker')),
            h('h1',{className:'hero__h1'},t('home.h1')),
            h('p',{className:'hero__lede'},t('home.lede')),
            h('div',{className:'hero__links'},
              h('a',{href:'/projects',className:'link',onClick:(e)=>{e.preventDefault();navigate('/projects');}},t('home.view')),
              h('a',{href:'/contact',className:'link link--dim',onClick:(e)=>{e.preventDefault();navigate('/contact');}},t('home.talk'))
            ),
            h('p',{className:'hero__meta'},'GLOBAL \u00B7 REMOTE-FIRST \u00B7 EN / \u4e2d\u6587')
          ),
          h('div',{style:{position:'relative'}},
            h(Orbit),
            h('p',{style:{position:'absolute',bottom:-28,left:0,fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.1em',color:'var(--text-faint)'}},t('orbit_note'))
          )
        ),
        h('p',{className:'hero__meta hero__scroll'},'SCROLL TO EXPLORE \u2193')
      )
    ),
    h('section',{className:'section','data-od-id':'showcase-section'},
      h('div',{className:'container'},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:40,gap:24}},
          h('div',null,
            h('p',{className:'kicker'},'WHAT WE BUILD'),
            h('h2',{style:{fontSize:'clamp(28px,4vw,40px)',fontFamily:'var(--font-display)',fontWeight:500,letterSpacing:'-0.02em',marginTop:8}},'Four disciplines, one outcome.')
          )
        ),
        h('div',{className:'tiles'},
          h('article',{className:'tile tile--1','data-od-id':'feature-card-voice'},
            h('div',{className:'tile__visual'},h('div',{className:'ring ring--1'}),h('div',{className:'ring ring--2'}),h('div',{className:'ring ring--3'}),h('div',{className:'ring__core'})),
            h('div',null,h('span',{className:'tile__num'},'01'),h('div',{className:'tile__word'},'Voice'),h('div',{className:'tile__tag'},'VOICE AGENTS \u00B7 ASR/LLM/TTS'))
          ),
          h('article',{className:'tile tile--2','data-od-id':'feature-card-search'},
            h('div',{className:'tile__visual'},
              h('div',{style:{display:'flex',flexDirection:'column',gap:8,padding:'8px 0'}},
                h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:999,background:'rgba(255,255,255,0.95)',color:'#0A0A0A'}},
                  h('span',null,'\u2315'),
                  h('input',{type:'text',placeholder:'Ask across contracts, SOPs, tickets\u2026',value:search,onChange:e=>setSearch(e.target.value),style:{flex:1,border:'none',background:'none',fontSize:13,outline:'none',color:'#0A0A0A'},'aria-label':'Try a search query'})
                ),
                ['Q2 renewal terms \u2014 Contract #1183','Onboarding SOP, latest revision','Ticket #4421 \u2014 invoice dispute'].map((r,i)=>h('div',{key:i,style:{display:'flex',alignItems:'center',gap:12,color:'#FAFAFA'}},
                  h('span',{style:{width:22,height:22,borderRadius:4,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,flex:'none'}},i+1),
                  h('span',{style:search.trim()?{fontSize:11,opacity:0.9}:{flex:1,height:8,borderRadius:4,background:'rgba(255,255,255,0.35)'}},search.trim()?r:'')
                ))
              )
            ),
            h('div',null,h('span',{className:'tile__num'},'02'),h('div',{className:'tile__word'},'Search'),h('div',{className:'tile__tag'},'ENTERPRISE SEARCH \u00B7 RAG'))
          ),
          h('article',{className:'tile tile--3','data-od-id':'feature-card-agents'},
            h('div',{className:'tile__visual'},
              h('div',{className:'nodes'},
                h('svg',{viewBox:'0 0 240 140','aria-hidden':'true'},
                  h('line',{x1:120,y1:70,x2:60,y2:20,stroke:'currentColor',strokeOpacity:0.35}),
                  h('line',{x1:120,y1:70,x2:190,y2:25,stroke:'currentColor',strokeOpacity:0.35}),
                  h('line',{x1:120,y1:70,x2:40,y2:110,stroke:'currentColor',strokeOpacity:0.35}),
                  h('line',{x1:120,y1:70,x2:200,y2:115,stroke:'currentColor',strokeOpacity:0.35}),
                  h('circle',{cx:120,cy:70,r:14,fill:'currentColor'}),
                  h('circle',{cx:60,cy:20,r:6,fill:'currentColor',opacity:0.7}),
                  h('circle',{cx:190,cy:25,r:6,fill:'currentColor',opacity:0.7}),
                  h('circle',{cx:40,cy:110,r:6,fill:'currentColor',opacity:0.7}),
                  h('circle',{cx:200,cy:115,r:6,fill:'currentColor',opacity:0.7})
                )
              )
            ),
            h('div',null,h('span',{className:'tile__num'},'03'),h('div',{className:'tile__word'},'Agents'),h('div',{className:'tile__tag'},'AI AGENTS \u00B7 CALLING \u00B7 COLLECTIONS'))
          ),
          h('article',{className:'tile tile--4','data-od-id':'feature-card-workflow'},
            h('div',{className:'tile__visual'},
              h('div',{className:'pipeline'},
                h('div',{className:'pipe-box'},h('div',{className:'pipe-box__s'},'Step 1'),h('div',{className:'pipe-box__l'},'Input')),
                h('span',{className:'pipe-arrow'},'\u2192'),
                h('div',{className:'pipe-box'},h('div',{className:'pipe-box__s'},'Step 2'),h('div',{className:'pipe-box__l'},'Agent')),
                h('span',{className:'pipe-arrow'},'\u2192'),
                h('div',{className:'pipe-box'},h('div',{className:'pipe-box__s'},'Step 3'),h('div',{className:'pipe-box__l'},'Output'))
              )
            ),
            h('div',null,h('span',{className:'tile__num'},'04'),h('div',{className:'tile__word'},'Workflow'),h('div',{className:'tile__tag'},'WORKFLOW AUTOMATION \u00B7 AGENT CHAINS'))
          )
        )
      )
    ),
    h(CtaSection,{navigate,t})
  );
}

function CtaSection({navigate,t}) {
  return h('section',{className:'cta'},
    h('div',{className:'container'},
      h('p',{className:'kicker',style:{color:'rgba(255,255,255,0.7)'}},t('cta.kicker')),
      h('h2',{className:'cta__title'},t('cta.title')),
      h('div',{className:'cta__links'},
        h('a',{href:'/contact',onClick:(e)=>{e.preventDefault();navigate('/contact');}},t('cta.go'))
      )
    )
  );
}

function ProjectsPage({navigate,t,lang}) {
  const cards = T.project_cards;
  const l = (o) => o[lang] || o.en;
  return h('main',{id:'content'},
    h('section',{className:'pagehero'},
      h('div',{className:'container'},
        h('p',{className:'kicker'},t('proj.kicker')),
        h('h1',{className:'pagehero__h1'},t('proj.h1')),
        h('p',{className:'pagehero__lede'},t('proj.lede'))
      )
    ),
    h('section',{className:'section--tight'},
      h('div',{className:'container'},
        h('div',{className:'cards'},
          cards.map((c,i)=>h('article',{key:i,className:'card'},
            h('span',{className:'card__kicker'},l(c.kicker)),
            h('h3',{className:'card__title'},l(c.title)),
            h('p',{className:'card__desc'},l(c.desc)),
            h('a',{href:'/contact',className:'card__link',onClick:(e)=>{e.preventDefault();navigate('/contact');}},'View case \u2192')
          ))
        )
      )
    ),
    h(CtaSection,{navigate,t})
  );
}

function AiLabPage({navigate,t,lang}) {
  const deps = T.lab_deployments;
  const l = (o) => o[lang] || o.en;
  return h('main',{id:'content'},
    h('section',{className:'pagehero'},
      h('div',{className:'container'},
        h('p',{className:'kicker'},t('lab.kicker')),
        h('h1',{className:'pagehero__h1'},t('lab.h1')),
        h('p',{className:'pagehero__lede'},t('lab.lede'))
      )
    ),
    h('section',{className:'section--tight'},
      h('div',{className:'container'},
        h('div',{className:'console'},
          h('div',{className:'console__head'},
            h('span',{className:'console__label'},t('lab_demo')),
            h('span',{className:'console__live'},h('span',{className:'dot'}),h('span',null,'LIVE \u00B7 SYNTHETIC DATA'))
          ),
          h('div',{className:'console__body'},
            h('div',null,
              h('div',{className:'bubble bubble--agent'},t('lab_a1')),
              h('div',{className:'bubble bubble--user'},t('lab_u1')),
              h('div',{className:'bubble bubble--agent'},t('lab_a2'))
            ),
            h('div',{className:'console__controls'},
              h('div',{className:'mic'},h('div',{className:'mic__core'})),
              h('span',{style:{fontSize:9,letterSpacing:'0.1em',color:'#EBEFF3',fontFamily:'var(--font-mono)'}},t('lab_mic')),
              h('div',{className:'console__wave'},h('span'),h('span'),h('span'),h('span'),h('span')),
              h('span',{style:{fontSize:9,letterSpacing:'0.1em',color:'#737373',fontFamily:'var(--font-mono)'}},t('lab_latency'))
            )
          )
        ),
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20,marginTop:32}},
          h('article',{className:'card'},
            h('span',{className:'card__kicker'},t('lab_d2k')),
            h('h3',{className:'card__title'},t('lab_d2t')),
            h('div',{style:{height:120,background:'var(--bg-elev)',borderRadius:'var(--radius)',margin:'12px 0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-dim)'}},'WORKFLOW CANVAS'),
            h('p',{className:'card__desc'},t('lab_d2d'))
          ),
          h('article',{className:'card'},
            h('span',{className:'card__kicker'},t('lab_d3k')),
            h('h3',{className:'card__title'},t('lab_d3t')),
            h('div',{style:{height:120,background:'var(--bg-elev)',borderRadius:'var(--radius)',margin:'12px 0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-dim)'}},'SEARCH UI'),
            h('p',{className:'card__desc'},t('lab_d3d'))
          )
        ),
        h('div',{style:{marginTop:64}},
          h('p',{className:'kicker'},t('lab_depk')),
          h('h2',{style:{fontSize:32,fontFamily:'var(--font-display)',fontWeight:500,letterSpacing:'-0.02em',margin:'10px 0 28px'}},t('lab_dept')),
          h('div',{className:'table'},
            h('div',{className:'table__row table__row--head'},h('span',null,'YEAR'),h('span',null,'DEPLOYMENT'),h('span',{style:{textAlign:'right'}},lang==='zh'?'\u6210\u679C':'OUTCOME')),
            deps.map((d,i)=>h('div',{key:i,className:'table__row'},
              h('span',{className:'year'},d.year),
              h('span',{className:'title'},l(d.title)),
              h('span',{className:'domain'},l(d.outcome))
            ))
          )
        )
      )
    )
  );
}

function AboutPage({navigate,t,lang}) {
  const focuses = T.about_focus;
  const l = (o) => o[lang] || o.en;
  return h('main',{id:'content'},
    h('section',{className:'pagehero'},
      h('div',{className:'container'},
        h('p',{className:'kicker'},t('about.kicker')),
        h('h1',{className:'pagehero__h1'},t('about.h1'))
      )
    ),
    h('section',{className:'section--tight'},
      h('div',{className:'container'},
        h('div',null,
          h('p',{style:{fontSize:17,lineHeight:1.8,color:'var(--text-dim)',maxWidth:760}},t('about_body1')),
          h('p',{style:{fontSize:17,lineHeight:1.8,color:'var(--text-dim)',maxWidth:760,marginTop:18}},t('about_body2'))
        )
      )
    ),
    h('section',{className:'philosophy'},
      h('div',{className:'container'},
        h('p',{className:'kicker'},'PRINCIPLE'),
        h('h2',{className:'philosophy__title'},t('about_principle')),
        h('p',{className:'philosophy__body'},t('about_principle_body'))
      )
    ),
    h('section',{className:'section'},
      h('div',{className:'container'},
        h('p',{className:'kicker'},'FOCUS AREAS'),
        h('h2',{style:{fontSize:24,fontFamily:'var(--font-display)',fontWeight:500,letterSpacing:'-0.02em',margin:'10px 0 20px'}},t('about_disciplines')),
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18}},
          focuses.map((f,i)=>h('div',{key:i,style:{border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:20}},
            h('div',{style:{fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'0.08em',color:'var(--accent)',marginBottom:8}},l(f.tag)),
            h('p',{style:{fontSize:14,color:'var(--text-dim)',lineHeight:1.6}},l(f.desc))
          ))
        )
      )
    ),
    h(CtaSection,{navigate,t})
  );
}

function ContactPage({navigate,t}) {
  const [sent,setSent]=useState(false);
  const handleSubmit=(e)=>{e.preventDefault();setSent(true);setTimeout(()=>setSent(false),1800);};
  return h('main',{id:'content'},
    h('section',{className:'pagehero'},
      h('div',{className:'container'},
        h('p',{className:'kicker'},t('contact.kicker')),
        h('h1',{className:'pagehero__h1'},t('contact.h1'))
      )
    ),
    h('section',{className:'section--tight'},
      h('div',{className:'container'},
        h('div',{className:'channels'},
          h('div',{className:'channel'},
            h('div',{className:'channel__l'},'EMAIL'),
            h('a',{href:'mailto:creationpanel@gmail.com',className:'channel__v'},'creationpanel@gmail.com \u2197')
          ),
          h('div',{className:'channel'},
            h('div',{className:'channel__l'},'LINKEDIN'),
            h('a',{href:'https://www.linkedin.com/in/shakya-pranamya/',className:'channel__v',target:'_blank',rel:'noopener noreferrer'},'linkedin.com/in/shakya-pranamya \u2197')
          ),
          h('div',{className:'channel'},
            h('div',{className:'channel__l'},'WECHAT'),
            h('span',{className:'channel__v'},'shakyain')
          )
        ),
        h('div',{style:{marginTop:48}},
          h('p',{className:'kicker',style:{marginBottom:16}},t('contact_form')),
          h('form',{className:'form',onSubmit:handleSubmit},
            h('div',{className:'form__row'},
              h('input',{type:'text',className:'field',name:'name',placeholder:t('contact_ph_name'),required:true}),
              h('input',{type:'email',className:'field',name:'email',placeholder:t('contact_ph_email'),required:true})
            ),
            h('textarea',{className:'field field--area',name:'message',placeholder:t('contact_ph_msg'),required:true}),
            h('button',{type:'submit',className:'btn btn--primary'},t('contact_send')),
            h('p',{className:`form-state${sent?' show':''}`,'aria-live':'polite'},t('contact_thanks'))
          )
        )
      )
    )
  );
}

function AgentsPage({navigate,t,lang}) {
  const agents = [
    {name:{en:"Simulation Agent",zh:"\u6A21\u62DF\u667A\u80FD\u4F53"},status:"active",activity:{en:"Running test scenario #42",zh:"\u8FD0\u884C\u6D4B\u8BD5\u573A\u666F #42"},last:{en:"Just now",zh:"\u521A\u521A"},type:{en:"Voice Agent",zh:"\u8BED\u97F3\u667A\u80FD\u4F53"},uptime:{en:"12h 34m",zh:"12 \u5C0F\u65F6 34 \u5206"}},
    {name:{en:"Calling Agent",zh:"\u5916\u547C\u667A\u80FD\u4F53"},status:"idle",activity:{en:"Awaiting dispatch",zh:"\u7B49\u5F85\u8C03\u5EA6"},last:{en:"3m ago",zh:"3 \u5206\u949F\u524D"},type:{en:"Outbound Agent",zh:"\u5916\u547C\u667A\u80FD\u4F53"},uptime:{en:"6h 12m",zh:"6 \u5C0F\u65F6 12 \u5206"}},
    {name:{en:"Collections Agent",zh:"\u50AC\u6536\u667A\u80FD\u4F53"},status:"active",activity:{en:"Processing queue #7",zh:"\u5904\u7406\u961F\u5217 #7"},last:{en:"1m ago",zh:"1 \u5206\u949F\u524D"},type:{en:"Compliance Agent",zh:"\u5408\u89C4\u667A\u80FD\u4F53"},uptime:{en:"48h 0m",zh:"48 \u5C0F\u65F6 0 \u5206"}},
    {name:{en:"Search Agent",zh:"\u641C\u7D22\u667A\u80FD\u4F53"},status:"active",activity:{en:"Indexing 1,247 documents",zh:"\u7D22\u5F15 1,247 \u4EFD\u6587\u6863"},last:{en:"30s ago",zh:"30 \u79D2\u524D"},type:{en:"RAG Agent",zh:"RAG \u667A\u80FD\u4F53"},uptime:{en:"72h 0m",zh:"72 \u5C0F\u65F6 0 \u5206"}},
    {name:{en:"Workflow Agent",zh:"\u5DE5\u4F5C\u6D41\u667A\u80FD\u4F53"},status:"offline",activity:{en:"Scheduled maintenance",zh:"\u8BA1\u5212\u7EF4\u62A4\u4E2D"},last:{en:"2h ago",zh:"2 \u5C0F\u65F6\u524D"},type:{en:"Orchestrator",zh:"\u7F16\u6392\u5668"},uptime:{en:"0m",zh:"0 \u5206\u949F"}},
  ];
  const l = (o) => o[lang] || o.en;
  const statusClass = (s) => `agent-card__status agent-card__status--${s}`;
  const statusLabel = (s) => ({active:{en:"Active",zh:"\u6D3B\u8DC3"},idle:{en:"Idle",zh:"\u7A7A\u95F2"},offline:{en:"Offline",zh:"\u79BB\u7EBF"}})[s][lang]||s;
  return h('main',{id:'content'},
    h('section',{className:'pagehero'},
      h('div',{className:'container'},
        h('p',{className:'kicker'},t('agents.kicker')),
        h('h1',{className:'pagehero__h1'},t('agents.h1')),
        h('p',{className:'pagehero__lede'},t('agents.lede'))
      )
    ),
    h('section',{className:'section--tight'},
      h('div',{className:'container'},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,gap:16,flexWrap:'wrap'}},
          h('span',{style:{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.1em',color:'var(--text-dim)'}},lang==='zh'?`${agents.filter(a=>a.status==='active').length} 个活跃智能体`:`${agents.filter(a=>a.status==='active').length} agents active`),
          h('button',{className:'btn btn--ghost',style:{fontSize:11,padding:'8px 16px'}},lang==='zh'?'+ 添加智能体':'+ ADD AGENT')
        ),
        h('div',{className:'agent-grid'},
          agents.map((a,i)=>h('div',{key:i,className:'agent-card','data-od-id':`agent-card-${a.name.en.toLowerCase().replace(/\s+/g,'-')}`,onClick:i===0?()=>navigate('/agents/simulation'):undefined,style:i===0?{cursor:'pointer'}:undefined},
            h('div',{className:'agent-card__header'},
              h('span',{className:'agent-card__name'},l(a.name)),
              h('span',{className:statusClass(a.status)},
                h('span',{style:{width:6,height:6,borderRadius:'50%',background:a.status==='active'?'#22C55E':a.status==='idle'?'var(--text-dim)':'#EF4444',display:'inline-block'}}),
                statusLabel(a.status)
              )
            ),
            h('div',{style:{fontSize:13,color:'var(--text-dim)',lineHeight:1.5}},l(a.activity)),
            h('div',{className:'agent-card__meta'},
              h('div',{className:'agent-card__meta-item'},
                h('div',{className:'agent-card__meta-label'},lang==='zh'?'\u7C7B\u578B':'TYPE'),
                h('div',{className:'agent-card__meta-value'},l(a.type))
              ),
              h('div',{className:'agent-card__meta-item'},
                h('div',{className:'agent-card__meta-label'},lang==='zh'?'\u8FD0\u884C\u65F6\u95F4':'UPTIME'),
                h('div',{className:'agent-card__meta-value'},l(a.uptime))
              ),
              h('div',{className:'agent-card__meta-item'},
                h('div',{className:'agent-card__meta-label'},lang==='zh'?'\u6700\u540E\u66F4\u65B0':'LAST UPDATED'),
                h('div',{className:'agent-card__meta-value'},l(a.last))
              ),
              h('div',{className:'agent-card__meta-item'},
                h('div',{className:'agent-card__meta-label'},lang==='zh'?'\u72B6\u6001':'STATUS'),
                h('div',{className:'agent-card__meta-value'},statusLabel(a.status))
              )
            )
          ))
        )
      )
    ),
    h(CtaSection,{navigate,t})
  );
}

function SimulationAgentPage({navigate,t,lang}) {
  const simRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const simCanvasRef = React.useRef(null);
  const chartCanvasRef = React.useRef(null);
  const tipRef = React.useRef(null);
  const displayRef = React.useRef(new Map());
  const phaseRef = React.useRef(null);
  const sampleRef = React.useRef(0);
  const kpiRef = React.useRef(0);
  const [running,setRunning] = React.useState(false);
  const [counts,setCounts] = React.useState({agents:0,humans:0,phase:'Day'});
  const [log,setLog] = React.useState([]);

  React.useEffect(()=>{
    if (!window.Sim || !window.Renderer || !window.OfficeCharts) {
      setLog(prev=>['Simulation engine failed to load.', ...prev].slice(0,10));
      return;
    }
    const sim = new window.Sim();
    const renderer = new window.Renderer(simCanvasRef.current);
    const charts = new window.OfficeCharts({canvas: chartCanvasRef.current, tip: tipRef.current});
    sim.paused = true; // wait for RUN SCENARIO
    simRef.current = sim;
    const display = displayRef.current;
    const loop = ()=>{
      sim.update();
      const state = sim.getState();
      for (const f of state.figures) {
        const d = display.get(f.id) || {x:f.x, y:f.y};
        display.set(f.id, d);
        d.x += (f.x - d.x) * 0.25;
        d.y += (f.y - d.y) * 0.25;
      }
      renderer.draw({world:state.world, zones:state.zones, props:state.props, walls:state.walls, figures:state.figures, display, selected:null, time:state.time});
      let agents = 0, humans = 0;
      for (const f of state.figures) {
        if (f.type === 'robot') { if (f.state !== 'idle') agents++; }
        else if (!f.gone) humans++;
      }
      const now = performance.now();
      if (now - kpiRef.current > 300) { kpiRef.current = now; setCounts({agents, humans, phase: state.time.isNight ? 'Night' : 'Day'}); }
      const ph = state.time.isNight ? 'Night' : 'Day';
      if (phaseRef.current !== ph) { phaseRef.current = ph; setLog(prev=>[`${ph}: ${humans} humans present - ${agents} agents active`, ...prev].slice(0,10)); }
      if (now - sampleRef.current > 400) { sampleRef.current = now; charts.push({t: state.time.clock, agents, humans}); }
      charts.render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return ()=>{ if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  },[]);

  const toggle = ()=>{
    const sim = simRef.current; if (!sim) return;
    const paused = sim.togglePause();
    setRunning(!paused);
    setLog(prev=>[(paused ? 'Scenario paused.' : 'Scenario started - agents patrolling, humans at desks.') , ...prev].slice(0,10));
  };

  const l = (o) => o[lang] || o.en;
  return h('main',{id:'content'},
    h('section',{className:'pagehero'},
      h('div',{className:'container'},
        h('a',{href:'/agents',className:'back-link',onClick:(e)=>{e.preventDefault();navigate('/agents');}},t('sim_back')),
        h('p',{className:'kicker',style:{marginTop:16}},t('sim_kicker')),
        h('h1',{className:'pagehero__h1'},t('sim_h1')),
        h('p',{className:'pagehero__lede'},t('sim_lede'))
      )
    ),
    h('section',{className:'section--tight'},
      h('div',{className:'container'},
        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}},
          h('div',{className:'card',style:{padding:20}},
            h('div',{style:{fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.1em',color:'var(--text-dim)',textTransform:'uppercase',marginBottom:8}},t('sim_scenario')),
            h('div',{style:{fontFamily:'var(--font-display)',fontSize:18,fontWeight:500,marginBottom:4}},'Test Scenario #42'),
            h('div',{style:{fontSize:13,color:'var(--text-dim)',lineHeight:1.5}},'A hybrid office: 16 humans + 16 AI agents on one floor, running a 24/7 day/night loop.'),
            h('div',{style:{display:'flex',gap:8,marginTop:12}},
              h('span',{style:{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.08em',color:'var(--accent)',padding:'4px 10px',border:'1px solid var(--accent-line)',borderRadius:100,background:'var(--accent-soft)'}},'AGENTS'),
              h('span',{style:{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.08em',color:'var(--text-dim)',padding:'4px 10px',border:'1px solid var(--border)',borderRadius:100}},'LIVE')
            )
          ),
          h('div',{className:'card',style:{padding:20,display:'flex',flexDirection:'column',justifyContent:'space-between'}},
            h('div',null,
              h('div',{style:{fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.1em',color:'var(--text-dim)',textTransform:'uppercase',marginBottom:8}},t('sim_controls')),
              h('div',{style:{display:'flex',gap:12,alignItems:'center'}},
                h('button',{className:'btn btn--primary',onClick:toggle,disabled:running,style:{opacity:running?0.5:1,fontSize:12,padding:'10px 18px'}},t('sim_run')),
                h('button',{className:'btn btn--ghost',onClick:toggle,disabled:!running,style:{opacity:!running?0.5:1,fontSize:12,padding:'10px 18px'}},t('sim_stop'))
              )
            ),
            h('div',{style:{display:'flex',gap:18,marginTop:14,fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-dim)'}},
              h('span',null,`AI AGENTS: ${counts.agents}`),
              h('span',null,`HUMANS: ${counts.humans}`),
              h('span',null,`${counts.phase}`)
            )
          )
        ),
        h('div',{className:'olt-stage'},
          h('canvas',{ref:simCanvasRef,className:'olt-canvas',width:1280,height:896})
        ),
        h('div',{className:'olt-charts'},
          h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}},
            h('span',{style:{fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.1em',color:'var(--text-dim)',textTransform:'uppercase'}},'PRESENCE - AGENTS VS HUMANS'),
            h('div',{style:{display:'flex',gap:16,fontSize:12,color:'var(--text-dim)'}},
              h('span',{style:{display:'flex',alignItems:'center',gap:6}},h('span',{style:{width:10,height:10,borderRadius:3,background:'var(--accent)'}}),'AI agents'),
              h('span',{style:{display:'flex',alignItems:'center',gap:6}},h('span',{style:{width:10,height:10,borderRadius:3,background:'#3b82c4'}}),'Humans')
            )
          ),
          h('div',{className:'olt-chart-wrap'},
            h('canvas',{ref:chartCanvasRef,className:'olt-chart-canvas'}),
            h('div',{ref:tipRef,className:'olt-tip'})
          )
        ),
        h('div',{style:{marginTop:20}},
          h('div',{style:{fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.1em',color:'var(--text-dim)',textTransform:'uppercase',marginBottom:12}},t('sim_console')),
          h('div',{className:'olt-console'},
            log.length === 0
              ? h('div',{style:{fontSize:13,color:'var(--text-dim)'}},'Idle - press RUN SCENARIO to start.')
              : log.map((line,i)=>h('div',{key:i,style:{fontSize:13,color:i===0?'var(--text)':'var(--text-dim)',opacity:1-(i*0.06),padding:'4px 0',fontFamily:'var(--font-mono)'}},`> ${line}`))
          )
        )
      )
    ),
    h(CtaSection,{navigate,t})
  );
}

function CvPage({navigate,t,lang}) {
  const exps = T.cv_experience, certs = T.cv_certs, domains = T.cv_domains;
  const l = (o) => o[lang] || o.en;
  return h('main',{id:'content'},
    h('section',{className:'pagehero'},
      h('div',{className:'container'},
        h('p',{className:'kicker'},t('cv.kicker')),
        h('h1',{className:'pagehero__h1'},t('cv.h1'))
      )
    ),
    h('section',{className:'section--tight'},
      h('div',{className:'container'},
        h('div',{className:'cv-content'},
          h('div',{className:'cv-header'},
            h('div',null,
              h('h2',{className:'cv-name'},'Shakya Tang'),
              h('p',{className:'cv-role'},'Product & AI Leader \u00B7 Voice \u00B7 Search \u00B7 Agents')
            ),
            h('div',{style:{textAlign:'right'}},
              h('p',{style:{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-dim)'}},'creationpanel@gmail.com'),
              h('p',{style:{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-dim)',marginTop:4}},'GLOBAL \u00B7 REMOTE-FIRST \u00B7 EN / \u4e2d\u6587')
            )
          ),
          h('div',{className:'cv-section'},
            h('p',{className:'cv-section__title'},lang==='zh'?'简介':'SUMMARY'),
            h('p',{style:{fontSize:14,color:'var(--text-dim)',lineHeight:1.7}},t('cv_summary'))
          ),
          h('div',{className:'cv-section'},
            h('p',{className:'cv-section__title'},lang==='zh'?'经历':'EXPERIENCE'),
            exps.map((e,i)=>h('div',{key:i,className:'cv-experience'},
              h('div',{className:'cv-experience__header'},
                h('span',{className:'cv-experience__title'},l(e.title)),
                h('span',{className:'cv-experience__date'},l(e.date))
              ),
              h('p',{className:'cv-experience__desc'},l(e.desc))
            ))
          ),
          h('div',{className:'cv-section'},
            h('p',{className:'cv-section__title'},lang==='zh'?'认证':'CERTIFICATIONS'),
            h('p',{style:{fontFamily:'var(--font-mono)',fontSize:13,color:'var(--text-dim)'}},l(certs[0]))
          ),
          h('div',{className:'cv-section'},
            h('p',{className:'cv-section__title'},lang==='zh'?'\u9886\u57df':'DOMAINS'),
            h('div',{className:'cv-tags'},
              domains.map((d,i)=>h('span',{key:i,className:'cv-tag'},l(d)))
            )
          ),
          h('div',{className:'cv-section',style:{marginBottom:0}},
            h('p',{className:'cv-section__title'},lang==='zh'?'语言':'LANGUAGES'),
            h('p',{style:{fontSize:14,color:'var(--text-dim)'}},t('cv_lang'))
          )
        )
      )
    ),
    h(CtaSection,{navigate,t})
  );
}

function NotFoundPage({navigate,t,lang}) {
  return h('main',{id:'content'},
    h('section',{style:{position:'relative',minHeight:'70vh',display:'flex',alignItems:'center',overflow:'hidden'}},
      h('div',{className:'orbs','aria-hidden':'true'},h('div',{className:'orb orb--1'}),h('div',{className:'orb orb--2'})),
      h('div',{style:{fontFamily:'var(--font-display)',fontSize:'clamp(100px,18vw,200px)',fontWeight:600,lineHeight:1,letterSpacing:'-0.06em',color:'var(--text)',opacity:0.04,position:'absolute',top:'50%',right:'5%',transform:'translateY(-50%)',pointerEvents:'none',userSelect:'none'}},404),
      h('div',{className:'container',style:{position:'relative',zIndex:1}},
        h('p',{className:'kicker'},'ERROR 404'),
        h('h1',{className:'hero__h1',style:{fontSize:'clamp(36px,5vw,52px)',marginTop:12}},lang==='zh'?'这个页面已发货，但不在这里。':'This page shipped, but not here.'),
        h('p',{style:{fontSize:'clamp(18px,2.5vw,24px)',color:'var(--text-dim)',marginTop:12,maxWidth:560,lineHeight:1.5}},lang==='zh'?'链接可能已损坏或页面已移动。试试下面这些：':'The link may be broken or the page moved. Try one of these instead:'),
        h('div',{style:{display:'flex',gap:32,marginTop:36,flexWrap:'wrap'}},
          h('a',{href:'/',className:'link',onClick:(e)=>{e.preventDefault();navigate('/');}},lang==='zh'?'返回首页 \u2193':'Back home \u2193'),
          h('a',{href:'/projects',className:'link link--dim',onClick:(e)=>{e.preventDefault();navigate('/projects');}},lang==='zh'?'查看项目 \u2192':'View projects \u2192')
        )
      )
    )
  );
}

function BackendPage({navigate,t,lang}) {
  const [tab,setTab] = useState('content');
  const [strings,setStrings] = useState({});
  const [arrays,setArrays] = useState({});
  const [guide,setGuide] = useState({sections:{},news:{}});
  const [settings,setSettings] = useState({aiGuideEnabled:true,defaultTheme:'dark',defaultLang:'en',newsEnabled:true});
  const [saved,setSaved] = useState('');
  const [manifestOk,setManifestOk] = useState(false);

  // --- gate: no token -> bounce out ---
  useEffect(()=>{
    if (!hasBackendAccess()) { window.location.replace('/about'); }
  },[]);

  // --- init editable content from effective T ---
  useEffect(()=>{
    const s={}; const a={};
    collectStringKeys(BASE_T).forEach(p=>{ const v=getPath(T,p)||{}; s[p]={en:v.en||'',zh:v.zh||''}; });
    ARRAY_KEYS.forEach(k=>{ a[k]=JSON.stringify(getPath(T,k)||[],null,2); });
    setStrings(s); setArrays(a);
    const st = loadSettings();
    if (st) setSettings(Object.assign({aiGuideEnabled:true,defaultTheme:'dark',defaultLang:'en',newsEnabled:true}, st));
  },[]);

  // --- init AI guide text from manifest.json ---
  useEffect(()=>{
    fetch('assets/audio/manifest.json').then(r=>r.ok?r.json():Promise.reject()).then(m=>{
      const g={sections:{},news:{}};
      Object.keys(m.sections||{}).forEach(sec=>{
        const tx=(m.sections[sec].text)||{}; g.sections[sec]={en:tx.en||'',zh:tx.zh||''};
      });
      const ntx=(m.news&&m.news.text)||{}; g.news={en:ntx.en||'',zh:ntx.zh||''};
      setGuide(g); setManifestOk(true);
    }).catch(()=>{ setManifestOk(false); });
  },[]);

  if (!hasBackendAccess()) return null;

  const PAGE_LABELS = {home:'Home',about:'About',projects:'Projects',agents:'Agents',contact:'Contact',cv:'CV',lab:'AI Lab',sim:'Simulation',nav:'Navigation',footer:'Footer',status:'Status',cta:'CTA',login_btn:'Global'};
  function groupedStrings(){
    const groups={};
    collectStringKeys(BASE_T).forEach(p=>{ const g=p.split('.')[0]; (groups[g]=groups[g]||[]).push(p); });
    return groups;
  }

  function download(name,text){ const b=new Blob([text],{type:'application/json'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=name; a.click(); URL.revokeObjectURL(u); }

  function setStr(path,field,val){ setStrings(prev=>Object.assign({},prev,{[path]:Object.assign({},prev[path],{[field]:val})})); }
  function setArr(key,val){ setArrays(prev=>Object.assign({},prev,{[key]:val})); }
  function setGuideText(kind,key,field,val){ setGuide(prev=>{ const n=Object.assign({},prev); n[kind][key]=Object.assign({},n[kind][key],{[field]:val}); return n; }); }

  function saveContent(){
    const overrides={};
    Object.keys(strings).forEach(p=>setPath(overrides,p,{en:strings[p].en,zh:strings[p].zh}));
    Object.keys(arrays).forEach(k=>{ try{ const v=JSON.parse(arrays[k]); overrides[k]=v; }catch(e){ /* keep existing on invalid JSON */ } });
    localStorage.setItem('shakya.siteConfig',JSON.stringify(overrides));
    setSaved('Site content saved — reload the site to apply changes.');
  }
  function saveGuide(){
    localStorage.setItem('shakya.guideOverrides',JSON.stringify(guide));
    setSaved('AI guide text saved — reload the site to apply. Export manifest.json to deploy.');
  }
  function saveSettings(){
    localStorage.setItem('shakya.settings',JSON.stringify(settings));
    setSaved('Settings saved — applies on next load (theme/language default, widget on/off).');
  }
  function exportAll(){
    const all={siteConfig:JSON.parse(localStorage.getItem('shakya.siteConfig')||'{}'),guideOverrides:guide,settings:settings};
    download('shakya.config.json',JSON.stringify(all,null,2));
  }
  function resetAll(){
    if(!window.confirm('Clear all overrides (content, guide text, settings)? Site reverts to defaults on reload.')) return;
    localStorage.removeItem('shakya.siteConfig'); localStorage.removeItem('shakya.guideOverrides'); localStorage.removeItem('shakya.settings');
    setSaved('All overrides cleared.');
  }
  function logout(){ clearBackendAccess(); navigate('/about'); }

  const wrap=h('div',{className:'backend'},
    h('header',{className:'backend__bar'},
      h('div',null,
        h('div',{className:'backend__title'},'Backend Configuration'),
        h('div',{className:'backend__sub'},'shakya.work — centralized control panel')
      ),
      h('div',{className:'backend__bar-actions'},
        h('button',{className:'btn btn--ghost',style:{fontSize:11,padding:'8px 14px'},onClick:()=>navigate('/')},'View site ↗'),
        h('button',{className:'btn btn--primary',style:{fontSize:11,padding:'8px 14px'},onClick:logout},'Logout')
      )
    ),
    h('div',{className:'backend__tabs'},
      ['content','guide','settings'].map(tb=>h('button',{key:tb,className:'backend__tab'+(tab===tb?' active':''),onClick:()=>setTab(tb)},
        tb==='content'?'Site Content':tb==='guide'?'AI Guide Text':'Site Settings'))
    ),
    h('div',{className:'backend__body'},
      saved && h('div',{className:'backend__saved'},saved),

      tab==='content' && h('div',null,
        h('p',{className:'backend__note'},'Every editable site string is listed below, grouped by page. These are the actual configurable copy elements used across the site.'),
        Object.keys(groupedStrings()).map(g=>h('section',{key:g,className:'backend__group'},
          h('h3',{className:'backend__group-title'},PAGE_LABELS[g]||g),
          groupedStrings()[g].map(p=>h('div',{key:p,className:'backend__field'},
            h('label',{className:'backend__field-label'},p),
            h('div',{className:'backend__langs'},
              h('textarea',{className:'field field--area',value:strings[p]?strings[p].en:'',placeholder:'English',onChange:e=>setStr(p,'en',e.target.value)}),
              h('textarea',{className:'field field--area',value:strings[p]?strings[p].zh:'',placeholder:'中文',onChange:e=>setStr(p,'zh',e.target.value)})
            )
          ))
        )),
        h('section',{className:'backend__group'},
          h('h3',{className:'backend__group-title'},'Structured Content (JSON)'),
          ARRAY_KEYS.map(k=>h('div',{key:k,className:'backend__field'},
            h('label',{className:'backend__field-label'},k+' (JSON)'),
            h('textarea',{className:'field field--area',style:{minHeight:120,fontFamily:'var(--font-mono)',fontSize:12},value:arrays[k]||'',onChange:e=>setArr(k,e.target.value)})
          ))
        ),
        h('div',{className:'backend__actions'},
          h('button',{className:'btn btn--primary',onClick:saveContent},'Save site content')
        )
      ),

      tab==='guide' && h('div',null,
        !manifestOk && h('p',{className:'backend__note'},'Could not load manifest.json (audio guide source). Guide text editing is unavailable until it is reachable.'),
        manifestOk && h('p',{className:'backend__note'},'AI guide narration text per section and for the weekly news. Edits apply to the voice widget on reload.'),
        manifestOk && Object.keys(guide.sections).map(sec=>h('section',{key:sec,className:'backend__group'},
          h('h3',{className:'backend__group-title'},'Section: '+sec),
          h('div',{className:'backend__langs'},
            h('textarea',{className:'field field--area',value:guide.sections[sec].en,placeholder:'English',onChange:e=>setGuideText('sections',sec,'en',e.target.value)}),
            h('textarea',{className:'field field--area',value:guide.sections[sec].zh,placeholder:'中文',onChange:e=>setGuideText('sections',sec,'zh',e.target.value)})
          )
        )),
        manifestOk && h('section',{className:'backend__group'},
          h('h3',{className:'backend__group-title'},'Section: news (weekly)'),
          h('div',{className:'backend__langs'},
            h('textarea',{className:'field field--area',value:guide.news.en,placeholder:'English',onChange:e=>setGuideText('news','en',e.target.value)}),
            h('textarea',{className:'field field--area',value:guide.news.zh,placeholder:'中文',onChange:e=>setGuideText('news','zh',e.target.value)})
          )
        ),
        manifestOk && h('div',{className:'backend__actions'},
          h('button',{className:'btn btn--primary',onClick:saveGuide},'Save guide text'),
          h('button',{className:'btn btn--ghost',onClick:()=>{ const m={sections:{},news:{text:guide.news}}; Object.keys(guide.sections).forEach(s=>m.sections[s]={text:guide.sections[s]}); download('manifest.guide.json',JSON.stringify(m,null,2)); }},'Export guide JSON')
        )
      ),

      tab==='settings' && h('div',null,
        h('p',{className:'backend__note'},'Site-wide toggles that map to real runtime behaviour.'),
        h('section',{className:'backend__group'},
          h('div',{className:'backend__toggle'},
            h('div',null,h('div',{className:'backend__field-label'},'AI guide widget'),h('div',{className:'backend__toggle-sub'},'Show the bottom-left voice guide on the site')),
            h('label',{className:'switch'},h('input',{type:'checkbox',checked:settings.aiGuideEnabled,onChange:e=>setSettings(s=>({...s,aiGuideEnabled:e.target.checked}))}),h('span',{className:'slider'}))
          ),
          h('div',{className:'backend__toggle'},
            h('div',null,h('div',{className:'backend__field-label'},'Weekly AI news'),h('div',{className:'backend__toggle-sub'},'Enable the news tab in the voice guide')),
            h('label',{className:'switch'},h('input',{type:'checkbox',checked:settings.newsEnabled,onChange:e=>setSettings(s=>({...s,newsEnabled:e.target.checked}))}),h('span',{className:'slider'}))
          ),
          h('div',{className:'backend__toggle'},
            h('div',null,h('div',{className:'backend__field-label'},'Default theme')),
            h('select',{className:'field',style:{maxWidth:200},value:settings.defaultTheme,onChange:e=>setSettings(s=>({...s,defaultTheme:e.target.value}))},h('option',{value:'dark'},'Dark'),h('option',{value:'light'},'Light'))
          ),
          h('div',{className:'backend__toggle'},
            h('div',null,h('div',{className:'backend__field-label'},'Default language')),
            h('select',{className:'field',style:{maxWidth:200},value:settings.defaultLang,onChange:e=>setSettings(s=>({...s,defaultLang:e.target.value}))},h('option',{value:'en'},'English'),h('option',{value:'zh'},'中文'))
          )
        ),
        h('div',{className:'backend__actions'},
          h('button',{className:'btn btn--primary',onClick:saveSettings},'Save settings')
        )
      ),

      h('div',{className:'backend__footer-actions'},
        h('button',{className:'btn btn--ghost',onClick:exportAll},'Export all config (JSON)'),
        h('button',{className:'btn btn--ghost',onClick:resetAll},'Reset all overrides')
      )
    )
  );
  return wrap;
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));