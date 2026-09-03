# Sonal Hegde — Interactive Portfolio

A cinematic, accessible engineering portfolio for Sonal Hegde, focused on embedded systems, IoT, cyber-physical systems, edge AI, computer vision, and digital-twin research.

## Live site

**[https://sonalhegde.github.io/sonal-hegde-portfolio/](https://sonalhegde.github.io/sonal-hegde-portfolio/)**

Every push to `main` builds and publishes the site to GitHub Pages automatically.

## Website highlights

- Interactive robot mascot: the Spline scene (desktop) and a lightweight Three.js robot track the cursor with damped easing, idle into a wandering glance after a few seconds, wave with a spark burst on click/tap, and stay keyboard-accessible
- Dedicated robot loading animation (silhouette shimmer + build rings) with graceful fallbacks — Spline failure swaps to the Three.js robot, WebGL failure swaps to a CSS/SVG robot
- Dual light/dark theme derived from the robot's own palette, persisted in `localStorage`, applied before first paint (no theme flash), with WCAG-AA-retuned accents on white
- Dedicated lite experience for phones and low-capability devices: capability detection (UA, pointer coarseness, memory/CPU cores, reduced motion, runtime frame budget) swaps in a CSS/SVG robot, a static backdrop frame, and a park-when-static globe — the ~2.9 MB of WebGL chunks never download on the lite path (694 KB JS total, measured)
- Animated Canvas2D dither backdrop that pauses while scrolling and reuses offscreen buffers, keeping nav clicks and touch scrolling responsive
- Privacy-conscious globe centered on Mangalore, India, with city+country-granularity visitor markers
- Visitor counter backed by a real D1 store with session+IP+day dedupe and server-side geolocation — numbers are never fabricated; static deployments show an explicit "unavailable" state
- Built-in portfolio assistant with a deterministic static fallback when the chat API is unavailable

## Tech stack

`Next.js (Vinext)` · `React` · `TypeScript` · `Vite` · `Tailwind CSS` · `Framer Motion` · `GSAP` · `Spline` · `Three.js` · `Canvas2D` · `D3` · `TopoJSON` · `Drizzle` + `Cloudflare D1` · `GitHub Pages`

## Experience

- Full-viewport Canvas2D dither renderer with an adaptive 18 fps desktop / 12 fps mobile budget, offscreen-buffer reuse, and scroll-aware frame skipping
- Self-hosted Spline robot scene with demand-driven cursor tracking, container-aware resizing, and a Three.js fallback robot for touch/small viewports
- GSAP pill navigation, Framer Motion reveals, and reduced-motion support throughout
- D3/TopoJSON globe with a city-pointer base marker (Mangalore, India) and drag-to-rotate that parks its render loop when static
- Portfolio-scoped FAQ assistant with a server API and deterministic static fallback
- Responsive layouts, keyboard focus states, and a mobile viewing notice

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

### Visitor counter backend (optional)

On GitHub Pages the visitor feature intentionally shows "unavailable" — it refuses to invent numbers. To serve real counts, deploy the server build to Cloudflare (the worker in `worker/` reads visitor location from `request.cf` geodata and stores deduped rows in D1):

1. Apply the Drizzle migrations to your D1 database (`drizzle/0000_*.sql`, `drizzle/0001_visitor-dedupe.sql`)
2. Deploy the worker; the API routes (`/api/visitors`, `/api/chat`) become live
3. Point a static deployment at it with `NEXT_PUBLIC_VISITORS_API_URL=https://<your-worker>/`

Dedupe key: SHA-256 of (browser session id | client IP | day), stored under a unique index — page reloads never inflate the count.

## Local development

```bash
npm install
npm run dev
npm run lint
npm test
```

QA overrides: append `?theme=light` (or `dark`) to force a theme, and `?mode=lite` to preview the reduced-fidelity mobile experience on a desktop browser.

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

## Performance and accessibility

- Device-mode detection branches the whole app (full/lite); reduced motion drops to lite on every device
- Animated canvases, the Spline scene, and the globe pause off-screen and when the tab is hidden; the globe parks entirely when static
- Canvas device-pixel ratios are capped below 2
- Heavy Three.js, Spline, and postprocessing code is code-split behind device-mode checks — lite devices never download it
- Lite devices receive the CSS/SVG robot, a static backdrop frame, and a non-rotating globe
- `prefers-reduced-motion` freezes decorative motion
- The robot is a labelled, keyboard-operable control; decorative overlays are `aria-hidden`

## Security

- Strict input validation, same-origin enforcement, rate limiting, and timeouts on the chat route
- Content Security Policy and hardened response headers; visitor geolocation is resolved server-side only (no third-party IP APIs in the client, no client-side keys)
- Visitor rows store city/country/coarse coordinates only — labels show city + country, never finer-grained addresses
- No client-side API keys
- `npm audit` is expected to report zero known vulnerabilities

The project source image for the dither backdrop is original generated artwork. Third-party certification marks remain the property of their respective issuers.
