"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import SettingsForm from "./SettingsForm";
import CvAnalyticsDashboard from "./CvAnalyticsDashboard";

/** Gates /settings behind the admin password (checked server-side via
 *  POST /api/settings/login which sets an httpOnly cookie). */
export default function SettingsGate({ authed }: { authed: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const unlock = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setBusy(true);
      setError(false);
      try {
        const res = await fetch("/api/settings/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (res.ok) {
          router.refresh();
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setBusy(false);
      }
    },
    [password, router]
  );

  if (authed) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-14 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {t("settings.eyebrow")}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {t("settings.title")}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          {t("settings.description")}
        </p>
        <SettingsForm />
        <CvAnalyticsDashboard />
      </div>
    );
  }

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-5 py-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {t("settings.loginTitle")}
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {t("settings.loginTitle")}
      </h1>
      <p className="mt-2 text-sm text-muted">{t("settings.loginBody")}</p>
      <form onSubmit={unlock} className="mt-6 space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("settings.passwordPlaceholder")}
          autoComplete="current-password"
          className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
        {error && (
          <p className="text-sm text-red-500">{t("settings.invalidPassword")}</p>
        )}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "…" : t("settings.loginButton")}
        </button>
      </form>
    </section>
  );
}
