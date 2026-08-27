import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { rateLimit, clientIp } from "@/lib/rate-limit";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const MAX_LEN = 5000;

export async function POST(request: Request) {
  try {
    // Abuse protection: 10 messages / 15 min per IP.
    if (!rateLimit(`contact:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }
    const body = await request.json();
    let { name = "", email = "", message = "" } = body;
    name = typeof name === "string" ? name : "";
    email = typeof email === "string" ? email : "";
    message = typeof message === "string" ? message : "";

    if (!name.trim() || !email.trim() || !message.trim()) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    if (
      name.length > MAX_LEN ||
      email.length > MAX_LEN ||
      message.length > MAX_LEN
    ) {
      return NextResponse.json(
        { error: "Message is too long." },
        { status: 413 }
      );
    }

    const dataDir = path.join(process.cwd(), ".data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const filePath = path.join(dataDir, "contact-messages.json");
    const entries: any[] = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf8"))
      : [];

    entries.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    });

    fs.writeFileSync(filePath, JSON.stringify(entries, null, 2));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
