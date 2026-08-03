import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);

test("exports the documentation home page", async () => {
  const html = await readFile(new URL("index.html", outputRoot), "utf8");
  assert.match(html, /AIIGovernance/);
  assert.match(html, /治理落入代码/);
});

test("exports every documented category", async () => {
  const slugs = [
    "installation",
    "robot",
    "architecture",
    "laws",
    "skills",
    "usage",
    "upgrade",
    "uninstall",
    "releases",
  ];
  await Promise.all(
    slugs.map((slug) => access(new URL(`${slug}/index.html`, outputRoot))),
  );
});

test("uses the GitHub Pages base path for generated assets", async () => {
  const html = await readFile(new URL("index.html", outputRoot), "utf8");
  assert.match(html, /\/AIIGovernance-docs\/_next\//);
});
