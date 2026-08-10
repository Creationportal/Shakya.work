#!/usr/bin/env python3
"""Automated weekly AI-news audio pipeline.

Sequence (matches the requested spec):
  1. Fetch the N most recent AI news items from the current week (RSS + arXiv).
  2. Summarize via the Gemma model into a concise, audio-ready script.
  3. Produce the summary in the target language (translate if it differs from EN).
  4. Synthesize to mp3 via Fish Audio (free model through OpenRouter).
  5. Write the audio + update assets/audio/manifest.json (news block).

Constraints enforced:
  - Audio segment kept under 2 minutes (per-language length budget; auto-shorten if over).
  - Fewer than N articles available -> summarize what exists, never fail.
  - Language mismatch -> translate before TTS.

Env: OPENROUTER_API_KEY
Usage:
  python scripts/gen_news.py                 # all configured languages
  python scripts/gen_news.py --lang zh       # single language only
  python scripts/gen_news.py --max 3         # fewer stories
  python scripts/gen_news.py --no-tts        # print scripts, skip audio (safe test)
"""
import argparse
import datetime
import email.utils
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

import requests

from gen_audio import tts
from build_guide import llm_client, chat, translate

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
CONFIG = json.load(open(os.path.join(ROOT, "config.json")))
ORC = CONFIG["openrouter"]
MANIFEST = os.path.join(REPO, "assets", "audio", "manifest.json")
PROMPT_TPL = open(os.path.join(ROOT, "content", "news_prompt.txt")).read()
NEWS = CONFIG["news"]
LANG_ORDER = CONFIG["languages"]  # en, zh, yue, es, ne

# Spoken-rate estimates (seconds per counting unit) + a safety margin under 120s.
TARGET_SECONDS = 110
RATE = {
    "en": ("word", 0.40),   # ~150 wpm
    "es": ("word", 0.42),
    "zh": ("char", 0.22),   # ~4.5 chars/s
    "yue": ("char", 0.22),
    "ne": ("char", 0.32),   # Devanagari ~3 chars/s
}
LANG_NAMES = {
    "en": "English", "zh": "Chinese (Simplified)", "yue": "Cantonese (Traditional)",
    "es": "Spanish", "ne": "Nepali",
}
NEWS_LABELS = {
    "en": "Latest AI news", "zh": "最新 AI 资讯", "yue": "最新 AI 消息",
    "es": "Últimas noticias de IA", "ne": "नवीनतम AI समाचार",
}


# ---------------------------------------------------------------- helpers
def _text(node):
    return (node.text or "").strip() if node is not None else ""


def _clean(it):
    for tag in ("{*}description", "description", "{*}summary", "summary"):
        n = it.find(tag)
        if n is not None:
            return re.sub("<[^>]+>", " ", _text(n))[:240]
    return ""


def _date(it):
    for tag in ("pubDate", "{*}published", "published", "{*}updated", "updated"):
        n = it.find(tag)
        if n is not None and _text(n):
            s = _text(n)
            dt = email.utils.parsedate_to_datetime(s) if "," in s else None
            if dt is None:
                try:
                    dt = datetime.datetime.fromisoformat(s.replace("Z", "+00:00"))
                except Exception:
                    dt = None
            if dt is not None:
                return dt.replace(tzinfo=None)
    return None


def estimate_seconds(text, lang):
    kind, rate = RATE.get(lang, ("word", 0.40))
    n = len(text.split()) if kind == "word" else len(re.findall(r"\S", text))
    return n * rate


def budget_units(lang, seconds=TARGET_SECONDS):
    kind, rate = RATE.get(lang, ("word", 0.40))
    return max(20, int(seconds / rate))


# ---------------------------------------------------------------- step 1: fetch
def gather(week_start, max_items):
    items = []
    for feed in NEWS["rss_feeds"]:
        try:
            r = requests.get(feed, timeout=20, headers={"User-Agent": "shakya-radio/1.0"})
            root = ET.fromstring(r.content)
            for it in root.iter():
                if it.tag.endswith("item") or it.tag.endswith("entry"):
                    title = _text(it.find("{*}title")) or _text(it.find("title"))
                    if title:
                        items.append({"title": title, "desc": _clean(it),
                                      "date": _date(it), "src": "rss"})
        except Exception as e:
            print(f"  ! feed failed {feed}: {e}")
    try:
        cats = "+OR+".join(f"cat:{c}" for c in NEWS["arxiv_categories"])
        url = f"http://export.arxiv.org/api/query?search_query={cats}&sortBy=submittedDate&max_results=8"
        r = requests.get(url, timeout=20)
        root = ET.fromstring(r.content)
        ns = {"a": "http://www.w3.org/2005/Atom"}
        for e in root.findall("a:entry", ns):
            t = _text(e.find("a:title", ns))
            s = _text(e.find("a:summary", ns))
            if t:
                items.append({"title": t, "desc": s[:240], "date": _date(e), "src": "arxiv"})
    except Exception as e:
        print(f"  ! arxiv failed: {e}")

    wk = [i for i in items if i["date"] and i["date"] >= week_start]
    wk.sort(key=lambda x: x["date"], reverse=True)
    if len(wk) < max_items:
        print(f"  note: only {len(wk)} items in current week; topping up with most recent overall")
        seen = set(id(i) for i in wk)
        others = [i for i in items if id(i) not in seen]
        others.sort(key=lambda x: x["date"] or datetime.datetime.min, reverse=True)
        wk += others[: max(0, max_items - len(wk))]
    return wk[:max_items]


# ---------------------------------------------------------------- step 2/3: summarize + localize
def _clean_script(text):
    """Strip <thought> reasoning blocks and any leading preamble the model adds."""
    text = re.sub(r"<thought>.*?</thought>", "", text or "", flags=re.DOTALL)
    text = re.sub(r"<thought>.*$", "", text, flags=re.DOTALL).strip()
    text = re.sub(r"^(here[ ']?s|here is|sure[,!]?|below is|certainly[,!]?|of course[,!]?)\b.*?[:\-]\s*",
                  "", text, flags=re.IGNORECASE).strip()
    return text


def summarize_en(client, items, n, max_seconds):
    sources = "\n".join(f"- {i['title']}. {i['desc']}" for i in items)
    budget = budget_units("en", max_seconds)
    prompt = (PROMPT_TPL
              .replace("<<LANG>>", "English")
              .replace("<<BUDGET>>", str(budget))
              .replace("<<UNIT>>", "words")
              .replace("<<N>>", str(n))
              .replace("<<SOURCES>>", sources))
    return chat(client, ("You are a precise broadcast news editor. Output ONLY the spoken "
                         "script — no preamble, no markdown, no bullets, no headings, no "
                         "commentary."), prompt)


def translate_to(client, text, lang, max_seconds):
    budget = budget_units(lang, max_seconds)
    unit = "characters" if RATE[lang][0] == "char" else "words"
    sys = (f"You are a literal translation engine. Translate the user's English radio script "
           f"into {LANG_NAMES[lang]} ({'Traditional Chinese characters' if lang == 'yue' else LANG_NAMES[lang]}). "
           f"Keep it natural, spoken, under {budget} {unit}, and keep the closing sign-off line. "
           f"STRICT: Output ONLY the translated script. No options or alternatives, no markdown, "
           f"bullets, headings, or commentary.")
    return chat(client, sys, text)


def shorten(client, text, lang, max_seconds):
    budget = budget_units(lang, max_seconds)
    unit = "characters" if RATE[lang][0] == "char" else "words"
    sys = (f"Compress the user's {LANG_NAMES[lang]} radio script to under {budget} {unit} "
           f"while keeping the lead story, the key facts, and the closing sign-off. "
           f"Output ONLY the compressed script.")
    return chat(client, sys, text)


def produce_script(client, items, lang, n, max_seconds, en_text=None):
    if lang == "en":
        text = en_text if en_text is not None else summarize_en(client, items, n, max_seconds)
    else:
        if en_text is None:
            en_text = summarize_en(client, items, n, max_seconds)
        text = translate_to(client, en_text, lang, max_seconds)
    # enforce the 2-minute cap
    if estimate_seconds(text, lang) > max_seconds:
        print(f"  ! {lang} over budget ({estimate_seconds(text, lang):.0f}s) -> shortening")
        text = shorten(client, text, lang, max_seconds)
    return _clean_script(text)


# ---------------------------------------------------------------- step 4/5: synth + persist
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", default="all", help="comma list or 'all' (default all)")
    ap.add_argument("--max", type=int, default=NEWS.get("top_n", 5), help="max stories")
    ap.add_argument("--max-seconds", type=int, default=TARGET_SECONDS)
    ap.add_argument("--no-tts", action="store_true", help="print scripts only, skip audio")
    args = ap.parse_args()

    langs = LANG_ORDER if args.lang == "all" else [l.strip() for l in args.lang.split(",") if l.strip()]
    today = datetime.datetime.now()
    week_start = (today - datetime.timedelta(days=today.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0)

    print(f"[news] fetching up to {args.max} items (week of {week_start.date()})")
    items = gather(week_start, args.max)
    if not items:
        raise SystemExit("No news items gathered this week")
    print(f"[news] using {len(items)} items")
    for i in items:
        print(f"  - {i['title'][:70]}  ({i['src']}, {i['date'].date() if i['date'] else '?'})")

    client = llm_client()
    # Summarize once in EN, then translate to the other languages (saves ~5 LLM calls).
    en_script = summarize_en(client, items, len(items), args.max_seconds)
    audio, voice_audio, texts = {}, {}, {}
    voices = ORC.get("voices", {"default": ORC["default_voice"]})

    # Load prior manifest so successful outputs can be reused (idempotent re-runs).
    old_news = {}
    if os.path.exists(MANIFEST):
        try:
            old_news = json.load(open(MANIFEST)).get("news", {})
        except Exception:
            pass

    for lang in langs:
        rel = f"assets/audio/news/latest.{lang}.mp3"
        out = os.path.join(REPO, "assets", "audio", "news", f"latest.{lang}.mp3")
        if (os.path.exists(out) and old_news.get("audio", {}).get(lang) == rel
                and old_news.get("text", {}).get(lang)):
            print(f"[news] {lang}: reuse existing")
            texts[lang] = old_news["text"][lang]
            audio[lang] = rel
            voice_audio[lang] = {vid: rel for vid in voices}
            continue
        print(f"[news] {lang}: summarizing + localizing")
        try:
            script = produce_script(client, items, lang, len(items), args.max_seconds,
                                    en_text=en_script)
        except SystemExit as e:
            print(f"  ! {lang} script generation failed: {e}; skipping")
            continue
        secs = estimate_seconds(script, lang)
        unit = "words" if RATE[lang][0] == "word" else "chars"
        nunits = len(script.split()) if RATE[lang][0] == "word" else len(re.findall(r"\S", script))
        print(f"  -> {nunits} {unit}, ~{secs:.0f}s audio (cap {args.max_seconds}s)")
        texts[lang] = script

        if args.no_tts:
            out = None
        else:
            try:
                tts(script, out, provider=CONFIG["tts_provider"], voice=ORC["default_voice"])
                audio[lang] = rel
            except SystemExit as e:
                print(f"  ! tts skipped for news/{lang}: {e}")
        voice_audio[lang] = {vid: audio.get(lang) for vid in voices}

    manifest = {"sections": {}, "news": {}}
    if os.path.exists(MANIFEST):
        manifest = json.load(open(MANIFEST))
    manifest.setdefault("news", {})
    manifest["news"].update({
        "label": NEWS_LABELS,
        "audio": audio,
        "voiceAudio": voice_audio,
        "text": texts,
        "updated": datetime.date.today().isoformat(),
    })
    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    json.dump(manifest, open(MANIFEST, "w"), ensure_ascii=False, indent=2)
    print(f"[news] wrote {MANIFEST} (updated {manifest['news']['updated']})")


if __name__ == "__main__":
    main()
