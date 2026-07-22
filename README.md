# Sonal Hegde — Interactive Portfolio

A cinematic, accessible engineering portfolio for Sonal Hegde, focused on embedded systems, IoT, cyber-physical systems, edge AI, computer vision, and digital-twin research.

## Live site

- Surge preview: [sonalhegde-work.surge.sh](https://sonalhegde-work.surge.sh)
- Intended custom domain: [www.sonal.work.gd](https://www.sonal.work.gd)

## Experience

- Full-viewport Canvas2D dither renderer with an adaptive 18 fps desktop / 12 fps mobile budget
- Self-hosted Spline robot scene with demand-driven cursor tracking and container-aware resizing
- GSAP pill navigation, Framer Motion reveals, and reduced-motion support
- D3/TopoJSON research map with a privacy-safe India marker and approximate visitor-location context
- Portfolio-scoped FAQ assistant with a server API and deterministic static fallback
- Responsive layouts, keyboard focus states, and a mobile viewing notice

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

The Surge build statically renders the home page, copies public assets, and adds `200.html`, `404.html`, and the canonical-domain `CNAME` file:

```bash
npm run build:surge
surge ./surge-dist www.sonal.work.gd
```

For a custom domain, point `www` to `na-west1.surge.sh`, then provision TLS:

```bash
surge encrypt www.sonal.work.gd
```

See [Surge custom-domain documentation](https://surge.sh/docs/platform/custom-domains) for root-domain DNS options.

The static mirror uses the assistant's local portfolio index when `/api/chat` is unavailable. The server deployment can use `OPENAI_API_KEY`; it is read only inside the server route and must never be committed.

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
