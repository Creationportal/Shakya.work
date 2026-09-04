/**
 * rag.ts — a small, dependency-free retrieval engine for the /rag demo.
 *
 * Design goal: the demo must work with zero API keys, and upgrade itself
 * automatically when an embedding endpoint is configured.
 *
 *   no EMBEDDING_API_KEY  → BM25 keyword retrieval (free, instant, decent)
 *   EMBEDDING_API_KEY set → OpenAI-compatible embeddings + cosine similarity
 *
 * If the embedding call fails for any reason (bad key, quota, network) the
 * engine falls back to BM25 rather than surfacing an error to the visitor.
 */

export type RagChunk = {
  index: number;
  text: string;
  /** Relevance score. Comparable within a single result set, not across sets. */
  score: number;
};

export type RagResult = {
  chunks: RagChunk[];
  engine: "bm25" | "embeddings";
  /** Total chunks the document was split into. */
  indexed: number;
  latencyMs: number;
  /** Optional operator note (why a fallback was used, etc.). */
  message?: string;
};

/** Fish.audio-style guard rails: keep the demo inside sane request sizes. */
export const MAX_DOC_CHARS = 200_000;
export const MAX_QUERY_CHARS = 500;

const CHUNK_SIZE = 700;
const CHUNK_OVERLAP = 100;
const TOP_K = 5;

/**
 * Embedding the whole corpus on every keystroke would be wasteful, so past
 * this many chunks we stay on BM25 unless the visitor explicitly wants vectors.
 * 64 chunks ≈ 45k characters, which covers every realistic demo document.
 */
const EMBED_MAX_CHUNKS = 64;

/**
 * Split text into overlapping chunks. Paragraph boundaries are respected where
 * possible, then over-long paragraphs are hard-sliced — this mirrors how a
 * production ingestion pipeline behaves, which is the point of the demo.
 */
export function chunkText(
  input: string,
  size: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): string[] {
  const text = input.replace(/\r\n?/g, "\n").trim();
  if (!text) return [];

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    if (!current.trim()) return;
    chunks.push(current.trim());
    const tail = current.slice(-overlap);
    current = tail;
  };

  for (const para of paragraphs) {
    if (para.length > size) {
      // Hard-slice an over-long paragraph, carrying the overlap forward.
      let start = 0;
      while (start < para.length) {
        const slice = para.slice(start, start + size);
        current = current ? `${current} ${slice}` : slice;
        flush();
        start += size - overlap;
      }
      continue;
    }
    if (current && (current.length + 1 + para.length) > size) flush();
    current = current ? `${current} ${para}` : para;
  }
  flush();

  return chunks.length ? chunks : [text.slice(0, size)];
}

/**
 * Tokeniser that treats CJK and Latin text sensibly:
 *   - Latin/digit runs become lowercase word tokens
 *   - CJK runs emit both single characters and bigrams
 * Bigrams matter because Chinese has no whitespace word boundaries, so
 * character-only tokenising loses most of the signal.
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const latin = input.toLowerCase().match(/[a-z0-9]+/g);
  if (latin) tokens.push(...latin);

  const cjkRuns = input.match(/[㐀-鿿぀-ヿ]+/g);
  if (cjkRuns) {
    for (const run of cjkRuns) {
      for (let i = 0; i < run.length; i += 1) {
        tokens.push(run[i]);
        if (i + 1 < run.length) tokens.push(run.slice(i, i + 2));
      }
    }
  }
  return tokens;
}

/**
 * Okapi BM25. k1 controls term-frequency saturation, b controls how strongly
 * document length is normalised — the standard defaults.
 */
function bm25(query: string[], docs: string[][], k1 = 1.5, b = 0.75): number[] {
  const n = docs.length;
  const scores = new Array<number>(n).fill(0);
  if (!n) return scores;

  const avgdl = docs.reduce((sum, d) => sum + d.length, 0) / n || 1;

  const df = new Map<string, number>();
  for (const doc of docs) {
    for (const term of new Set(doc)) df.set(term, (df.get(term) ?? 0) + 1);
  }

  const qtf = new Map<string, number>();
  for (const term of query) qtf.set(term, (qtf.get(term) ?? 0) + 1);

  for (const [term, qn] of qtf) {
    const docFreq = df.get(term);
    if (!docFreq) continue;
    const idf = Math.log(1 + (n - docFreq + 0.5) / (docFreq + 0.5));
    for (let i = 0; i < n; i += 1) {
      const doc = docs[i];
      let tf = 0;
      for (const tok of doc) if (tok === term) tf += 1;
      if (!tf) continue;
      const denom = tf + k1 * (1 - b + (b * doc.length) / avgdl);
      scores[i] += idf * ((tf * (k1 + 1)) / denom) * qn;
    }
  }
  return scores;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Embed a batch of texts through an OpenAI-compatible /embeddings endpoint.
 * Returns null whenever embeddings are unavailable — never throws, so the
 * caller can silently degrade to BM25.
 */
async function embedBatch(texts: string[]): Promise<number[][] | null> {
  const key = process.env.EMBEDDING_API_KEY;
  if (!key) return null;

  const url = process.env.EMBEDDING_API_URL ?? "https://api.openai.com/v1/embeddings";
  const model = process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, input: texts }),
    });
    if (!res.ok) return null;

    const json: unknown = await res.json();
    const rows = (json as { data?: unknown })?.data;
    if (!Array.isArray(rows) || rows.length !== texts.length) return null;

    const vectors = rows.map((r) => (r as { embedding?: unknown }).embedding);
    if (vectors.some((v) => !Array.isArray(v))) return null;
    return vectors as number[][];
  } catch {
    return null;
  }
}

export function embeddingsConfigured(): boolean {
  return Boolean(process.env.EMBEDDING_API_KEY);
}

/**
 * Run a retrieval pass over `doc` and return the top-K most relevant chunks.
 */
export async function ragSearch(
  doc: string,
  query: string,
  topK: number = TOP_K
): Promise<RagResult> {
  const started = Date.now();
  const chunks = chunkText(doc);

  if (!chunks.length) {
    return {
      chunks: [],
      engine: "bm25",
      indexed: 0,
      latencyMs: 0,
      message: "The document is empty.",
    };
  }

  let engine: RagResult["engine"] = "bm25";
  let scores = new Array<number>(chunks.length).fill(0);
  let message: string | undefined;

  const wantEmbeddings = embeddingsConfigured();

  if (wantEmbeddings && chunks.length <= EMBED_MAX_CHUNKS) {
    const vectors = await embedBatch([query, ...chunks]);
    if (vectors && vectors.length === chunks.length + 1) {
      const [qv, ...cv] = vectors;
      engine = "embeddings";
      scores = cv.map((v) => cosine(qv, v));
    } else {
      message =
        "Embedding request failed — fell back to keyword (BM25) retrieval.";
    }
  } else if (wantEmbeddings) {
    message = `Document produced ${chunks.length} chunks; using keyword (BM25) retrieval to stay within the ${EMBED_MAX_CHUNKS}-chunk embedding budget.`;
  } else {
    message =
      "No EMBEDDING_API_KEY configured — running free keyword (BM25) retrieval.";
  }

  if (engine === "bm25") {
    const queryTokens = tokenize(query);
    const docs = chunks.map(tokenize);
    scores = bm25(queryTokens, docs);
  }

  const ranked = chunks
    .map((text, index) => ({ index, text, score: scores[index] ?? 0 }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return {
    chunks: ranked,
    engine,
    indexed: chunks.length,
    latencyMs: Date.now() - started,
    message,
  };
}
