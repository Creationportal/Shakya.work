#!/usr/bin/env node
/**
 * Fresh AI-audio generator for the new Shakya.work site.
 *
 * What it does
 *   Reads public/audio-guide/manifest.json and synthesizes each section's
 *   narration text into an mp3, writing it next to the path declared in the
 *   manifest's `audio` map.
 *
 * TTS provider
 *   Fish Audio (https://api.fish.audio/v1/tts) via FISH_API_KEY.
 *   NOTE: the OLD build targeted OpenRouter's `/audio/speech` endpoint, which
 *   is NOT a valid OpenRouter route (it 402/404s). We use Fish Audio's
 *   documented TTS endpoint instead — this is the core bug fix vs the old site.
 *
 * Optional LLM translation
 *   If a section has English text but no text for a target language, and an
 *   LLM key is present (OPENROUTER_API_KEY or GEMINI_API_KEYS), it can be
 *   translated before synthesis. Disabled by default; enable with --translate.
 *
 * Usage
 *   node scripts/generate-audio.mjs            # synthesize all present text
 *   node scripts/generate-audio.mjs --lang zh  # single language
 *   node scripts/generate-audio.mjs --dry-run  # print plan, call no APIs
 *
 * Env
 *   FISH_API_KEY        (required for TTS)
 *   FISH_REFERENCE_ID   (optional cloned-voice reference)
 *   FISH_MODEL          (optional, default s2.1-pro)
 *   OPENROUTER_API_KEY  (optional, for --translate)
 *   GEMINI_API_KEYS     (optional, for --translate; comma-separated)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "public", "audio-guide", "manifest.json");
const FISH_TTS_URL = "https://api.fish.audio/v1/tts";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const TRANSLATE = args.has("--translate");
const LANG_FILTER = (() => {
  const i = process.argv.findIndex((a) => a === "--lang");
  return i >= 0 ? process.argv[i + 1] : null;
})();

function log(...m) { console.log("[generate-audio]", ...m); }

function readManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
}

function outPathFor(url) {
  // url is like "/audio-guide/guide/en/home.mp3"
  return path.join(ROOT, "public", url.replace(/^\/+/, ""));
}

async function synthFish(text, lang) {
  const key = process.env.FISH_API_KEY;
  if (!key) throw new Error("FISH_API_KEY is not set");
  const body = {
    text,
    format: "mp3",
    model: process.env.FISH_MODEL || "s2.1-pro",
  };
  if (process.env.FISH_REFERENCE_ID) body.reference_id = process.env.FISH_REFERENCE_ID;
  const res = await fetch(FISH_TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Fish TTS failed ${res.status}: ${err.slice(0, 200)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

async function translate(text, target) {
  // Minimal, guarded translation stub. Returns null if no provider configured.
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const r = await fetch(`${process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1"}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free",
          messages: [
            { role: "system", content: `Translate the following to ${target}. Reply with only the translation.` },
            { role: "user", content: text },
          ],
        }),
      });
      if (r.ok) {
        const j = await r.json();
        return j.choices?.[0]?.message?.content?.trim() || null;
      }
    } catch (e) {
      log("translate warn:", e.message);
    }
  }
  return null;
}

async function main() {
  const manifest = readManifest();
  const langs = (manifest.languages || ["en"]).filter(
    (l) => !LANG_FILTER || l === LANG_FILTER
  );

  const jobs = [];

  for (const [key, node] of Object.entries(manifest.sections || {})) {
    for (const l of langs) {
      const text = node.text?.[l] || (TRANSLATE ? null : null);
      if (!text && TRANSLATE && node.text?.en) {
        // placeholder; resolved later
        jobs.push({ key, lang: l, section: true, needTranslate: true });
      } else if (text) {
        const url = node.audio?.[l];
        if (url) jobs.push({ key, lang: l, section: true, text, url });
      }
    }
  }

  // news
  const news = manifest.news || {};
  for (const l of langs) {
    const text = news.text?.[l];
    const url = news.audio?.[l];
    if (text && url) jobs.push({ key: "news", lang: l, section: false, text, url });
  }

  if (jobs.length === 0) {
    log("No synthesis jobs (no text present for the selected languages).");
    return;
  }

  log(`Plan: ${jobs.length} clip(s)${DRY_RUN ? " [DRY RUN]" : ""}`);
  let ok = 0;
  for (const job of jobs) {
    let { text } = job;
    if (job.needTranslate) {
      text = await translate(job.text?.en || "", job.lang);
      if (!text) {
        log(`skip ${job.key}/${job.lang} (translation unavailable)`);
        continue;
      }
    }
    const out = outPathFor(job.url);
    log(`${job.section ? "section" : "news"} ${job.key}/${job.lang} -> ${job.url}`);
    if (DRY_RUN) {
      ok++;
      continue;
    }
    const buf = await synthFish(text, job.lang);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, buf);
    ok++;
  }
  log(`Done. ${ok}/${jobs.length} clips processed.`);
}

main().catch((e) => {
  console.error("[generate-audio] FATAL:", e.message);
  process.exit(1);
});
