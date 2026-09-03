# Sonal Hegde — Interactive Portfolio

A cinematic, accessible engineering portfolio for Sonal Hegde, focused on embedded systems, IoT, cyber-physical systems, edge AI, computer vision, and digital-twin research.

## Live site

**[https://sonalhegde.github.io/sonal-hegde-portfolio/](https://sonalhegde.github.io/sonal-hegde-portfolio/)**

Every push to `main` builds and publishes the site to GitHub Pages automatically.

## Website highlights

- Interactive Spline robot with cursor tracking and responsive layout behavior
- Animated Canvas2D dither backdrop with low-end and reduced-motion fallbacks
- Glass-HUD navigation, scroll reveals, project cards, and accessibility-first controls
- Privacy-conscious world map with an approximate visitor-location signal
- Built-in portfolio assistant with a static fallback for the deployed site

## Tech stack

`Next.js (Vinext)` · `React` · `TypeScript` · `Vite` · `Tailwind CSS` · `Framer Motion` · `GSAP` · `Spline` · `Canvas2D` · `D3` · `TopoJSON` · `Three.js` · `GitHub Pages`

## Deployment

The site is hosted on **GitHub Pages** and deployed with the workflow in `.github/workflows/pages.yml`:

1. On every push to `main` (or a manual run from the Actions tab), the workflow installs dependencies and runs the Vinext production build with `NEXT_PUBLIC_BASE_PATH=/sonal-hegde-portfolio`
2. `scripts/export-static.mjs` statically renders the home page into `github-pages-dist`, adds `index.html`, `200.html`, `404.html`, and `.nojekyll`, and verifies the rendered markup
3. The artifact is published via `actions/deploy-pages@v4`

To trigger a deployment manually: **Actions → Deploy portfolio to GitHub Pages → Run workflow**.

To build the GitHub Pages artifact locally:

```bash
NEXT_PUBLIC_BASE_PATH=sonal-hegde-portfolio \
STATIC_OUTPUT_DIR=github-pages-dist \
STATIC_SITE_URL=https://sonalhegde.github.io/sonal-hegde-portfolio/ \
npm run build && node scripts/export-static.mjs
```

## Local development

```bash
npm install
npm run dev
npm run lint
npm test
```

## Production builds

The server-capable build is produced by Vinext:

```bash
npm run build
```

An optional Surge mirror statically renders the home page, copies public assets, and adds `200.html`, `404.html`, and the canonical-domain `CNAME` file:

```bash
npm run build:surge
surge ./surge-dist www.sonal.work.gd
```

For a custom domain, point `www` to `na-west1.surge.sh`, then provision TLS:

```bash
surge encrypt www.sonal.work.gd
```

See [Surge custom-domain documentation](https://surge.sh/docs/platform/custom-domains) for root-domain DNS options.

The static mirror uses the assistant's local portfolio index when `/api/chat` is unavailable. The optional server deployment reads its provider key only inside the server route; it must never be committed.

## Experience

- Full-viewport Canvas2D dither renderer with an adaptive 18 fps desktop / 12 fps mobile budget
- Self-hosted Spline robot scene with demand-driven cursor tracking and container-aware resizing
- GSAP pill navigation, Framer Motion reveals, and reduced-motion support
- D3/TopoJSON research map with a privacy-safe India marker and approximate visitor-location context
- Portfolio-scoped FAQ assistant with a server API and deterministic static fallback
- Responsive layouts, keyboard focus states, and a mobile viewing notice

## Performance and accessibility

- Animated canvases and the Spline scene pause off-screen and when the tab is hidden
- Canvas device-pixel ratios are capped below 2
- Heavy Three.js and postprocessing code is loaded after the hero's semantic content
- Low-end devices receive lower-resolution or static visual fallbacks
- `prefers-reduced-motion` freezes decorative motion

## Security

- Strict input validation, same-origin enforcement, rate limiting, and timeouts on the chat route
- Content Security Policy and hardened response headers
- No client-side API keys
- `npm audit` is expected to report zero known vulnerabilities

The project source image for the dither backdrop is original generated artwork. Third-party certification marks remain the property of their respective issuers.
