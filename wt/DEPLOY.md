# Deploy Prompt — Milestone Weight Tracker → www.shakya.work/wt

> **Self-contained handoff.** Paste this into a Craft-mode session (or run the commands manually) to deploy the app.
> **Strategy:** Cloudflare Pages project + a Cloudflare Worker mounted on route `www.shakya.work/wt*` that serves the app, so it coexists with the existing site at the `shakya.work` root.

---

## Goal
Deploy the Milestone Weight Tracker (static Vite + React 19 SPA in this folder) to Cloudflare so it is reachable at `https://www.shakya.work/wt`, and commit the source to an **existing GitHub repo**.

## Constraints
1. Pure static SPA — no backend; data lives in `localStorage`.
2. No client-side router (view switching is in-app state), so page refresh never needs a `404.html` rewrite.
3. Serve under the subpath `/wt` (not domain root) to coexist with existing site content.

## Prerequisites to fill in
- `<YOUR_EXISTING_REPO_URL>` — clone URL of the GitHub repo you'll push into.
- Cloudflare account with the **`shakya.work` zone** added and DNS managed by Cloudflare (orange-clouded).
- Default branch name of the existing repo (`main` or `master`).
- `wrangler` CLI optional (dashboard works too).

## Critical files (in this folder)
| File | Role in deploy |
|------|----------------|
| `vite.config.ts` | Set `base: "/wt/"` so asset URLs resolve under the subpath |
| `package.json` | `npm run build` → emits `dist/`; optionally pin Node via `engines` |
| `index.html`, `src/**` | App source built by Cloudflare Pages |
| `.gitignore` | Must ignore `node_modules/` and `dist/` (already present) |

---

## Steps

**1. Set the base path.** Edit `vite.config.ts` so every asset URL is prefixed with `/wt/`:
```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/wt/",
});
```
Note: with `base: "/wt/"`, local `npm run dev` / `vite preview` will expect the `/wt` prefix. For local testing, run `vite preview --base /wt/` or temporarily use `base: "./"`. The committed/production value must be `"/wt/"`.

**2. (Optional, recommended) Pin Node.** Add to `package.json` so Cloudflare builds with a compatible runtime:
```json
"engines": { "node": ">=20" }
```
(App needs Node 18+ for Vite 6 / React 19.)

**3. Build locally to verify:**
```bash
npm install
npm run build      # produces dist/ with /wt/assets/... references
```

**4. Commit to the existing GitHub repo:**
```bash
git init
git remote add origin <YOUR_EXISTING_REPO_URL>
git add -A
git commit -m "feat: milestone weight tracker (served at /wt)"
git push -u origin main    # use master if that is the repo's default
```

**5. Deploy to Cloudflare Pages (Git integration):**
- Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → select the repo.
- Build command: `npm run build`
- Build output directory: `dist`
- (If needed) Set **Node version** in build settings to 20+.
- Deploy. Note the generated Pages URL, e.g. `https://wt.<hash>.pages.dev` (call it `<PAGES_URL>`).

**6. Mount at `/wt` via a Cloudflare Worker.** Create a Worker that proxies `/wt*` to the Pages project and passes everything else through to the existing site:
```js
// worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/wt" || url.pathname.startsWith("/wt/")) {
      const target = url.href.replace(url.origin + "/wt", "<PAGES_URL>");
      return fetch(target, request);
    }
    return fetch(request); // existing site at shakya.work root
  },
};
```
- Deploy the Worker (Dashboard → Workers → Create Worker, paste the script, or `wrangler deploy`).
- **Triggers → Routes:** add `www.shakya.work/wt` and `www.shakya.work/wt*` (both — the bare path and the prefix).

**7. Custom domain + DNS:**
- Confirm the `shakya.work` zone is on Cloudflare with `www.shakya.work` orange-clouded (proxied). If `www` is not yet a Cloudflare-managed record, add a CNAME `www` → your Cloudflare target and enable the proxy.
- Universal SSL (free) auto-covers `www.shakya.work` — no extra cert step.
- (The Worker route above handles the `/wt` path; no separate Pages custom domain is required.)

**8. Verify:**
- Open `https://www.shakya.work/wt` → app loads, no blank screen.
- DevTools → Network: assets should come from `https://www.shakya.work/wt/assets/...` (200s).
- Refresh the page → still loads (no SPA router, so fine).
- Log a weight in the sheet → reload → entry persists (localStorage).

---

## Troubleshooting
- **Blank page at /wt** → almost always wrong base. Confirm `vite.config.ts` has `base: "/wt/"` AND the rebuilt `dist/index.html` references `/wt/assets/...`. Redeploy Pages after the change.
- **Assets 404 under /wt** → Worker route must include both `www.shakya.work/wt` and `www.shakya.work/wt*`; the bare path alone misses sub-resources.
- **Mixed-content / SSL warnings** → ensure `www` is proxied (orange cloud) so Cloudflare terminates TLS.
- **Old cached build** → redeploy Pages and hard-refresh (Cmd/Ctrl+Shift+R).

## Outcome
Source lives in the existing GitHub repo; the live app is at `https://www.shakya.work/wt`, mounted cleanly beside the rest of the site.
