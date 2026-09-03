# Changelog — shakya.work

All notable changes to the site are documented here. The site is a Next.js 16
App Router project (TypeScript + Tailwind). Entries are dated to the working
session; the tree is deployed by the owner (changes are intentionally left
uncommitted in the working tree until release).

## 2026-09-02 (pre-deployment audit & fixes)

### Security
- **`/cv` server-gated.** The CV page previously rendered full PII (email, name,
  phone numbers, references) in server HTML with no access check. It now reads
  the `portal_access` cookie and `redirect("/vault")` when not granted.
- **`/wt` server-gated.** The Weight & Milestone Tracker is a private/noindex
  route; it now requires the vault access code (same `portal_access` cookie as
  `/cv`), redirecting to `/vault` when not granted.
- **`robots.txt`** now disallows `/wt` (was crawlable despite being noindex +
  gated). Disallow list: `/settings`, `/api/`, `/.data/`, `/cv`, `/vault`, `/wt`.

### Contact
- `/contact` lists all four public emails: `creationpanel@gmail.com` (primary),
  `tangshakya@163.com` (secondary), `shakya@dyna.ai`, `shakya@agent.qq.com`
  (aliases). `emailAliases` made explicit in `.data/settings.json`.

### Layout & structure
- `/about` intro layout changed from stacked to two-column (image left, text
  right; stacks below `md`).
- AI Lab stubs (`/ailab/ai-rnd`, `/ailab/projects`, `/ailab/demos`) now render
  through the shared `ProjectPage` frame with "Coming soon" cards.

### Audio / VoiceGuide
- `public/audio-guide/manifest.json` had `~17` `.mp3` references (en/zh/yue/es/ne)
  that did not exist; every play 404'd before falling back to browser TTS.
  Dead `audio` / `voiceAudio` references removed — the widget now uses the
  browser SpeechSynthesis voice directly (no 404s). Add real `.mp3` files later
  and re-add the keys to re-enable pre-recorded audio.

## 2026-08-28 (reconstructed baseline)

- **SEO:** unique per-page `title` + `description` via `src/lib/seo.ts`
  `pageMeta()`; `llms.txt` restored; `/ailab/simulation` `<h1>` added.
- **Favicon:** circle mark's triangle replaced with an "S" (`src/app/icon.svg`).
- **Legal:** privacy / terms / accessibility (en + zh) present and dated.
- **i18n:** full English ↔ Chinese switching via `lang` cookie + `LanguageProvider`.
