"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || t("contact.error"));
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError(t("contact.error"));
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="sr-only">
            {t("contact.namePlaceholder")}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("contact.namePlaceholder")}
            required
            className="w-full rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="sr-only">
            {t("contact.emailPlaceholder")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("contact.emailPlaceholder")}
            required
            className="w-full rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="sr-only">
          {t("contact.messagePlaceholder")}
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("contact.messagePlaceholder")}
          required
          rows={5}
          className="w-full resize-y rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
      >
        {status === "submitting" ? t("contact.sending") : t("contact.send")}
      </button>

      {status === "success" && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {t("contact.success")}
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
