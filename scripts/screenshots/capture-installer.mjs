/* 抓取安装器向导逐页截图——不需要真的运行安装器。
 *
 *   npm run shots:installer
 *   AIIG_INSTALLER_GUI=/path/to/installer/gui npm run shots:installer
 *
 * 原理：安装器界面是一个自带全部 CSS/JS 的静态 HTML，33+ 个向导页都是同一
 * 文档里的 <section class="page">，靠 showPage(state) 加减 .active 切换。
 * 本脚本用本地静态服务器打开它（不用 file://，避免字体与 CORS 的坑），
 * 先注入一个同形状的假 pywebview 桥（scripts/screenshots/stub-pywebview.js），
 * 再逐个状态切页截图。
 *
 * 边界：假桥里的数字是排版用示意数据。真实进度面板、真实日志与 done_success
 * 的真实验证清单必须真装一次才有——这些图不能标称"真跑证据"。
 *
 * 环境变量：
 *   AIIG_INSTALLER_GUI  安装器 gui 目录，默认按仓库同级目录探测
 *   AIIG_CHROME         浏览器可执行文件（默认自动探测）
 *   AIIG_SHOTS_OUT      输出目录，默认 public/screenshots/installer
 */

import { spawnSync } from "node:child_process";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { CaptureError, die, launch } from "./lib/cdp.mjs";

/** 读取界面来源仓库的分支与 commit，写进 manifest 当作出处。 */
function provenance(guiDir) {
  const run = (args) => {
    const result = spawnSync("git", ["-C", dirname(guiDir), ...args], { encoding: "utf8" });
    return result.status === 0 ? result.stdout.trim() : null;
  };
  return { branch: run(["rev-parse", "--abbrev-ref", "HEAD"]), commit: run(["rev-parse", "--short", "HEAD"]) };
}

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

/* 安装器仓库不在 docs 仓里，按常见布局探测；找不到就要求显式指定。 */
const GUI_CANDIDATES = [
  process.env.AIIG_INSTALLER_GUI,
  resolve(repoRoot, "../AIIGovernance-installer/gui"),
  resolve(repoRoot, "../.worktrees/aiig-060/installer/gui"),
  resolve(repoRoot, "../../.worktrees/aiig-060/installer/gui"),
].filter(Boolean);

const OUT = process.env.AIIG_SHOTS_OUT
  ? new URL(`file:///${process.env.AIIG_SHOTS_OUT.replace(/\\/g, "/")}/`)
  : new URL("../../public/screenshots/installer/", import.meta.url);

/* 想出图的向导状态。文件名即状态名，方便和安装器源码对上。
   注释是这一页在文档里的用途；不写文档的页也一起截，留作素材。 */
const STATES = [
  "welcome",              // 首页：四个入口
  "probing",              // 环境检查
  "need_git",             // 缺 Git
  "select_target_dir",    // 选择项目目录
  "sync_enrollment",      // GitHub 身份门禁
  "upgrade_check",        // 版本检查
  "choose_overwrite_upgrade",
  "uninstall_confirm",    // 卸载确认：删除/保留清单
  "git_init_confirm",
  "mounting",             // 挂载治理框架
  "wiring",               // 接线
  "profile_review",       // 确认项目配置
  "permissions_config",   // 权限基线
  "trust_confirm",        // 项目信任
  "verifying",            // 安装验证
  "codex_offer",          // Codex 接线
  "codex_wiring",
  "legacy_bridge_confirm",
  "feishu_offer",         // 可选集成
  "cc_assembling",
  "credentials_input",    // 飞书凭据
  "credentials_verifying",
  "bot_binding_conflict", // 机器人唯一绑定
  "capture_open_id",      // 身份确认
  "daemon_registering",   // 服务自启
  "daemon_fallback_offer",// 自启降级
  "e2e_verifying",        // 端到端验证
  "done_success",         // 安装完成
  "done_uninstall",       // 卸载完成
  "done_failure",         // 需要处理
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function findGui() {
  for (const candidate of GUI_CANDIDATES) {
    // 一律 resolve：AIIG_INSTALLER_GUI 传进来的可能是正斜杠写法，
    // 而 join() 产出的是平台原生分隔符，不归一化会让下面的越界检查误判。
    const normalized = resolve(candidate);
    if (existsSync(join(normalized, "index.html"))) return normalized;
  }
  throw new CaptureError(
    "找不到安装器的 gui/index.html。\n已尝试：\n" +
      GUI_CANDIDATES.map((path) => `  - ${path}`).join("\n") +
      "\n\n用 AIIG_INSTALLER_GUI 指到安装器仓库的 gui 目录再重跑：\n" +
      "  AIIG_INSTALLER_GUI=/path/to/AIIGovernance-installer/gui npm run shots:installer",
  );
}

/** 起一个只读的本地静态服务器，仅服务 gui 目录。 */
function serve(root) {
  return new Promise((resolvePort, reject) => {
    const server = createServer(async (request, response) => {
      const path = decodeURIComponent((request.url ?? "/").split("?")[0]);
      const target = join(root, path === "/" ? "index.html" : path.replace(/^\/+/, ""));
      if (!target.startsWith(root)) {
        response.writeHead(403).end();
        return;
      }
      try {
        const info = await stat(target);
        if (!info.isFile()) throw new Error("not a file");
        response.writeHead(200, { "content-type": MIME[extname(target)] ?? "application/octet-stream" });
        createReadStream(target).pipe(response);
      } catch {
        response.writeHead(404).end();
      }
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolvePort({ server, port: server.address().port }));
  });
}

async function main() {
  const gui = findGui();
  const stub = await readFile(new URL("./stub-pywebview.js", import.meta.url), "utf8");
  const { server, port } = await serve(gui);
  await mkdir(OUT, { recursive: true });

  // 安装器窗口是 1080×720，照这个尺寸截，出来的图和真机一比一。
  const page = await launch({ width: 1080, height: 720, scale: 2 });
  const captured = [];
  try {
    await page.addInitScript(stub);
    await page.goto(`http://127.0.0.1:${port}/index.html`, { settle: 1800 });

    // 冷启动时第一帧偶尔还没铺完，多给几次机会再判失败。
    let available = new Set();
    for (let attempt = 0; attempt < 6 && available.size === 0; attempt += 1) {
      if (attempt > 0) await new Promise((done) => setTimeout(done, 700));
      const known = await page.evaluate(
        "JSON.stringify(Array.from(document.querySelectorAll('section.page'))" +
          ".map(s => s.id.replace(/^page-/, '')))",
      );
      available = new Set(JSON.parse(known));
    }
    if (available.size === 0) {
      const title = await page.evaluate("document.title");
      const size = await page.evaluate("document.body.innerHTML.length");
      throw new CaptureError(
        "页面里一个 section.page 都没有——界面没渲染出来，已中止。\n" +
          `界面目录：${gui}\n标题：${JSON.stringify(title)}　body 字节：${size}\n` +
          (page.consoleErrors.length
            ? `页面异常：\n${page.consoleErrors.slice(0, 5).join("\n")}`
            : "页面没有抛出异常，多半是静态服务没把 index.html 发出去。"),
      );
    }

    for (const state of STATES) {
      if (!available.has(state)) {
        process.stdout.write(`[screenshots] 跳过 ${state}：这一版界面里没有这个页面\n`);
        continue;
      }
      // 假桥的 get_state 跟着改，refreshState 才不会把页面又切回去。
      await page.evaluate(
        `(function(){ window.__aiigShot.state = ${JSON.stringify(state)}; ` +
          "refreshState(); return true; })()",
      );
      await new Promise((done) => setTimeout(done, 700));

      const active = await page.evaluate(
        "(document.querySelector('section.page.active')||{}).id || ''",
      );
      if (active !== `page-${state}`) {
        throw new CaptureError(
          `切到 ${state} 失败：当前激活的是 ${active || "（没有）"}。已中止，不写这张图。`,
        );
      }

      const buffer = await page.screenshot();
      const file = `${state}.png`;
      await writeFile(new URL(file, OUT), buffer);
      captured.push(`${file.padEnd(28)} ${String(buffer.length).padStart(8)} B`);
      process.stdout.write(`[screenshots] ${file}\n`);
    }
  } finally {
    await page.close();
    server.close();
  }

  const source = provenance(gui);
  await writeFile(
    new URL("manifest.json", OUT),
    `${JSON.stringify({
      kind: "installer-wizard",
      capturedAt: new Date().toISOString(),
      guiDir: gui,
      sourceBranch: source.branch,
      sourceCommit: source.commit,
      viewport: { width: 1080, height: 720, deviceScaleFactor: 2 },
      dataSource: "scripts/screenshots/stub-pywebview.js（假桥示意数据，非真实安装记录）",
      screens: captured.length,
    }, null, 2)}\n`,
    "utf8",
  );

  process.stdout.write(
    `\n[screenshots] 共 ${captured.length} 页，输出目录 ${fileURLToPath(OUT)}\n` +
      captured.map((line) => `  ${line}\n`).join("") +
      `\n界面来源：${gui}` +
      `${source.branch ? `（${source.branch} @ ${source.commit}）` : ""}\n` +
      "提醒：动态数据来自 scripts/screenshots/stub-pywebview.js 的假桥，" +
      "是界面示意而非真跑证据。出处已写入 manifest.json。\n",
  );
}

main().catch(die);
