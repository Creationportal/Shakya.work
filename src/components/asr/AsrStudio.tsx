"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";

/**
 * AsrStudio — the client UI for the speech-to-text demo.
 *
 * Runs entirely in the browser on the Web Speech API: no API key, no audio
 * upload, and nothing leaves the device. That makes the demo permanently free
 * to run, which is the same "free path first" rule the rest of the lab follows.
 */

type Segment = {
  text: string;
  confidence: number;
  at: number;
};

const LANGS: { code: string; label: string }[] = [
  { code: "en-US", label: "English" },
  { code: "zh-CN", label: "中文" },
  { code: "zh-HK", label: "粵語" },
  { code: "es-ES", label: "Español" },
  { code: "ne-NP", label: "नेपाली" },
];

const ERROR_COPY: Record<string, string> = {
  "not-allowed": "asr.micDenied",
  "service-not-allowed": "asr.micDenied",
  "no-speech": "asr.noSpeech",
  network: "asr.network",
  "language-not-supported": "asr.langUnsupported",
};

export default function AsrStudio() {
  const { t } = useLanguage();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("en-US");
  const [interim, setInterim] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition)
    );
  }, []);

  useEffect(() => {
    if (!listening) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [listening]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    setListening(false);
    setInterim("");
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
  }, []);

  useEffect(() => () => {
    shouldListenRef.current = false;
    try {
      recRef.current?.abort();
    } catch {
      /* nothing to clean up */
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setError(t("asr.notSupported"));
      return;
    }

    setError("");
    shouldListenRef.current = true;
    setElapsed(0);

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recRef.current = rec;

    rec.onstart = () => setListening(true);

    rec.onresult = (event) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const alt = result[0];
        if (!alt) continue;
        if (result.isFinal) {
          const text = alt.transcript.trim();
          if (text) {
            setSegments((prev) => [
              ...prev,
              { text, confidence: alt.confidence, at: Date.now() },
            ]);
          }
        } else {
          pending += alt.transcript;
        }
      }
      setInterim(pending.trim());
    };

    rec.onerror = (event) => {
      shouldListenRef.current = false;
      setListening(false);
      const key = ERROR_COPY[event.error] ?? "asr.errorHint";
      setError(`${t(key)}${event.error ? ` (${event.error})` : ""}`);
    };

    // Chrome ends the session after a pause; resume while the visitor still
    // expects to be heard, unless an error already stopped us.
    rec.onend = () => {
      setInterim("");
      if (shouldListenRef.current) {
        try {
          rec.start();
          return;
        } catch {
          /* fall through to stopping */
        }
      }
      setListening(false);
    };

    try {
      rec.start();
    } catch {
      setError(t("asr.notSupported"));
      setListening(false);
    }
  }, [lang, t]);

  const transcript = segments.map((s) => s.text).join(" ");
  const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const scored = segments.filter((s) => s.confidence > 0);
  const avgConfidence = scored.length
    ? scored.reduce((sum, s) => sum + s.confidence, 0) / scored.length
    : 0;

  async function copyTranscript() {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(t("asr.copyFailed"));
    }
  }

  function downloadTranscript() {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {t("asr.freeLabel")}
          </span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label={t("asr.language")}
            className="rounded-md border border-line bg-paper px-2 py-1 text-[12px] text-ink outline-none focus:border-[#7c3aed]"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={listening ? stop : start}
          disabled={supported === false}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
            listening
              ? "bg-red-500 hover:bg-red-600"
              : "bg-[#7c3aed] hover:bg-[#6d28d9]"
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full bg-white ${
              listening ? "animate-pulse" : ""
            }`}
          />
          {listening ? t("asr.stop") : t("asr.start")}
        </button>

        <div className="mt-3 flex items-center justify-between text-[12px] text-muted">
          <span>{listening ? t("asr.listening") : t("asr.idle")}</span>
          {listening && <span>{elapsed}s</span>}
        </div>

        {supported === false && (
          <p className="mt-3 text-[12px] text-red-500">{t("asr.notSupported")}</p>
        )}
        {error && <p className="mt-3 text-[12px] text-red-500">{error}</p>}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {t("asr.transcriptLabel")}
          </h2>
          {transcript && (
            <div className="flex items-center gap-3 text-[11px]">
              <button
                type="button"
                onClick={copyTranscript}
                className="text-muted underline-offset-2 hover:underline"
              >
                {copied ? t("asr.copied") : t("asr.copy")}
              </button>
              <button
                type="button"
                onClick={downloadTranscript}
                className="text-muted underline-offset-2 hover:underline"
              >
                {t("asr.download")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSegments([]);
                  setElapsed(0);
                }}
                className="text-muted underline-offset-2 hover:underline"
              >
                {t("asr.clear")}
              </button>
            </div>
          )}
        </div>

        <div className="min-h-[120px] rounded-lg border border-line bg-paper p-4">
          {!transcript && !interim ? (
            <p className="text-sm text-muted">{t("asr.placeholder")}</p>
          ) : (
            <p className="text-sm leading-relaxed text-ink">
              {transcript}
              {interim && (
                <span className="text-muted"> {interim}</span>
              )}
            </p>
          )}
        </div>

        {segments.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-ink">{words}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">
                {t("asr.words")}
              </p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">{segments.length}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">
                {t("asr.segments")}
              </p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">
                {avgConfidence ? `${Math.round(avgConfidence * 100)}%` : "—"}
              </p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">
                {t("asr.confidence")}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[12px] text-muted">{t("asr.freeNote")}</p>
    </div>
  );
}
