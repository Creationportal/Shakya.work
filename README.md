# shakya — AI portfolio

Single-page React application — a portfolio for AI, voice, agents, and automation projects.  
Bilingual (EN / 中文), dark/light theme. Deploy to any static host.

## Pages
| Route | Content |
|---|---|
| `/` | Home — hero orbit, showcase tiles, CTA |
| `/projects` | Project catalogue (6 cards) |
| `/ai-lab` | Interactive demos (voice console, workflow, search) |
| `/agents` | Agent dashboard — 5 agents with status/activity/uptime |
| `/agents/simulation` | Simulation agent — run scenarios with live step console |
| `/about` | Bio, philosophy, focus areas |
| `/contact` | Channels (EMAIL / LINKEDIN / WECHAT) + message form |
| `/cv` | CV — hidden from nav, accessible by URL |

## Features
- **SPA routing** via `history.pushState` + 404 fallback
- **Bilingual toggle** — EN / 中文, persists in localStorage
- **Dark/light theme** — persists in localStorage
- **Interactive orbit** — pointer-reactive, draggable canvas particle field
- **Agent dashboard** — status/activity/uptime cards, Simulation Agent subpage with pipeline console
- **Workspace features** — activity log (bottom-left), login button (placeholder)
- **Responsive** — breakpoints at 980px / 640px, burger nav on mobile
- **SEO** — per-page meta, Open Graph, Twitter Cards, sitemap, robots.txt

## Architecture
```
├── index.html               SPA entry (React 18 + Babel standalone)
├── 404.html                 SPA path-preserving redirect
├── assets/
│   ├── css/styles.css       Design system (268 lines)
│   ├── js/app.js            React SPA (797 lines, 9 components)
│   ├── og.png               Open Graph image
│   └── og.svg               OG source
├── zh/                      Chinese-page redirect stubs → SPA
├── blog/                    Blog redirect stubs → SPA
├── sitemap.xml
├── robots.txt
├── _headers
├── .nojekyll
└── .gitignore
```

## Run locally
```bash
python3 -m http.server 8080
open http://localhost:8080
```

## Deploy
Push to GitHub Pages, Cloudflare Pages, or any static host.  
`404.html` handles SPA client-side routing on hosts without URL rewriting.