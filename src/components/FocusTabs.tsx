"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

type TabKey = "fintech" | "ai" | "china" | "ecosystem";

export default function FocusTabs() {
  const { t } = useTranslation();
  const tabs: { key: TabKey; label: string }[] = [
    { key: "fintech", label: t("focusTabs.fintechLabel") },
    { key: "ai", label: t("focusTabs.aiLabel") },
    { key: "china", label: t("focusTabs.chinaLabel") },
    { key: "ecosystem", label: t("focusTabs.ecosystemLabel") },
  ];
  const [active, setActive] = useState<TabKey>("fintech");

  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <div
        role="tablist"
        aria-label={t("focusTabs.label")}
        className="flex flex-wrap gap-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === tab.key
                ? "bg-accent text-white"
                : "bg-paper text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <h3 className="text-lg font-semibold text-ink">
          {t(`focusTabs.${active}Title`)}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {t(`focusTabs.${active}Body`)}
        </p>
      </div>
    </div>
  );
}
