import { NextResponse } from "next/server";
import { SETTINGS_COOKIE, SETTINGS_PASSWORD } from "@/lib/settings/store";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/** POST { password } → validates against SETTINGS_PASSWORD (env) and sets an
 *  httpOnly settings_auth cookie on success. Rate-limited and fails closed. */
export async function POST(request: Request) {
  try {
    // Fail closed if no password is configured.
    if (!SETTINGS_PASSWORD) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }
    // Brute-force protection: 10 attempts / 15 min per IP.
    if (!rateLimit(`login:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }
    const body = await request.json();
    const { password } = body as { password?: string };
    if (password !== SETTINGS_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const res = NextResponse.json({ success: true });
    res.cookies.set(SETTINGS_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8h session
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
