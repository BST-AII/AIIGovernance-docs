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
  version: "0.3.82",
  tag: "installer-v0.3.82",
  publishedAt: "2026-11-01T14:03:03Z",
  releaseDate: "2026-11-01",
  assets: [
    {
      platform: "Windows x64",
      file: "AIIGovernance-Setup-installer-v0.3.82.exe",
      sha256: "88007dff7d6bf400067c7800e046535c614d2c1a64dd84ae18536aafcff5a70c",
      bytes: 143678729,
    },
    {
      platform: "Ubuntu / WSL x64",
      file: "AIIGovernance-Setup-linux-x64-v0.3.82.tar.gz",
      sha256: "bb23cbaa938f9dc87814d170991e493ba220edcced198c01f4bbd4eb804a1437",
      bytes: 318653584,
    },
    {
      platform: "macOS Apple Silicon",
      file: "AIIGovernance-Setup-macos-arm64-v0.3.82.zip",
      sha256: "c15815c84aafe6853046ceedecd36a10bc61dc9535885ddd4427e0d913ce10cb",
      bytes: 97064530,
    },
    {
      platform: "macOS Intel",
      file: "AIIGovernance-Setup-macos-x64-v0.3.82.zip",
      sha256: "2ace9779328aa19d738facd653f36cfacace3b9db0a2fab8b2c1dbec15609410",
      bytes: 96285449,
    },
  ],
  source: "github-release",
  syncedAt: "2026-11-01T14:07:54Z",
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
