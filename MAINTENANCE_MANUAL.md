# Shakya.work — Maintenance Manual

**Author:** Shakya | **Domain:** shakya.work | **Last Updated:** July 2026

---

## 1. Architecture

```
shakya.work
    │
    ▼ Spaceship (Registrar — paid annually)
    ▼ Cloudflare (DNS + Pages Hosting — free)
    ▼ GitHub (Source Code — free)
```

| Service | Role | Cost | URL |
|---------|------|------|-----|
| **Spaceship** | I own shakya.work here | Paid (annual) | spaceship.com |
| **Cloudflare** | DNS routing + site hosting + SSL | Free | dash.cloudflare.com |
| **GitHub** | Code storage + auto-deploy trigger | Free | github.com/Creationportal/Shakya.work |

---

## 2. How It Was Set Up (Cliff Notes)

**DNS:** Spaceship → Cloudflare nameservers (`mcgrory.ns.cloudflare.com`, `piper.ns.cloudflare.com`)
**Hosting:** Cloudflare Pages → connected to GitHub repo → auto-deploys on push
**Domain:** Added `shakya.work` as custom domain in Pages → Cloudflare auto-configured DNS + SSL

---

## 3. How to Update the Website

### A) Via Terminal (Mac — Once Git is installed)

```bash
cd /Users/shakya/shakya-website
git add .
git commit -m "Describe your change here"
git push
```
That's it. Cloudflare auto-deploys in ~30 seconds.

### B) Via GitHub Website (No Terminal)

1. Go to github.com/Creationportal/Shakya.work
2. Click the file → pencil icon → edit → "Commit changes"

---

## 4. Routine Maintenance

| Task | Frequency | Action |
|------|-----------|--------|
| Check site is live | Weekly | Visit https://shakya.work |
| Renew domain | Annually (July) | Login at spaceship.com |
| Cloudflare health check | Monthly | dash.cloudflare.com → shakya.work (should show green Active) |
| Git pull before push | As needed | `git pull` if push is rejected |

---

## 5. Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| Site down / DNS error | Spaceship nameservers may have reset — check they still point to Cloudflare |
| Old content showing | Hard refresh: **Cmd+Shift+R** (Mac) |
| Push rejected | Run `git pull` first, then `git push` again |
| SSL warning | Wait 15 min for Cloudflare certificate to issue |

---

## 6. Future Roadmap

- [ ] Multi-page site: Home, CV, Projects, Business Info
- [ ] Login system (Cloudflare Workers + Supabase)
- [ ] AI app integrations (DeepSeek, OpenRouter)
- [ ] Blog / case studies section

---

*Keep this file in your GitHub repo for reference.*
