import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders Sonal Hegde's portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Sonal Hegde/);
  assert.match(html, /Bridging Circuits, Code, and Cognition/);
  assert.match(html, /Applied Cyber-Physical Systems/);
  assert.match(html, /Digital Twin-Based Smart Transportation/);
  assert.match(html, /based in India/);
  assert.match(html, /class="loader"/);
  assert.match(html, /connect-src[^\"]*https:\/\/prod\.spline\.design/);
  assert.match(html, />India</);
  assert.match(html, /connect-src[^\"]*https:\/\/ipwho\.is[^\"]*https:\/\/ipapi\.co/);
  assert.match(html, />CV</);
  assert.match(html, /href="\/cv"/);
  assert.match(html, /href="[^"]*\/favicon\.ico"/);
  assert.ok(html.indexOf('id="certifications"') < html.indexOf('id="education"'));
  assert.doesNotMatch(html, /Hero visual mode|>ASCII</);
  assert.doesNotMatch(html, /Three\.js robot|Three\.js \/ WebGL|DRAG TO ROTATE|geo-globe-shell/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});
