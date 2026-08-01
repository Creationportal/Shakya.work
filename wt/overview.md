# Milestone Weight Tracker — Build Delivered

## What was built
A production-ready **Milestone Weight Tracker** web app, implemented from `instructions.html` (authoritative spec) and `mockup.html` (visual target). Stack: **Vite + React 19 + TypeScript (strict) + Tailwind CSS v4**, dark theme using the exact spec design tokens (#0B0F1A / #151B29 / #242E42 / blue #3B82F6 / purple #A855F7 / teal #2DD4BF / green #34D399 / red #F87171 / amber #FBBF24).

Live demo: https://04e9078784a94645b6d55be2f3bb6d26.sh1.agentos-app.net
Source: `/Users/shakya/Workbuddy/2026-08-01-20-59-10/`

## Screens
1. **Dashboard** — app bar + milestone chip, 3×2 stats grid (Actual / Change / Trend-week / This Week / This Month / Total, green▼ red▲), BMI·BF%·Waist chips, weight line chart with D/W/M aggregation toggle, dual-line trajectory chart (solid purple actual vs dashed teal ideal, shaded gap) with Ideal-today / Deviation / Required-rate. Mobile fits the viewport; desktop reflows to 6-up stats + side-by-side charts.
2. **Log Weight sheet** — month calendar date picker (entry dots + selected day) and a horizontal **scroll ruler** for weight (0.1 kg steps, center needle, big readout, no +/- buttons). Done commits and triggers a full recalculation. Bottom sheet on mobile, centered modal ≥768px.
3. **Milestone Journey** — progress header (X of 18 reached), current-milestone card (progress bar between adjacent milestones + "what changes" quote), 30-day best/worst projection card annotated with the milestone band each lands in, and a 21-row vertical timeline (done=teal, current=purple halo, flags 🔥💪✨🏆🔥) with **inline editable** weight/BF%/waist per row (Save recalculates everything).
4. **Celebration** — confetti + the milestone's `what_changes` text fires on first reach of a flagged milestone.

## Logic (all live, per §4 spec)
BMI = weight / 2.99 · day/week/month deltas + total vs 87.5 baseline · current milestone matched by BF% (fallback nearest weight; can regress on regain) · ideal trajectory straight line at 0.75 kg/wk from 89 kg (Feb 1) · deviation = weight − ideal(today) · 30-day best = weight − 0.75×30/7, worst = weight + recent-4-week-avg-gain×30/7 (floored at flat). Data persists to `localStorage` and ships preloaded with the §3.1 goal set + the real sample dataset through 14 Jul (82.6 kg, Milestone 5).

## Notable decisions
- **Required rate**: spec text formula `(weight − target)/weeks` collapses to ≈ideal rate whenever the ideal line is already ahead of actual (its target dates are in the past). To keep it meaningful + amber-aware, it is computed as `deviation / weeksToGoal` where `weeksToGoal = (weight − finalGoal)/rate`. Documented here; swap to the literal formula if you prefer the exact §4 wording.
- **shadcn/ui** was intentionally skipped: the spec needs bespoke components (scroll ruler, calendar, SVG charts) that shadcn doesn't provide, and KISS favors hand-rolled Tailwind here. Lucide is used for icons.
- Charts are hand-drawn SVG (line + area + point labels) — no chart library added, keeping the bundle small (73 kB gzip).

## How to run locally
```
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/  (deployable to Vercel / Netlify / any static host)
```
