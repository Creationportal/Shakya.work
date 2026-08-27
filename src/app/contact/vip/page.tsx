import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { getLang, translate } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings/store";
import Icon from "@/components/Icon";

export async function generateMetadata() {
  const lang = await getLang();
  return { title: lang === "zh" ? "联系 — 贵宾通道" : "Contact — VIP desk" };
}

export default async function VipContactPage() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);
  const settings = getSettings();

  const { emailPrimary, emailSecondary, linkedin, phone, wechat, github } =
    settings.contact;

  const channels = [
    {
      icon: "mail" as const,
      label: t("vip.emailLabel"),
      lines: [emailPrimary, emailSecondary],
      notes: [t("vip.emailPrimaryNote"), t("vip.emailSecondaryNote")],
      href: `mailto:${emailPrimary}`,
    },
    {
      icon: "linkedin" as const,
      label: t("vip.linkedinLabel"),
      lines: [linkedin.replace(/^https?:\/\/(www\.)?/, "")],
      notes: [t("vip.linkedinNote")],
      href: linkedin,
    },
    {
      icon: "phone" as const,
      label: t("vip.phoneLabel"),
      lines: [phone],
      notes: [t("vip.phoneNote")],
      href: `tel:${phone.replace(/\s/g, "")}`,
    },
    {
      icon: "languages" as const,
      label: t("vip.wechatLabel"),
      lines: [wechat || t("vip.onRequest")],
      notes: [t("vip.wechatNote")],
      href: wechat ? "" : `mailto:${emailPrimary}?subject=${encodeURIComponent("WeChat handle request")}`,
    },
    {
      icon: "globe" as const,
      label: t("vip.githubLabel"),
      lines: [github || t("vip.onRequest")],
      notes: [t("vip.githubNote")],
      href: github || `mailto:${emailPrimary}?subject=${encodeURIComponent("GitHub access request")}`,
    },
  ];

  return (
    <div className="flex-1">
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-6 md:pt-24">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          ← {t("vip.backToContact")}
        </Link>
        <p className="mt-8 text-xs font-medium uppercase tracking-widest text-accent">
          {t("vip.eyebrow")}
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-ink md:text-5xl">
          {t("vip.title")}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          {t("vip.description")}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => {
            const card = (
              <div className="group h-full rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Icon name={c.icon} className="h-4 w-4" />
                </span>
                <span className="mt-4 block text-xs font-medium uppercase tracking-widest text-accent">
                  {c.label}
                </span>
                {c.lines.map((line, i) => (
                  <p
                    key={`${line}-${i}`}
                    className={`mt-2 ${c.lines.length > 1 ? "text-sm" : "text-lg"} font-medium text-ink`}
                  >
                    {line}
                  </p>
                ))}
                {c.notes.map((n) => (
                  <p key={n} className="mt-2 text-sm text-muted">
                    {n}
                  </p>
                ))}
              </div>
            );
            return c.href ? (
              <Link
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block h-full"
              >
                {card}
              </Link>
            ) : (
              <div key={c.label} className="h-full">
                {card}
              </div>
            );
          })}
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
