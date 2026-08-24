/* 本文件由 scripts/sync-release-data.mjs 生成，数据全部来自 GitHub Release API。
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

export const release: ReleaseData = {
  version: "0.3.65",
  tag: "installer-v0.3.65",
  publishedAt: "2026-08-24T07:25:32Z",
  releaseDate: "2026-08-24",
  assets: [
    {
      platform: "Windows x64",
      file: "AIIGovernance-Setup-installer-v0.3.65.exe",
      sha256: "df109d57331e1357af9487a19250d10dc6096ccc5409fc4c4da4a5bc7edeb499",
      bytes: 144229809,
    },
    {
      platform: "Ubuntu / WSL x64",
      file: "AIIGovernance-Setup-linux-x64-v0.3.65.tar.gz",
      sha256: "e2b758ca4c6c6b8c347f157ea26e9dce1a2ade18a4ca4581300239621e2652de",
      bytes: 318325542,
    },
    {
      platform: "macOS Apple Silicon",
      file: "AIIGovernance-Setup-macos-arm64-v0.3.65.zip",
      sha256: "1454001d92af56dfb1cd3aad299745a42f28bd7111c92ac5f71aab0ac7392338",
      bytes: 96732935,
    },
    {
      platform: "macOS Intel",
      file: "AIIGovernance-Setup-macos-x64-v0.3.65.zip",
      sha256: "6284a809ca103d4a69f0fc5cce122a53ad12c823ff76f1fbfbd0d5f52e2fcf0b",
      bytes: 95920067,
    },
  ],
  source: "github-release",
  syncedAt: "2026-08-24T07:29:29Z",
};

/** "0.3.53" → "v0.3.53" */
export const versionLabel = `v${release.version}`;

/** 把资产字节数显示成 MB，只保留一位小数 */
export function assetSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** 文件名里的版本号换回 vX.Y.Z 占位符，用于"不会过期"的命令示例 */
export function placeholderName(file: string): string {
  return file.replace(release.version, "X.Y.Z");
}
