import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const COOKIE_NAME = "portal_access";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: NextRequest) {
  const expected = process.env.ACCESS_CODE ?? "";

  // Fail closed if no access code is configured.
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Server misconfigured" },
      { status: 500 }
    );
  }
  // Brute-force protection: 10 attempts / 15 min per IP.
  if (!rateLimit(`access:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  let code = "";
  try {
    const body = await req.json();
    code = typeof body?.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (code.trim() !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid code" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "granted", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
