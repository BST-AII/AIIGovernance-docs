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
  version: "0.3.94",
  tag: "installer-v0.3.94",
  publishedAt: "2026-11-18T03:45:35Z",
  releaseDate: "2026-11-18",
  assets: [
    {
      platform: "Windows x64",
      file: "AIIGovernance-Setup-installer-v0.3.94.exe",
      sha256: "a90f9057db8906fc610505c9fb1f7ddbb4804d074e188a6afc5aa28765dc33b3",
      bytes: 143771556,
    },
    {
      platform: "Ubuntu / WSL x64",
      file: "AIIGovernance-Setup-linux-x64-v0.3.94.tar.gz",
      sha256: "6d4d8cd7c623fe3922dab76124763ba767c8506ed2869a5a163ccd12d9f966e9",
      bytes: 318986108,
    },
    {
      platform: "macOS Apple Silicon",
      file: "AIIGovernance-Setup-macos-arm64-v0.3.94.zip",
      sha256: "94cbf751390a6d095a3a5d8ae8a881e5b92b83809b65817a676e2bb73d5d37e9",
      bytes: 97158365,
    },
    {
      platform: "macOS Intel",
      file: "AIIGovernance-Setup-macos-x64-v0.3.94.zip",
      sha256: "68f1f0a44013ad3e6b582410bd9523d16bebbacf095a54a7d7f40a08c47cf4d9",
      bytes: 96380904,
    },
  ],
  source: "github-release",
  syncedAt: "2026-11-18T03:52:26Z",
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
