/* 抓取 AI 中台管理平台（Console）逐屏截图。
 *
 *   # 1. 先在 records-service 仓起开发夹具（另开一个终端，保持运行）
 *   cd ../AIIGovernance-records-service/console && npm run dev
 *
 *   # 2. 回到 docs 仓出图
 *   npm run shots:console
 *
 * 夹具说明：console 的 dev 构建在真实接口失败时会回落到 src/mocks/devFixtures.ts，
 * 其中 /me 返回系统管理员身份，因此所有导航项与管理页都可见可截。这是设计好的
 * 开发夹具，不是真实生产数据——出的图是界面示意，不能当作生产运行证据。
 *
 * 环境变量：
 *   AIIG_CONSOLE_URL   夹具地址，默认 http://localhost:5173/admin/app
 *   AIIG_CHROME        浏览器可执行文件（默认自动探测）
 *   AIIG_SHOTS_OUT     输出目录，默认 public/screenshots/console
 */

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { CaptureError, die, launch } from "./lib/cdp.mjs";

const BASE = (process.env.AIIG_CONSOLE_URL ?? "http://localhost:5173/admin/app")
  .replace(/\/+$/, "");
const OUT = process.env.AIIG_SHOTS_OUT
  ? new URL(`file:///${process.env.AIIG_SHOTS_OUT.replace(/\\/g, "/")}/`)
  : new URL("../../public/screenshots/console/", import.meta.url);

/* 每一屏：路由、文件名、必须出现的文字（渲染核验），以及是否整页截。
   settle 给 ECharts（图谱/趋势是 canvas）留出稳定时间。 */
const SCREENS = [
  { route: "/services", file: "services.png", expect: "AI 中台管理平台", settle: 1400 },
  { route: "/overview", file: "overview.png", expect: "知识贡献概览", settle: 2600, fullPage: true },
  { route: "/knowledge", file: "my-knowledge.png", expect: "我的知识", settle: 1200 },
  { route: "/projects", file: "projects.png", expect: "项目", settle: 1200 },
  { route: "/graph", file: "graph.png", expect: "知识图谱", settle: 2800 },
  { route: "/admin/knowledge", file: "knowledge-manage.png", expect: "知识管理", settle: 1400 },
  { route: "/admin/knowledge/classify", file: "classify.png", expect: "归类", settle: 1400 },
  { route: "/accounts", file: "accounts.png", expect: "账号管理", settle: 1400 },
  { route: "/admin/operations", file: "operations.png", expect: "运维总览", settle: 2200 },
  { route: "/admin/system", file: "system.png", expect: "系统诊断", settle: 1400 },
  // 登录卡在 AppShell 之外，单独截。
  { route: "/signin", file: "signin.png", expect: "使用 GitHub 账号登录", settle: 900 },
];

async function preflight() {
  let response;
  try {
    response = await fetch(`${BASE}/`, { redirect: "follow" });
  } catch (error) {
    throw new CaptureError(
      `连不上 Console 夹具：${BASE}\n（${error.message}）\n\n` +
        "请先在另一个终端启动它，并保持运行：\n" +
        "  cd ../AIIGovernance-records-service/console\n" +
        "  npm run dev\n\n" +
        "夹具地址不同的话用 AIIG_CONSOLE_URL 指过来。",
    );
  }
  if (!response.ok) {
    throw new CaptureError(`Console 夹具返回 HTTP ${response.status}：${BASE}`);
  }
}

async function main() {
  await preflight();
  await mkdir(OUT, { recursive: true });

  const page = await launch({ width: 1440, height: 900, scale: 2 });
  const done = [];
  try {
    for (const screen of SCREENS) {
      const url = `${BASE}${screen.route}`;
      await page.goto(url, { settle: screen.settle ?? 1200 });

      // 渲染核验：断言这一屏该有的文字真的在 DOM 里。SPA 起不来时页面
      // 是白的，但截图本身仍然"成功"——所以必须在截之前查一次。
      const present = await page.evaluate(
        `document.body.innerText.includes(${JSON.stringify(screen.expect)})`,
      );
      if (!present) {
        const head = await page.evaluate("document.body.innerText.slice(0, 300)");
        throw new CaptureError(
          `${url} 上没找到预期文字「${screen.expect}」，判定为没渲染出来，已中止。\n` +
            `页面实际开头：${JSON.stringify(head)}`,
        );
      }

      const buffer = await page.screenshot({ fullPage: screen.fullPage ?? false });
      await writeFile(new URL(screen.file, OUT), buffer);
      done.push(`${screen.file.padEnd(22)} ${String(buffer.length).padStart(8)} B  ${screen.route}`);
      process.stdout.write(`[screenshots] ${screen.file} ← ${screen.route}\n`);
    }
  } finally {
    await page.close();
  }

  await writeFile(
    new URL("manifest.json", OUT),
    `${JSON.stringify({
      kind: "console-screens",
      capturedAt: new Date().toISOString(),
      source: BASE,
      viewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
      dataSource:
        "console/src/mocks/devFixtures.ts（开发夹具假数据；/me 返回系统管理员，" +
        "因此所有导航项都可见）",
      screens: done.length,
    }, null, 2)}\n`,
    "utf8",
  );

  process.stdout.write(
    `\n[screenshots] 共 ${done.length} 屏，输出目录 ${fileURLToPath(OUT)}\n` +
      done.map((line) => `  ${line}\n`).join("") +
      "\n提醒：这些图来自开发夹具的假数据，只能作为界面示意；" +
      "若要展示真实运行状态，需在生产环境人工截图并脱敏。\n",
  );
}

main().catch(die);
