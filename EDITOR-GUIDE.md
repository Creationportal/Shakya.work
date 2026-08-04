# EDITOR-GUIDE.md — shakya.work

> **PRIORITY: HIGH** — This is the authoritative reference for anyone editing the site. Keep it in sync with the code. `README.md` is the user-facing overview and may drift; this file wins for editors.

**Site:** `shakya.work` · **No build step** (plain HTML/CSS/vanilla JS) · **Bilingual** EN ⇄ 中文 · **Deploy:** any static host (GitHub Pages / Cloudflare Pages).

---

## 1. Backup policy (read before editing this file)

A timestamped whole-site zip is created **before every session that updates this guide**.

- Location: `backups/shakya.work-backup-YYYYMMDD-HHMMSS.zip`
- Excludes: `.git/`, `.DS_Store`, `backups/` itself.
- Restore: unzip the relevant backup over the site (or cherry-pick files).
- Latest: `backups/shakya.work-backup-20260804-104913.zip` (pre-EDITOR-GUIDE snapshot).

---

## 2. File map

### Root
| File | What it is |
|---|---|
| `index.html` | Home — hero orbit, showcase tiles, explorer tabs, CTA. **EN.** |
| `projects.html` | Project catalogue (6 cards). **EN.** |
| `ai-lab.html` | Interactive demos: voice console, workflow, search. **EN.** |
| `case-voice-gpt.html` | Voice GPT case study (overview/outcome/approach). **EN.** |
| `about.html` | Bio + philosophy + focus areas. **EN**, static real bio (was placeholder "Beatles", removed). |
| `contact.html` | Channels (EMAIL / LINKEDIN / WECHAT) + message form. **EN.** |
| `cv.html` | CV access — code-gated private doc. **EN.** |
| `changelog.html` | Version timeline. **EN.** |
| `404.html` | Error page. **EN.** |
| `voice.html` `search.html` `agents.html` `workflow.html` | **Pillar pages** — one per discipline. Template: pagehero → intro → capabilities → how-it-works → FAQ → CTA. Carries `FAQPage` JSON-LD. **EN.** |
| `sitemap.xml` | 22 URLs (EN core + pillars + blog + ZH set). Declared in `robots.txt`. |
| `robots.txt` | `Allow: /` + `Sitemap: https://shakya.work/sitemap.xml`. |
| `_headers` | GitHub Pages cache rules: `/assets/` = 1yr immutable; `/*.html` = no-cache. |
| `README.md` | User-facing overview (separate from this guide). |
| `DESIGN-MANIFEST.json` `DESIGN-HANDOFF.md` | Design handoff docs. |
| `EDITOR-GUIDE.md` | This file. |

### Subdirectories
| Dir | Contents |
|---|---|
| `zh/` | 7 Chinese pages mirroring EN: `index, about, contact, voice, search, agents, workflow`. `lang="zh"`, `og:locale=zh_CN`, reciprocal `hreflang="en"`, static Chinese copy, `../assets/` paths. |
| `blog/` | `index.html` (listing) + 3 articles (`enterprise-voice-agents`, `enterprise-search-rag`, `ai-agents-vs-workflow-automation`), each with `Article` JSON-LD, `../assets/` paths. **EN only.** |
| `wt/` | **Older build — DO NOT EDIT. Keep as-is (user instruction).** |
| `assets/` | `css/styles.css`, `js/{theme,i18n,main}.js`, `og.png`, `og.svg`, `beatles.jpg` (dead/unused asset). |

---

## 3. Page reference

| Page | Canonical `/…` | i18n | Key sections |
|---|---|---|---|
| index | `/` | heavy (`data-i18n`) | NAV · HERO · SHOWCASE · EXPLORER · CTA · FOOTER |
| projects | `/projects` | heavy | pagehero · catalogue grid |
| ai-lab | `/ai-lab` | heavy | pagehero · 3 demos |
| case-voice-gpt | `/case-voice-gpt` | heavy | pagehero · overview/outcome · approach |
| about | `/about` | **none** (static bio) | pagehero · intro · focus areas |
| contact | `/contact` | heavy | pagehero · channels · form |
| cv | `/cv` | heavy | pagehero · code gate |
| changelog | `/changelog` | heavy | pagehero · timeline |
| 404 | `/404` | heavy | error message · links |
| voice/search/agents/workflow | `/voice` … | badges static, rest mixed | pagehero · CAPABILITIES · HOW IT WORKS · FAQ · CTA |
| zh/* | `/zh/…` | **none** (static zh) | mirror of EN sections, hardcoded Chinese |
| blog/* | `/blog` … | heavy | listing / article body |

> **i18n note:** EN pages mix `data-i18n` (toggles language) and static text. `zh/*` pages are fully static Chinese (no `data-i18n`) — they rely on hardcoded copy, not the dictionary.

---

## 4. Shared section anatomy

**NAV (`.nav`)** — brand · `nav__links` (Projects / AI Lab / Blog / About / Contact) · `nav__right`:
- `a.nav__status` → links to `/contact` (EN) or `/zh/contact` (ZH). Text: "OPEN TO COLLABORATION" / "开放合作中". **This was a `<div>` before 2026-08-04; it is now a link.**
- theme toggle (`data-theme-toggle`), language toggle (`data-lang-toggle`), burger.

**FOOTER (`.footer`)** — brand + same link set.

**HOME-only sections:** HERO (orbit canvas) · SHOWCASE (4 tiles → `/voice /search /agents /workflow`) · EXPLORER (tabbed demo panel driven by `data-*` attributes).

**Pillar template:** pagehero (kicker `DISCIPLINE 0X — …`) → intro lead → CAPABILITIES grid → HOW IT WORKS (`<ol>`) → FAQ (must mirror the `FAQPage` JSON-LD in `<head>`) → CTA.

**Scripts (end of body, all pages):** `theme.js` → `i18n.js` → `main.js`.

---

## 5. i18n system (`assets/js/i18n.js`)

- Translatable node → `data-i18n="key"` (text) or `data-i18n-ph="key"` (input placeholder).
- Dictionary `T` holds `{ en, zh }` per key, grouped by section (Nav, Footer, Home, Showcase, Explorer, CTA, Projects, AI Lab, Case, CV, Contact, Changelog). **`about.*` keys were removed — they are dead.**
- `apply(lang)`: sets `<html lang>`, swaps text + placeholders, toggles lang button, persists to `localStorage["shakya-lang"]`, fires `langchange` event.
- `current()`: returns stored lang, else **`/zh/` path → `"zh"`, otherwise `"en"`** (path-aware since 2026-08-04).
- **To add a string:** add key to `T` with `{en, zh}`, then add `data-i18n="key"` to the element.

---

## 6. SEO conventions (apply to every new/edited page)

- **Canonical:** absolute, extensionless, self-referencing. e.g. `https://shakya.work/voice`. Never use `shakya.ai` (dead domain).
- **hreflang:** EN page → `hreflang="zh"` (sibling `/zh/…`) + `hreflang="x-default"` (self); ZH page → `hreflang="en"` (sibling). Always reciprocal.
- **Open Graph / Twitter:** `og:title`, `og:description`, `og:url`, `og:image` (absolute `https://shakya.work/assets/og.png`), `twitter:card=summary_large_image`.
- **Structured data:** `FAQPage` JSON-LD on the 4 pillars (FAQ text must match the visible FAQ). `Article` JSON-LD on the 3 blog posts.
- **Extensionless URLs:** internal links use `/voice` etc. The host MUST 308-redirect `/voice.html` → `/voice` (confirm post-deploy).
- **Sitemap / robots:** `sitemap.xml` (22 URLs) declared in `robots.txt`. Submit to Google Search Console **and** Baidu Zhanzhang (搜索资源平台).
- **Cache:** `_headers` sets `/assets/` to 1yr immutable (kills `cf-cache-status: DYNAMIC` CWV risk).

---

## 7. Styling (`assets/css/styles.css`)

- `:root` variables: `--accent:#6C5CE7`, `--text`, `--text-dim`, `--border`, `--bg`, `--bg-elev`, `--radius`. `[data-theme="light"]` overrides for light mode.
- Theme toggle sets `data-theme` on `<html>` (persists in `localStorage`).
- `.nav__status` is now an `<a>` (contact link): `cursor:pointer`, hover → `--accent`. Edit styles there if the badge look changes.

---

## 8. Deployment

1. **No build.** Deploy the folder contents to a static host.
2. **GitHub Pages:** push to repo root (or `/docs`); enable Pages. Add `.nojekyll` at root if `/assets` 404s.
3. **Extensionless routing:** configure host redirects `/voice` → `/voice.html` (308). Cloudflare Pages / Netlify: add redirect rules. **Required** — internal links are extensionless.
4. **Post-deploy (account steps, not code):**
   - Submit `sitemap.xml` to GSC + Baidu Zhanzhang.
   - Verify Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1).
   - Reconcile Cloudflare `robots.txt`/cache (the "Cloudflare Managed" robots may override the repo one).
   - Decide `shakya.ai`: if brand domain, 301 → `shakya.work`; if dead, leave buried.

---

## 9. Change log

**2026-08-03**
- SEO teardown + dual-engine (Google + Baidu) strategy; strategy/audit/deployment docs written to WorkBuddy workspace.
- Fixed canonicals (`shakya.ai` → `shakya.work`), made `og:image` absolute, internal links extensionless.
- Added `sitemap.xml` (22 URLs), `robots.txt`, `_headers`.
- Built 4 pillar pages + `FAQPage` schema.
- Built `/blog` (3 articles + `Article` schema).
- Built `/zh/` set (7 pages, `lang="zh"`, reciprocal `hreflang`).
- Rewrote `about.html` (real bio; removed "Beatles" placeholder).

**2026-08-04**
- Contact updates: email → `creationpanel@gmail.com` (6 places, incl. `i18n.js`); LinkedIn real link; WeChat `shakyain`; "OPEN TO WORK" → "OPEN TO COLLABORATION" contact link (all 23 pages).
- SEO audit fixes: LinkedIn `rel="noopener noreferrer"`; `i18n.js` path-aware default (`/zh/` → `zh`); removed dead `about.*` (Beatles) i18n block + `beatles.jpg` manifest refs.
- Created `EDITOR-GUIDE.md`; established `backups/` policy (pre-update timestamped zips).

---

*Edit this file whenever structure, pages, or conventions change. Keep the change log dated.*
