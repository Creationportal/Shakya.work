import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCvAnalytics } from "@/lib/cv-analytics";
import { SETTINGS_COOKIE } from "@/lib/settings/store";

/**
 * GET /api/cv/analytics — returns aggregated CV visit stats for the /settings
 * dashboard. Must be called with the settings_auth cookie (set by /login),
 * otherwise 401. The raw visit log is never exposed without auth.
 */
export async function GET() {
  const cookieStore = await cookies();
  const authed = cookieStore.get(SETTINGS_COOKIE)?.value === "1";
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getCvAnalytics());
}
