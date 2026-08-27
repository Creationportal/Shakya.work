import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { getLang, translate } from "@/lib/i18n/server";

export async function generateMetadata() {
  const lang = await getLang();
  return {
    title: lang === "zh" ? "WT — 即将上线 | shakya" : "WT — Coming Soon | shakya",
    robots: { index: false, follow: false },
  };
}

export default async function WtPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  return (
    <div>
      <PageIntro
        eyebrow={t("projects.wtStatus")}
        title={t("projects.wtTitle")}
        description={t("projects.wtBody")}
      />

      <section className="mx-auto max-w-3xl px-5 pb-24 text-center">
        <div className="rounded-xl border border-line bg-surface p-8 sm:p-12">
          <div
            className="text-5xl sm:text-6xl"
            aria-hidden="true"
          >
            🚧
          </div>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            {lang === "zh"
              ? "WT 仍在工作坊中搭建脚手架。完成后，它将把自然语言请求编译为可执行的智能体链。"
              : "WT is still in the workshop, but the scaffolding is up. When ready, it will compile natural-language requests into executable agent chains."}
          </p>
          <div className="mt-8">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-md border border-line bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              ← {t("about.viewProjects")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
