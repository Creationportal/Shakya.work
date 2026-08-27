"use client";

import PageIntro from "@/components/PageIntro";
import { useTranslation } from "@/lib/i18n";

export default function UnderDev({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <PageIntro eyebrow={eyebrow} title={title} />
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
          <p className="font-medium text-ink">{t("underDev.title")}</p>
          <p className="mt-2">{t("underDev.body").replace("{title}", title)}</p>
        </div>
      </section>
    </div>
  );
}
