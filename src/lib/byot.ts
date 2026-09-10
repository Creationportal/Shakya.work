/**
 * BYOT — Bring Your Own Token.
 *
 * Visitors can paste their own provider API keys to unlock the live AI demos
 * (voice-agent chat, Fish Audio TTS) without this site owning any usage cost.
 *
 * Security model:
 * - Keys are stored ONLY in the visitor's browser (localStorage).
 * - They are attached to individual demo requests (body `byot` field) and used
 *   transiently in-memory by the server route. They are never persisted,
 *   logged, cached, or echoed back.
 * - If no visitor key is present, the routes fall back to the site's own env
 *   keys, and then to the browser/demo fallbacks — same behavior as before.
 */

export type ByotChat = { key: string; url?: string; model?: string };
export type ByotFish = { key: string; voiceId?: string };
export type Byot = { chat?: ByotChat; fish?: ByotFish };

const LS_KEY = "shakya.byot.v1";
const MAX_KEY_CHARS = 256;
const MAX_URL_CHARS = 300;
const MAX_MODEL_CHARS = 120;

function clean(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const s = value.trim();
  // Reject control characters / whitespace inside keys.
  if (!s || /[\s\u0000-\u001f]/.test(s) || s.length > max) return undefined;
  return s;
}

function sanitize(raw: unknown): Byot {
  const out: Byot = {};
  if (!raw || typeof raw !== "object") return out;
  const r = raw as { chat?: ByotChat; fish?: ByotFish };
  const chatKey = clean(r.chat?.key, MAX_KEY_CHARS);
  if (chatKey) {
    out.chat = {
      key: chatKey,
      url: clean(r.chat?.url, MAX_URL_CHARS),
      model: clean(r.chat?.model, MAX_MODEL_CHARS),
    };
  }
  const fishKey = clean(r.fish?.key, MAX_KEY_CHARS);
  if (fishKey) {
    out.fish = {
      key: fishKey,
      voiceId: clean(r.fish?.voiceId, MAX_MODEL_CHARS),
    };
  }
  return out;
}

/** Read the visitor's stored keys. Safe on the server (returns {}). */
export function readByot(): Byot {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? sanitize(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

/** Persist the visitor's keys in their own browser only. */
export function writeByot(byot: Byot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(sanitize(byot)));
  } catch {
    // storage full/blocked — non-fatal, demos fall back
  }
}

/** Remove the visitor's keys from this browser. */
export function clearByot(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // ignore
  }
}

/** Merge the visitor's stored keys into an outgoing demo-request body (client only). */
export function withByot<T extends object>(body: T): T & { byot?: Byot } {
  const byot = readByot();
  return Object.keys(byot).length ? { ...body, byot } : { ...body };
}

/**
 * Server-side: extract and sanitize a visitor-supplied key config from a
 * request body. Size-capped, trimmed, control-characters rejected. Nothing is
 * ever persisted or logged.
 */
export function parseByotInput(input: unknown): Byot {
  return sanitize(input);
}
