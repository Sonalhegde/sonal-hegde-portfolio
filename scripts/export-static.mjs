import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const clientDirectory = resolve(root, "dist", "client");
const serverEntry = resolve(root, "dist", "server", "index.js");
const outputDirectory = resolve(root, "surge-dist");

if (!existsSync(clientDirectory) || !existsSync(serverEntry)) {
  throw new Error("Run the production build before exporting the Surge artifact.");
}

mkdirSync(outputDirectory, { recursive: true });
cpSync(clientDirectory, outputDirectory, { recursive: true, force: true });

const { default: worker } = await import(`${pathToFileURL(serverEntry).href}?static=${Date.now()}`);
const response = await worker.fetch(
  new Request("https://www.sonal.work.gd/", { headers: { accept: "text/html" } }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) {
  throw new Error(`Static render failed with HTTP ${response.status}.`);
}

const html = await response.text();
if (!html.includes("Sonal Hegde") || !/\/(?:assets|_next\/static)\//.test(html)) {
  throw new Error("Static render did not contain the expected portfolio markup or assets.");
}

for (const file of ["index.html", "200.html", "404.html"]) {
  writeFileSync(resolve(outputDirectory, file), html, "utf8");
}
writeFileSync(resolve(outputDirectory, "CNAME"), "www.sonal.work.gd\n", "utf8");
writeFileSync(resolve(outputDirectory, ".surgeignore"), ".openai\n_headers\n", "utf8");

console.log(`Static Surge artifact: ${outputDirectory}`);
console.log(`HTML bytes: ${Buffer.byteLength(html)} · canonical domain: www.sonal.work.gd`);
