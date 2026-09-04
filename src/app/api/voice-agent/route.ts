import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const MAX_LEN = 2000;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Multilingual system persona for the portfolio voice agent.
const SYSTEM_PROMPT = `You are nxt, the AI assistant for Shakya.work — Pranamyya Shakya's portfolio of production AI products.
You help recruiters, AI companies, business partners and private clients understand the offerings:
AI Voice Agent (Voice GPT), Enterprise Search, Sales AI, Debt Collection AI (built compliantly),
Workflow Automation, Knowledge Management, Data Analytics, and the Office Live Twin (OLT) simulation.
Be concise, professional and confident. Reply in the same language the user writes in.
Keep answers under 60 words. Never invent prices, timelines or credentials.`;

interface LlmResult {
  reply: string;
  used: boolean;
}

/**
 * Calls an OpenAI-compatible chat endpoint when LLM_API_KEY is configured.
 * Falls back to a short persona blurb so the demo still "speaks" without a key.
 */
async function generateReply(userText: string, lang: string): Promise<LlmResult> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return {
      reply:
        lang === "zh"
          ? "你好，我是 nxt，Shakya.work 的 AI 助手。我可以介绍我们的 AI 语音代理、企业搜索、销售 AI 与债务催收 AI 等产品。请配置 LLM 密钥以启用实时对话。"
          : "Hi, I'm nxt, the AI assistant for Shakya.work. I can talk about our AI Voice Agent, Enterprise Search, Sales AI and Debt Collection AI. Configure an LLM key to enable live chat.",
      used: false,
    };
  }
  try {
    const url =
      process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions";
    const model = process.env.LLM_MODEL || "gpt-4o-mini";
    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userText },
    ];
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature: 0.5, max_tokens: 200 }),
    });
    if (!res.ok) throw new Error(`LLM ${res.status}`);
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) throw new Error("empty LLM response");
    return { reply: text, used: true };
  } catch (err) {
    console.warn("[voice-agent] LLM failed:", err);
    return {
      reply: "Sorry — the language model is temporarily unavailable. Please try again shortly.",
      used: false,
    };
  }
}

interface TtsResult {
  audio: string | null; // data URL
  engine: "fish-audio" | "browser-tts";
}

/**
 * Synthesizes speech via Fish Audio when FISH_AUDIO_API_KEY is set; the returned
 * audio is a base64 data URL the client can play directly. On any failure we
 * return null so the client falls back to the browser SpeechSynthesis API.
 */
async function synthesize(text: string): Promise<TtsResult> {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) return { audio: null, engine: "browser-tts" };
  try {
    const body: Record<string, unknown> = {
      text,
      format: "mp3",
      mp3_bitrate: 128,
    };
    const voiceId = process.env.FISH_AUDIO_VOICE_ID;
    if (voiceId) body.reference_id = voiceId;

    const res = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Fish Audio ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      audio: `data:audio/mp3;base64,${buf.toString("base64")}`,
      engine: "fish-audio",
    };
  } catch (err) {
    console.warn("[voice-agent] Fish Audio failed:", err);
    return { audio: null, engine: "browser-tts" };
  }
}

export async function POST(req: NextRequest) {
  // Abuse protection: 20 requests / 10 min per IP.
  if (!rateLimit(`voice-agent:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let body: { text?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const text = (body.text ?? "").toString().trim();
  const lang = (body.lang ?? "en").toString().trim();
  if (!text) {
    return NextResponse.json({ error: "Please say something." }, { status: 400 });
  }
  if (text.length > MAX_LEN) {
    return NextResponse.json({ error: "Message too long." }, { status: 413 });
  }

  const { reply, used: llmUsed } = await generateReply(text, lang);
  const { audio, engine } = await synthesize(reply);

  return NextResponse.json({
    reply,
    audio, // null → client uses browser TTS
    lang,
    engine, // "fish-audio" | "browser-tts"
    llmUsed,
  });
}
