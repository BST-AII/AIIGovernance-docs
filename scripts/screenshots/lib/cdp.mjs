/* 极小的 Chrome DevTools Protocol 客户端。
 *
 * 刻意不引入 Playwright/Puppeteer：docs 站的依赖里没有浏览器驱动，也不该
 * 为了出图给站点构建加一个几百 MB 的依赖。这里直接驱动本机已经安装的
 * Chrome/Edge，Node 22+ 自带的全局 WebSocket 足够说完整个协议。
 *
 * 契约：找不到浏览器、连不上、页面没渲染出来——一律抛错退出，
 * 绝不产出空图或半张图。
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** 按平台列出常见的 Chromium 系浏览器位置。 */
const CANDIDATES = {
  win32: [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  ],
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
  ],
};

export class CaptureError extends Error {}

/** 定位浏览器。找不到就抛出带安装指引的错误，不静默降级。 */
export function findBrowser() {
  const override = process.env.AIIG_CHROME;
  if (override) {
    if (!existsSync(override)) {
      throw new CaptureError(
        `AIIG_CHROME 指向的文件不存在：${override}\n` +
          "把它指向本机 Chrome / Edge / Chromium 的可执行文件。",
      );
    }
    return override;
  }
  const found = (CANDIDATES[process.platform] ?? []).find((path) => existsSync(path));
  if (found) return found;
  throw new CaptureError(
    "本机没有找到 Chrome / Edge / Chromium。\n" +
      "截图流水需要一个 Chromium 系浏览器（无头模式运行，不会打开窗口）。\n" +
      "已尝试的位置：\n" +
      (CANDIDATES[process.platform] ?? []).map((path) => `  - ${path}`).join("\n") +
      "\n\n装好之后重跑；如果装在别处，用 AIIG_CHROME 指过去：\n" +
      "  AIIG_CHROME=/path/to/chrome npm run shots:console",
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 启动无头浏览器并连上去。返回一个带 goto/evaluate/screenshot 的会话。 */
export async function launch({ width = 1440, height = 900, scale = 2 } = {}) {
  const binary = findBrowser();
  const profile = await mkdtemp(join(tmpdir(), "aiig-shots-"));
  const child = spawn(
    binary,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--allow-file-access-from-files",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  const exited = new Promise((resolve) => child.once("exit", resolve));

  // 无头 Chrome 把实际监听端口写进 profile 里的 DevToolsActivePort。
  const portFile = join(profile, "DevToolsActivePort");
  let port = null;
  for (let attempt = 0; attempt < 80 && port === null; attempt += 1) {
    if (child.exitCode !== null) {
      throw new CaptureError(
        `浏览器启动即退出（退出码 ${child.exitCode}）。\n${stderr.trim()}`,
      );
    }
    try {
      const text = await readFile(portFile, "utf8");
      const first = text.split("\n")[0].trim();
      if (first) port = Number(first);
    } catch {
      await sleep(125);
    }
  }
  if (port === null) {
    child.kill();
    throw new CaptureError(
      `等了 10 秒也没等到浏览器的调试端口（${portFile}）。\n${stderr.trim()}`,
    );
  }

  const versionResponse = await fetch(`http://127.0.0.1:${port}/json/version`);
  if (!versionResponse.ok) {
    child.kill();
    throw new CaptureError(`浏览器调试端点返回 ${versionResponse.status}。`);
  }
  const version = await versionResponse.json();

  const socket = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = () => reject(new CaptureError("无法连接浏览器调试端口。"));
  });

  let nextId = 0;
  const pending = new Map();
  const listeners = new Set();
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id !== undefined && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new CaptureError(`${message.error.message}`));
      else resolve(message.result);
      return;
    }
    for (const listener of listeners) listener(message);
  };

  function send(method, params = {}, sessionId) {
    nextId += 1;
    const id = nextId;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify(payload));
    });
  }

  /** 等一个 CDP 事件，超时抛错。 */
  function waitFor(method, sessionId, timeout = 20000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        listeners.delete(listener);
        reject(new CaptureError(`等待 ${method} 超时（${timeout}ms）。`));
      }, timeout);
      const listener = (message) => {
        if (message.method !== method) return;
        if (sessionId && message.sessionId !== sessionId) return;
        clearTimeout(timer);
        listeners.delete(listener);
        resolve(message.params);
      };
      listeners.add(listener);
    });
  }

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: scale, mobile: false,
  }, sessionId);

  const consoleErrors = [];
  listeners.add((message) => {
    if (message.sessionId !== sessionId) return;
    if (message.method === "Runtime.exceptionThrown") {
      consoleErrors.push(message.params.exceptionDetails?.text ?? "exception");
    }
  });

  return {
    consoleErrors,

    /** 注册一段在每个新文档的所有脚本之前执行的初始化脚本。 */
    async addInitScript(source) {
      await send("Page.addScriptToEvaluateOnNewDocument", { source }, sessionId);
    },

    /** 打开一个地址并等到 load 事件后再静置 settle 毫秒。 */
    async goto(url, { settle = 900 } = {}) {
      const loaded = waitFor("Page.loadEventFired", sessionId);
      await send("Page.navigate", { url }, sessionId);
      await loaded;
      await sleep(settle);
    },

    /** 在页面里跑一段表达式，返回值必须可 JSON 序列化。 */
    async evaluate(expression, { awaitPromise = false } = {}) {
      const result = await send("Runtime.evaluate", {
        expression, returnByValue: true, awaitPromise,
      }, sessionId);
      if (result.exceptionDetails) {
        throw new CaptureError(
          `页面脚本抛错：${result.exceptionDetails.text} ${
            result.exceptionDetails.exception?.description ?? ""}`,
        );
      }
      return result.result.value;
    },

    /** 截图，返回 PNG Buffer。fullPage 时按文档实际高度截，最高 4000 CSS px。 */
    async screenshot({ fullPage = false } = {}) {
      const params = { format: "png", captureBeyondViewport: fullPage };
      if (fullPage) {
        const box = await this.evaluate(
          "JSON.stringify({w:document.documentElement.scrollWidth," +
            "h:document.documentElement.scrollHeight})",
        );
        const { w, h } = JSON.parse(box);
        params.clip = {
          x: 0, y: 0,
          width: Math.max(width, Math.min(w, 2400)),
          height: Math.min(Math.max(height, h), 4000),
          scale: 1,
        };
      }
      const shot = await send("Page.captureScreenshot", params, sessionId);
      const buffer = Buffer.from(shot.data, "base64");
      if (buffer.length < 5000) {
        throw new CaptureError(
          `截出来的 PNG 只有 ${buffer.length} 字节，几乎肯定是白屏。` +
            "已中止，不写这张图。",
        );
      }
      return buffer;
    },

    async close() {
      try {
        socket.close();
      } catch { /* 已经断了 */ }
      child.kill();
      await Promise.race([exited, sleep(3000)]);
      await rm(profile, { recursive: true, force: true }).catch(() => {});
    },
  };
}

/** 把错误按统一格式打到 stderr 并以 1 退出。 */
export function die(error) {
  process.stderr.write(`\n[screenshots] ${error.message}\n\n`);
  process.exit(1);
}
