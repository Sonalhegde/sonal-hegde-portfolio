# Sonal Hegde — Interactive Portfolio

A cinematic, accessible engineering portfolio for Sonal Hegde, focused on
embedded systems, IoT, cyber-physical systems, edge AI, computer vision, and
digital-twin research.

## Experience

- Full-viewport Canvas2D dither renderer with a 24 fps adaptive cell budget
- Original Three.js robot with pointer-reactive pupils and head tracking
- Framer Motion glass navigation, scroll reveals, and reduced-motion support
- D3/TopoJSON research map and interactive orthographic globe
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

The Surge build statically renders the home page, copies public assets, and adds
`200.html`, `404.html`, and the canonical-domain `CNAME` file:

```bash
npm run build:surge
surge ./surge-dist www.sonal.work.gd
```

The static mirror uses the assistant's local portfolio index when `/api/chat` is
not available. The server deployment can use `OPENAI_API_KEY`; it is read only
inside the server route and must never be committed.

## Security

- Strict input validation, same-origin enforcement, rate limiting, and timeouts on the chat route
- Content Security Policy and hardened response headers
- No client-side API keys
- `npm audit` is expected to report zero known vulnerabilities

The project source image for the dither backdrop is original generated artwork.
Third-party certification marks remain the property of their respective issuers.
