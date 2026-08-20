import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const clientDirectory = resolve(root, "dist", "client");
const serverEntry = resolve(root, "dist", "server", "index.js");
const outputName = process.env.STATIC_OUTPUT_DIR?.trim() || "surge-dist";
const outputDirectory = resolve(root, outputName);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
const staticSiteUrl = process.env.STATIC_SITE_URL?.trim() || "https://www.sonal.work.gd/";
const customDomain = process.env.STATIC_CUSTOM_DOMAIN?.trim() || "";
const renderUrl = process.env.STATIC_RENDER_URL?.trim() || new URL("/", staticSiteUrl).toString();

if (!existsSync(clientDirectory) || !existsSync(serverEntry)) {
  throw new Error("Run the production build before exporting the static artifact.");
}

if (!/[a-zA-Z0-9_-]+/.test(outputName) || !["surge-dist", "github-pages-dist"].includes(outputName)) {
  throw new Error(`Refusing to clean unexpected static export directory: ${outputName}`);
}

if (relative(root, outputDirectory) !== outputName) {
  throw new Error("Refusing to clean an unexpected static export directory.");
}

try {
  rmSync(outputDirectory, { recursive: true, force: true });
} catch (error) {
  if (error?.code !== "EPERM" || !existsSync(outputDirectory)) throw error;
  for (const entry of readdirSync(outputDirectory)) {
    rmSync(resolve(outputDirectory, entry), { recursive: true, force: true });
  }
}

mkdirSync(outputDirectory, { recursive: true });
cpSync(clientDirectory, outputDirectory, { recursive: true, force: true });

const { default: worker } = await import(`${pathToFileURL(serverEntry).href}?static=${Date.now()}`);
const response = await worker.fetch(
  new Request(renderUrl, { headers: { accept: "text/html" } }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) {
  throw new Error(`Static render failed with HTTP ${response.status}.`);
}

let html = await response.text();
if (!html.includes("Sonal Hegde") || !/\/(?:assets|_next\/static)\//.test(html)) {
  throw new Error("Static render did not contain the expected portfolio markup or assets.");
}

// Keep the fallback entry points useful for direct visits and GitHub Pages' SPA fallback.
for (const file of ["index.html", "200.html", "404.html"]) {
  writeFileSync(resolve(outputDirectory, file), html, "utf8");
}

if (customDomain) writeFileSync(resolve(outputDirectory, "CNAME"), `${customDomain}\n`, "utf8");
if (basePath) writeFileSync(resolve(outputDirectory, ".nojekyll"), "", "utf8");
if (outputName === "surge-dist") writeFileSync(resolve(outputDirectory, ".surgeignore"), ".openai\n_headers\n", "utf8");

console.log(`Static artifact: ${outputDirectory}`);
console.log(`HTML bytes: ${Buffer.byteLength(html)} · base path: ${basePath || "/"}`);
