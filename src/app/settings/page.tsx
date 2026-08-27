import { cookies } from "next/headers";
import { getLang } from "@/lib/i18n/server";
import { SETTINGS_COOKIE } from "@/lib/settings/store";
import SettingsGate from "@/components/settings/SettingsGate";

export async function generateMetadata() {
  const lang = await getLang();
  return {
    title: lang === "zh" ? "设置" : "Settings",
    // Admin page: never index or follow from search engines.
    robots: { index: false, follow: false },
  };
}

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get(SETTINGS_COOKIE)?.value === "1";
  return <SettingsGate authed={authed} />;
}
