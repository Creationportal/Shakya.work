"use client";

import { useRef } from "react";
import Link from "next/link";
import { useSimulation } from "./useSimulation";
import { useTranslation } from "@/lib/i18n";

export default function SimulationView() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { running, counts, start, stop } = useSimulation(canvasRef);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20">
      <div className="mb-6">
        <Link
          href="/ailab"
          className="text-sm text-muted transition-colors hover:text-accent"
        >
          ← {t("simulator.backToAgents")}
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Current scenario */}
        <div className="rounded-xl border border-line bg-surface p-6">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted">
            {t("simulator.currentScenario")}
          </h2>
          <h3 className="mt-3 text-xl font-medium text-ink">
            {t("simulator.scenarioTitle")}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t("simulator.scenarioBody")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-accent">
              {t("simulator.badgeAgents")}
            </span>
            <span className="inline-flex items-center rounded-full border border-line px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted">
              {t("simulator.badgeLive")}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-6">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted">
              {t("simulator.controls")}
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={start}
                disabled={running}
                className={`rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-opacity ${
                  running
                    ? "cursor-not-allowed bg-accent/50 text-white"
                    : "bg-accent text-white hover:bg-accent-ink"
                }`}
              >
                {t("simulator.run")}
              </button>
              <button
                type="button"
                onClick={stop}
                disabled={!running}
                className={`rounded-md border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  !running
                    ? "cursor-not-allowed text-muted/50"
                    : "text-ink hover:bg-paper"
                }`}
              >
                {t("simulator.stop")}
              </button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-wider text-muted">
            <span>
              {t("simulator.aiAgents")}: {counts.agents}
            </span>
            <span>
              {t("simulator.humans")}: {counts.humans}
            </span>
            <span>{counts.phase}</span>
          </div>
        </div>
      </div>

      {/* Canvas stage */}
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-paper">
        <div className="relative w-full" style={{ aspectRatio: "1280/896" }}>
          <canvas
            ref={canvasRef}
            width={1280}
            height={896}
            className="absolute inset-0 h-full w-full"
            aria-label={t("simulator.canvasLabel")}
          />
        </div>
      </div>
    </div>
  );
}
