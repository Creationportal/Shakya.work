import { ReactNode } from "react";
import PageIntro from "@/components/PageIntro";

/**
 * ProjectPage — shared page frame for every project / product / idea page.
 *
 * It is the single source of truth for the site's project design language:
 *   - PageIntro header (accent eyebrow, ink <h1>, muted description)
 *   - one max-w-6xl content container with a consistent space-y-12 rhythm
 *   - the site tokens (paper / ink / muted / line / surface / accent) via the
 *     className utilities already wired in globals.css + the design system.
 *
 * Usage:
 *   <ProjectPage eyebrow="AI Lab" title="AI R&D" description="...">
 *     <ProjectSection title="...">...</ProjectSection>
 *     <ProjectGrid>
 *       <ProjectCard href=... />
 *     </ProjectGrid>
 *   </ProjectPage>
 *
 * Every new project page should be wrapped in ProjectPage so it inherits the
 * header, container width and spacing automatically — no per-page duplication.
 */
export default function ProjectPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      <section className="mx-auto max-w-6xl space-y-12 px-5 pb-20">
        {children}
      </section>
    </div>
  );
}
