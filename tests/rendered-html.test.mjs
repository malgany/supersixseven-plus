import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const assetRoot = new URL(
  "../public/assets/animated-prototype-character/",
  import.meta.url,
);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Fight Turn prototype shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="pt-BR"/i);
  assert.match(html, /<title>Fight Turn — Protótipo 2D<\/title>/i);
  assert.match(html, /data-testid="fight-game"/);
  assert.match(html, /Comandos Âmbar/);
  assert.match(html, /Comandos Ciano/);
  assert.match(html, /reinicia a luta/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("maps every supplied animation frame", async () => {
  const expected = {
    "Base Character": {
      attack: 13,
      death: 5,
      hit: 3,
      idle: 4,
      jump: 8,
      roll: 7,
      run: 8,
      slide: 5,
      walk: 8,
    },
    Pistol: {
      attack: 3,
      death: 7,
      hit: 3,
      idle: 4,
      jump: 8,
      roll: 7,
      run: 8,
      slide: 5,
      walk: 8,
    },
    Rifle: {
      attack: 2,
      death: 7,
      hit: 3,
      idle: 4,
      jump: 8,
      roll: 7,
      run: 8,
      slide: 5,
      walk: 8,
    },
    Sword: {
      attack: 6,
      death: 8,
      hit: 3,
      idle: 4,
      jump: 8,
      roll: 7,
      run: 8,
      slide: 5,
      walk: 8,
    },
  };

  let total = 0;
  for (const [folder, animations] of Object.entries(expected)) {
    const files = await readdir(new URL(`${folder}/`, assetRoot));
    const actual = {};

    for (const file of files) {
      const match = /^([a-z]+) \((\d+)\)\.png$/i.exec(file);
      assert.ok(match, `Nome de quadro inesperado: ${folder}/${file}`);
      actual[match[1]] = (actual[match[1]] ?? 0) + 1;
      total += 1;
    }

    assert.deepEqual(actual, animations);
  }

  assert.equal(total, 223);

  const manifest = JSON.parse(
    await readFile(new URL("manifest.json", assetRoot), "utf8"),
  );
  assert.equal(manifest.license, "CC0");
  assert.equal(manifest.frameSize.width, 512);
  assert.equal(manifest.frameSize.height, 512);
});

test("removes starter-only code and dependencies", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /import FightGame from "\.\/FightGame"/);
  assert.match(page, /<FightGame \/>/);
  assert.match(layout, /<html lang="pt-BR">/);
  assert.doesNotMatch(page, /_sites-preview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  const appFiles = await readdir(new URL("app/", projectRoot));
  assert.ok(!appFiles.includes("_sites-preview"));
});
