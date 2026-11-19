# Sillage website

Canonical public site: [https://getsillage.github.io/](https://getsillage.github.io/)

Source repository: [`getsillage/getsillage.github.io`](https://github.com/getsillage/getsillage.github.io)

This is the product showcase site for [Sillage](https://github.com/getsillage/sillage) — a self-hosted, single-user space for private records, history review, and AI answers grounded in your own notes.

Sillage is available through its responsive Web interface in English or Simplified Chinese. Users access their instance from desktop or mobile browsers without installing a client.

This repository is separate from the product monorepo. Documentation, releases, engineering governance (`make check`, constitution, CI), and the application itself live in the main project ([sillage](https://github.com/getsillage/sillage)). Keep the public one-line product description, Web-only access, and “no multi-user / no official hosting” claims aligned with the current monorepo READMEs.

## Features

- Single-page product landing (English / Simplified Chinese)
- Light and dark themes
- Interactive demo at `#/demo`, using the actual Sillage Web UI with 96 fictional records, photos, history, calendar, search, favorites, and archives
- SEO: Open Graph, Twitter cards, JSON-LD, robots.txt, sitemap
- Hash-based Content Security Policy, security headers, and HTML cache controls
- Latest release tag pulled from GitHub for the Docker quick start
- Static build suitable for Cloudflare Pages, GitHub Pages, Netlify, etc.

## Interactive demo

The demo can be opened from the navigation, hero, or illustrated product preview. It renders an unchanged snapshot of the actual Sillage Web client in a separate document, preserving the product's sidebar, Markdown editor, record rows, calendar, details, Ask, settings, mobile drawer, and themes. Only the outer demo notice and browser-local API/data adapter are specific to the experience page. The 96 fictional records include older entries for On This Day; images appear in record details as in the product. Demo changes stay in the current browser and can be reset from the demo notice. Ask uses clearly labelled preset answers and real demo-record references without calling an AI provider. No product server or account is needed. Photos are bundled locally; sources are documented in `public/demo/SOURCES.md`.

The Web UI snapshot and its upstream revision are recorded in `src/demo/product/UPSTREAM.md`. Refresh it from the adjacent product checkout with `node scripts/sync-demo-product.mjs`. The website repository includes the snapshot so standalone builds do not require a second checkout. Do not modify the copied product components to change the demo. Interface language follows the real product behavior: changing language translates controls, not existing record content.

File uploads and real account/AI-provider configuration are unavailable in this browser-only demo; unsuccessful uploads retain the draft. Hosting CSP and frame headers allow only same-origin embedding for the isolated product document.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Node.js 20+

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
make check          # install, audit, lint, typecheck, tests, build, docs, Actions pins
make check-web
make check-docs
make check-actions
```

CI runs `make check` on pull requests and `main`. The gate includes component, interaction, accessibility, release-fallback, and post-build security/SEO tests. The GitHub Pages workflow runs the same gate before uploading a deployable artifact. Third-party Actions are pinned to immutable commit SHAs, dependency lifecycle scripts are deny-by-default, and Dependabot checks npm plus GitHub Actions weekly.

Optional local env (see `.env.example`):

```bash
cp .env.example .env
# set VITE_SITE_URL=https://your.domain
```

## Build

```bash
VITE_SITE_URL=https://your.domain npm run build
npm run preview
```

Output is written to `dist/`. The post-build step rewrites `robots.txt` / `sitemap.xml`, injects absolute canonical / OG URLs when `VITE_SITE_URL` is set, generates a base-aware `404.html`, and applies a CSP whose hashes match the final inline bootstrap scripts. Production jobs may set `REQUIRE_SITE_URL=1` to reject missing, non-HTTPS, or base-mismatched public URLs.

## Deploy

### GitHub Pages

1. Use the organization Pages repository name `getsillage.github.io`.
2. Settings → Pages → Source: **GitHub Actions**.
3. The default public URL is `https://getsillage.github.io/`; set the repository variable `SITE_URL` only when using a custom domain.
4. Push to `main` — workflow **Deploy GitHub Pages** builds and publishes `dist/` at the root path.

For a custom domain, add a `CNAME` file under `public/` (or configure it in the Pages UI) and set `SITE_URL` to that domain.

### Cloudflare Pages

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output | `dist` |
| Node version | `22` (or `20`) |
| Env var | `VITE_SITE_URL` = your public origin |

`public/_headers` and `public/_redirects` are included for security headers and SPA fallback.

### Any static host

Upload the contents of `dist/` after `npm run build`.

## Content sources

Copy tracks the main repository:

- [README](https://github.com/getsillage/sillage/blob/main/README.md)
- [Product guidance](https://github.com/getsillage/sillage/blob/main/docs/development/product-guidance.md)
- [Brand and public content guide](https://github.com/getsillage/.github/blob/main/BRAND.md)
- [Deployment guide](https://github.com/getsillage/sillage/blob/main/docs/user/deployment.md)
- [AI usage and privacy](https://github.com/getsillage/sillage/blob/main/docs/user/ai.md)

Update `src/config/site.ts` (`defaultReleaseTag`) if the pinned fallback release changes. The live site prefers GitHub’s latest release API.

## License

MIT (aligned with Sillage).
