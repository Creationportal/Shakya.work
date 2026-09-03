"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CV_DATA } from "@/lib/cv-data";
import Icon from "@/components/Icon";
import CvDownloadButton from "@/components/CvDownloadButton";
import CvPrintButton from "@/components/CvPrintButton";

type CvLang = "en" | "zh";
const STORAGE_KEY = "cv_lang";

const T = {
  en: {
    backHome: "← Back to homepage",
    contact: "Contact",
    summary: "Professional summary",
    jobIntent: "Target role",
    expertise: "Areas of expertise",
    experience: "Work experience",
    projects: "Project highlights",
    workPermit: "China work authorization",
    certifications: "Certifications",
    education: "Education",
    languages: "Languages",
    chinaMarket: "China market & ecosystem",
    portfolio: "Portfolio",
    references: "References",
    referencesNote: "Contact details preserved as listed on the previous CV.",
    affiliations: "Organizations & affiliations",
    portfolioLabel: "Projects",
    portfolioGithub: "GitHub",
    portfolioBoss: "Boss直聘",
    call: "+86",
    callAlt: "+977",
  },
  zh: {
    backHome: "← 返回首页",
    contact: "联系方式",
    summary: "个人优势",
    jobIntent: "求职意向",
    expertise: "专业技能",
    experience: "工作经历",
    projects: "项目经历",
    workPermit: "在华工作资质",
    certifications: "证书资质",
    education: "教育背景",
    languages: "语言能力",
    chinaMarket: "中国市场与生态经验",
    portfolio: "作品集",
    references: "推荐人",
    referencesNote: "联系方式按上一版简历原文保留。",
    affiliations: "机构与关联组织",
    portfolioLabel: "项目",
    portfolioGithub: "GitHub",
    portfolioBoss: "Boss直聘",
    call: "+86",
    callAlt: "+977",
  },
};

export default function CvContent() {
  const [cvLang, setCvLang] = useState<CvLang>("en");
  const visitLogged = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CvLang | null;
    // Restore the visitor's last language choice after mount — reading
    // localStorage during render would cause a hydration mismatch.
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- restore persisted language after mount */
    if (saved === "zh" || saved === "en") setCvLang(saved);
  }, []);

  // Log a CV visit (fire once per mount; guards React StrictMode double-invoke
  // in dev). The endpoint is rate-limited server-side.
  useEffect(() => {
    if (visitLogged.current) return;
    visitLogged.current = true;
    fetch("/api/cv/visit", { method: "POST", keepalive: true }).catch(() => {});
  }, []);

  const toggle = useCallback(
    (next: CvLang) => {
      setCvLang(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
    },
    []
  );

  const t = T[cvLang];
  const data = CV_DATA;
  const L = (v: { en: string; zh: string }) => v[cvLang];

  const expertise = cvLang === "zh" ? data.expertiseZh : data.expertise;
  const workPermit = cvLang === "zh" ? data.workPermitZh : data.workPermit;
  const chinaMarket = cvLang === "zh" ? data.chinaMarketZh : data.chinaMarket;

  return (
    <div>
      {/* Top bar: back link + language toggle (CV-only) */}
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
          <Link
            href="/"
            className="text-muted transition-colors hover:text-ink"
          >
            {t.backHome}
          </Link>
          <div
            className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-0.5"
            role="group"
            aria-label="CV language"
          >
            <button
              type="button"
              onClick={() => toggle("en")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                cvLang === "en"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-ink"
              }`}
              aria-pressed={cvLang === "en"}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => toggle("zh")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                cvLang === "zh"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-ink"
              }`}
              aria-pressed={cvLang === "zh"}
            >
              中文
            </button>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-5 pb-20 pt-10">
        {/* Header */}
        <header className="border-b border-line pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Curriculum Vitae
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {cvLang === "zh" ? data.nameZh : data.name}{" "}
            {cvLang === "zh" ? (
              <span className="text-muted">· {data.name}</span>
            ) : (
              <span className="text-muted">· {data.nameZh}</span>
            )}
          </h1>
          <p className="mt-2 text-lg text-muted">{L(data.title)}</p>
          <p className="mt-1 text-sm text-muted">{data.location}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3 no-print">
            <CvDownloadButton />
            <CvPrintButton />
          </div>
        </header>

        {/* Contact */}
        <Section icon="mail" title={t.contact}>
          <ul className="space-y-1.5 text-sm">
            <ContactRow
              icon="globe"
              label="Site"
              value={data.contacts.site}
              href={`https://${data.contacts.site}`}
            />
            <ContactRow
              icon="pin"
              label={cvLang === "zh" ? "地址" : "Address"}
              value={data.contacts.address}
            />
            <ContactRow
              icon="mail"
              label={cvLang === "zh" ? "邮箱" : "Email"}
              value={data.contacts.emailPrimary}
              href={`mailto:${data.contacts.emailPrimary}`}
            />
            <ContactRow
              icon="mail"
              label={cvLang === "zh" ? "备用邮箱" : "Alt email"}
              value={data.contacts.emailSecondary}
              href={`mailto:${data.contacts.emailSecondary}`}
            />
            <ContactRow
              icon="phone"
              label={`${t.call} ${data.contacts.phone}`}
              value={data.contacts.phone}
              href={`tel:${data.contacts.phone.replace(/\s/g, "")}`}
            />
            <ContactRow
              icon="phone"
              label={`${t.callAlt} ${data.contacts.phoneAlt}`}
              value={data.contacts.phoneAlt}
              href={`tel:${data.contacts.phoneAlt.replace(/\s/g, "")}`}
            />
            <ContactRow
              icon="linkedin"
              label="LinkedIn"
              value={data.contacts.linkedin}
              href={`https://${data.contacts.linkedin}`}
            />
            <ContactRow
              icon="languages"
              label="WeChat"
              value={data.contacts.wechat}
            />
          </ul>
        </Section>

        {/* Summary */}
        <Section icon="users" title={t.summary}>
          <p className="text-sm leading-relaxed text-ink">{L(data.summary)}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {L(data.jobIntent)}
          </p>
        </Section>

        {/* Expertise */}
        <Section icon="tools" title={t.expertise}>
          <ul className="flex flex-wrap gap-2">
            {expertise.map((s) => (
              <li
                key={s}
                className="rounded-md border border-line bg-surface px-3 py-1 text-xs font-medium text-ink"
              >
                {s}
              </li>
            ))}
          </ul>
        </Section>

        {/* Experience */}
        <Section icon="briefcase" title={t.experience}>
          <div className="space-y-7">
            {data.experience.map((e) => (
              <article key={`${e.company}-${e.period}-${e.role.en}`}>
                <div className="flex items-start gap-4">
                  {e.logo && (
                    <div className="relative flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-md border border-line bg-paper p-1">
                      <Image
                        src={e.logo}
                        alt={e.company}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-base font-semibold text-ink">
                        {L(e.role)}
                      </h3>
                      {e.period && (
                        <span className="text-xs font-medium uppercase tracking-wide text-muted">
                          {e.period}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-accent">
                      {e.company} · {e.place}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                      {L(e.blurb)}
                    </p>
                    {e.bullets.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                        {e.bullets.map((b, i) => (
                          <li key={i}>{L(b)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* Projects */}
        <Section icon="file" title={t.projects}>
          <ul className="space-y-4">
            {data.projects.map((p) => (
              <li
                key={p.title}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="text-sm font-semibold text-ink">{p.title}</h3>
                  <span className="text-xs text-muted">{p.company}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {L(p.blurb)}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        {/* Work permit */}
        <Section icon="globe" title={t.workPermit}>
          <ul className="space-y-1.5 text-sm text-ink">
            {workPermit.map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent" />
                {line}
              </li>
            ))}
          </ul>
        </Section>

        {/* Certifications */}
        <Section icon="certificate" title={t.certifications}>
          <ul className="space-y-2">
            {data.certifications.map((c) => (
              <li
                key={c.name}
                className="flex items-start gap-3 rounded-md border border-line bg-surface p-3 text-sm"
              >
                {c.logo ? (
                  <span className="relative mt-0.5 flex h-8 w-8 flex-none items-center justify-center overflow-hidden rounded-md border border-line bg-paper p-0.5">
                    <Image
                      src={c.logo}
                      alt={c.issuer}
                      fill
                      className="object-contain"
                    />
                  </span>
                ) : (
                  <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-md bg-accent/10 text-accent">
                    <Icon name="certificate" className="h-3.5 w-3.5" />
                  </span>
                )}
                <div>
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-muted">{c.issuer}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* Education */}
        <Section icon="university" title={t.education}>
          <ul className="space-y-3">
            {data.education.map((e) => (
              <li
                key={`${e.school}-${e.period}`}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <div className="flex items-start gap-4">
                  {e.logo && (
                    <div className="relative flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-md border border-line bg-paper p-1">
                      <Image
                        src={e.logo}
                        alt={e.school}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="text-sm font-semibold text-ink">{e.school}</p>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted">
                        {e.period}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-accent">{L(e.degree)}</p>
                    <p className="text-xs text-muted">{e.place}</p>
                    {L(e.detail) !== "—" && (
                      <p className="mt-1 text-xs text-muted">{L(e.detail)}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* Languages */}
        <Section icon="languages" title={t.languages}>
          <ul className="space-y-2">
            {data.languages.map((l) => (
              <li
                key={l.name}
                className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2 text-sm"
              >
                <span className="font-medium text-ink">{l.name}</span>
                <span className="text-xs text-muted">{l.level}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* China market */}
        <Section icon="globe" title={t.chinaMarket}>
          <ul className="space-y-1.5 text-sm text-ink">
            {chinaMarket.map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent" />
                {line}
              </li>
            ))}
          </ul>
        </Section>

        {/* Portfolio */}
        <Section icon="file" title={t.portfolio}>
          <p className="text-sm text-ink">
            {t.portfolioLabel}:{" "}
            <a
              href={`https://${data.contacts.site}/projects`}
              className="text-accent hover:underline"
            >
              {data.contacts.site}/projects
            </a>{" "}
            · {t.portfolioGithub}:{" "}
            <a
              href={`https://${data.contacts.github}`}
              className="text-accent hover:underline"
            >
              {data.contacts.github}
            </a>{" "}
            · {t.portfolioBoss}: {data.contacts.bossZhipin}
          </p>
        </Section>

        {/* Affiliations / other organizations */}
        {data.affiliations.length > 0 && (
          <Section icon="globe" title={t.affiliations}>
            <ul className="flex flex-wrap gap-3">
              {data.affiliations.map((a) => (
                <li
                  key={a.name}
                  className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2"
                >
                  <span className="relative flex h-6 w-6 flex-none items-center justify-center overflow-hidden rounded-sm border border-line bg-paper p-0.5">
                    <Image
                      src={a.logo}
                      alt={a.name}
                      fill
                      className="object-contain"
                    />
                  </span>
                  <span className="text-sm text-ink">{a.name}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* References — preserved exactly from the old CV. */}
        <Section icon="users" title={t.references}>
          <ul className="space-y-3">
            {data.references.map((r) => (
              <li
                key={r.name}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <p className="text-sm font-semibold text-ink">{r.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {r.title}
                </p>
                <p className="mt-2 text-xs text-accent">{r.contact}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">{t.referencesNote}</p>
        </Section>
      </article>
    </div>
  );
}

/* -------------------------------------------------------------- */

function Section({
  icon,
  title,
  children,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 border-b border-line pb-2 text-sm font-semibold uppercase tracking-widest text-accent">
        <Icon name={icon} className="h-4 w-4" />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <span className="inline-flex items-start gap-2 text-sm">
      <Icon name={icon} className="mt-0.5 h-3.5 w-3.5 flex-none text-accent" />
      <span>
        <span className="text-xs uppercase tracking-wide text-muted">
          {label}
        </span>
        <span className="ml-2 text-ink">{value}</span>
      </span>
    </span>
  );
  return (
    <li>
      {href ? (
        <Link href={href} className="hover:text-accent">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </li>
  );
}
