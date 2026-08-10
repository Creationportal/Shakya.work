#!/usr/bin/env python3
"""Text-to-speech helper supporting two providers.

1. OpenRouter  -> POST {base}/v1/audio/speech (OpenAI-style TTS).
   ACTIVE provider. Uses the FREE model "fish-audio/s2.1-pro-free:free"
   which covers en / zh / yue / es / ne and needs NO credits.
   NOTE: the free model only accepts voice="alloy" (single speaker). The
   voice selector in the widget stays as a configurable placeholder until
   real Fish Audio cloned voices are wired in.
2. Fish Audio  -> POST https://api.fish.audio/v1/tts (fallback path for when
   multi-voice / cloned voices are needed; requires FISH_API_KEY).

Env: OPENROUTER_API_KEY (active)  /  FISH_API_KEY (fallback)
"""
import argparse
import json
import os
import sys

import requests

ROOT = os.path.dirname(os.path.abspath(__file__))
CONFIG = json.load(open(os.path.join(ROOT, "config.json")))

NARRATOR = CONFIG.get("narrator_voice_id", "")  # Fish Audio only
ORC = CONFIG.get("openrouter", {})
PROVIDER = CONFIG.get("tts_provider", "openrouter")
# The free fish-audio model on OpenRouter is single-voice.
FREE_VOICE = "alloy"


def _tts_openrouter(text, out_path, model=None, voice=None,
                    api_key=None, api_url=None):
    api_key = api_key or os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise SystemExit("OPENROUTER_API_KEY not set")
    base = (api_url or ORC["base_url"]).rstrip("/")
    url = base + (ORC.get("tts_endpoint") or "/audio/speech")
    # Free model is single-voice; force alloy regardless of requested voice.
    body = {
        "model": model or ORC.get("tts_model", "fish-audio/s2.1-pro-free:free"),
        "input": text,
        "voice": FREE_VOICE,
        "response_format": "mp3",
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": ORC.get("referer", "https://shakya.work"),
        "X-Title": ORC.get("title", "shakya.work AI Guide"),
    }
    r = requests.post(url, headers=headers, json=body, timeout=150)
    if r.status_code != 200:
        raise SystemExit(f"OpenRouter TTS failed {r.status_code}: {r.text[:300]}")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(r.content)
    print(f"wrote {out_path} ({len(r.content)} bytes)")
    return out_path


def _tts_fish(text, out_path, reference_id=None, model=None,
              bitrate=128, api_key=None, api_url=None):
    api_key = api_key or os.environ.get("FISH_API_KEY")
    if not api_key:
        raise SystemExit("FISH_API_KEY not set")
    url = api_url or "https://api.fish.audio/v1/tts"
    model = model or CONFIG.get("fish_model", "s2.1-pro")
    body = {"text": text, "model": model, "format": "mp3",
            "mp3_bitrate": bitrate, "latency": "normal"}
    if reference_id:
        body["reference_id"] = reference_id
    r = requests.post(url, headers={"Authorization": f"Bearer {api_key}",
                                    "Content-Type": "application/json"},
                      json=body, timeout=120)
    if r.status_code != 200:
        raise SystemExit(f"Fish TTS failed {r.status_code}: {r.text[:300]}")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(r.content)
    print(f"wrote {out_path} ({len(r.content)} bytes)")
    return out_path


def tts(text, out_path, provider=None, model=None, voice="alloy",
        reference_id=None, api_key=None):
    """Unified TTS. `provider` overrides config; OpenRouter ignores reference_id."""
    provider = provider or PROVIDER
    if provider == "openrouter":
        return _tts_openrouter(text, out_path, model=model, voice=voice,
                               api_key=api_key)
    return _tts_fish(text, out_path, reference_id=reference_id,
                     model=model, api_key=api_key)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--provider", default=PROVIDER)
    ap.add_argument("--model")
    ap.add_argument("--voice", default=FREE_VOICE)
    ap.add_argument("--reference-id", default=NARRATOR)
    args = ap.parse_args()
    tts(args.text, args.out, provider=args.provider, model=args.model,
        voice=args.voice, reference_id=args.reference_id)


if __name__ == "__main__":
    main()
