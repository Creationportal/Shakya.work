# Deploy — shakya.work

Target platform: **Vercel** (native Next.js 16 — no adapter, no `output` mode, no `wrangler.toml`).

## Build

Vercel auto-detects the framework from `package.json` and runs `next build`. No custom build config needed.

- Local production build check: `env -u NODE_OPTIONS npx next build` (the `env -u NODE_OPTIONS` only matters in the sandbox, where an injected `NODE_OPTIONS=--use-system-ca` breaks Turbopack's TLS — not needed on Vercel).
- Local preview: `npx next start -p 3000` after a build, or `npx next dev -p 3000` for live edits.

## Required environment variables

Set these in the Vercel project (Dashboard → Settings → Environment Variables, or `vercel env add`):

| Name | Purpose | Notes |
|------|---------|-------|
| `SETTINGS_PASSWORD` | Protects `/settings` admin panel | Used by `/api/settings/login` + cookie check |
| `ACCESS_CODE` | Grants the vault portal (unlocks `/cv`, `/wt`) | Used by `/api/access` + `portal_access` cookie |
| `CV_GEO_LOOKUP` | Optional geo enrichment on CV visits | Server-side only |

Without these, the gated routes still work (they just stay locked / show the access form); nothing crashes.

### Setting the credentials in Vercel (so the gate works on the live site)

**Dashboard (recommended):**

1. Sign in at [vercel.com](https://vercel.com) → open the **shakya.work** project.
2. Go to **Settings → Environment Variables**.
3. Add two variables (values match the local `.env.local`):

   | Key | Value | Environments |
   |-----|-------|--------------|
   | `ACCESS_CODE` | `12345678910` | ✅ Production · Preview · Development |
   | `SETTINGS_PASSWORD` | `12345678910` | ✅ Production · Preview · Development |

4. Click **Save** for each.
5. **Redeploy — this step is mandatory.** Env variables only take effect on *new* deployments: go to **Deployments** → latest deployment → **⋯ menu → Redeploy** (or just `git push` any commit).
6. Verify on the live site: `/vault` → enter the access code → should land on `/cv`; `/settings` → the settings password → admin panel opens.

> If the live site still shows **"Server misconfigured"** after redeploying, the variable name is misspelled or it wasn't scoped to the Production environment — both APIs fail closed (500) when the env var is missing.

**CLI alternative:**

```bash
vercel login
vercel env add ACCESS_CODE production        # paste the current code when prompted
vercel env add SETTINGS_PASSWORD production  # paste the current password when prompted
vercel redeploy --prod                       # or: vercel deploy --prod
```

> ⚠️ The current credential is a simple numeric code — weak for a gate protecting CV/PII. Acceptable for a demo; rotate to a longer mixed value later (one-line change in `.env.local` + the same two Vercel vars).

## Optional environment variables (activate live features)

These are **server-only** — never shipped to the browser. The site degrades gracefully (browser TTS, keyword retrieval, persona blurb) when they are absent, so it runs with **zero paid tokens** by default.

| Name | Enables | Falls back to |
|------|---------|--------------|
| `LLM_API_KEY` (+ `LLM_API_URL`, `LLM_MODEL`) | Live replies in the Voice Agent widget | Multilingual persona blurb |
| `FISH_AUDIO_API_KEY` (+ `FISH_AUDIO_VOICE_ID`) | Real Fish Audio voice synthesis (`/api/tts`, `/api/voice-agent`) | Free browser SpeechSynthesis |
| `EMBEDDING_API_KEY` (+ `EMBEDDING_API_URL`, `EMBEDDING_MODEL`) | Vector retrieval in the RAG demo (`/api/rag`) | BM25 keyword retrieval |

## Durable contact / access-request storage (optional)

`/api/contact` and `/api/access-request` persist best-effort to disk and **never 500** on a read-only filesystem. For durable storage, link a **Vercel KV** store to the project (Dashboard → Storage → Create / Link). This injects `KV_REST_API_URL` + `KV_REST_API_TOKEN`; `src/lib/kv.ts` picks it up automatically and `rpush`s messages/requests. No code change needed. Free tier (300K reads / 100K writes per day) is ample for a portfolio.

## Runtime notes

- Vercel functions run on a **read-only filesystem** (only `/tmp` is writable). All file writes in the API routes are wrapped in try/catch and degrade to a `persisted:false` / `ok:true` 200 response.
- Security headers in `next.config.ts` (`headers()`) are honored by Vercel.
- Private routes (`/settings`, `/cv`, `/vault`, `/wt`) are excluded from `sitemap.xml` and disallowed in `robots.txt`; `/cv` and `/wt` additionally 307-redirect to `/vault` when unauthenticated.

## Deploy steps

1. Push to the connected Git repo (auto-deploy), **or**
2. `vercel login` → `vercel deploy --prod` from the repo root.
3. Add the required env vars (table above).
4. (Optional) Link a KV store and/or set the LLM / Fish Audio / embedding keys to light up the live AI features.

## Pre-deploy checklist

See `PRE-DEPLOYMENT-CHECKLIST.html` (regenerated 2026-09-04) for the full 21-area review — currently 21 PASS / 0 FAIL / 0 WARN, production build green (42 routes).
