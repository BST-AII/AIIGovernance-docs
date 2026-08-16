import {
  DocPage, Matrix, Note, Warn,
  latestReleaseHref, pageHref, releaseHistoryHref,
} from "../doc-kit";
import { assetSize, release, versionLabel } from "../release-data";
import { noteFor } from "../release-notes";

const note = noteFor(release.version);

export const releases: DocPage = {
  group: "参考", label: "版本说明", title: "版本与发布说明",
  intro: "这里汇总当前正式安装器、跨平台产物和面向用户的版本变化；安装包仍从组织内部 Release 仓库下载。",
  sections: [
    {
      id: "latest", title: `当前正式版本：${versionLabel}`,
      body: <>
        {release.source === "placeholder" ? (
          <Warn title="版本数据未取到">本页的版本信息没能从真实发布记录同步成功，下面显示的是占位内容。请在 docs 仓运行 <code>npm run sync:release</code> 重新同步后再引用。</Warn>
        ) : null}
        <p>发布时间：{release.releaseDate}（tag <code>{release.tag}</code>）。Windows、Ubuntu x64、macOS Apple Silicon 与 macOS Intel 由同一个 Release 交付。</p>
        {note ? (
          <>
            <p>{note.summary}</p>
            <ul>{note.highlights.map((line) => <li key={line}>{line}</li>)}</ul>
          </>
        ) : (
          <Note title="本版暂无单独的更新说明">安装包信息如下；面向用户的变化说明尚未补写，请以 Release 页面上的说明为准。</Note>
        )}
        <div className="link-list">
          <a href={latestReleaseHref} target="_blank" rel="noreferrer"><b>打开 {versionLabel} / 最新 Release</b><span>未来发布新版本后，此入口会自动指向新版本 →</span></a>
        </div>
      </>,
    },
    {
      id: "artifacts", title: "本版发布产物",
      body: <>
        <Matrix
          head={["平台", "安装包", "体积", "SHA256"]}
          rows={release.assets.map((entry) => [
            entry.platform,
            <code key="f">{entry.file}</code>,
            assetSize(entry.bytes),
            <code key="s" className="sha">{entry.sha256}</code>,
          ])}
        />
        <p>每个安装包旁边还有对应的 <code>.sha256</code> 校验文件与来源 manifest（记录安装器、治理框架与 Wildskills 的精确 commit）。上表的数值直接读自 <code>{release.tag}</code> 的发布记录，可逐字核对。</p>
      </>,
    },
    {
      id: "single-source", title: "本页数据从哪里来",
      body: <>
        <p>版本号、发布日期、安装包文件名与 SHA256 全部由一个同步脚本从 GitHub Release API 写入一份数据文件，页面只负责渲染；人工只维护面向用户的说明文字。</p>
        <div className="simple-table">
          <div><b>机器写</b><span><code>app/release-data.ts</code>——由 <code>npm run sync:release</code> 从真实 Release 重写。取不到真实发布记录时脚本直接失败，绝不写入编造的值。</span></div>
          <div><b>人工写</b><span><code>app/release-notes.ts</code>——按版本号维护的更新说明文字。同步脚本永远不碰这份文件。</span></div>
        </div>
        <Note title="为发布流水预留的接口">打完 tag 之后在 docs 仓运行 <code>npm run sync:release</code> 即可；<code>npm run sync:release -- --check</code> 只比对不写盘，站点数据与真实 Release 漂移时以非零退出码报错，适合放进 CI。</Note>
      </>,
    },
    {
      id: "current", title: "0.3.x 累计能力",
      body: <ul>
        <li>首次安装、已有项目升级与重装入口</li>
        <li>强制 GitHub / BST-AII 身份核验</li>
        <li>自动安装多项目 Sync Agent 与 MCP Bridge</li>
        <li>版本检测、Settings 备份与升级说明</li>
        <li>项目级安全卸载</li>
        <li>已有项目独立添加飞书机器人</li>
        <li>已有 cc-connect 相同版本安全复用</li>
        <li>四平台统一构建与自动 GitHub Release</li>
      </ul>,
    },
    {
      id: "automation", title: "自动版本规则",
      body: <p>推送到安装器 <code>main</code> 分支后，自动发布流程递增 PATCH 版本，并在 Windows、Ubuntu、macOS Intel 与 Apple Silicon Runner 上分别测试和构建。全部通过后生成统一 Tag、四平台安装包、SHA256 与来源 manifest。真实 GUI、GitHub 授权、飞书消息与系统自启动仍必须在目标真机上完成一次人工验收。</p>,
    },
    {
      id: "history", title: "查看历史版本",
      body: <>
        <p>本页保留当前版本面向用户的主要变化；精确 Tag、发布时间、校验文件和旧安装包位于完整 Release 历史。</p>
        <div className="link-list">
          <a href={releaseHistoryHref} target="_blank" rel="noreferrer"><b>查看完整 Release 历史</b><span>需要先登录拥有 BST-AII 权限的 GitHub 账号 →</span></a>
          <a href={pageHref("installation")}><b>返回跨平台安装说明</b><span>查看下载、校验、平台步骤与问题报告 →</span></a>
        </div>
      </>,
    },
  ],
};
