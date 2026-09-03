# Shakya.work — Design System

This file is the single instruction point for changing **the look of the entire
site**. A coding agent (or the site owner via `/settings`) can update tokens here
and the whole design follows. Do not hardcode colors, fonts, or radii in page
components — always reference tokens.

## 1. Token map (what each token controls)

| Token | Where it's used |
| --- | --- |
| `--accent` | primary brand color: links, active nav, buttons, charts, borders on hover |
| `--accent-ink` | stronger accent (headings, hovers) |
| `--glow` | orb / hero radial glow background |
| `--paper` | page background |
| `--ink` | primary text |
| `--muted` | secondary text |
| `--line` | borders, dividers |
| `--surface` | cards, footer, raised panels |
| `--font-base` | body font stack |
| `--radius-sm/md/lg/xl` | corner radii of buttons, cards, inputs |

The site uses the Tailwind color classes `bg-paper`, `text-ink`, `text-muted`,
`border-line`, `bg-surface`, `text-accent`, `bg-accent`, etc. — these map to the
tokens via `@theme` in `src/app/globals.css`.

## 2. Where the values live

**Source of truth for defaults:** `src/app/globals.css` (`:root` block).

**Runtime overrides (what `/settings` writes):**
- Schema + defaults: `src/lib/settings/schema.ts` → `SiteSettings.design`
- Server store: `src/lib/settings/store.ts` → `.data/settings.json` (gitignored)
- Public read API: `GET /api/settings`
- Token → CSS applier: `src/lib/design-system/tokens.ts`
- Client applier: `src/components/DesignSystemProvider.tsx` (writes
  `--accent-var`, `--glow-var`, `--radius-*-var`, `--font-base-var` on `<html>`)
- `globals.css` aliases the `*-var` props into `--accent`/`--radius-*` inside
  `:root` and `.dark`, so dark mode stays pure CSS.

## 3. How to change the design

### A. One-off default change (developer)
Edit the `:root` / `.dark` blocks in `src/app/globals.css`. Example — make the
brand teal:
```css
:root { --accent-var: #0d9488; }
```
or permanently:
```css
:root { --accent: #0d9488; --accent-ink: #0f766e; --glow: rgba(13,148,136,0.22); }
.dark { --accent: #5eead4; --accent-ink: #2dd4bf; --glow: rgba(94,234,212,0.22); }
```

### B. Site owner (no code)
Open `/settings`, enter the `SETTINGS_PASSWORD` value (configured in your host
environment or `.env.local`), adjust **Design** section and **Save**.
This writes `.data/settings.json`; every visitor's page picks it up.

### C. Fonts
`design.font` in settings maps to a stack in `src/lib/design-system/tokens.ts`
(`FONTS`). To add a Google font: import it in `src/app/layout.tsx`
(`next/font/google`), register a variable, and reference it in the `FONTS` map.

### D. Radii
`design.radius` scales all `rounded-*` utilities: sm/md/lg/xl multipliers in
`RADII` in `tokens.ts`.

## 4. Rules for component authors

- Use token classes only: `text-ink`, `text-muted`, `bg-surface`, `bg-paper`,
  `border-line`, `text-accent`, `bg-accent`, `border-accent`.
- Never hardcode `#hex` colors in TSX.
- Dark mode: rely on `.dark` class on `<html>`; tokens swap automatically.
- New pages: reuse `PageIntro`, `SiteHeader`, `SiteFooter`.
- If a setting exists in `/settings`, read it via `getSettings()` (server) or
  `useSiteSettings()` (client) instead of duplicating a constant.

## 5. File index (design-relevant)

- `src/app/globals.css` — tokens, base styles, print styles, voice-guide styles
- `src/lib/design-system/tokens.ts` — settings → CSS applier
- `src/components/DesignSystemProvider.tsx` — client theme boot + settings context
- `src/lib/settings/schema.ts` — settings schema & defaults
- `src/lib/settings/store.ts` — server settings read/write
- `src/app/api/settings/route.ts` — GET (public) / PUT (gated) API
- `src/app/settings/page.tsx` — backend UI (gated by the `SETTINGS_PASSWORD` env var)
