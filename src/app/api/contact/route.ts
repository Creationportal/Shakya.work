import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getKv } from "@/lib/kv";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const MAX_LEN = 5000;

interface ContactEntry {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

/**
 * Best-effort persistence.
 * 1. If Vercel KV is linked, store durably there (preferred on serverless).
 * 2. Otherwise fall back to local disk (works in dev / Node, no-ops on read-only
 *    serverless FS). Either way the visitor's submission must never 500.
 */
async function persistContact(entry: ContactEntry): Promise<boolean> {
  const client = getKv();
  if (client) {
    try {
      await client.rpush("contact_messages", entry);
      return true;
    } catch (err) {
      console.warn("[contact] KV persist failed:", err);
      // fall through to disk best-effort
    }
  }
  try {
    const dataDir = path.join(process.cwd(), ".data");
    await fs.mkdir(dataDir, { recursive: true });
    const filePath = path.join(dataDir, "contact-messages.json");
    let entries: ContactEntry[] = [];
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) entries = parsed as ContactEntry[];
    } catch {
      // No existing file yet — start fresh.
    }
    entries.push(entry);
    await fs.writeFile(filePath, JSON.stringify(entries, null, 2));
    return true;
  } catch (err) {
    console.warn("[contact] persistence skipped (read-only FS?):", err);
    return false;
  }
}

export async function POST(request: Request) {
  // Abuse protection: 10 messages / 15 min per IP.
  if (!rateLimit(`contact:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name = "", email = "", message = "" } = (body ?? {}) as Record<
    string,
    unknown
  >;
  const n = typeof name === "string" ? name : "";
  const e = typeof email === "string" ? email : "";
  const m = typeof message === "string" ? message : "";

  if (!n.trim() || !e.trim() || !m.trim()) {
    return NextResponse.json(
      { error: "Please fill in all fields." },
      { status: 400 }
    );
  }
  if (!isValidEmail(e)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (n.length > MAX_LEN || e.length > MAX_LEN || m.length > MAX_LEN) {
    return NextResponse.json({ error: "Message is too long." }, { status: 413 });
  }

  const persisted = await persistContact({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: n.trim(),
    email: e.trim(),
    message: m.trim(),
    createdAt: new Date().toISOString(),
  });

  // Success regardless of persistence: a read-only filesystem must not make the
  // public contact form look broken to a legitimate visitor.
  return NextResponse.json({ success: true, persisted }, { status: 200 });
}
