"use client";

import { useLanguage } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className="inline-flex items-center overflow-hidden rounded-md border border-line text-xs font-medium"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "en"
            ? "bg-accent text-white"
            : "text-muted hover:bg-surface hover:text-ink"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "zh"
            ? "bg-accent text-white"
            : "text-muted hover:bg-surface hover:text-ink"
        }`}
      >
        中文
      </button>
    </div>
  );
}
