"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation, useLanguage } from "@/lib/i18n";
import { useSiteSettings } from "@/components/DesignSystemProvider";

const HEADER_NAV = [
  { key: "ailab", href: "/ailab" },
  { key: "projects", href: "/projects" },
  { key: "ideas", href: "/ideas" },
  { key: "about", href: "/about" },
  { key: "vault", href: "/vault" },
  { key: "contact", href: "/contact" },
] as const;

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { settings } = useSiteSettings();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-ink"
          onClick={() => setOpen(false)}
        >
          {lang === "zh" ? settings.site.nameZh : settings.site.name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {HEADER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors ${
                isActive(item.href)
                  ? "font-medium text-accent"
                  : "text-muted hover:text-ink"
              }`}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        {/* Desktop controls */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-ink"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("header.openToCollaboration")}
          </Link>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink md:hidden"
        >
          <span className="text-lg leading-none">{open ? "✕" : "≡"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-line bg-paper md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col px-5 py-2">
            {HEADER_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block py-2.5 text-sm ${
                    isActive(item.href)
                      ? "font-medium text-accent"
                      : "text-muted"
                  }`}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
            <li className="mt-3 flex items-center gap-3 border-t border-line py-3">
              <ThemeToggle />
              <LanguageSwitcher />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
