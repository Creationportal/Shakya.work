import { NextResponse } from "next/server";
import { MAX_DOC_CHARS, MAX_QUERY_CHARS, ragSearch } from "@/lib/rag";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/rag — retrieval over an ad-hoc document.
 *
 * Body: { doc: string, query: string }
 * Returns: { ok, chunks: [{index, text, score}], engine, indexed, latencyMs, message }
 *
 * Retrieval is server-side so an embedding key never reaches the browser, and
 * so the corpus size is not limited by what a phone can index in JS.
 */
export async function POST(req: Request) {
  if (!rateLimit(`rag:${clientIp(req)}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const doc = typeof (body as { doc?: unknown })?.doc === "string"
    ? (body as { doc: string }).doc
    : "";
  const query = typeof (body as { query?: unknown })?.query === "string"
    ? (body as { query: string }).query
    : "";

  if (!doc.trim() || !query.trim()) {
    return NextResponse.json(
      { error: "Both a document and a query are required." },
      { status: 400 }
    );
  }
  if (doc.length > MAX_DOC_CHARS) {
    return NextResponse.json(
      {
        error: `Document exceeds the ${MAX_DOC_CHARS.toLocaleString()} character limit (got ${doc.length.toLocaleString()}).`,
      },
      { status: 413 }
    );
  }
  if (query.length > MAX_QUERY_CHARS) {
    return NextResponse.json(
      { error: `Query exceeds the ${MAX_QUERY_CHARS} character limit.` },
      { status: 413 }
    );
  }

  const result = await ragSearch(doc, query);
  return NextResponse.json({ ok: true, ...result });
}
