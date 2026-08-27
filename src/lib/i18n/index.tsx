"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { en, zh } from "./dictionaries";
import type { Lang } from "./types";

const COOKIE_NAME = "lang";
const STORAGE_KEY = "lang";
const DEFAULT_LANG: Lang = "en";
const dictionaries = { en, zh };

function getByPath(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur && typeof cur === "object" && part in cur) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

function translate(key: string, lang: Lang): string {
  const value = getByPath(dictionaries[lang], key);
  if (value !== undefined) return value;
  const fallback = getByPath(dictionaries[DEFAULT_LANG], key);
  return fallback !== undefined ? fallback : key;
}

function setCookie(lang: Lang) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${lang}; path=/; SameSite=Lax; Max-Age=31536000`;
}

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Lang;
}) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(initialLang);

  const t = useCallback((key: string) => translate(key, lang), [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, next);
      }
      setCookie(next);
      if (typeof document !== "undefined") {
        document.documentElement.lang = next;
      }
      router.refresh();
    },
    [router]
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}

export function useTranslation() {
  return useLanguage();
}

export { translate };
export type { Lang };
