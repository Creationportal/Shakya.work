"use client";

import { ReactNode } from "react";

export default function PageIntro({
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
    <section className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:pt-20">
      {eyebrow && (
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 max-w-2xl text-lg text-muted">{description}</p>
      )}
      {children}
    </section>
  );
}
