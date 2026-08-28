"use client";

import Link from "next/link";
import { useTranslation, useLanguage } from "@/lib/i18n";
import { useSiteSettings } from "@/components/DesignSystemProvider";

const LEGAL_LINKS = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
  { key: "accessibility", href: "/accessibility" },
] as const;

export default function SiteFooter() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { settings } = useSiteSettings();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink">
              {lang === "zh" ? settings.site.nameZh : settings.site.name}
            </p>
          </div>

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

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row">
          <p>{t("footer.rights").replace("{year}", String(new Date().getFullYear()))}</p>
          <p className="text-[10px] uppercase tracking-widest">v2.0-test-1</p>
        </div>
      </div>
    </footer>
  );
}
