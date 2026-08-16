/* 从真实 GitHub Release 重写 app/release-data.ts。
 *
 *   npm run sync:release              # 读 releases/latest
 *   npm run sync:release -- --tag installer-v0.3.53
 *   npm run sync:release -- --check   # 只比对，不写盘；漂移时退出码 1
 *
 * 唯一数据源是 `gh release view`。取不到真实发布记录时脚本直接失败，
 * 绝不写入编造的版本号或 SHA256——站点上的每个校验值都必须能在 Release
 * 页面上核对。
 *
 * 发布流水接口：打完 tag 后在 docs 仓运行本脚本，它重写 release-data.ts；
 * 面向用户的更新说明文字在 app/release-notes.ts，本脚本不会碰。
 */

import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const REPO = process.env.AIIG_RELEASES_REPO ?? "BST-AII/AIIGovernance-releases";
const target = new URL("../app/release-data.ts", import.meta.url);

/* 生成文件的固定头尾。数据块夹在中间，类型和辅助函数不随发布变化。 */
const HEADER = `/* 本文件由 scripts/sync-release-data.mjs 生成，数据全部来自 GitHub Release API。
 *
 * 不要手工编辑数据块：发布流水在打完 tag 之后运行
 *
 *     npm run sync:release
 *
 * 即可重写本文件。面向用户的更新说明文字写在 app/release-notes.ts，
 * 那份文件由人维护，同步脚本不会碰它。
 *
 * source 字段是诚实标记：
 *   "github-release" —— 版本号、日期与 SHA256 全部读自真实 Release；
 *   "placeholder"    —— 没能读到真实发布记录，页面必须显示占位并标注。
 */

export type ReleaseAsset = {
  /** 展示用平台名，例如 "Windows x64" */
  platform: string;
  /** Release 资产文件名 */
  file: string;
  /** 真实 SHA256；为空字符串表示未取到，页面会显示"未取到" */
  sha256: string;
  /** 资产字节数，用于展示体积 */
  bytes: number;
};

export type ReleaseData = {
  /** 语义版本号，不带 v 前缀 */
  version: string;
  /** Git tag，例如 installer-v0.3.53 */
  tag: string;
  /** Release 发布时刻（ISO-8601 UTC） */
  publishedAt: string;
  /** 发布日期 YYYY-MM-DD，供正文直接引用 */
  releaseDate: string;
  /** 四平台安装包 */
  assets: ReleaseAsset[];
  /** 数据来源；placeholder 时页面必须显示告警 */
  source: "github-release" | "placeholder";
  /** 本文件最后一次同步的时刻 */
  syncedAt: string;
};
`;

const FOOTER = `
/** "0.3.53" → "v0.3.53" */
export const versionLabel = \`v\${release.version}\`;

/** 把资产字节数显示成 MB，只保留一位小数 */
export function assetSize(bytes: number): string {
  return \`\${(bytes / 1024 / 1024).toFixed(1)} MB\`;
}

/** 文件名里的版本号换回 vX.Y.Z 占位符，用于"不会过期"的命令示例 */
export function placeholderName(file: string): string {
  return file.replace(release.version, "X.Y.Z");
}
`;

/** 资产文件名前缀 → 展示用平台名。顺序即页面上的展示顺序。 */
const PLATFORMS = [
  { platform: "Windows x64", prefix: "AIIGovernance-Setup-installer-", suffix: ".exe" },
  { platform: "Ubuntu / WSL x64", prefix: "AIIGovernance-Setup-linux-x64-", suffix: ".tar.gz" },
  { platform: "macOS Apple Silicon", prefix: "AIIGovernance-Setup-macos-arm64-", suffix: ".zip" },
  { platform: "macOS Intel", prefix: "AIIGovernance-Setup-macos-x64-", suffix: ".zip" },
];

function fail(message, hint) {
  process.stderr.write(`\n[sync-release-data] ${message}\n`);
  if (hint) process.stderr.write(`${hint}\n`);
  process.stderr.write("\n未写入任何文件：宁可让站点停在上一个真实版本，也不写编造的版本号或 SHA256。\n\n");
  process.exit(1);
}

function gh(args) {
  const result = spawnSync("gh", args, { encoding: "utf8", shell: false });
  if (result.error?.code === "ENOENT") {
    fail(
      "找不到 gh 命令。",
      "本脚本只从真实 Release 读数据，需要 GitHub CLI：\n" +
        "  安装： https://cli.github.com/\n" +
        "  登录： gh auth login   （账号需要有 " + REPO + " 的读权限）",
    );
  }
  if (result.status !== 0) {
    fail(
      `gh ${args.join(" ")} 失败（退出码 ${result.status}）。`,
      (result.stderr || "").trim() +
        "\n\n仓库是 Private：请确认已 gh auth login 且账号在 BST-AII 组织内。",
    );
  }
  return result.stdout;
}

const argv = process.argv.slice(2);
const checkOnly = argv.includes("--check");
const tagIndex = argv.indexOf("--tag");
const requestedTag = tagIndex >= 0 ? argv[tagIndex + 1] : null;
if (tagIndex >= 0 && !requestedTag) fail("--tag 后面缺少 tag 名。");

const viewArgs = ["release", "view"];
if (requestedTag) viewArgs.push(requestedTag);
viewArgs.push("--repo", REPO, "--json", "tagName,publishedAt,assets");

let payload;
try {
  payload = JSON.parse(gh(viewArgs));
} catch (error) {
  fail(`无法解析 gh 输出：${error.message}`);
}

const tag = payload.tagName;
if (typeof tag !== "string" || !tag) fail("Release 没有 tagName。");
const versionMatch = /(\d+\.\d+\.\d+)$/.exec(tag);
if (!versionMatch) fail(`tag "${tag}" 里读不出 X.Y.Z 版本号。`);
const version = versionMatch[1];

const publishedAt = payload.publishedAt;
if (typeof publishedAt !== "string" || !publishedAt) fail(`Release ${tag} 没有 publishedAt。`);
const releaseDate = publishedAt.slice(0, 10);

const rawAssets = Array.isArray(payload.assets) ? payload.assets : [];
const assets = [];
const missing = [];
for (const { platform, prefix, suffix } of PLATFORMS) {
  const file = `${prefix}v${version}${suffix}`;
  const found = rawAssets.find((asset) => asset.name === file);
  if (!found) {
    missing.push(file);
    continue;
  }
  // gh 的 digest 形如 "sha256:<hex>"，是 GitHub 对该资产自己算的摘要。
  const digest = typeof found.digest === "string" ? found.digest : "";
  const sha256 = digest.startsWith("sha256:") ? digest.slice("sha256:".length) : "";
  if (!/^[0-9a-f]{64}$/.test(sha256)) {
    missing.push(`${file}（缺 sha256 摘要）`);
    continue;
  }
  assets.push({ platform, file, sha256, bytes: Number(found.size) || 0 });
}
if (missing.length > 0) {
  fail(
    `Release ${tag} 缺少四平台产物或摘要：\n  - ${missing.join("\n  - ")}`,
    "四平台安装包必须齐全才能更新站点；发布流水异常时请先修 Release，不要手写 release-data.ts。",
  );
}

const render = (syncedAt) => `${HEADER}
export const release: ReleaseData = {
  version: ${JSON.stringify(version)},
  tag: ${JSON.stringify(tag)},
  publishedAt: ${JSON.stringify(publishedAt)},
  releaseDate: ${JSON.stringify(releaseDate)},
  assets: [
${assets
  .map(
    (asset) => `    {
      platform: ${JSON.stringify(asset.platform)},
      file: ${JSON.stringify(asset.file)},
      sha256: ${JSON.stringify(asset.sha256)},
      bytes: ${asset.bytes},
    },`,
  )
  .join("\n")}
  ],
  source: "github-release",
  syncedAt: ${JSON.stringify(syncedAt)},
};
${FOOTER}`;

const previous = await readFile(target, "utf8").catch(() => "");
const previousBody = stripSyncedAt(previous);
const nextBody = stripSyncedAt(render("x"));

if (checkOnly) {
  if (previousBody === nextBody) {
    process.stdout.write(`[sync-release-data] app/release-data.ts 与 ${tag} 一致。\n`);
    process.exit(0);
  }
  process.stderr.write(
    `[sync-release-data] app/release-data.ts 与真实 Release ${tag} 不一致。\n` +
      "运行 npm run sync:release 更新后再提交。\n",
  );
  process.exit(1);
}

if (previousBody === nextBody) {
  process.stdout.write(`[sync-release-data] 已经是 ${tag}，无需改写。\n`);
  process.exit(0);
}

await writeFile(target, render(new Date().toISOString().replace(/\.\d{3}Z$/, "Z")), "utf8");
process.stdout.write(
  `[sync-release-data] 已写入 ${fileURLToPath(target)}\n` +
    `  版本 ${version} · tag ${tag} · 发布 ${releaseDate}\n` +
    assets.map((asset) => `  ${asset.platform.padEnd(20)} ${asset.sha256}\n`).join("") +
    "\n提醒：面向用户的更新说明请在 app/release-notes.ts 里补写这一版的条目。\n",
);

/** 比对时忽略 syncedAt，避免每次运行都判为漂移。 */
function stripSyncedAt(text) {
  return text.replace(/syncedAt: "[^"]*"/, 'syncedAt: "-"');
}
