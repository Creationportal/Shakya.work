import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getKv } from "@/lib/kv";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "access-requests.json");

/**
 * Best-effort persistence.
 * 1. If Vercel KV is linked, store durably there (preferred on serverless).
 * 2. Otherwise fall back to local disk (no-ops on read-only serverless FS).
 * Either way the request is acknowledged (200) so the UI never shows a hard error.
 */
async function persistAccessRequest(record: unknown): Promise<boolean> {
  const client = getKv();
  if (client) {
    try {
      await client.rpush("access_requests", record);
      return true;
    } catch (err) {
      console.warn("[access-request] KV persist failed:", err);
      // fall through to disk best-effort
    }
  }
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let existing: unknown[] = [];
    try {
      const raw = await fs.readFile(FILE, "utf8");
      existing = JSON.parse(raw);
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }
    existing.push(record);
    await fs.writeFile(FILE, JSON.stringify(existing, null, 2), "utf8");
    return true;
  } catch (err) {
    console.warn("[access-request] persistence skipped (read-only FS?):", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  // Abuse protection: 10 requests / 15 min per IP.
  if (!rateLimit(`access-request:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again later." },
      { status: 429 },
    );
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please provide a name and a valid email." },
      { status: 400 },
    );
  }

  const persisted = await persistAccessRequest({
    name,
    email,
    message,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, persisted });
}
