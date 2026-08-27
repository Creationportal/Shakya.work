import { NextResponse } from "next/server";
import { SETTINGS_COOKIE } from "@/lib/settings/store";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(SETTINGS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
