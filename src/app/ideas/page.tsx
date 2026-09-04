import Link from "next/link";
import Image from "next/image";
import PageIntro from "@/components/PageIntro";
import SimulatorPreview from "@/components/agents/simulation/SimulatorPreview";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "Ideas — Product Concepts & Prototypes", zh: "创意 — 产品概念与原型" },
    description: {
      en: "A working notebook of product concepts and prototypes from Shakya — simulations, trading ideas and early experiments.",
      zh: "Shakya 的产品概念与原型工作笔记——模拟、交易想法与早期实验。",
    },
  });
}

export default async function IdeasPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  const IDEAS = [
    {
      key: "simulation",
      href: "/ailab/simulation",
      title: t("ideas.simulationTitle"),
      body: t("ideas.simulationBody"),
      label: t("ideas.simulationLabel"),
      preview: <SimulatorPreview className="h-full w-full" />,
    },
    {
      key: "trading",
      href: "/trading",
      title: t("ideas.tradingTitle"),
      body: t("ideas.tradingBody"),
      label: t("ideas.tradingLabel"),
      preview: (
        <div className="relative h-full w-full">
          <Image
            src="/projects/unified-trading-analysis.png"
            alt={t("ideas.tradingTitle")}
            fill
            sizes="(min-width: 1024px) 30vw, 100vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ),
    },
    {
      key: "agentflow",
      href: "/ideas/agent-operation-flow",
      title: t("ideas.agentFlowTitle"),
      body: t("ideas.agentFlowBody"),
      label: t("ideas.agentFlowLabel"),
      preview: (
        <div className="relative h-full w-full">
          <Image
            src="/agent-operation-flow/screenshot.png"
            alt={t("ideas.agentFlowTitle")}
            fill
            sizes="(min-width: 1024px) 30vw, 100vw"
            className="object-cover object-top"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageIntro
        eyebrow={t("ideas.eyebrow")}
        title={t("ideas.title")}
        description={t("ideas.description")}
      />
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {IDEAS.map((idea) => (
            <Link
              key={idea.key}
              href={idea.href}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface p-0 transition-colors hover:border-accent"
            >
              {idea.preview && (
                <div className="aspect-[3/2] w-full overflow-hidden border-b border-line bg-paper">
                  {idea.preview}
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                  {idea.label}
                </span>
                <h2 className="mt-2 text-base font-semibold text-ink">
                  {idea.title}
                </h2>
                <p className="mt-2 flex-1 text-sm text-muted">{idea.body}</p>
                <span className="mt-4 inline-block text-sm text-accent group-hover:underline">
                  {t("ailab.open")} →
                </span>
              </div>
            </Link>
          ))}
          <div className="flex flex-col justify-center rounded-lg border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
            <p>{t("ideas.moreSoon")}</p>
          </div>
        </div>
      </section>

      {/* Blog — articles and news highlights */}
      {(() => {
        type BlogEntry = {
          kind: "article" | "news";
          date: string;
          href: string;
          title: { en: string; zh: string };
          body: { en: string; zh: string };
        };

        const BLOG: BlogEntry[] = [
          {
            kind: "news",
            date: "2026-09-04",
            href: "/ailab",
            title: {
              en: "AI Lab refresh — TTS, ASR, RAG and Voice Ops live in one place",
              zh: "AI 实验室改版——TTS、ASR、检索与语音运营汇聚一处",
            },
            body: {
              en: "The four R&D studios are now embedded directly on the AI Lab page — try them without leaving it.",
              zh: "四个研发工作室已直接嵌入 AI 实验室页面——无需跳转即可体验。",
            },
          },
          {
            kind: "article",
            date: "2026-08-30",
            href: "/ailab/ai-rnd",
            title: {
              en: "Designing enterprise search that answers, not lists",
              zh: "设计能回答问题、而非罗列结果的企业搜索",
            },
            body: {
              en: "Why chunk boundaries and overlap decide retrieval quality long before the embedding model does.",
              zh: "为什么切分边界与重叠策略，远比向量模型更能决定检索质量。",
            },
          },
          {
            kind: "article",
            date: "2026-08-22",
            href: "/ailab/ai-rnd",
            title: {
              en: "The free-tier discipline: shipping AI without API keys",
              zh: "免费额度纪律：不依赖 API 密钥也能上线 AI",
            },
            body: {
              en: "Browser speech, keyword retrieval and graceful degradation — a product rule, not just a budget constraint.",
              zh: "浏览器语音、关键词检索与优雅降级——这是产品原则，而不只是预算约束。",
            },
          },
          {
            kind: "news",
            date: "2026-08-15",
            href: "/ailab/simulation",
            title: {
              en: "Office Live Twin: humans and AI agents share one floor",
              zh: "Office Live Twin：人类员工与 AI 智能体共享同一楼层",
            },
            body: {
              en: "A 2D hybrid-office simulation with a 24/7 day/night loop is now live in the AI Lab.",
              zh: "带 24/7 昼夜循环的 2D 混合办公模拟已在 AI 实验室上线。",
            },
          },
          {
            kind: "article",
            date: "2026-08-05",
            href: "/ailab/ai-rnd",
            title: {
              en: "Six voice environments, one latency budget",
              zh: "六个语音环境，同一条延迟预算",
            },
            body: {
              en: "Notes on keeping capture-to-playback round trips predictable across regions and providers.",
              zh: "关于跨区域、跨供应商保持端到端延迟可预测的实践笔记。",
            },
          },
          {
            kind: "news",
            date: "2026-06-30",
            href: "/contact",
            title: {
              en: "WAIC 2026 Shanghai — see you there",
              zh: "WAIC 2026 上海见",
            },
            body: {
              en: "We will be at the World AI Conference in Shanghai — enterprise agents, voice automation and more.",
              zh: "我们将参展上海世界人工智能大会——企业级智能体、语音自动化等更多内容。",
            },
          },
        ];

        return (
          <section className="mx-auto max-w-6xl px-5 pb-24">
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              {t("ideas.blogTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted">{t("ideas.blogBody")}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BLOG.map((post) => (
                <Link
                  key={post.title.en}
                  href={post.href}
                  className="group flex flex-col rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent"
                >
                  <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    {post.kind === "article"
                      ? t("ideas.blogArticle")
                      : t("ideas.blogNews")}
                    <span className="font-normal normal-case tracking-normal text-muted">
                      · {post.date}
                    </span>
                  </span>
                  <h3 className="mt-2 text-base font-semibold leading-snug text-ink">
                    {post.title[lang]}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {post.body[lang]}
                  </p>
                  <span className="mt-4 inline-block text-sm text-accent group-hover:underline">
                    {t("ailab.open")} →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
