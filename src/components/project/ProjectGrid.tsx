import { ReactNode } from "react";

/**
 * ProjectGrid — responsive card grid shared by /ideas, /ailab and /projects.
 * `cols="2"` for wider cards (e.g. the /projects portfolio), `cols="3"` for
 * denser idea walls. Keeps the gap and breakpoints consistent site-wide.
 */
export default function ProjectGrid({
  children,
  cols = "3",
}: {
  children: ReactNode;
  cols?: "2" | "3";
}) {
  const colClass =
    cols === "2" ? "lg:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return <div className={`grid gap-6 ${colClass}`}>{children}</div>;
}
