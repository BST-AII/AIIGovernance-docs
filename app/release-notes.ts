/* 面向用户的版本说明——这份文件由人维护。
 *
 * 分工：版本号、发布日期、四平台安装包文件名与 SHA256 全部由
 * scripts/sync-release-data.mjs 写进 app/release-data.ts；这里只写
 * "用户能感知到什么变化"的说明文字。发布流水永远不会改写本文件。
 *
 * 发布新版本后：先跑 npm run sync:release，再在下面按版本号补一条。
 * 版本说明页会用 release.version 去查这里；查不到就只显示安装包信息，
 * 不会伪造更新说明。
 */

export type ReleaseNote = {
  /** 一句话说明这个版本的性质 */
  summary: string;
  /** 面向用户的变化要点，逐条写成完整句子 */
  highlights: string[];
};

export const releaseNotes: Record<string, ReleaseNote> = {
  "0.3.53": {
    summary:
      "纯修复版本，主题是打通 Ubuntu 与 macOS 上的知识检索通路，" +
      "并让重装与升级的语义第一次变得明确。",
    highlights: [
      "根治 Linux/macOS 升级不更新组件的缺陷：此前共享运行时按固定版本号钉安装，包版本长期不变，pip 认为条件已满足因而什么都不装，机器上一直跑着旧的 Agent 与 Bridge。这一版把 records 包版本推到 0.4.1，并把语义写成规则——重装一律全量重铺，升级只装版本号提升的组件。",
      "知识检索通路修复：查询结果含中文或其他非 ASCII 字符时连接被中断的问题、以及后台令牌轮换竞态导致六个云端查询工具在会话开始约十五分钟后集体返回 404 的问题，均已修复。",
      "升级与重装会重新接线本机全部已挂载项目，而不只是当前选中的那个。多项目机器上其他项目不会再残留指向旧载荷的绝对路径。",
      "安装器事务修复：一次中断的卸载会留下卸载态的事务日志，之后任何安装动作都会尝试接续它并在第一次推进阶段时崩溃。现在事务日志只在同一阶段族内接续，中断的卸载不再阻塞后续的覆盖重装。",
      "知识检索工具在客户端呈现为七个：六个受治理的云端查询工具（search_knowledge、get_knowledge、related_knowledge、search_records、list_projects、knowledge_status），外加一个只读本机日志、不出本机的 diagnostic_logs。",
    ],
  },
};

/** 取某个版本的说明；没有就返回 null，页面据此降级而不是编造。 */
export function noteFor(version: string): ReleaseNote | null {
  return releaseNotes[version] ?? null;
}
