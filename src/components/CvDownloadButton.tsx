"use client";

import { useEffect, useState } from "react";
import { useSiteSettings } from "@/components/DesignSystemProvider";
import { useTranslation } from "@/lib/i18n";
import Icon from "@/components/Icon";

/**
 * CV PDF download button. Reads the PDF path from /settings and verifies the
 * file actually exists before offering a download — until the real PDF is
 * uploaded it falls back to a "Request PDF" mailto, so the button always works.
 */
export default function CvDownloadButton({
  variant = "default",
}: {
  variant?: "default" | "hero";
}) {
  const { settings, ready } = useSiteSettings();
  const { t } = useTranslation();
  const [exists, setExists] = useState<boolean | null>(null);

  const pdfPath = settings.cv.pdfPath;
  const pdfFilename = settings.cv.pdfFilename;

  useEffect(() => {
    let cancelled = false;
    if (!pdfPath) {
      setExists(false);
      return;
    }
    fetch(pdfPath, { method: "HEAD", cache: "no-store" })
      .then((r) => {
        if (!cancelled) setExists(r.ok);
      })
      .catch(() => {
        if (!cancelled) setExists(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pdfPath, ready]);

  const mailto = `mailto:${settings.contact.emailPrimary}?subject=${encodeURIComponent(
    "CV request — Shakya Pranamya"
  )}`;

  if (exists === null) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted ${
          variant === "hero" ? "border-line" : ""
        }`}
        aria-hidden="true"
      >
        <Icon name="download" className="h-4 w-4" />
        …
      </span>
    );
  }

  const base = exists
    ? "inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
    : "inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent";

  return exists ? (
    <a href={pdfPath} download={pdfFilename} className={base}>
      <Icon name="download" className="h-4 w-4" />
      {t("cv.downloadPdf")}
    </a>
  ) : (
    <a href={mailto} className={base}>
      <Icon name="file" className="h-4 w-4" />
      {t("cv.requestPdf")}
    </a>
  );
}
