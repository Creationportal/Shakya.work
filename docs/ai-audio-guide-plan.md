# AI Audio Guide — Feasibility & Implementation Plan

**Scope:** Configure a real LLM + TTS to power the "AI Guide" voice widget on `shakya.work`.
**Provider chosen (this session):** **OpenRouter** — one key, one base URL, serving *both* the LLM (summarize/translate) and the TTS (speech).
**Status:** Architecture is **already built** in this repo and now wired to OpenRouter. Remaining: add credits to the OpenRouter account and run the generator scripts.

---

## 1. Feasibility verdict

**Highly feasible — and mostly done.** Your three requirements map directly onto code already present in `/Users/shakya/shakya.work`:

| Your requirement | Where it lives | State |
|---|---|---|
| 1. Page-specific audio narration (page text → TTS) | `scripts/build_guide.py` + route-aware widget | Built; needs credits + run |
| 2. Weekly AI news summary → audio (top 5) | `scripts/gen_news.py` (RSS/arXiv → LLM → TTS) | Built; needs credits + run |
| 3. Pause button (stop/resume) | pause-only transport in `assets/voice-widget/voice-widget.js` | Built |

The LLM is the intelligence layer behind both the **translation** of guide copy and the **summarization** of weekly news.

### Integration findings (validated live this session)
- OpenRouter **does not** expose the classic `/v1/audio/speech` TTS endpoint (the URL you pasted 404s in their docs and rejects model names like `tts-1`).
- OpenRouter's audio models are **`openai/gpt-audio-mini`** (cheap) and **`openai/gpt-audio`**. They are *multimodal* and are called via **`/v1/chat/completions`** with `modalities: ["text","audio"]` + `audio: {voice, format}`.
- The key you provided is **valid** (auth accepted). Both the LLM and TTS request paths return **`402 Insufficient credits`** — i.e. the request shape is correct; the account simply has **zero credits**. Add credits at `openrouter.ai/settings/credits` and it will work.
- `gpt-audio` is multilingual, so en / zh / yue / es / ne are expected to work from a single voice. (Audio output for yue/ne is unverified until credits are added — verify on first run.)

---

## 2. System architecture

Two halves that never talk directly: a **runtime** (browser) and a **build pipeline** (Python).

**Runtime (browser, on every page):**
- The widget reads `assets/audio/manifest.json`, resolves the audio for the *current route* + *selected language* (+ selected news voice), and plays it (pause-only transport).
- If the mp3 is missing, it falls back to the browser's built-in Web Speech voice, so it never breaks.
- "Page text" is served from a **curated narration script** (`scripts/content/guide_scripts.json`), not scraped from the DOM.

**Build (Python, run on demand or weekly via cron):**
- `gen_audio.py` → TTS via OpenRouter chat-completions audio (`openai/gpt-audio-mini`). Fish Audio path kept as a fallback.
- `build_guide.py` → LLM translates the English guide copy into zh/yue/es/ne, then renders all section mp3s.
- `gen_news.py` → gathers news (RSS + arXiv), LLM summarizes the **top 5** stories into a spoken script, translates, renders `latest.{lang}.mp3` **and** one file per news voice type (`latest.{lang}.{voice}.mp3`).
- Output lands under `assets/audio/` and is served statically by GitHub Pages.

---

## 3. APIs, services & dependencies

| Layer | What | Configured as |
|---|---|---|
| TTS | OpenRouter `openai/gpt-audio-mini` (multilingual; en/zh/yue/es/ne) | `config.json → openrouter.tts_model`, `tts_provider: openrouter` |
| LLM (intelligence) | OpenRouter `openai/gpt-4o-mini` via OpenAI-compatible SDK | `openrouter.base_url`, `openrouter.llm_model` |
| News sources | RSS (TechCrunch AI, Verge AI, etc.) + arXiv API | `news` block in `config.json` |
| Optional news | NewsAPI (broader coverage) | `newsapi_enabled: false` |
| Hosting | GitHub Pages (serves mp3s + widget) | already live |
| Scheduler | GitHub Actions cron (Mondays) | `.github/workflows/weekly-news.yml` (uses `OPENROUTER_API_KEY`) |
| Python deps | `requests`, `openai` | `scripts/requirements.txt` |

---

## 4. Implementation phases (status-tagged)

- [x] **P1** Widget UI — language dropdown, "AI Guide" label + persisted red dot, auto-play, pause-only, news voice selector, voice illustrations.
- [x] **P2** Pipeline scripts — TTS helper (OpenRouter + Fish fallback), guide builder, news generator (top-5 + per-voice), config, manifest schema, `requirements.txt`.
- [x] **P3** CI cron workflow (weekly news regeneration, using `OPENROUTER_API_KEY`).
- [x] **P5** News prompt tuned to **"top 5"** (`news_prompt.txt`).
- [ ] **P4 — Generate real audio:** add OpenRouter credits, run `build_guide.py` + `gen_news.py`. Fills all mp3s + manifest audio maps. *(Main remaining action.)*
- [ ] **P6 (optional) — News voices:** `openrouter.voices` maps the 4 selector entries (default/anchor/casual/calm) to OpenRouter voices (alloy/nova/coral/sage). Regenerate to populate them.
- [ ] **P7 (optional) — QA across languages:** listen to each lang (esp. yue/ne); refine phrasing.

---

## 5. Inputs required from you

1. **`OPENROUTER_API_KEY`** — the key you provided. Valid; just needs **credits** on the account.
2. **Add credits** to the OpenRouter account → `https://openrouter.ai/settings/credits`. This is the single blocker right now.
3. **Guide text per page** — draft exists in `scripts/content/guide_scripts.json` (English). Review/extend; the LLM translates the rest.
4. **GitHub repo secret** — add `OPENROUTER_API_KEY` as a repo **Actions secret** so the Monday cron runs unattended.
5. **(Optional) NewsAPI key** — to enable broader news sourcing.
6. **Confirm cadence** — Monday weekly cron is pre-wired.

---

## 6. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Browser autoplay policy | Handled — audio starts only on user click |
| OpenRouter account has no credits | Add credits; request shape already validated (402 = correct) |
| yue/ne audio quality unverified | Verify on first run; `gpt-audio` is multilingual by design |
| TTS latency (chat-audio is slower than classic TTS) | Cache mp3s; only generated once per week / per edit |
| Translation quality | Review pass; re-runnable in seconds |
| Audio freshness | GitHub Action cron overwrites `latest.*.mp3` weekly |

---

## 7. Cost estimate (rough)

- OpenRouter `gpt-audio-mini` TTS is priced per audio token; guide (~13 sections × 5 langs ≈ 65 short clips) is a few cents to ~$1 one-time.
- Weekly news: 5 langs × ≤4 voices ≈ up to 20 short clips/week → pennies.
- LLM summarize/translate: `gpt-4o-mini` is very cheap.
- Hosting/bandwidth: $0 on GitHub Pages free tier.

---

## 8. Exact commands to proceed

```bash
cd /Users/shakya/shakya.work
export OPENROUTER_API_KEY=sk-or-v1-...   # your key

python scripts/build_guide.py   # site tour, all 5 languages
python scripts/gen_news.py      # first weekly news episode (top 5, per voice)

git add assets/audio && git commit -m "audio: generate guide + news" && git push
```

The Monday GitHub Action then regenerates news automatically (reads `OPENROUTER_API_KEY` from repo secrets).
