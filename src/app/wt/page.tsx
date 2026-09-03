import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLang } from "@/lib/i18n/server";
import { WtApp } from "./WtApp";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title:
      lang === "zh"
        ? "WT · 体重与里程碑追踪器 | Shakya.work"
        : "WT · Weight & Milestone Tracker | Shakya.work",
    robots: { index: false },
  };
}

export default async function WeightTrackerPage() {
  // /wt is a private/gated route (noindex). Require the vault access code so it
  // is consistent with /cv and /vault and not reachable by direct URL.
  const cookieStore = await cookies();
  if (cookieStore.get("portal_access")?.value !== "granted") redirect("/vault");
  return (
    <div className="min-h-dvh bg-[#0b0f1a]">
      <WtApp />
    </div>
  );
}
