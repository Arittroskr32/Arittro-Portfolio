# Arittro Sarkar – Portfolio

Personal portfolio (React + Vite + Tailwind), hosted for free on **GitHub Pages**.
There is no server or database: all content lives in JSON files in this repository,
and the built-in admin panel edits those files by making commits for you.

```
frontend/
  public/data/*.json   ← site content (projects, blog, CTFs, CVEs, skills, profile…)
  public/uploads/      ← images
  src/                 ← the React app (public site + /admin panel)
.github/workflows/deploy-pages.yml  ← builds and publishes on every push to main
```

## How it works

* **Visitors** load the static site. Pages read the JSON files that were deployed with it.
* **You (admin)** open `/admin`, sign in with a GitHub token, and edit content with the same
  forms as before. Every save becomes one commit to `main` (images included). That push
  triggers the deploy workflow, and the live site updates in about 1–2 minutes.
  The admin panel always shows the latest saved content, even before the deploy finishes.
* **Contact form**: GitHub Pages can't store messages. By default the form opens the visitor's
  email app addressed to you. To receive messages without that step, create a free form at
  [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) and paste its endpoint
  (and Web3Forms access key) in **Admin → Settings**.

## One-time setup

1. **Turn on Pages**: repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Deploy**: merge to `main` (or run the *Deploy to GitHub Pages* workflow from the **Actions** tab).
   The site appears at `https://arittroskr32.github.io/Arittro-Portfolio/`.
3. **Custom domain (optional, e.g. `arittro-sarkar.me`)**: in **Settings → Pages → Custom domain**
   enter the domain and save, then at your DNS provider point it to GitHub Pages:
   * apex domain: `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     (and optionally `AAAA` to `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`)
   * `www`: `CNAME` to `arittroskr32.github.io`

   When DNS is verified, tick **Enforce HTTPS**, then re-run the deploy workflow once so the
   site is rebuilt for the domain root.
4. **Create your admin token**: GitHub → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**
   * Repository access: **Only select repositories** → `Arittro-Portfolio`
   * Permissions: **Contents: Read and write** (optional: **Actions: Read-only** to see deploy status on the dashboard)
   * Pick an expiry you're comfortable with. Paste the token on `/admin/login`.

   The token is stored only in your browser and only ever sent to `api.github.com`.
   Never commit it. To revoke access, delete the token on GitHub.

## Local development

```bash
cd frontend
npm ci
npm run dev        # http://localhost:5173
npm run build      # outputs frontend/dist (also writes 404.html for deep links)
```

You can also edit `frontend/public/data/*.json` by hand and push. That's exactly what the admin panel does.
