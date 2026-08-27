import { cookies } from "next/headers";
import { en, zh } from "./dictionaries";
import type { Lang } from "./types";

const DEFAULT_LANG: Lang = "en";
const COOKIE_NAME = "lang";
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

export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (value === "zh") return "zh";
  return DEFAULT_LANG;
}

export function translate(key: string, lang: Lang): string {
  const value = getByPath(dictionaries[lang], key);
  if (value !== undefined) return value;
  const fallback = getByPath(dictionaries[DEFAULT_LANG], key);
  return fallback !== undefined ? fallback : key;
}
