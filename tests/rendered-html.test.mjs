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
  assert.match(html, /https:\/\/service\.pikso\.art\/AIIGovernance-docs\//);
  assert.match(html, /国内镜像/);
});

test("publishes cross-platform installation, issue, and release guidance", async () => {
  const installation = await readFile(
    new URL("installation/index.html", outputRoot),
    "utf8",
  );
  assert.match(installation, /AIIGovernance-Setup-macos-arm64-vX\.Y\.Z\.zip/);
  assert.match(installation, /Apple 无法检查是否包含恶意软件/);
  assert.match(installation, /如何报告安装问题/);
  assert.match(installation, /AIIGovernance-releases\/releases\/latest/);
  assert.match(installation, /普通用户不需要再次运行脚本/);

  const releases = await readFile(
    new URL("releases/index.html", outputRoot),
    "utf8",
  );
  assert.match(releases, /当前正式版本：v0\.3\.30/);
  assert.match(releases, /完整 Release 历史/);
});
