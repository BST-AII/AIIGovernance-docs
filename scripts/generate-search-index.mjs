import { readFile, writeFile } from "node:fs/promises";

import { docsRoutes, outputFileFor } from "./docs-routes.mjs";

const outputRoot = new URL("../out/", import.meta.url);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/AIIGovernance-docs";

const decodeHtml = (value) => value
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/\s+/g, " ")
  .trim();

const matchText = (html, pattern, label) => {
  const match = pattern.exec(html);
  if (!match) throw new Error(`无法从 ${label} 提取搜索内容`);
  return decodeHtml(match[1]);
};

const entries = [];
for (const route of docsRoutes) {
  const html = await readFile(new URL(outputFileFor(route), outputRoot), "utf8");
  const title = matchText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, outputFileFor(route));
  const intro = matchText(
    html,
    /<p[^>]*class="[^"]*article-intro[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
    outputFileFor(route),
  );
  if (title !== route.title) {
    throw new Error(`${outputFileFor(route)} 标题漂移：${title} != ${route.title}`);
  }
  const href = `${basePath}${route.path}`;
  entries.push({ title, context: intro, href, searchText: `${title} ${intro}`, page: true });

  const sectionPattern = /<section[^>]*class="[^"]*article-section[^"]*"[^>]*id="([^"]+)"[^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  for (const match of html.matchAll(sectionPattern)) {
    const sectionTitle = decodeHtml(match[2]).replace(/^#\s*/, "");
    entries.push({
      title: sectionTitle,
      context: title,
      href: `${href}#${match[1]}`,
      searchText: `${sectionTitle} ${title} ${intro}`,
      page: false,
    });
  }
}

if (entries.length <= docsRoutes.length) {
  throw new Error("搜索索引没有包含章节条目");
}

await writeFile(
  new URL("search-index.json", outputRoot),
  `${JSON.stringify({ schema: 1, entries }, null, 2)}\n`,
  "utf8",
);
await writeFile(
  new URL("build-info.json", outputRoot),
  `${JSON.stringify({ commit: process.env.GITHUB_SHA ?? "local" }, null, 2)}\n`,
  "utf8",
);
process.stdout.write(`[search-index] ${entries.length} entries\n`);
