import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getSettings,
  saveSettings,
  SETTINGS_COOKIE,
} from "@/lib/settings/store";
import type { SiteSettings } from "@/lib/settings/schema";

/**
 * GET  /api/settings — public read (no secrets stored in settings; the page
 *                      itself is gated, and the design provider needs this).
 * PUT  /api/settings — requires the settings_auth cookie (set by /login).
 */
export async function GET() {
  return NextResponse.json(getSettings());
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const authed = cookieStore.get(SETTINGS_COOKIE)?.value === "1";
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as SiteSettings;
    const saved = saveSettings(body);
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json(
      { error: "Could not save settings." },
      { status: 400 }
    );
  }
}
