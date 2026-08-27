"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

export default function AccessForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.replace("/cv");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t("vault.accessDenied"));
      }
    } catch {
      setError(t("vault.somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={t("vault.accessCodePlaceholder")}
        autoComplete="off"
        className="w-full rounded-md border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink disabled:opacity-60"
      >
        {loading ? t("vault.checking") : t("vault.unlock")}
      </button>
    </form>
  );
}
