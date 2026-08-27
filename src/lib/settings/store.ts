import fs from "node:fs";
import path from "node:path";
import { DEFAULT_SETTINGS, type SiteSettings } from "./schema";

const DATA_DIR = path.join(process.cwd(), ".data");
const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");

/** Recursively merge a partial object over the defaults (missing keys kept). */
function merge<T>(base: T, patch: unknown): T {
  if (patch == null || typeof patch !== "object") return base;
  if (Array.isArray(patch) || typeof base !== "object" || base === null) {
    return (patch as T) ?? base;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(patch as Record<string, unknown>)) {
    const baseVal = out[key];
    const patchVal = (patch as Record<string, unknown>)[key];
    out[key] =
      baseVal && typeof baseVal === "object"
        ? merge(baseVal, patchVal)
        : (patchVal ?? baseVal);
  }
  return out as T;
}

function normalizeSettings(raw: unknown): SiteSettings {
  return merge(DEFAULT_SETTINGS, raw ?? {});
}

/** Server-only: read settings from disk (falls back to defaults). */
export function getSettings(): SiteSettings {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) return DEFAULT_SETTINGS;
    const raw = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
    return normalizeSettings(raw);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Server-only: persist settings to disk. */
export function saveSettings(next: SiteSettings): SiteSettings {
  const normalized = normalizeSettings(next);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(normalized, null, 2));
  return normalized;
}

/** Server-only: read a single section with defaults applied. */
export function getSettingsSection<K extends keyof SiteSettings>(
  key: K
): SiteSettings[K] {
  return getSettings()[key];
}

/**
 * Password that unlocks the /settings backend. Set via the SETTINGS_PASSWORD
 * environment variable (see .env.local). No hardcoded fallback: if unset the
 * backend fails closed (login always rejects).
 */
export const SETTINGS_PASSWORD = process.env.SETTINGS_PASSWORD ?? "";
export const SETTINGS_COOKIE = "settings_auth";
