import Link from "next/link";
import Orb from "@/components/Orb";
import TiltCard from "@/components/TiltCard";
import orbConfig from "@/lib/orb-config.json";
import { getLang, translate } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings/store";

export async function generateMetadata() {
  const lang = await getLang();
  return {
    title: lang === "zh" ? "Shakya.work" : "Shakya.work",
  };
}

export default async function HomePage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);
  const settings = getSettings();
  const loc = settings.home;

  const heroTitle = loc.heroTitle[lang];
  const heroBody = loc.heroBody[lang];
  const summaryTitle = loc.summaryTitle[lang];
  const orbLabel = loc.orbLabel[lang];

  const SUMMARY = [
    { title: t("home.fintechTitle"), body: t("home.fintechBody") },
    { title: t("home.aiTitle"), body: t("home.aiBody") },
    { title: t("home.chinaTitle"), body: t("home.chinaBody") },
  ];

  const PROJECT = {
    title: t("projects.tradingTitle"),
    body: t("projects.tradingBody"),
    demo: "/trading",
    case: "/projects",
    caseLabel: t("home.caseStudy"),
  };

  const orb = { ...orbConfig, label: orbLabel };

  return (
    <div>
      {/* Hero */}
      <section className="relative border-b border-line">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center px-5 lg:grid-cols-2">
          <div className="py-14 lg:py-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {t("home.heroEyebrow")}
            </p>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              {heroBody}
            </p>

            {/* Secondary links */}
            <div className="mt-8 flex flex-wrap items-center gap-7">
              <Link
                href="/projects"
                className="group flex items-center gap-2 text-base font-medium text-accent hover:underline"
              >
                {t("home.viewProjects")}
                <span className="transition-transform group-hover:translate-y-0.5">
                  ↓
                </span>
              </Link>
              <Link
                href="/contact"
                className="group flex items-center gap-2 text-base font-medium text-muted transition-colors hover:text-ink"
              >
                {t("contact.title")} →
              </Link>
            </div>
            <p className="mt-12 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
              {t("home.heroMeta")}
            </p>
          </div>

          <div className="relative h-[360px] w-full lg:h-[560px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-glow),transparent_55%)] opacity-70" />
            <Orb config={orb} />
          </div>
        </div>

        {settings.design.showScrollHint && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
              {t("home.scrollHint")} ↓
            </span>
          </div>
        )}
      </section>

      {/* Professional Summary */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {t("home.summaryEyebrow")}
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {summaryTitle}
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {SUMMARY.map((s) => (
            <div
              key={s.title}
              className="rounded-lg border border-line bg-surface p-7"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-accent">
                {s.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {t("home.projectsEyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t("home.projectsTitle")}
          </h2>
          <div className="mt-12">
            <TiltCard className="h-full rounded-lg" maxTilt={7}>
              <article className="group rounded-lg border border-line bg-paper p-6 transition-colors hover:border-accent sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-ink sm:text-xl">
                      {PROJECT.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {PROJECT.body}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <Link
                        href={PROJECT.demo}
                        className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                      >
                        {t("projects.openTrading")}
                      </Link>
                      <Link
                        href={PROJECT.case}
                        className="text-sm font-medium text-muted transition-colors hover:text-ink"
                      >
                        {PROJECT.caseLabel} →
                      </Link>
                    </div>
                  </div>
                  <div className="sm:w-1/2 lg:w-5/12">
                    <div className="overflow-hidden rounded-lg border border-line">
                      <img
                        src="/projects/unified-trading-analysis.png"
                        alt={PROJECT.title}
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </article>
            </TiltCard>
          </div>
        </div>
      </section>
    </div>
  );
}
