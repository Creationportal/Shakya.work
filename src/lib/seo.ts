import type { Metadata } from "next";

export type Lang = "en" | "zh";

export interface PageMeta {
  /** Visible page title per language. A " — Shakya.work" suffix is added automatically. */
  title: { en: string; zh: string };
  /** Unique meta description per language (avoids cross-page duplication). */
  description: { en: string; zh: string };
  /** Optional robots override (used for intentionally private pages). */
  robots?: { index?: boolean; follow?: boolean };
}

const SITE = "Shakya.work";

/**
 * Builds per-route Metadata with a consistent, brand-suffixed title and a
 * unique description. Centralising this prevents the 15-way duplicate
 * description problem (every route previously inherited the root layout's
 * description) and keeps titles long enough for crawlers while staying distinct
 * from each page's <h1>.
 */
export function pageMeta(lang: Lang, meta: PageMeta): Metadata {
  return {
    title: `${meta.title[lang]} — ${SITE}`,
    description: meta.description[lang],
    ...(meta.robots ? { robots: meta.robots } : {}),
  };
}
