import Link from "next/link";
import { ReactNode } from "react";

/**
 * ProjectCard — link card matching the site's card language exactly:
 *   - rounded-lg border border-line bg-surface, hover:border-accent
 *   - accent eyebrow label, ink <h2> title, muted body
 *   - optional 3:2 preview (image / live preview) clipped to the top
 *
 * Used on /ideas and /ailab. Pass the localized `cta` (e.g. t("ailab.open"))
 * so the card stays bilingual.
 */
export default function ProjectCard({
  href,
  label,
  title,
  body,
  cta = "Open",
  preview,
}: {
  href: string;
  label?: string;
  title: string;
  body: string;
  cta?: string;
  preview?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface p-0 transition-colors hover:border-accent"
    >
      {preview && (
        <div className="aspect-[3/2] w-full overflow-hidden border-b border-line bg-paper">
          {preview}
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {label && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
            {label}
          </span>
        )}
        <h2 className="mt-2 text-base font-semibold text-ink">{title}</h2>
        <p className="mt-2 flex-1 text-sm text-muted">{body}</p>
        <span className="mt-4 inline-block text-sm text-accent group-hover:underline">
          {cta} →
        </span>
      </div>
    </Link>
  );
}
