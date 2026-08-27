"use client";

import { useTranslation } from "@/lib/i18n";

export default function PrintCvButton() {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink"
    >
      {t("resume.printCv")}
    </button>
  );
}
