import Link from "next/link";
import { getLang, translate } from "@/lib/i18n/server";

export default async function NotFound() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-24 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
        {lang === "zh" ? "这个页面不存在。" : "This page doesn't exist."}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
        {lang === "zh"
          ? "链接可能已失效，或页面已移动。"
          : "The link may be broken, or the page may have moved."}
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {lang === "zh" ? "返回首页" : "Back to homepage"}
      </Link>
    </section>
  );
}
