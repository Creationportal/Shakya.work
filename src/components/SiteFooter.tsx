"use client";

import Link from "next/link";
import { useTranslation, useLanguage } from "@/lib/i18n";
import { useSiteSettings } from "@/components/DesignSystemProvider";

const LEGAL_LINKS = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
  { key: "accessibility", href: "/accessibility" },
] as const;

// Public, resolving profiles (same handles as /cv). X/Twitter has no public
// profile yet — add it here when one exists.
const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Creationportal" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/shakya-pranamya" },
] as const;

export default function SiteFooter() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { settings } = useSiteSettings();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="text-lg font-semibold tracking-tight text-ink">
              {lang === "zh" ? settings.site.nameZh : settings.site.name}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <nav className="flex flex-wrap gap-x-7 gap-y-2" aria-label="Social">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {item.label} ↗
                </a>
              ))}
            </nav>
            <nav className="flex flex-wrap gap-x-7 gap-y-2">
              {LEGAL_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {t(`footer.${item.key}`)}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row">
          <p>{t("footer.rights").replace("{year}", String(new Date().getFullYear()))}</p>
        </div>
      </div>
    </footer>
  );
}
