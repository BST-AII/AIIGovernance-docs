import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { docsRoutes } from "./docs-routes.mjs";

const sites = [
  process.env.DOCS_PAGES_ORIGIN ?? "https://bst-aii.github.io/AIIGovernance-docs/",
  process.env.DOCS_MIRROR_ORIGIN ?? "https://service.pikso.art/AIIGovernance-docs/",
].map(value => value.endsWith("/") ? value : `${value}/`);
const expectedCommit = process.env.EXPECTED_COMMIT;
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const mainBody = (html) => {
  const match = /<main[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/main>/i.exec(html);
  if (!match) throw new Error("页面缺少 article 主体");
  return match[1].replace(/\s+/g, " ").trim();
};

async function fetchOk(url) {
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${url} 返回 ${response.status}`);
  return response;
}

async function verify() {
  const reports = [];
  for (const site of sites) {
    const pages = new Map();
    for (const route of docsRoutes) {
      const response = await fetchOk(new URL(route.path.replace(/^\//, ""), site));
      const html = await response.text();
      assert.ok(html.includes(`<h1>${route.title}</h1>`), `${site}${route.path} 标题不匹配`);
      pages.set(route.path, html);
    }
    const searchText = await (await fetchOk(new URL("search-index.json", site))).text();
    const search = JSON.parse(searchText);
    assert.ok(search.entries?.length > docsRoutes.length, `${site} 搜索索引为空`);
    const buildInfo = await (await fetchOk(new URL("build-info.json", site))).json();
    if (expectedCommit) assert.equal(buildInfo.commit, expectedCommit, `${site} 不是本次 commit`);

    const assets = new Set();
    for (const html of pages.values()) {
      for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
        const value = match[1].replace(/&amp;/g, "&");
        if (value.startsWith("/AIIGovernance-docs/_next/") || value.startsWith("/AIIGovernance-docs/screenshots/")) {
          assets.add(value.slice("/AIIGovernance-docs/".length));
        }
      }
    }
    await Promise.all([...assets].map(path => fetchOk(new URL(path, site))));
    const account = pages.get("/account/");
    reports.push({
      site,
      pages,
      searchHash: sha256(searchText),
      buildCommit: buildInfo.commit,
      assets: assets.size,
      automaticCount: account.match(/自动开通/g)?.length ?? 0,
    });
  }

  assert.ok(reports[0].automaticCount > 0, "账号页缺少“自动开通”文案");
  assert.equal(reports[0].automaticCount, reports[1].automaticCount, "两站账号页“自动开通”数量不一致");
  assert.equal(reports[0].searchHash, reports[1].searchHash, "两站搜索索引 hash 不一致");
  for (const route of docsRoutes) {
    const hashes = reports.map(report => sha256(mainBody(report.pages.get(route.path))));
    assert.equal(hashes[0], hashes[1], `${route.path} 两站正文 hash 不一致`);
  }
  return reports;
}

let lastError;
for (let attempt = 1; attempt <= 6; attempt += 1) {
  try {
    const reports = await verify();
    for (const report of reports) {
      process.stdout.write(
        `[dual-site] ${report.site} pages=${docsRoutes.length} assets=${report.assets} ` +
        `search=${report.searchHash} commit=${report.buildCommit}\n`,
      );
    }
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < 6) {
      process.stderr.write(`[dual-site] attempt ${attempt}/6: ${error.message}\n`);
      await wait(10000);
    }
  }
}
throw lastError;
