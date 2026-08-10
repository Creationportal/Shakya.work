#!/usr/bin/env python3
"""Generate the site-guide audio + manifest.

Reads scripts/content/guide_scripts.json (English), translates each section into
zh / yue / es / ne via the free LLM, synthesises mp3s with the FREE
fish-audio/s2.1-pro-free:free model via OpenRouter, and writes
assets/audio/manifest.json consumed by the widget.

Env: OPENROUTER_API_KEY
"""
import json
import os
import re
import time

from gen_audio import tts, NARRATOR

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
GUIDE_JSON = os.path.join(ROOT, "content", "guide_scripts.json")
MANIFEST = os.path.join(REPO, "assets", "audio", "manifest.json")
CONFIG = json.load(open(os.path.join(ROOT, "config.json")))
ORC = CONFIG["openrouter"]

ENGLISH_LABELS = {
    "home": "Home", "projects": "Projects", "agents": "Agents",
    "ai-lab": "AI Lab", "workflow": "Workflow", "about": "About",
    "contact": "Contact", "voice": "Voice", "case-voice-gpt": "Voice GPT case study",
    "cv": "CV", "changelog": "Changelog", "search": "Search",
    "blog": "Blog",
}
LANG_ORDER = ["en", "zh", "yue", "es", "ne"]


class _LLMBackend:
    """Unified chat backend.

    If GEMINI_API_KEYS (comma-separated) is set, chat() round-robins across the
    Gemini keys (OpenAI-compatible endpoint) and automatically rotates to the
    next key on a 429/quota error. This multiplies the per-key free quota and
    sidesteps OpenRouter's hard 50-requests/day cap entirely.

    Otherwise it falls back to the original OpenRouter client (free tier).
    """

    def __init__(self):
        self.gemini_keys = [k.strip() for k in
                            os.environ.get("GEMINI_API_KEYS", "").split(",") if k.strip()]
        self.gemini_model = os.environ.get("GEMINI_MODEL", "gemma-4-26b-a4b-it")
        self.gemini_base = "https://generativelanguage.googleapis.com/v1beta/openai/"
        self._idx = 0
        # OpenRouter key pool: OPENROUTER_API_KEYS (comma-sep) OR a single
        # OPENROUTER_API_KEY. When multiple keys are given we round-robin and
        # rotate to the next key on a 429/quota error — each OpenRouter account
        # has its own 50-requests/day free budget, so pooling N keys gives N*50.
        keys = [k.strip() for k in
                os.environ.get("OPENROUTER_API_KEYS", "").split(",") if k.strip()]
        if not keys:
            single = os.environ.get("OPENROUTER_API_KEY")
            if single:
                keys = [single.strip()]
        self.or_keys = keys
        self._or_idx = 0
        self._or_clients = {}   # lazily built per key
        self._gem_clients = {}  # lazily built per Gemini key
        self._or_model = ORC["llm_model"]

    def _or_client_for(self, key):
        if key not in self._or_clients:
            from openai import OpenAI
            self._or_clients[key] = OpenAI(api_key=key, base_url=ORC["base_url"])
        return self._or_clients[key]

    def chat(self, system, user, retries=10):
        if self.gemini_keys:
            return self._gemini_chat(system, user, retries)
        return self._or_chat(system, user, retries)

    def _or_chat(self, system, user, retries):
        n = len(self.or_keys)
        if n == 0:
            raise SystemExit("No OpenRouter key set "
                             "(OPENROUTER_API_KEY / OPENROUTER_API_KEYS).")
        last = None
        for attempt in range(retries):
            key = self.or_keys[self._or_idx % n]
            self._or_idx += 1
            try:
                r = self._or_client_for(key).chat.completions.create(
                    model=self._or_model,
                    messages=[{"role": "system", "content": system},
                              {"role": "user", "content": user}],
                    temperature=0.3,
                )
                if (not r.choices
                        or not getattr(r.choices[0], "message", None)
                        or not (r.choices[0].message.content or "").strip()):
                    last = "empty completion"
                    print(f"  ! empty LLM response (attempt {attempt+1}/{retries}); retrying")
                    time.sleep(2 + attempt * 3)
                    continue
                return r.choices[0].message.content.strip()
            except Exception as e:
                last = e
                # OpenRouter free tier: 429 = per-account 50/day cap. With a key
                # pool we rotate to the next key instead of dying. Only hard-fail
                # once every pooled key is exhausted for the day.
                if "429" in str(e) or "Rate limit" in str(e):
                    print(f"  ! OpenRouter 429 on key#{self._or_idx % n}; rotating")
                    continue
                print(f"  ! LLM error (attempt {attempt+1}/{retries}): {e}; retrying")
                time.sleep(2 + attempt * 3)
        raise SystemExit(f"LLM failed after {retries} attempts (all OpenRouter keys exhausted?): {last}")

    def _gem_client_for(self, key):
        if key not in self._gem_clients:
            from openai import OpenAI
            self._gem_clients[key] = OpenAI(api_key=key, base_url=self.gemini_base)
        return self._gem_clients[key]

    def _gemini_chat(self, system, user, retries):
        last = None
        n = len(self.gemini_keys)
        # gemma-4 is a reasoning model: it can spend its whole token budget on a
        # <thought> block and emit no final answer. Step the budget up only when
        # needed so routine calls stay fast but thought-heavy ones still succeed.
        mt_ladder = [2048, 4096, 8192]
        for attempt in range(retries):
            key = self.gemini_keys[self._idx % n]
            self._idx += 1
            mt = mt_ladder[min(attempt, len(mt_ladder) - 1)]
            try:
                c = self._gem_client_for(key)
                r = c.chat.completions.create(
                    model=self.gemini_model,
                    messages=[{"role": "system", "content": system},
                              {"role": "user", "content": user}],
                    temperature=0.3,
                    max_tokens=mt,
                )
                raw = (r.choices[0].message.content or "") if (
                    r.choices and getattr(r.choices[0], "message", None)) else ""
                # gemma-4 reasoning models emit <thought>…</thought> blocks; drop them.
                content = re.sub(r"<thought>.*?</thought>", "", raw, flags=re.DOTALL)
                content = re.sub(r"<thought>.*$", "", content, flags=re.DOTALL).strip()
                if not content:
                    last = "empty after thought-strip"
                    print(f"  ! empty Gemini response (attempt {attempt+1}/{retries}, mt={mt}); rotating key")
                    continue
                return content
            except Exception as e:
                last = e
                msg = str(e).lower()
                if "429" in msg or "rate" in msg or "quota" in msg:
                    print(f"  ! Gemini 429/quota on key#{self._idx % n}; rotating to next")
                    continue
                print(f"  ! Gemini error (attempt {attempt+1}/{retries}): {e}; retrying")
                time.sleep(2 + attempt * 2)
        raise SystemExit(f"Gemini LLM failed after {retries} attempts: {last}")


def llm_client():
    return _LLMBackend()


def chat(client, system, user, model=None):
    """Thin delegate to the backend's chat() (model is configured on the backend)."""
    return client.chat(system, user)


def translate(client, text, target):
    spec = {
        "zh": "Mandarin Chinese in Simplified characters, natural spoken style.",
        "yue": "Cantonese using Traditional Chinese characters and colloquial Cantonese phrasing.",
        "es": "neutral Latin-American Spanish, natural spoken broadcast style.",
        "ne": "Nepali (Devanagari script), natural spoken style.",
    }[target]
    sys = ("You are a literal translation engine. Translate the user's text "
           f"into {spec} Preserve meaning, length and friendly tone.\n"
           "STRICT RULES: Return ONLY the translated text. Do NOT give options or "
           "alternatives. Do NOT use markdown, bullets, headings or commentary. "
           "No 'here are', no explanations. One plain block of text and nothing else.")
    return chat(client, sys, text)


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--english-only", action="store_true",
                    help="Skip LLM translation; generate English audio for all sections only.")
    args = ap.parse_args()
    guide = json.load(open(GUIDE_JSON))
    client = None  # lazily created only when a translation is actually needed
    # Load prior manifest so successful outputs can be reused (idempotent re-runs).
    old_sections = {}
    if os.path.exists(MANIFEST):
        try:
            old_sections = json.load(open(MANIFEST)).get("sections", {})
        except Exception:
            pass
    sections = {}
    for key, en_text in guide.items():
        if key.startswith("_"):  # skip metadata keys like "_comment"
            continue
        print(f"[guide] {key}")
        text = {"en": en_text}
        label = {"en": ENGLISH_LABELS.get(key, key.title())}
        audio = {}
        for lang in LANG_ORDER:
            rel = f"assets/audio/guide/{lang}/{key}.mp3"
            out = os.path.join(REPO, "assets", "audio", "guide", lang, f"{key}.mp3")
            old = old_sections.get(key, {})
            if (os.path.exists(out) and old.get("audio", {}).get(lang) == rel
                    and old.get("text", {}).get(lang)):
                print(f"  ~ reuse existing {lang}/{key}")
                text[lang] = old["text"][lang]
                label[lang] = old.get("label", {}).get(lang, label["en"])
                audio[lang] = rel
                continue
            if lang == "en":
                t = en_text
            elif args.english_only:
                print(f"  ~ english-only: skip {lang}/{key}")
                continue
            else:
                if client is None:
                    client = llm_client()
                try:
                    out = translate(client, en_text, lang)
                    # parse "LABEL: ... \n\n <script>" produced by translate()
                    lines = out.split("\n")
                    if lines and lines[0].startswith("LABEL:"):
                        lab = lines[0][len("LABEL:"):].strip()
                        scr = "\n".join(lines[1:]).strip().lstrip("\n").strip()
                    else:
                        lab, scr = label["en"], out.strip()
                    text[lang] = scr
                    label[lang] = lab or label["en"]
                except SystemExit as e:
                    print(f"  ! translate failed for {lang}/{key}: {e}; skipping")
                    continue
            try:
                tts(t, out, provider=CONFIG["tts_provider"],
                    voice=ORC["default_voice"])
                audio[lang] = rel
            except SystemExit as e:
                print(f"  ! tts skipped for {lang}/{key}: {e}")
        sections[key] = {"label": label, "audio": audio, "text": text}

    manifest = {"sections": sections}
    # Preserve any news audio already generated by gen_news.py instead of
    # clobbering it on every run.
    if os.path.exists(MANIFEST):
        try:
            old = json.load(open(MANIFEST))
            if isinstance(old.get("news"), dict) and old["news"]:
                manifest["news"] = old["news"]
        except Exception:
            pass
    if "news" not in manifest:
        manifest["news"] = {
            "label": {"en": "Latest AI news", "zh": "最新 AI 资讯",
                      "yue": "最新 AI 消息", "es": "Últimas noticias de IA",
                      "ne": "नवीनतम AI समाचार"},
            "audio": {}, "text": {}, "updated": None,
        }
    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    json.dump(manifest, open(MANIFEST, "w"), ensure_ascii=False, indent=2)
    print(f"wrote {MANIFEST}")


if __name__ == "__main__":
    main()
