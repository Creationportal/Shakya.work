import { ReactNode } from "react";

/**
 * ProjectSection — a consistent in-page section heading used by product pages
 * (e.g. the "What it is" / "How it works" blocks on the Agent Operation Flow
 * page). Keeps heading size, ink colour and muted intro width uniform.
 */
export default function ProjectSection({
  title,
  intro,
  children,
  id,
}: {
  title: string;
  intro?: string;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
      {intro && <p className="max-w-2xl text-sm text-muted">{intro}</p>}
      {children}
    </section>
  );
}
