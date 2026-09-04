"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

/**
 * RagStudio — the client UI for the enterprise-search demo.
 *
 * The corpus is pasted (or loaded from the sample), the query is sent to
 * /api/rag, and the ranked passages come back with enough metadata to make the
 * retrieval step visible: how many chunks were indexed, which engine scored
 * them, and how long it took.
 */

type Hit = { index: number; text: string; score: number };

const SAMPLE = `Voice agents fail on latency, not on accuracy.
A caller tolerates a slightly wrong answer; they hang up on a two second pause. The budget that matters is the round trip: capture, transcribe, decide, synthesise, play. Everything else is decoration.

Retrieval quality is a chunking problem before it is a model problem.
Most disappointing RAG systems are not let down by the embedding model. They are let down by chunks that split a sentence in half, or that bury the one relevant clause inside a thousand words of boilerplate. Fix boundaries and overlap first, then reach for a better model.

Ship the free path first.
Every demo in this lab runs with no API key. Browser speech synthesis, browser speech recognition, and keyword retrieval carry the whole experience. Paid models are an upgrade, not a dependency. If a feature cannot degrade, it cannot be demoed.

Concurrency is the real cost driver in voice.
Running two thousand concurrent calls is not two thousand times a single call. Connection pools, jitter buffers and per-region routing decide whether the tail latency holds. Six voice environments across Saudi, Huawei, Japan, US, Singapore and Indonesia each carry their own failure modes.

Compliance decides the architecture.
Recording consent, retention windows and redaction are not features you add at the end. They determine where audio may be stored, which vendors may touch it, and whether a transcript can leave the region at all.`;

export default function RagStudio() {
  const { t } = useLanguage();
  const [doc, setDoc] = useState(SAMPLE);
  const [query, setQuery] = useState("What drives latency in voice agents?");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [meta, setMeta] = useState<{
    engine: string;
    indexed: number;
    latencyMs: number;
    message?: string;
  } | null>(null);

  async function search() {
    if (busy || !doc.trim() || !query.trim()) return;
    setBusy(true);
    setError("");
    setHits([]);
    setMeta(null);
    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc, query }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setHits((data.chunks ?? []) as Hit[]);
      setMeta({
        engine: data.engine,
        indexed: data.indexed,
        latencyMs: data.latencyMs,
        message: data.message,
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const topScore = hits.length ? hits[0].score : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {t("rag.corpusLabel")}
          </span>
          <button
            type="button"
            onClick={() => setDoc(SAMPLE)}
            className="text-[11px] text-muted underline-offset-2 hover:underline"
          >
            {t("rag.sample")}
          </button>
        </div>

        <textarea
          value={doc}
          onChange={(e) => setDoc(e.target.value)}
          rows={10}
          placeholder={t("rag.docPlaceholder")}
          className="w-full resize-y rounded-lg border border-line bg-paper p-3 text-sm leading-relaxed text-ink outline-none focus:border-[#7c3aed]"
        />

        <div className="mt-4">
          <label
            htmlFor="rag-query"
            className="text-[11px] font-medium uppercase tracking-wider text-muted"
          >
            {t("rag.queryLabel")}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="rag-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") search();
              }}
              placeholder={t("rag.queryPlaceholder")}
              className="flex-1 rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-[#7c3aed]"
            />
            <button
              onClick={search}
              disabled={busy || !doc.trim() || !query.trim()}
              className="rounded-lg bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? t("rag.searching") : t("rag.search")}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-[12px] text-red-500">{error}</p>}
      </div>

      {meta && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-ink">{meta.indexed}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">
                {t("rag.indexed")}
              </p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">
                {meta.engine === "embeddings"
                  ? t("rag.engineVectors")
                  : t("rag.engineBm25")}
              </p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">
                {t("rag.engineLabel")}
              </p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">{meta.latencyMs} ms</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">
                {t("rag.latency")}
              </p>
            </div>
          </div>
          {meta.message && (
            <p className="mt-4 border-t border-line pt-3 text-[12px] text-muted">
              {meta.message}
            </p>
          )}
        </div>
      )}

      {meta && (
        <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {t("rag.results")}
          </h2>

          {hits.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{t("rag.noResults")}</p>
          ) : (
            <ol className="mt-4 space-y-4">
              {hits.map((hit, i) => (
                <li
                  key={hit.index}
                  className="rounded-lg border border-line bg-paper p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7c3aed]">
                      #{i + 1} · {t("rag.chunk")} {hit.index + 1}
                    </span>
                    <span className="text-[11px] text-muted">
                      {hit.score.toFixed(3)}
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-[#7c3aed]"
                      style={{
                        width: `${Math.max(6, (hit.score / (topScore || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">
                    {hit.text}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {!meta && !error && (
        <p className="text-center text-[12px] text-muted">{t("rag.needDoc")}</p>
      )}

      <p className="text-center text-[12px] text-muted">{t("rag.freeNote")}</p>
    </div>
  );
}
