"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

export default function RequestAccess() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("loading");
    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t("vault.somethingWrong"));
        setStatus("error");
      }
    } catch {
      setError(t("vault.networkError"));
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-sm text-muted">
        <p className="font-medium text-ink">{t("vault.requestSuccessTitle")}</p>
        <p className="mt-2">{t("vault.requestSuccessBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink">
          {t("vault.nameLabel")}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink">
          {t("vault.emailLabel")}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink">
          {t("vault.messageLabel")}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink disabled:opacity-60"
      >
        {status === "loading" ? t("vault.requesting") : t("vault.requestButton")}
      </button>
    </form>
  );
}
