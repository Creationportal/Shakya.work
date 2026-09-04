"use client";

import { useEffect, useRef, useState } from "react";

type Lang = "en" | "zh" | "yue" | "es" | "ne";

const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "zh", label: "中文" },
  { id: "yue", label: "粤语" },
  { id: "es", label: "Español" },
  { id: "ne", label: "नेपाली" },
];

// BCP-47 codes for the browser SpeechSynthesis fallback.
const SPEECH_CODE: Record<Lang, string> = {
  en: "en-US",
  zh: "zh-CN",
  yue: "zh-HK",
  es: "es-ES",
  ne: "ne-NP",
};

export default function VoiceAgent() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [engine, setEngine] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function play(text: string, audio: string | null, eng: string) {
    setEngine(eng);
    if (audio) {
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = audio;
      await audioRef.current.play().catch(() => speakBrowser(text));
    } else {
      speakBrowser(text);
    }
  }

  function speakBrowser(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_CODE[lang];
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setError("");
    setReply("");
    try {
      const res = await fetch("/api/voice-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setReply(data.reply);
      await play(data.reply, data.audio, data.engine);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Stop any speech when the widget is closed.
  useEffect(() => {
    if (!open && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open voice agent"
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-lg shadow-violet-900/30 transition hover:bg-[#6d28d9]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[340px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-line bg-surface/95 p-4 shadow-xl shadow-black/20 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />
          <span className="text-sm font-semibold text-ink">nxt · Voice Agent</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="text-muted transition hover:text-ink"
        >
          ✕
        </button>
      </div>

      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="mb-2 w-full rounded-lg border border-line bg-paper px-2 py-1.5 text-sm text-ink outline-none"
      >
        {LANGS.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>

      <div className="max-h-40 overflow-y-auto rounded-lg bg-paper p-2 text-sm text-ink">
        {reply ? (
          <p>{reply}</p>
        ) : (
          <p className="text-muted">
            Ask about our AI Voice Agent, Enterprise Search, Sales AI, Debt
            Collection AI, or the Office Live Twin.
          </p>
        )}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        rows={2}
        placeholder="Type a message…"
        className="mt-2 w-full resize-none rounded-lg border border-line bg-paper p-2 text-sm text-ink outline-none focus:border-[#7c3aed]"
      />

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted">
          {engine === "fish-audio"
            ? "🔊 Fish Audio"
            : engine === "browser-tts"
              ? "🔊 Browser TTS"
              : ""}
        </span>
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="rounded-lg bg-[#7c3aed] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "…" : "Send"}
        </button>
      </div>

      {error && <p className="mt-2 text-[12px] text-red-500">{error}</p>}
    </div>
  );
}
