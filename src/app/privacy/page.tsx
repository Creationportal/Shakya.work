import Link from "next/link";
import { getLang } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";
import { legalContent } from "@/lib/legal-content";

export async function generateMetadata() {
  const lang = await getLang();
  const c = legalContent.privacy;
  return pageMeta(lang, {
    title: { en: c.en.metaTitle, zh: c.zh.metaTitle },
    description: { en: c.en.metaDescription, zh: c.zh.metaDescription },
  });
}

export default async function PrivacyPage() {
  const lang = await getLang();
  const data = legalContent.privacy[lang];

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:pt-20">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">
        {data.eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {data.title}
      </h1>
      <p className="mt-4 text-lg text-muted">{data.lede}</p>
      <p className="mt-2 text-xs font-mono uppercase tracking-widest text-muted">
        {data.updated}
      </p>

      <article className="mt-10 space-y-8">
        {data.sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {s.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
          </section>
        ))}
        {data.contactTitle && (
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {data.contactTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              <a
                href="mailto:creationpanel@gmail.com"
                className="text-accent hover:underline"
              >
                creationpanel@gmail.com
              </a>
            </p>
          </section>
        )}
        {data.note && (
          <p className="border-l-2 border-accent/40 pl-4 text-xs text-muted">
            {data.note}
          </p>
        )}
      </article>

      <div className="mt-12">
        <Link href="/" className="text-sm text-accent hover:underline">
          {data.eyebrow === "Legal" ? "← Back to homepage" : "← 返回首页"}
        </Link>
      </div>
    </div>
  );
}
