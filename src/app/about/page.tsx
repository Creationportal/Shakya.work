import Link from "next/link";
import Image from "next/image";
import PageIntro from "@/components/PageIntro";
import AboutBackground from "@/components/about/AboutBackground";
import SkillsSection from "@/components/about/SkillsSection";
import { getLang, translate } from "@/lib/i18n/server";

export async function generateMetadata() {
  const lang = await getLang();
  return {
    title: lang === "zh" ? "Shakya 工作台" : "Shakya Workdesk",
  };
}

export default async function AboutPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  // Achievements and Business details are intentionally kept private and linked to /vault.
  const EMPTY = [] as const;

  return (
    <div className="relative">
      <AboutBackground />

      <PageIntro
        eyebrow={t("about.eyebrow")}
        title={t("about.title")}
        description={t("about.description")}
      />

      {/* Intro */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="rounded-xl border border-line bg-surface/80 p-6 backdrop-blur-sm sm:p-10">
          <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg border border-line">
            <Image
              src="/projects/shakya-digital.jpg"
              alt="Shakya"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="max-w-none space-y-4 text-muted">
            <p className="text-base leading-relaxed sm:text-lg">
              {t("about.introP1")}
            </p>
            <p className="text-base leading-relaxed">{t("about.introP2")}</p>
            <p className="text-base leading-relaxed">{t("about.introP3")}</p>
            <p className="text-base leading-relaxed">{t("about.introP4")}</p>
            <p className="text-base leading-relaxed">{t("about.introP5")}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/vault"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {t("about.viewResume")} →
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t("about.viewProjects")} →
            </Link>
          </div>
        </div>
      </section>

      {/* Skills */}
      <SkillsSection />

      {/* Achievements & Business */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Achievements */}
          <div className="rounded-xl border border-line bg-surface/80 p-6 backdrop-blur-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("about.achievementsEyebrow")}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
              {t("about.achievementsTitle")}
            </h2>
            <p className="mt-3 text-sm text-muted">
              {t("about.achievementsBody")}
            </p>
            <div className="mt-6">
              <Link
                href="/vault"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {t("about.achievementsVaultCta")}
              </Link>
            </div>
          </div>

          {/* Business */}
          <div className="rounded-xl border border-line bg-surface/80 p-6 backdrop-blur-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("about.businessEyebrow")}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
              {t("about.businessTitle")}
            </h2>
            <p className="mt-3 text-sm text-muted">{t("about.businessBody")}</p>
            <div className="mt-6">
              <Link
                href="/vault"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {t("about.businessVaultCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer utilities */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="flex justify-end">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-ink"
          >
            {t("about.settingsLink")}
          </Link>
        </div>
      </section>
    </div>
  );
}
