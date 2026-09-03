import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { getLang, translate } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings/store";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMeta(lang, {
    title: { en: "Contact Shakya", zh: "联系 Shakya" },
    description: {
      en: "Get in touch with Shakya for AI product, fintech or partnership work — email, social links and a direct message form.",
      zh: "与 Shakya 联系，洽谈 AI 产品、金融科技或合作——邮箱、社交链接与留言表单。",
    },
  });
}

export default async function ContactPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);
  const settings = getSettings();

  const emails = [
    settings.contact.emailPrimary,
    settings.contact.emailSecondary,
    ...(settings.contact.emailAliases ?? []),
  ].filter((e): e is string => Boolean(e));

  const CHANNELS = [
    ...emails.map((email) => ({
      label: t("contact.emailLabel"),
      value: email,
      href: "mailto:" + email,
      note: t("contact.emailNote"),
    })),
    {
      label: t("contact.linkedinLabel"),
      value: settings.contact.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
      href: settings.contact.linkedin,
      note: t("contact.linkedinNote"),
    },
  ];

  return (
    <div className="flex-1">
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-6 md:pt-24">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          {t("contact.eyebrow")}
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-ink md:text-5xl">
          {t("contact.title")}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          {t("contact.description")}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          {CHANNELS.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent"
            >
              <span className="text-xs font-medium uppercase tracking-widest text-accent">
                {c.label}
              </span>
              <p className="mt-3 flex items-center gap-2 text-lg font-medium text-ink">
                {c.value}
                <svg
                  className="h-4 w-4 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </p>
              <p className="mt-2 text-sm text-muted">{c.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          {t("contact.formTitle")}
        </p>
        <div className="mt-6 rounded-lg border border-line bg-surface p-6 md:p-10">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
