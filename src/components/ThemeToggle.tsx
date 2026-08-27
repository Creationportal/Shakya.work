"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

export default function ThemeToggle() {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    if (next) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setIsDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme.toggle")}
      className="flex h-8 items-center gap-2 rounded-md border border-line px-3 text-xs font-medium text-ink transition-colors hover:bg-surface"
    >
      <span className="text-sm">{isDark ? "☀" : "☾"}</span>
      <span className="hidden sm:inline">
        {isDark ? t("theme.light") : t("theme.dark")}
      </span>
    </button>
  );
}
