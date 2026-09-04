import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * TTS engine — Fish.audio integration.
 *
 * The API token is the configurable placeholder the user supplies later: it is
 * read from the FISH_AUDIO_API_KEY environment variable (set in the Vercel
 * project). When unset, the route degrades gracefully to a browser-TTS signal
 * so the studio still works as a demo. No token is ever committed to source.
 *
 * Input limit: Fish.audio's FREE plan allows at most 500 characters per
 * generation. Higher tiers (Plus/Pro) allow 15,000 / 30,000 — raise MAX_CHARS
 * if the linked account is upgraded.
 */
const MAX_CHARS = 500;
const HARD_CAP = 4000; // never let raw input blow up the parser

export async function POST(req: NextRequest) {
  // Abuse protection: 20 requests / 10 min per IP (free quota is small).
  if (!rateLimit(`tts:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let body: { text?: string; voiceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const text = (body.text ?? "").toString();
  const voiceId = (body.voiceId ?? "").toString().trim();

  if (!text.trim()) {
    return NextResponse.json({ error: "Please enter some text." }, { status: 400 });
  }
  // Free-tier token window limit.
  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      {
        error: `Input exceeds the free-tier limit of ${MAX_CHARS} characters (got ${text.length}).`,
      },
      { status: 413 }
    );
  }
  if (text.length > HARD_CAP) {
    return NextResponse.json({ error: "Message too long." }, { status: 413 });
  }

  const apiKey = process.env.FISH_AUDIO_API_KEY;

  // Configurable token not supplied yet → caller uses browser TTS fallback.
  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      configured: false,
      audio: null,
      engine: "browser-tts",
      chars: text.length,
      message:
        "Fish.audio API key not configured — using browser TTS fallback. Set FISH_AUDIO_API_KEY to enable studio-quality voice.",
    });
  }

  try {
    const ttsBody: Record<string, unknown> = {
      text,
      format: "mp3",
      mp3_bitrate: 128,
    };
    if (voiceId) ttsBody.reference_id = voiceId;

    const res = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(ttsBody),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.warn("[tts] Fish.audio error:", res.status, detail.slice(0, 200));
      return NextResponse.json({
        ok: true,
        configured: true,
        audio: null,
        engine: "browser-tts",
        chars: text.length,
        message: `Fish.audio request failed (${res.status}). Falling back to browser TTS.`,
      });
    }

    const buf = Buffer.from(await res.arrayBuffer());
    return NextResponse.json({
      ok: true,
      configured: true,
      audio: `data:audio/mp3;base64,${buf.toString("base64")}`,
      engine: "fish-audio",
      chars: text.length,
    });
  } catch (err) {
    console.warn("[tts] Fish.audio exception:", err);
    return NextResponse.json({
      ok: true,
      configured: true,
      audio: null,
      engine: "browser-tts",
      chars: text.length,
      message: "Fish.audio request error. Falling back to browser TTS.",
    });
  }
}
