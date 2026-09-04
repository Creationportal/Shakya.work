"use client";

import { useEffect, useRef, useState } from "react";
import TtsStudio from "@/components/tts/TtsStudio";
import AsrStudio from "@/components/asr/AsrStudio";
import RagStudio from "@/components/rag/RagStudio";
import VoiceOpsStudio from "@/components/voice-ops/VoiceOpsStudio";
import { useTranslation } from "@/lib/i18n";

/**
 * LiveModules — the four AI R&D studios (TTS+, ASR+, RAG+, Voice Ops)
 * embedded directly on the AI Lab page as one tabbed section. All studios
 * stay mounted so in-progress state (typed text, transcript, inputs)
 * survives tab switches; the inactive ones are hidden via CSS.
 *
 * Deep links: /ailab#live-tts | #live-asr | #live-rag | #live-voiceops
 * preselect the matching tab and scroll the section into view.
 */

const MODULES = [
  { id: "tts", titleKey: "tts.title", descKey: "tts.description", hash: "live-tts" },
  { id: "asr", titleKey: "asr.title", descKey: "asr.description", hash: "live-asr" },
  { id: "rag", titleKey: "rag.title", descKey: "rag.description", hash: "live-rag" },
  {
    id: "voiceops",
    titleKey: "voiceops.title",
    descKey: "voiceops.description",
    hash: "live-voiceops",
  },
] as const;

type ModuleId = (typeof MODULES)[number]["id"];

export default function LiveModules() {
  const { t } = useTranslation();
  const [active, setActive] = useState<ModuleId>("tts");
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Deep links: /ailab#live-asr preselects the ASR tab.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const found = MODULES.find((m) => m.hash === hash);
    if (found) {
      setActive(found.id);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const current = MODULES.find((m) => m.id === active) ?? MODULES[0];

  return (
    <div ref={sectionRef} className="scroll-mt-24 rounded-xl border border-line bg-surface">
      {/* Tab bar */}
      <div
        className="flex flex-wrap gap-1 border-b border-line p-2"
        role="tablist"
        aria-label="AI R&D live modules"
      >
        {MODULES.map((m) => (
          <button
            key={m.id}
            id={`tab-${m.id}`}
            type="button"
            role="tab"
            aria-selected={active === m.id}
            aria-controls={`panel-${m.id}`}
            onClick={() => setActive(m.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              active === m.id
                ? "bg-accent text-white"
                : "text-muted hover:bg-paper hover:text-ink"
            }`}
          >
            {t(m.titleKey)}
          </button>
        ))}
      </div>

      {/* Active module description */}
      <p className="border-b border-line px-5 py-3 text-sm leading-relaxed text-muted">
        {t(current.descKey)}
      </p>

      {/* Studios — all mounted, only the active one visible */}
      <div className="p-5 sm:p-6">
        {MODULES.map((m) => (
          <div
            key={m.id}
            id={`panel-${m.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${m.id}`}
            hidden={active !== m.id}
          >
            {m.id === "tts" && <TtsStudio />}
            {m.id === "asr" && <AsrStudio />}
            {m.id === "rag" && <RagStudio />}
            {m.id === "voiceops" && <VoiceOpsStudio />}
          </div>
        ))}
      </div>
    </div>
  );
}
