/* 抓取 HTML 报告的教程截图。报告由 demo-report.py 用合成图生成，调用的是真实的报告代码。
 *
 *   AIIG_RECORDS_REPO=../AIIGovernance-records-service AIIG_PYTHON=<records 的 python> npm run shots:report
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { die, launch } from "./lib/cdp.mjs";

const REPO = process.env.AIIG_RECORDS_REPO;
if (!REPO) die(new Error("要设置 AIIG_RECORDS_REPO，指向 records 仓"));
const OUT = fileURLToPath(new URL("../../public/screenshots/data/", import.meta.url));
const work = mkdtempSync(join(tmpdir(), "aiig-demo-report-"));
const folder = join(work, "report");

try {
  const made = spawnSync(process.env.AIIG_PYTHON ?? "python",
    [fileURLToPath(new URL("demo-report.py", import.meta.url)), folder], {
      stdio: "inherit",
      env: {
        ...process.env,
        PYTHONUTF8: "1",
        PYTHONPATH: [join(REPO, "src"), join(REPO, "packages/aiigovernance-protocol/src")]
          .map((part) => resolve(part)).join(delimiter),
      },
    });
  if (made.status !== 0) throw new Error("演示报告没有生成");

  const page = await launch({ width: 1360, height: 900, scale: 1 });
  try {
    await page.goto(pathToFileURL(join(folder, "index.html")).href, { settle: 1500 });
    const external = await page.evaluate(
      `performance.getEntriesByType("resource").filter((r) => !r.name.startsWith("file:")).length`);
    if (external !== 0) throw new Error(`报告发出了 ${external} 个外部请求`);
    writeFileSync(join(OUT, "report-page.png"), await page.screenshot());
    await page.evaluate(`[...document.querySelectorAll("h2")].find((h) => h.textContent.startsWith("样本")).scrollIntoView(); true`);
    // 看图区和数据平台网页同一种看法：三个窗口、测试输入按比例放大，点备注跳回它框的区域。
    const windows = await page.evaluate(`document.querySelectorAll('canvas[aria-label^="窗口："]').length`);
    if (windows !== 3) throw new Error(`报告里应有 3 个窗口，实际 ${windows} 个：报告的看图区可能改过`);
    const jumped = await page.evaluate(`(function () {
      const jump = [...document.querySelectorAll("button")].find((b) => b.textContent.startsWith("跳到这个区域"));
      if (!jump) return false;
      jump.click();
      return true;
    })()`);
    if (!jumped) throw new Error("找不到「跳到这个区域」：报告的备注可能改过");
    await new Promise((done) => setTimeout(done, 1200));
    const caption = await page.evaluate(`document.querySelector(".window-note").textContent`);
    if (!caption.includes("放大 ×2 显示")) throw new Error(`测试输入的窗口标题不对：${caption}`);
    writeFileSync(join(OUT, "report-cards.png"), await page.screenshot());
  } finally {
    await page.close();
  }
} catch (error) {
  die(error);
} finally {
  rmSync(work, { recursive: true, force: true });
}
