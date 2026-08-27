/**
 * Tiny in-memory sliding-window rate limiter.
 *
 * Adequate for a single-instance Node server (next dev / a single container).
 * For horizontally-scaled deployments, swap the backing store for Redis/Upstash.
 */

const buckets = new Map<string, number[]>();

/**
 * Returns true if the request for `key` is allowed, false if the limit is hit.
 * Tracks timestamps within `windowMs` and enforces `limit` hits.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = buckets.get(key) ?? [];
  const recent = hits.filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

/** Best-effort client identifier from proxy headers, falling back to "unknown". */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
