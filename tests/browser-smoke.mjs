import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";

import { launch } from "../scripts/screenshots/lib/cdp.mjs";
import { docsRoutes } from "../scripts/docs-routes.mjs";

const outputRoot = new URL("../out/", import.meta.url);
const failureRoot = new URL("../outputs/browser-failures/", import.meta.url);
const previewRoot = new URL("../outputs/browser-previews/", import.meta.url);
const basePath = "/AIIGovernance-docs";
const fullMatrix = process.env.AIIG_BROWSER_FULL === "1";
const pages = fullMatrix
  ? docsRoutes.map(route => route.path.replace(/^\//, ""))
  : ["", "installation/", "console/", "skills/"];
const widths = fullMatrix ? [390, 768, 1280, 1440, 1920] : [390, 1280];
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    if (!url.pathname.startsWith(basePath)) {
      response.writeHead(404).end("not found");
      return;
    }
    let relative = decodeURIComponent(url.pathname.slice(basePath.length)).replace(/^\/+/, "");
    if (!relative || relative.endsWith("/")) relative += "index.html";
    if (relative.includes("..")) throw new Error("invalid path");
    const file = new URL(relative, outputRoot);
    const details = await stat(file);
    if (!details.isFile()) throw new Error("not a file");
    const extension = /\.[^.]+$/.exec(relative)?.[0] ?? "";
    response.writeHead(200, { "content-type": mime[extension] ?? "application/octet-stream" });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end("not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const origin = `http://127.0.0.1:${address.port}${basePath}/`;

const auditExpression = `JSON.stringify((() => {
  const buttons = [...document.querySelectorAll('button')];
  const images = [...document.querySelectorAll('main img')];
  const main = document.querySelector('main');
  return {
    title: document.querySelector('h1')?.textContent?.trim(),
    h1Count: document.querySelectorAll('h1').length,
    h2Count: document.querySelectorAll('main h2').length,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    mainTop: main?.getBoundingClientRect().top,
    unlabeledButtons: buttons.filter(button => !(button.getAttribute('aria-label') || button.textContent?.trim())).length,
    missingAlt: images.filter(image => !image.hasAttribute('alt')).length,
    leftNavDisplay: getComputedStyle(document.querySelector('.left-nav')).display,
    mobileToolsDisplay: getComputedStyle(document.querySelector('.mobile-tools')).display,
  };
})())`;

try {
  for (const width of widths) {
    process.stdout.write(`[browser] start width=${width}\n`);
    const browser = await launch({ width, height: 900, scale: 1 });
    try {
      for (const page of pages) {
        process.stdout.write(`[browser] check ${page || "home"}@${width}\n`);
        try {
          await browser.goto(`${origin}${page}`);
          const audit = JSON.parse(await browser.evaluate(auditExpression));
          assert.ok(audit.title, `${page || "home"}@${width}: 缺少 h1`);
          assert.equal(audit.h1Count, 1, `${page || "home"}@${width}: h1 数量错误`);
          assert.ok(audit.h2Count > 0, `${page || "home"}@${width}: 缺少章节标题`);
          assert.ok(audit.overflow <= 1, `${page || "home"}@${width}: 页面横向溢出 ${audit.overflow}px`);
          assert.equal(audit.unlabeledButtons, 0, `${page || "home"}@${width}: 存在无名称按钮`);
          assert.equal(audit.missingAlt, 0, `${page || "home"}@${width}: 图片缺少 alt 属性`);

          if (process.env.AIIG_BROWSER_CAPTURE === "1") {
            await mkdir(previewRoot, { recursive: true });
            const previewName = `${page.replaceAll("/", "-") || "home"}-${width}.png`;
            await writeFile(new URL(previewName, previewRoot), await browser.screenshot({ fullPage: true }));
          }

          if (width === 390) {
            assert.equal(audit.leftNavDisplay, "none", `${page || "home"}: 移动端仍显示完整左侧目录`);
            assert.notEqual(audit.mobileToolsDisplay, "none", `${page || "home"}: 移动端菜单不可见`);
            assert.ok(audit.mainTop < 180, `${page || "home"}: 移动端正文被目录推到首屏之后`);
          }

          const interaction = JSON.parse(await browser.evaluate(`(async () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
            await new Promise(resolve => setTimeout(resolve, 80));
            const opened = Boolean(document.querySelector('[role="dialog"]'));
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            await new Promise(resolve => setTimeout(resolve, 80));
            return JSON.stringify({ opened, closed: !document.querySelector('[role="dialog"]') });
          })()`, { awaitPromise: true }));
          assert.equal(interaction.opened, true, `${page || "home"}@${width}: Ctrl+K 未打开搜索`);
          assert.equal(interaction.closed, true, `${page || "home"}@${width}: Escape 未关闭搜索`);

          if (width === 390) {
            const menu = JSON.parse(await browser.evaluate(`(async () => {
              document.querySelector('button[aria-controls="mobile-site-menu"]')?.click();
              await new Promise(resolve => setTimeout(resolve, 80));
              const opened = Boolean(document.querySelector('#mobile-site-menu'));
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
              await new Promise(resolve => setTimeout(resolve, 80));
              return JSON.stringify({ opened, closed: !document.querySelector('#mobile-site-menu') });
            })()`, { awaitPromise: true }));
            assert.deepEqual(menu, { opened: true, closed: true }, `${page || "home"}: 移动端菜单开关失败`);
          }

          const firstSection = await browser.evaluate("document.querySelector('main section[id]')?.id");
          assert.ok(firstSection, `${page || "home"}@${width}: 页面没有可直达章节`);
          await browser.goto(`${origin}${page}?anchor-refresh=1#${firstSection}`, { settle: 250 });
          const anchor = await browser.evaluate(
            `JSON.stringify({hash: location.hash, exists: Boolean(document.getElementById(${JSON.stringify(firstSection)}))})`,
          );
          assert.deepEqual(JSON.parse(anchor), { hash: `#${firstSection}`, exists: true }, `${page || "home"}@${width}: 锚点直达失败`);
          process.stdout.write(`[browser] pass ${page || "home"}@${width}\n`);
        } catch (error) {
          await mkdir(failureRoot, { recursive: true });
          const name = `${page.replaceAll("/", "-") || "home"}-${width}.png`;
          await writeFile(new URL(name, failureRoot), await browser.screenshot({ fullPage: true }));
          throw error;
        }
      }
      assert.deepEqual(browser.consoleErrors, [], `浏览器出现运行时异常：${browser.consoleErrors.join("; ")}`);
    } finally {
      await browser.close();
    }
  }
  process.stdout.write(`[browser] ${pages.length} pages × ${widths.length} widths passed\n`);
} finally {
  await new Promise((resolve) => server.close(resolve));
}
