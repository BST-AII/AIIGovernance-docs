import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

import { docsRoutes, outputFileFor } from "./docs-routes.mjs";

const outputRoot = new URL("../out/", import.meta.url);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/AIIGovernance-docs";
const htmlByPath = new Map();

const decodeAttribute = (value) => value.replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
const outputUrl = (relative) => new URL(relative, outputRoot);

for (const route of docsRoutes) {
  const file = outputFileFor(route);
  const html = await readFile(outputUrl(file), "utf8");
  htmlByPath.set(route.path, html);
  assert.ok(html.includes(`<h1>${route.title}</h1>`), `${file} 缺少定稿标题：${route.title}`);
}

const badPhrases = [
  "看知识长成什么样", "你会用到的三件东西", "那门禁在哪",
  "一个机器人只绑一个项目", "七个工具：六个查云端，一个查本机",
  "命中其中任意一项，这对按钮就会渲染", "下一次请求就掉回",
  "自动重放只会把同一个错误刷成一屏噪声", "不是页面里写死的常量",
  "这张表恒为空",
];
const allHtml = [...htmlByPath.values()].join("\n");
for (const phrase of badPhrases) {
  assert.ok(!allHtml.includes(phrase), `仍存在待替换表达：${phrase}`);
}

let localLinks = 0;
let anchors = 0;
let screenshots = 0;
for (const [routePath, html] of htmlByPath) {
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const raw = decodeAttribute(match[1]);
    if (!raw.startsWith(basePath) && !raw.startsWith("#")) continue;
    localLinks += 1;
    const relativeWithHash = raw.startsWith("#")
      ? `${routePath}${raw}`
      : raw.slice(basePath.length) || "/";
    const [relativePath, fragment] = relativeWithHash.split("#", 2);
    const cleanPath = relativePath.split("?", 1)[0] || routePath;
    let target;
    if (cleanPath.endsWith("/")) {
      target = cleanPath === "/" ? "index.html" : `${cleanPath.slice(1)}index.html`;
    } else {
      target = cleanPath.replace(/^\//, "");
    }
    await access(outputUrl(target)).catch(() => {
      throw new Error(`${outputFileFor(docsRoutes.find(item => item.path === routePath))} 含死链：${raw}`);
    });
    if (fragment) {
      anchors += 1;
      const targetHtml = await readFile(outputUrl(target), "utf8");
      assert.match(targetHtml, new RegExp(`\\bid="${fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`), `锚点不存在：${raw}`);
    }
  }

  for (const figure of html.matchAll(/<figure[\s\S]*?<img[^>]*src="([^"]*screenshots\/[^"]+)"[^>]*>[\s\S]*?<\/figure>/g)) {
    screenshots += 1;
    const image = /<img[^>]*alt="([^"]*)"[^>]*>/.exec(figure[0]);
    assert.ok(image?.[1]?.trim(), `截图缺少有效 alt：${figure[1]}`);
    assert.match(figure[0], /class="figure-source"/, `截图缺少来源标识：${figure[1]}`);
  }
}

const searchIndex = JSON.parse(await readFile(outputUrl("search-index.json"), "utf8"));
assert.equal(searchIndex.schema, 1, "搜索索引 schema 不正确");
assert.ok(searchIndex.entries.length > docsRoutes.length, "搜索索引为空或不含章节");
for (const entry of searchIndex.entries) {
  assert.ok(entry.title && entry.href && entry.searchText, "搜索索引存在空条目");
  assert.ok(entry.href.startsWith(basePath), `搜索结果越出本站路径：${entry.href}`);
}

const controls = await readFile(new URL("../app/docs-controls.tsx", import.meta.url), "utf8");
assert.match(controls, /ctrlKey\s*\|\|\s*event\.metaKey/, "搜索缺少 Ctrl/Cmd + K 快捷键");
for (const key of ["Escape", "ArrowDown", "ArrowUp", "Enter"]) {
  assert.ok(controls.includes(`event.key === "${key}"`), `搜索缺少 ${key} 键盘操作`);
}
assert.ok(!controls.includes("fetch("), "本地搜索不应把查询发送到外部服务");

process.stdout.write(
  `[content] ${docsRoutes.length} routes, ${localLinks} local refs, ${anchors} anchors, ` +
  `${screenshots} screenshots, ${searchIndex.entries.length} search entries\n`,
);
