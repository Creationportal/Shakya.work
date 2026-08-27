"use client";

import { useTranslation } from "@/lib/i18n";
import Icon from "@/components/Icon";

export default function CvPrintButton() {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent"
    >
      <Icon name="file" className="h-4 w-4" />
      {t("cv.print")}
    </button>
  );
}
