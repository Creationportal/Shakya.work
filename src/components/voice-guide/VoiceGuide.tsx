"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useSiteSettings } from "@/components/DesignSystemProvider";

type Lang = "en" | "zh" | "yue" | "es" | "ne";

type ManifestNode = {
  label?: Record<string, string>;
  audio?: Record<string, string>;
  text?: Record<string, string>;
  voiceAudio?: Record<string, Record<string, string>>;
};

type Manifest = {
  languages: Lang[];
  labels: Record<Lang, string>;
  speechLocales: Record<Lang, string>;
  sections: Record<string, ManifestNode>;
  news: ManifestNode & {
    updated?: string;
    voiceAudio?: Record<string, Record<string, string>>;
  };
  newsVoiceTypes?: { id: string; label: string }[];
};

const DEFAULT_LANG: Lang = "en";

const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  zh: "中文",
  yue: "粤语",
  es: "Español",
  ne: "नेपाली",
};

const SPEECH_LOCALES: Record<Lang, string> = {
  en: "en-US",
  zh: "zh-CN",
  yue: "zh-HK",
  es: "es-ES",
  ne: "ne-NP",
};

function sectionFromPath(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  if (!clean) return "home";
  const first = clean.split("/")[0];
  return first || "home";
}

export default function VoiceGuide() {
  const { t } = useTranslation();
  const { settings, ready: settingsReady } = useSiteSettings();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [tab, setTab] = useState<"guide" | "news">("guide");
  const [newsVoice, setNewsVoice] = useState("default");
  const [playing, setPlaying] = useState<{
    kind: "guide" | "news";
    key: string;
    mode: "audio" | "speech";
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [seen, setSeen] = useState(true);
  const [newsDisabled, setNewsDisabled] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  // refs so the audio error handler (registered once at mount) can read the
  // current manifest/lang without a stale closure.
  const manifestRef = useRef<Manifest | null>(null);
  const langRef = useRef<Lang>(DEFAULT_LANG);
  // refs so the route-aware effect (deps: [pathname]) always calls the latest
  // playItem / reads the current open + manifest state without restarting
  // playback on every manifest/lang change.
  const openRef = useRef(false);
  const playItemRef = useRef<
    (kind: "guide" | "news", key: string, voice?: string) => void
  >(() => {});

  /* ---- boot: load manifest + persisted prefs ---- */
  useEffect(() => {
    setMounted(true);
    setSeen(localStorage.getItem("aiGuideSeen") === "1");
    const saved = localStorage.getItem("aiGuideLang") as Lang | null;
    if (saved && LANG_LABELS[saved]) setLang(saved);
    setNewsDisabled(localStorage.getItem("aiNewsDisabled") === "1");
    fetch("/audio-guide/manifest.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((m: Manifest) => {
        // normalise labels/locales in case manifest is partial
        m.labels = { ...LANG_LABELS, ...(m.labels || {}) };
        m.speechLocales = { ...SPEECH_LOCALES, ...(m.speechLocales || {}) };
        setManifest(m);
      })
      .catch(() => {
        // Offline fallback so the widget never hard-fails.
        setManifest({
          languages: ["en"],
          labels: LANG_LABELS,
          speechLocales: SPEECH_LOCALES,
          sections: {
            home: { label: { en: "Home" }, text: { en: "Welcome to Shakya.work." } },
          },
          news: { label: { en: "Latest AI news" }, text: {}, audio: {} },
        });
      });
  }, []);

  /* ---- apply admin settings (defaults only when user has no preference) ---- */
  useEffect(() => {
    if (!settingsReady) return;
    if (!localStorage.getItem("aiGuideLang") && settings.voiceGuide.defaultLang) {
      setLang(settings.voiceGuide.defaultLang as Lang);
    }
    setNewsVoice((prev) =>
      prev === "default" && settings.voiceGuide.defaultNewsVoice
        ? settings.voiceGuide.defaultNewsVoice
        : prev
    );
    setNewsDisabled(!settings.voiceGuide.enableNews);
  }, [settingsReady, settings.voiceGuide]);

  /* ---- route awareness ---- */
  useEffect(() => {
    if (openRef.current && manifestRef.current) {
      playItemRef.current("guide", sectionFromPath(pathname));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /* keep manifest/lang/open refs fresh for the (once-mounted) effects */
  useEffect(() => {
    manifestRef.current = manifest;
    langRef.current = lang;
    openRef.current = open;
  }, [manifest, lang, open]);

  /* ---- helpers ---- */
  const nodeText = useCallback(
    (node: ManifestNode | undefined, l: Lang) =>
      (node?.text && (node.text[l] || node.text.en)) || "",
    []
  );

  const resolveUrl = useCallback(
    (node: ManifestNode | undefined, l: Lang, voice?: string) => {
      if (!node) return null;
      if (node.audio && node.audio[l]) return node.audio[l];
      if (voice && node.voiceAudio && node.voiceAudio[l]?.[voice]) {
        return node.voiceAudio[l][voice];
      }
      return null;
    },
    []
  );

  const stopAll = useCallback(() => {
    audioRef.current?.pause();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback(
    (node: ManifestNode | undefined, l: Lang) => {
      const text = nodeText(node, l);
      if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = SPEECH_LOCALES[l] || "en-US";
      u.rate = settings.voiceGuide.speechRate;
      speechRef.current = u;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      u.onend = () => {
        setPlaying((p) => (p && p.mode === "speech" ? null : p));
      };
    },
    [nodeText, settings.voiceGuide.speechRate]
  );

  const playItem = useCallback(
    (kind: "guide" | "news", key: string, voice?: string) => {
      if (!manifest) return;
      const node = kind === "news" ? manifest.news : manifest.sections[key];
      if (!node) return;
      if (kind === "news" && voice) setNewsVoice(voice);

      stopAll();
      // For news, prefer the explicitly requested voice (the select passes it);
      // fall back to the persisted newsVoice for plain plays.
      const effectiveVoice = kind === "news" ? voice ?? newsVoice : undefined;
      const url = resolveUrl(node, lang, effectiveVoice);

      if (url) {
        const audio =
          audioRef.current || (audioRef.current = new Audio());
        audio.src = url;
        audio.play().catch(() => {
          setPlaying({ kind, key, mode: "speech" });
          speak(node, lang);
        });
        setPlaying({ kind, key, mode: "audio" });
      } else {
        setPlaying({ kind, key, mode: "speech" });
        speak(node, lang);
      }
    },
    [manifest, lang, newsVoice, resolveUrl, speak, stopAll]
  );

  // Always point the ref at the latest playItem so effects with minimal deps
  // never call a stale closure.
  playItemRef.current = playItem;

  const togglePause = useCallback(() => {
    if (!playing) return;
    if (playing.mode === "speech") {
      const s = window.speechSynthesis;
      if (s.speaking && !s.paused) s.pause();
      else if (s.paused) s.resume();
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  }, [playing]);

  /* ---- audio element wiring ---- */
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnd = () => setPlaying(null);
    const onErr = () => {
      setPlaying((p) => {
        if (p && p.mode === "audio" && manifestRef.current) {
          const node =
            p.kind === "news"
              ? manifestRef.current.news
              : manifestRef.current.sections[p.key];
          speak(node, langRef.current);
        }
        return p ? { ...p, mode: "speech" } : p;
      });
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onErr);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onErr);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSeenNow = useCallback(() => {
    setSeen(true);
    localStorage.setItem("aiGuideSeen", "1");
  }, []);

  const toggleOpen = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) setSeenNow();
      localStorage.setItem("aiGuideOpen", next ? "1" : "0");
    },
    [setSeenNow]
  );

  if (!mounted) return null;

  const current = sectionFromPath(pathname);
  const languages = (manifest?.languages as Lang[]) || [DEFAULT_LANG];
  const labels = manifest?.labels || LANG_LABELS;
  const news = manifest?.news || { label: { en: "Latest AI news" }, text: {}, audio: {} };
  const newsVoices = manifest?.newsVoiceTypes || [
    { id: "default", label: "Default voice" },
  ];

  const nowLabel =
    playing &&
    (playing.kind === "news"
      ? news.label?.[lang] || news.label?.en || "Latest AI news"
      : manifest?.sections[playing.key]?.label?.[lang] ||
        manifest?.sections[playing.key]?.label?.en ||
        playing.key);

  const transcriptText = playing
    ? nodeText(
        playing.kind === "news" ? news : manifest?.sections[playing.key],
        lang
      )
    : "";

  const isPaused =
    playing?.mode === "speech"
      ? typeof window !== "undefined" &&
        !!window.speechSynthesis &&
        window.speechSynthesis.paused
      : audioRef.current
        ? audioRef.current.paused
        : true;

  return (
    <div className="vg-root">
      {/* Collapsed pill */}
      <button
        type="button"
        aria-label="Open AI Guide"
        onClick={() => toggleOpen(true)}
        className="vg-pill"
      >
        <span className="vg-eq" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="vg-pill-label">{t("voiceGuide.pillLabel")}</span>
        {!seen && <span className="vg-dot" aria-hidden="true" />}
      </button>

      {/* Expanded card */}
      {open && (
        <div className="vg-card" role="dialog" aria-label="AI Guide">
          <div className="vg-head">
            <div className="vg-title">
              {t("voiceGuide.title")}
              {!seen && <span className="vg-dot vg-dot-inline" aria-hidden="true" />}
            </div>
            <button
              type="button"
              className="vg-min"
              aria-label={t("voiceGuide.minimize")}
              onClick={() => toggleOpen(false)}
            >
              –
            </button>
          </div>

          <div className="vg-langwrap">
            <label className="sr-only" htmlFor="vg-lang">
              {t("voiceGuide.selectLanguage")}
            </label>
            <select
              id="vg-lang"
              className="vg-lang"
              value={lang}
              onChange={(e) => {
                const l = e.target.value as Lang;
                setLang(l);
                localStorage.setItem("aiGuideLang", l);
                if (playing) playItem(playing.kind, playing.key);
              }}
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {labels[l]}
                </option>
              ))}
            </select>
          </div>

          <div className="vg-tabs">
            <button
              type="button"
              className={`vg-tab ${tab === "guide" ? "active" : ""}`}
              onClick={() => {
                setTab("guide");
                playItem("guide", current);
              }}
            >
              {t("voiceGuide.guideTab")}
            </button>
            {!newsDisabled && (
              <button
                type="button"
                className={`vg-tab ${tab === "news" ? "active" : ""}`}
              onClick={() => {
                setTab("news");
                playItem("news", "news");
              }}
            >
              {t("voiceGuide.newsTab")}
            </button>
            )}
          </div>

          <div className="vg-body">
            {tab === "guide" && (
              <div className="vg-list">
                {Object.keys(manifest?.sections || {}).map((key) => {
                  const s = manifest!.sections[key];
                  const label = s.label?.[lang] || s.label?.en || key;
                  const here = key === current ? " · you are here" : "";
                  const isPlaying =
                    playing?.kind === "guide" && playing.key === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`vg-row ${isPlaying ? "playing" : ""}`}
                      onClick={() => playItem("guide", key)}
                    >
                      <span className="vg-status" aria-hidden="true">
                        {isPlaying && (
                          <>
                            <i /><i /><i /><i />
                          </>
                        )}
                      </span>
                      <span className="vg-rowlabel">
                        {label}
                        {here && <span className="vg-here">{here}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {tab === "news" && (
              <div
                className="vg-newscard"
                role="button"
                tabIndex={0}
                onClick={() => playItem("news", "news")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    playItem("news", "news");
                  }
                }}
              >
                <div className="vg-newstitle">
                  {news.label?.[lang] || news.label?.en || "Latest AI news"}
                </div>
                <div className="vg-newsdate">
                  {news.updated ? `Updated ${news.updated}` : t("voiceGuide.notGenerated")}
                </div>
                <label className="vg-field">
                  <span>{t("voiceGuide.voiceLabel")}</span>
                  <select
                    className="vg-voice"
                    value={newsVoice}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      setNewsVoice(e.target.value);
                      playItem("news", "news", e.target.value);
                    }}
                  >
                    {newsVoices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="vg-hint">{t("voiceGuide.playHint")}</div>
              </div>
            )}
          </div>

          {playing && (
            <div className="vg-player">
              <button
                type="button"
                className="vg-pp"
                aria-label={isPaused ? "Resume" : "Pause"}
                onClick={togglePause}
              >
                {isPaused ? "▶" : "❚❚"}
              </button>
              <div className="vg-meta">
                <div className="vg-now">
                  {nowLabel}
                  {playing.mode === "speech" && " · browser voice"}
                </div>
                <div className="vg-bar" aria-hidden="true">
                  <div className="vg-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <button
                type="button"
                className={`vg-transcript ${transcriptOpen ? "on" : ""}`}
                aria-label="Toggle transcript"
                aria-pressed={transcriptOpen}
                onClick={() => setTranscriptOpen((v) => !v)}
              >
                “
              </button>
            </div>
          )}

          {playing && transcriptOpen && (
            <div className="vg-transbox">{transcriptText}</div>
          )}
        </div>
      )}
    </div>
  );
}
