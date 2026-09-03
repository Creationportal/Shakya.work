"use client";

import { useState } from "react";

export default function CopyBlock({
  text,
  filename = "skill.md",
  height = 460,
}: {
  text: string;
  filename?: string;
  height?: number;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="font-mono text-xs text-muted">{filename}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre
        className="overflow-auto p-4 font-mono text-[12px] leading-relaxed text-muted"
        style={{ maxHeight: height }}
      >
        <code>{text}</code>
      </pre>
    </div>
  );
}
