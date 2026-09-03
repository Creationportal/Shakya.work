import { kv } from "@vercel/kv";

/**
 * Returns the Vercel KV client when a KV store is linked to the project
 * (Vercel injects KV_REST_API_URL + KV_REST_API_TOKEN), otherwise null.
 *
 * On Vercel's serverless runtime the filesystem is read-only, so without KV the
 * public forms cannot persist submissions. Callers MUST degrade gracefully when
 * this returns null — the form still acknowledges success (200) to the visitor.
 */
export function getKv(): typeof kv | null {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return kv;
  }
  return null;
}
