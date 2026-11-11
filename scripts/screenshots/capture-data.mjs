/* 抓取数据平台网页的教程截图，页面来自演示环境（开发模式，假数据，不连生产）。
 *
 *   # 1. 在 data-service 仓起演示环境（另开一个终端，保持运行）
 *   cd ../AIIGovernance-data-service/console
 *   npx vite --port 5288 --strictPort --host 127.0.0.1
 *
 *   # 2. 回到 docs 仓出图
 *   npm run shots:data
 *
 * 脚本真的在页面上点按钮、填表、提交，按界面上的文字找控件。按钮或字段改了名，
 * 这里会直接报错并中止，不会留下一张过期的图。样本图是这里现场生成的渐变图，
 * 由脚本自带的假本机小服务提供，不碰 NAS，也不含任何真实数据。
 *
 * 环境变量：
 *   AIIG_DATA_URL      演示环境地址，默认 http://127.0.0.1:5288/admin/data/app
 *   AIIG_SHOTS_OUT     输出目录，默认 public/screenshots/data
 */

import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

import { CaptureError, die, launch } from "./lib/cdp.mjs";

const BASE = (process.env.AIIG_DATA_URL ?? "http://127.0.0.1:5288/admin/data/app").replace(/\/+$/, "");
const OUT = process.env.AIIG_SHOTS_OUT
  ? new URL(`file:///${process.env.AIIG_SHOTS_OUT.replace(/\\/g, "/")}/`)
  : new URL("../../public/screenshots/data/", import.meta.url);

const ROOT = "/CE_Data/member/weili/data/AiScene";
const COMPARE_ID = "f4000000-0000-4000-8000-000000000001";
/* 演示数据里的 seg-v1 模块：多来源的训练集、虚拟合并的测试集、只有 .npy 的数据，
   和一个标着「数据已更新」的对比。编号与 console 的 mocks/assetsStore.ts 一致。 */
const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const SEG_MODULE_ID = "aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa";
const SEG_NPY_ID = "c5000000-0000-4000-8000-000000000007";
const SEG_COMPARE_ID = "f4000000-0000-4000-8000-000000000011";
/* CE 检测 / 检测 v3 模块里的测试集 aiscene_v3_test：演示数据给它放了两份副本和一次收发。
   训练 unet-lr1e-3 的输入数据记了版本。 */
const DET_MODULE_ID = "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa";
const DET_TEST_ID = "cccccccc-3333-4333-8333-cccccccccccc";
const DET_RUN_ID = "f1000000-0000-4000-8000-000000000001";

/* 页面里的小工具。控件都按用户看得到的文字找，和教程写的一致。 */
const HELPERS = `
window.__t = {
  roots() {
    const dialogs = [...document.querySelectorAll('[role="dialog"]')];
    return dialogs.length ? [dialogs[dialogs.length - 1]] : [document.body];
  },
  visible(el) { return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); },
  clickable(text, exact) {
    for (const root of this.roots()) {
      const found = [...root.querySelectorAll('button, a, [role="tab"], [role="link"]')]
        .filter((el) => this.visible(el))
        .find((el) => { const t = el.textContent.trim(); return exact ? t === text : t.includes(text); });
      if (found) return found;
    }
    return null;
  },
  click(text, exact = true) {
    const el = this.clickable(text, exact);
    if (!el) return false;
    if (el.disabled) return "disabled";
    el.click();
    return true;
  },
  field(label) {
    for (const root of this.roots()) {
      for (const span of root.querySelectorAll('label > span')) {
        if (span.textContent.trim().startsWith(label)) {
          const box = span.parentElement.querySelector('input, select, textarea');
          if (box && this.visible(box)) return box;
        }
      }
    }
    return null;
  },
  set(box, value) {
    const proto = box.tagName === 'SELECT' ? HTMLSelectElement.prototype
      : box.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(box, value);
    box.dispatchEvent(new Event(box.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    box.dispatchEvent(new Event('change', { bubbles: true }));
  },
  fill(label, value) {
    const box = this.field(label);
    if (!box) return false;
    this.set(box, value);
    return true;
  },
  choose(label, text) {
    const box = this.field(label);
    if (!box) return false;
    const option = [...box.options].find((item) => item.textContent.includes(text));
    if (!option) return false;
    this.set(box, option.value);
    return true;
  },
  tick(ariaLabel) {
    for (const root of this.roots()) {
      const box = root.querySelector('input[aria-label="' + ariaLabel + '"]');
      if (box) { if (!box.checked) box.click(); return true; }
    }
    return false;
  },
  /* 没有可见文字标签、只有 aria-label 的输入框，比如合并对话框里的来源名。 */
  fillAria(ariaLabel, value) {
    for (const root of this.roots()) {
      const box = root.querySelector('input[aria-label="' + ariaLabel + '"]');
      if (box && this.visible(box)) { this.set(box, value); return true; }
    }
    return false;
  },
  tickRow(text) {
    for (const root of this.roots()) {
      const row = [...root.querySelectorAll('label')].find((el) => el.textContent.includes(text));
      const box = row && row.querySelector('input[type="checkbox"]');
      if (box) { if (!box.checked) box.click(); return true; }
    }
    return false;
  },
  version(alias) {
    const card = [...document.querySelectorAll('.data-center-record-card')]
      .find((el) => el.querySelector('h4')?.textContent === alias);
    const link = card && [...card.querySelectorAll('a')].find((el) => el.textContent.trim() === '版本详情');
    if (!link) return false;
    link.click();
    return true;
  },
  has(text) { return document.body.innerText.includes(text); },
  scrollTo(text) {
    const all = [...document.querySelectorAll('h1, h2, h3, legend, [role="tablist"], .asset-card, section')];
    const el = all.find((item) => this.visible(item) && item.textContent.trim().startsWith(text));
    if (!el) return false;
    const pane = document.querySelector('.app-content') ?? document.scrollingElement;
    el.scrollIntoView({ block: 'start' });
    pane.scrollBy?.(0, -16);
    window.scrollBy(0, -16);
    return true;
  },
  /* 滚到文字恰好等于 text 的元素，或者给定的选择器。 */
  reveal(text) {
    const el = text.startsWith('.') ? document.querySelector(text)
      : [...document.querySelectorAll('h1, h2, h3, h4, strong, legend, span, p')]
        .find((item) => this.visible(item) && item.textContent.trim() === text);
    if (!el) return false;
    el.scrollIntoView({ block: 'start' });
    window.scrollBy(0, -24);
    return true;
  },
  dismiss() {
    for (const el of [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === '知道了')) el.click();
    return true;
  },
  top() {
    document.querySelector('.app-content')?.scrollTo?.(0, 0);
    window.scrollTo(0, 0);
    return true;
  },
};
`;

/* ── 假本机小服务：合成图，只给演示用 ─────────────────────────────────── */

function crcTable() {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
}
const CRC = crcTable();
const crc32 = (buffer) => {
  let c = -1;
  for (const byte of buffer) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

function png(width, height, shade) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1);
    for (let x = 0; x < width; x += 1) {
      const wave = Math.sin((x * shade.freq) / width + y / 37) * 28;
      const at = row + 1 + x * 3;
      raw[at] = Math.max(0, Math.min(255, shade.r + (x / width) * 90 + wave));
      raw[at + 1] = Math.max(0, Math.min(255, shade.g + (y / height) * 80 + wave));
      raw[at + 2] = Math.max(0, Math.min(255, shade.b + wave * 0.6));
    }
  }
  const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, sum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0)),
  ]);
}

const PANELS = [
  { key: "input", caption: "测试输入" }, { key: "m0", caption: "夜景-基线" }, { key: "m1", caption: "夜景-加强" },
];
const SHADES = {
  input: { r: 30, g: 40, b: 70, freq: 18 }, m0: { r: 70, g: 80, b: 90, freq: 18 }, m1: { r: 95, g: 110, b: 105, freq: 18 },
};

function startViewer(token) {
  const images = new Map();
  const manifest = {
    kind: "comparison", id: COMPARE_ID, title: "夜景两次测试", panels: PANELS,
    items: ["night/0012", "night/0047", "indoor/0003"].map((key, index) => ({
      sample_key: key, category: key.split("/")[0],
      files: Object.fromEntries(PANELS.map((panel) => [panel.key, {
        asset_id: `${index}-${panel.key}`, ext: "png", decode: "browser", width: 640, height: 480,
      }])),
    })),
  };
  const server = createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Private-Network", "true");
    if (url.searchParams.get("t") !== token) { response.writeHead(403).end(); return; }
    if (url.pathname === "/api/manifest") {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(manifest));
      return;
    }
    const asset = /^\/cache\/([^/]+)/.exec(url.pathname)?.[1];
    if (asset) {
      const [index, panel] = decodeURIComponent(asset).split("-");
      if (!images.has(asset)) images.set(asset, png(640, 480, { ...SHADES[panel], freq: 14 + Number(index) * 9 }));
      response.setHeader("Content-Type", "image/png");
      response.end(images.get(asset));
      return;
    }
    response.writeHead(404).end();
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

/* ── 操作流程 ─────────────────────────────────────────────────────────── */

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function main() {
  try {
    const reply = await fetch(`${BASE}/`);
    if (!reply.ok) throw new Error(`HTTP ${reply.status}`);
  } catch (error) {
    throw new CaptureError(`连不上演示环境 ${BASE}（${error.message}）。先按文件开头的说明启动它。`);
  }
  await mkdir(OUT, { recursive: true });
  const page = await launch({ width: 1360, height: 860, scale: 2 });
  const done = [];

  const run = (code) => page.evaluate(code);
  const until = async (text, what = text) => {
    for (let i = 0; i < 80; i += 1) {
      if (await run(`window.__t.has(${JSON.stringify(text)})`)) return;
      await sleep(250);
    }
    throw new CaptureError(`等不到页面出现「${what}」，界面可能改过，已中止`);
  };
  const act = async (code, what) => {
    const value = await run(code);
    if (value !== true) throw new CaptureError(`操作失败（${value}）：${what}。界面可能改过，已中止`);
    await sleep(350);
  };
  const click = (text, exact = true) => act(`window.__t.click(${JSON.stringify(text)}, ${exact})`, `点击「${text}」`);
  const fill = (label, value) => act(`window.__t.fill(${JSON.stringify(label)}, ${JSON.stringify(value)})`, `填写「${label}」`);
  const choose = (label, text) => act(`window.__t.choose(${JSON.stringify(label)}, ${JSON.stringify(text)})`, `选择「${label}」的「${text}」`);
  const reveal = (text) => act(`window.__t.reveal(${JSON.stringify(text)})`, `滚动到「${text}」`);
  const fillAria = (label, value) => act(`window.__t.fillAria(${JSON.stringify(label)}, ${JSON.stringify(value)})`, `填写「${label}」`);
  const version = (alias) => act(`window.__t.version(${JSON.stringify(alias)})`, `打开「${alias}」的版本详情`);
  const scroll = (text) => act(`window.__t.scrollTo(${JSON.stringify(text)})`, `滚动到「${text}」`);
  const shot = async (file, options = {}) => {
    if (options.clean ?? true) await run("window.__t.dismiss()");
    await sleep(options.settle ?? 400);
    const buffer = await page.screenshot({ fullPage: options.fullPage ?? false });
    await writeFile(new URL(file, OUT), buffer);
    done.push(`${file.padEnd(26)} ${String(buffer.length).padStart(8)} B`);
    process.stdout.write(`[screenshots] ${file}\n`);
  };
  const toModule = async () => {
    await click("返回数据中心");
    await until("登记数据");
  };
  /* 模块页下方的「登记数据」表单。 */
  const register = async ({ alias, type, description, reason, path }) => {
    await fill("数据版本别名", alias);
    await choose("数据类型", type);
    await choose("数据位置", "NAS-AiScene");
    await fill("数据完整路径", path ?? `${ROOT}/${alias}`);
    if (description) await fill("数据描述", description);
    await fill("登记原因", reason);
  };
  const freeze = async () => {
    await click("冻结清单");
    await until("开始冻结");
    await fill("冻结原因", "归档这份数据");
    await click("开始冻结");
    await until("重新冻结", "冻结完成");
  };

  try {
    await page.addInitScript(HELPERS);

    await page.goto(`${BASE}/projects`, { settle: 1500 });
    await until("CE 检测");
    await shot("web-projects.png");

    await click("CE 检测", false);
    await until("创建模块");
    await click("创建模块");
    await until("模块标识", "创建模块对话框");
    await fill("模块名称", "夜景降噪");
    await fill("模块标识", "night-denoise");
    await shot("web-create-module.png");
    await click("取消");
    await click("det-v3", false);
    await until("登记数据");
    await sleep(1500);
    await shot("web-module.png");

    // 第 2 步：登记原始数据。
    await scroll("登记数据");
    await register({
      alias: "night-raw-v1", type: "原始数据", reason: "三季度夜景采集入库",
      description: "2026 年三季度夜景采集，未标注",
    });
    await shot("web-register-form.png");
    await click("登记数据");
    await until("已登记「night-raw-v1」");
    await sleep(1500);
    await until("night-raw-v1");
    await act("window.__t.top()", "回到页面顶部");
    await shot("web-registered.png", { clean: false });

    // 第 3 步：冻结清单。
    await version("night-raw-v1");
    await until("文件清单");
    await sleep(800);
    await shot("web-version.png");
    await click("冻结清单");
    await until("开始冻结");
    await fill("冻结原因", "归档这份数据");
    await shot("web-freeze-dialog.png");
    await click("开始冻结");
    await until("重新冻结", "冻结完成");
    await shot("web-frozen.png");
    await toModule();

    // 第 4 步：训练数据写来源，衍生两级。
    await scroll("登记数据");
    await register({ alias: "night-train-v1", type: "训练数据", reason: "第一版训练集" });
    await click("登记数据");
    await until("已登记「night-train-v1」");
    await sleep(1500);
    await version("night-train-v1");
    await until("设置来源");
    await sleep(600);
    await click("设置来源");
    await until("添加来源", "设置来源对话框");
    await choose("派生自", "night-raw-v1");
    await fill("处理说明", "去掉过曝样本，长边缩到 1024");
    await fill("原因", "写明来源");
    await click("保存");
    await sleep(1500);
    await freeze();

    // 第 5 步：配对规则。
    await click("设置规则");
    await until("怎么认出一对");
    await choose("怎么认出一对", "按目录名");
    await fill("输入目录名", "lq");
    await fill("目标目录名", "gt");
    await scroll("配对规则");
    await shot("web-pair-rule.png");
    await click("保存规则");
    await until("修改原因");
    await fill("修改原因", "lq 是输入，gt 是目标");
    await click("保存");
    await sleep(1200);
    await toModule();

    await scroll("登记数据");
    await register({ alias: "night-train-v2", type: "训练数据", reason: "第二版训练集" });
    await click("登记数据");
    await until("已登记「night-train-v2」");
    await sleep(1500);
    await version("night-train-v2");
    await until("设置来源");
    await sleep(600);
    await click("设置来源");
    await until("添加来源", "设置来源对话框");
    await choose("派生自", "night-train-v1");
    await fill("处理说明", "补充雨夜样本");
    await fill("原因", "写明来源");
    await click("保存");
    await sleep(1500);
    await freeze();
    await until("night-raw-v1");
    await scroll("来源");
    await shot("web-source-tree.png");
    await toModule();

    // 第 6 步：测试数据，同样写来源、冻结。
    await scroll("登记数据");
    await register({ alias: "night-test-v1", type: "测试数据", reason: "夜景测试集" });
    await click("登记数据");
    await until("已登记「night-test-v1」");
    await sleep(1500);
    await version("night-test-v1");
    await until("设置来源");
    await sleep(600);
    await click("设置来源");
    await until("添加来源", "设置来源对话框");
    await choose("派生自", "night-raw-v1");
    await fill("原因", "写明来源");
    await click("保存");
    await sleep(1500);
    await freeze();
    await toModule();

    // 第 7 步：登记训练。
    await reveal(".asset-tabs");
    await click("训练");
    await click("登记训练");
    await until("训练名称");
    await sleep(800);
    await fill("训练名称", "unet-night-lr1e-3");
    await fill("代码版本", "9f8e7d6");
    await choose("状态", "已完成");
    await fill("训练参数", '{"lr": 0.001, "epochs": 100}');
    await act("window.__t.tick('night-train-v2 作训练')", "勾选输入数据");
    await fill("原因", "夜景模型第一轮训练");
    await shot("web-training-dialog.png");
    await click("登记训练");
    await until("unet-night-lr1e-3");
    await sleep(1000);
    await reveal(".asset-tabs");
    await shot("web-training-list.png");

    // 第 8 步：登记模型。
    await click("模型");
    await sleep(500);
    await click("登记模型");
    await until("模型文件路径");
    await sleep(800);
    await fill("模型名称", "unet-night-best");
    await choose("存放位置", "NAS-AiScene");
    await fill("模型文件路径", `${ROOT}/models/unet-night-best.pth`);
    await choose("来自哪次训练", "unet-night-lr1e-3");
    await fill("框架", "pytorch");
    await fill("原因", "这轮训练的最佳模型");
    await shot("web-model-dialog.png");
    await click("登记模型");
    await until("unet-night-best");
    await sleep(800);

    // 第 9 步：登记测试和结果。
    await click("测试");
    await sleep(500);
    await click("登记测试");
    await until("测试名称");
    await sleep(800);
    await fill("测试名称", "夜景-v2");
    await choose("测试集", "night-test-v1");
    await choose("用的模型", "unet-night-best");
    await choose("结果位置", "NAS-AiScene");
    await fill("结果目录路径", `${ROOT}/results/night-v2`);
    await choose("状态", "已完成");
    await fill("测试指标", '{"psnr": 31.2}');
    await fill("原因", "夜景模型第一轮测试");
    await shot("web-test-dialog.png");
    await click("登记测试");
    await until("夜景-v2");
    await sleep(800);
    await reveal(".asset-tabs");
    await shot("web-test-list.png");

    // 第 10 步：新建对比。演示数据里已有两次跑完的测试。
    await click("对比");
    await sleep(500);
    // 演示数据里第二次测试的结果没冻结，选不上。这里只改浏览器内存里的假数据。
    await page.evaluate(
      `import("/admin/data/app/src/mocks/assetsStore.ts").then((m) => {
        m.assetRow("run:f3000000-0000-4000-8000-000000000002").attributes.result_frozen = true;
        return true;
      })`, { awaitPromise: true });
    await click("新建对比");
    await until("对比名称");
    await sleep(800);
    await fill("对比名称", "夜景两次测试-复查");
    await choose("测试集", "aiscene_v3_test");
    await sleep(1500);
    await act("window.__t.tickRow('夜景-基线')", "勾选成员");
    await act("window.__t.tickRow('夜景-加强')", "勾选成员");
    await fill("原因", "比较两次测试的结果");
    await shot("web-comparison-dialog.png");
    await click("取消");
    await sleep(500);
    await reveal(".asset-tabs");
    await shot("web-comparison-list.png");

    // 批量导入。
    await act("window.__t.top()", "回到页面顶部");
    await click("导入 CSV");
    await until("导入数据记录");
    await shot("web-import.png");
    await click("✕");

    // 多来源、虚拟合并、没有图片。演示数据的 seg-v1 模块里已经有这些数据，
    // 重新打开页面后演示数据回到初始状态，前面登记的不在了，不影响这一段。
    await page.goto(`${BASE}/projects`, { settle: 1500 });
    await until("CE 检测");
    await click("CE 检测", false);
    await until("seg-v1");
    await click("seg-v1", false);
    await until("seg_train_mix");
    await sleep(1500);

    // 两个来源的训练数据：来源卡片和设置来源对话框。
    await version("seg_train_mix");
    await until("设置来源");
    await sleep(1000);
    await scroll("来源");
    await shot("web-sources.png");
    await click("设置来源");
    await until("添加来源", "设置来源对话框");
    await fill("原因", "补写处理说明");
    await shot("web-set-source.png");
    await click("取消");
    await toModule();

    // 合并数据对话框。只截图，不提交：模块里已经有合并好的 seg_test_all。
    await act("window.__t.top()", "回到页面顶部");
    await click("合并数据");
    await until("合并后的名字", "合并数据对话框");
    await fill("合并后的名字", "seg_test_day_night");
    await act("window.__t.tick('seg_test_day')", "勾选 seg_test_day");
    await act("window.__t.tick('seg_test_night')", "勾选 seg_test_night");
    await fillAria("seg_test_day 的来源名", "白天");
    await fillAria("seg_test_night 的来源名", "夜间");
    await fill("描述", "白天、夜间两份测试集原样合并");
    await fill("原因", "两份测试集一起评测");
    await shot("web-merge-dialog.png");
    await click("取消");
    await sleep(500);

    // 合并集的版本页：成员、重新合成。
    await version("seg_test_all");
    await until("虚拟合并 · 2 个来源");
    await until("成员原地不动", "成员卡片");
    await sleep(1200);
    await shot("web-merged-page.png");
    await toModule();

    // 重新冻结成员前，对话框列出用着它的地方。
    await version("seg_test_day");
    await until("重新冻结");
    await sleep(1000);
    await click("重新冻结");
    await until("这些地方用着这份数据", "受影响的地方");
    await fill("冻结原因", "补拍了几张");
    await shot("web-refreeze.png");
    await click("取消");
    await sleep(400);

    // 只有 .npy 的数据：版本页顶部的提示。这条只在演示数据的索引里，模块页没有卡片，直接打开。
    await page.goto(`${BASE}/projects/${PROJECT_ID}/modules/${SEG_MODULE_ID}/datasets/${SEG_NPY_ID}`, { settle: 2000 });
    await until("没有可看的图片");
    await sleep(1000);
    await shot("web-no-images.png");

    // 两地之间的副本和收发记录：版本页下方的两张卡片，只显示，没有按钮。
    await page.goto(`${BASE}/projects/${PROJECT_ID}/modules/${DET_MODULE_ID}/datasets/${DET_TEST_ID}`, { settle: 2000 });
    await until("收发记录");
    await sleep(800);
    await scroll("副本");
    await shot("web-copies.png");

    // 训练页：输入数据旁写着登记时用的是哪一版。
    await page.goto(`${BASE}/projects/${PROJECT_ID}/modules/${DET_MODULE_ID}/training/${DET_RUN_ID}`, { settle: 2000 });
    await until("用的是现在这一版");
    await sleep(800);
    await scroll("输入数据");
    await shot("web-training-version.png");

    // 合并测试集上的结果对比，数据已更新。
    await page.goto(`${BASE}/review/compare/${SEG_COMPARE_ID}`, { settle: 2500 });
    await until("数据已更新");
    await until("重新对齐");
    await sleep(1500);
    await shot("review-merged-lineage.png");
    await reveal("对齐报告");
    await shot("review-stale.png");

    // 对比页：没有小服务时的样子。
    await page.goto(`${BASE}/review/compare/${COMPARE_ID}`, { settle: 2500 });
    await until("夜景两次测试");
    await sleep(1500);
    await shot("review-overview.png");
    await reveal("样本与备注");
    await shot("review-no-viewer.png");

    // 对比页：连上假本机小服务。
    const token = "demo-token";
    const server = await startViewer(token);
    try {
      const { port } = server.address();
      await page.goto(`${BASE}/review/compare/${COMPARE_ID}?local=127.0.0.1:${port}&t=${token}`, { settle: 3000 });
      await until("night/0012");
      await sleep(2000);
      await reveal("样本与备注");
      await shot("review-cards.png", { settle: 1500 });
      // 滑动对比：左半边是对比参照（默认第一列，测试输入）。
      await act(`window.__t.tickRow("滑动对比")`, "勾选「滑动对比」");
      await shot("review-wipe.png", { settle: 800 });
      await act(`(() => {
        const row = [...document.querySelectorAll("label")].find((el) => el.textContent.includes("滑动对比"));
        row.querySelector("input").click();
        return true;
      })()`, "取消「滑动对比」");
      // 框一块写备注，回到全图，再点「跳到这个区域」：所有窗口框出那块。
      await act(`window.__t.tickRow("框选放大")`, "勾选「框选放大」");
      await act(`(() => {
        const canvas = document.querySelector('canvas[aria-label="窗口：夜景-基线"]');
        if (!canvas) return "没有「夜景-基线」窗口";
        const r = canvas.getBoundingClientRect();
        const fire = (type, x, y) => canvas.dispatchEvent(new PointerEvent(type, {
          bubbles: true, button: 0, pointerId: 1, clientX: r.left + x, clientY: r.top + y }));
        fire("pointerdown", r.width * 0.45, r.height * 0.35);
        fire("pointermove", r.width * 0.75, r.height * 0.65);
        fire("pointerup", r.width * 0.75, r.height * 0.65);
        return true;
      })()`, "在窗口里框一块");
      await until("区域：左上");
      await act(`(() => {
        const box = document.querySelector('textarea[aria-label="备注内容"]');
        if (!box) return "没有备注框";
        window.__t.set(box, "框里这块噪点少了，边缘没糊");
        return true;
      })()`, "写备注");
      await click("改善");
      await click("添加备注");
      await until("跳到这个区域");
      await act(`window.__t.tickRow("框选放大") && (() => {
        const row = [...document.querySelectorAll("label")].find((el) => el.textContent.includes("框选放大"));
        row.querySelector("input").click();
        return true;
      })()`, "取消「框选放大」");
      await click("适应窗口");
      await click("跳到这个区域", false);
      await shot("review-notes.png", { settle: 1200 });
    } finally {
      server.close();
    }
  } finally {
    await page.close();
  }

  // 血缘图单独用宽屏截：多级衍生是这张图的重点，不能被横向滚动条切掉。
  const wide = await launch({ width: 2240, height: 500, scale: 1.5 });
  try {
    await wide.goto(`${BASE}/review/compare/${COMPARE_ID}`, { settle: 3500 });
    if (!(await wide.evaluate("document.body.innerText.includes('血缘思维导图') || !!document.querySelector('.lineage-svg')"))) {
      throw new CaptureError("对比页没有血缘图，已中止");
    }
    const buffer = await wide.screenshot();
    await writeFile(new URL("lineage.png", OUT), buffer);
    done.push(`${"lineage.png".padEnd(26)} ${String(buffer.length).padStart(8)} B`);
    process.stdout.write("[screenshots] lineage.png\n");
  } finally {
    await wide.close();
  }

  await writeFile(new URL("manifest.json", OUT), `${JSON.stringify({
    kind: "data-console-tutorial",
    capturedAt: new Date().toISOString(),
    source: BASE,
    viewport: { width: 1360, height: 860, deviceScaleFactor: 2 },
    dataSource: "数据平台网页开发模式的演示数据；样本图由本脚本生成，不是真实数据",
    screens: done.length,
  }, null, 2)}\n`, "utf8");
  process.stdout.write(`\n[screenshots] 共 ${done.length} 张，输出目录 ${fileURLToPath(OUT)}\n`
    + done.map((line) => `  ${line}\n`).join(""));
}

main().catch(die);
