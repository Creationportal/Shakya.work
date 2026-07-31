# shakya® — portfolio site

A bilingual (EN / 中文), light/dark, static portfolio for a Product & AI Transformation Leader.
No build step — plain HTML, CSS, and vanilla JS. Drop the folder on any static host.

## Pages
- `index.html` — Home (dark, vibrant, interactive orbit + discipline tiles + explorer)
- `projects.html` — Project catalogue
- `ai-lab.html` — Interactive demos (voice console, workflow, search)
- `case-voice-gpt.html` — Voice GPT case study
- `about.html` — Bio, philosophy, capabilities
- `contact.html` — Channels + message form
- `changelog.html` — Version timeline
- `404.html` — Error page

## Features
- **Bilingual toggle** — every string keyed via `data-i18n`; swaps EN ⇄ 中文 site-wide. Preference persists in `localStorage`.
- **Light/dark theme** — `data-theme` on `<html>`, CSS variables, persists in `localStorage`. Default: dark.
- **Interactive orbit** — pointer-reactive canvas particle field on the homepage.
- **Scroll reveal** — IntersectionObserver fade-up on `[data-reveal]`.
- **Responsive** — mobile nav, fluid grids, `prefers-reduced-motion` respected.
- **SEO** — semantic HTML, per-page `<title>`/`<meta description>`, Open Graph tags on home.

## Structure
```
website/
├── index.html, projects.html, ai-lab.html, …   (pages)
├── 404.html
├── .nojekyll          (lets GitHub Pages serve /assets)
└── assets/
    ├── css/styles.css
    └── js/
        ├── theme.js   (light/dark)
        ├── i18n.js    (EN/中文 dictionary + toggle)
        └── main.js    (orbit, tabs, reveal, form, mobile nav)
```

## Run locally
```bash
cd website
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to GitHub Pages
1. Push this `website/` folder's contents to the root of a repo (or a `/docs` folder).
2. Repo Settings → Pages → Source: the branch / folder.
3. `.nojekyll` ensures `/assets` is served as-is.

## Customize
- **Colors:** edit the CSS variables under `:root` and `[data-theme="light"]` in `assets/css/styles.css`.
- **Copy / translations:** edit the `T` object in `assets/js/i18n.js`.
- **Content:** edit the HTML files directly (nav + footer are inline per page for SEO).

---

