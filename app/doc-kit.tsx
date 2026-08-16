/* 文档页共用的类型、常量与排版组件。
 * 内容页只 import 这里，不互相 import，避免循环依赖。 */

import type { ReactNode } from "react";

export type Section = { id: string; title: string; body: ReactNode };
export type DocPage = {
  group: string;
  label: string;
  title: string;
  intro: string;
  sections: Section[];
};

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const pageHref = (slug: string) =>
  `${basePath}${slug === "overview" ? "/" : `/${slug}/`}`;

/* 这些链接刻意不带版本号：releases/latest 永远指向当前最新版本，
 * 因此站点换版本时不需要改链接。 */
export const latestReleaseHref =
  "https://github.com/BST-AII/AIIGovernance-releases/releases/latest";
export const releaseHistoryHref =
  "https://github.com/BST-AII/AIIGovernance-releases/releases";
export const installerIssueHref =
  "https://github.com/BST-AII/AIIGovernance-releases/issues/new?template=installer-bug.yml";
export const domesticMirrorHref = "https://service.pikso.art/AIIGovernance-docs/";

/* 管理平台（AI 中台）线上地址。来源：records-service
 * docs/CONFIGURATION_GUIDE.md 的 AIIG_CONSOLE_PUBLIC_URL。 */
export const consoleHref = "https://service.pikso.art/AIIknowledgeService";
/* 登录入口指向 SPA 首屏，而不是后端的 /admin/login。
   /admin/login 是一条直奔 GitHub OAuth 的 302：浏览器打开它只会闪一下就跳走，
   页面上没有任何可点的东西，正文里"点『通过 GitHub 授权登录』"就对不上。
   带那颗按钮的是 SPA 的登录屏（截图 signin.png 即出自此处）。 */
export const consoleLoginHref = `${consoleHref}/admin/app/signin`;

export const Code = ({ children }: { children: string }) => (
  <pre className="code-block">
    <code>{children}</code>
  </pre>
);

export const Note = ({ title, children }: { title: string; children: ReactNode }) => (
  <aside className="note">
    <b>{title}</b>
    <div>{children}</div>
  </aside>
);

/** 需要用户特别当心的事实——比升级提示更重的一档。 */
export const Warn = ({ title, children }: { title: string; children: ReactNode }) => (
  <aside className="note warn">
    <b>{title}</b>
    <div>{children}</div>
  </aside>
);

/* ── 截图与出处 ────────────────────────────────────────────────────────
   每张截图都必须声明它的像素从哪来，这是 Figure 的必填参数——想加一张图
   而不表态是编译不过的。

   这条约束不是洁癖。站点上的截图目前全部出自自动化流水：Console 走 dev
   夹具（/me 返回系统管理员，数字是造出来的），安装器走假 pywebview 桥
   （见 scripts/screenshots/stub-pywebview.js）。安装器界面自己的侧边栏
   还常驻一行「所有进度与日志均来自真实执行结果」——那句话对真跑的安装器
   成立，对截图里的演示数据并不成立。不标注的话，这张图就替产品做了一个
   它没资格做的声明。 */
export type FigureSource = "console-fixture" | "installer-stub" | "real-capture";

/** 各来源在图注里显示的出处说明。"real-capture" 无需说明，故不在表内。 */
const SOURCE_NOTE: Record<Exclude<FigureSource, "real-capture">, string> = {
  "console-fixture": "界面示意 · 开发夹具数据，非生产环境的真实统计",
  "installer-stub": "界面示意 · 演示数据，非某一次真实安装的执行记录",
};

/** 界面截图。src 传 public/ 下的相对路径，例如 "screenshots/console/overview.png"。 */
export const Figure = ({
  src,
  alt,
  caption,
  source,
}: {
  src: string;
  alt: string;
  caption: string;
  /** 像素出处。必填：见上方注释。 */
  source: FigureSource;
}) => (
  <figure className="figure">
    <img src={`${basePath}/${src}`} alt={alt} loading="lazy" />
    <figcaption>
      {caption}
      {source === "real-capture" ? null : (
        <span className="figure-source">{SOURCE_NOTE[source]}</span>
      )}
    </figcaption>
  </figure>
);

/** 两张并排的截图。 */
export const FigureRow = ({ children }: { children: ReactNode }) => (
  <div className="figure-row">{children}</div>
);

/** 多列对照表。列宽自适应，窄屏时整块横向滚动而不是把页面撑破。 */
export const Matrix = ({
  head,
  rows,
}: {
  head: string[];
  rows: (string | ReactNode)[][];
}) => (
  <div className="table-wrap">
    <table className="matrix">
      <thead>
        <tr>
          {head.map((cell) => (
            <th key={cell}>{cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) =>
              cellIndex === 0 ? <th key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>,
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** 支持等级标记，用在平台矩阵里。 */
export const Level = ({ kind }: { kind: "yes" | "best" | "no" }) => (
  <span className={`level level-${kind}`}>
    {kind === "yes" ? "支持" : kind === "best" ? "best-effort" : "不支持"}
  </span>
);

/* ── 示例会话 ──────────────────────────────────────────────────────────
   客户端是终端对话形态，截图信息密度低又难维护，所以用排版好的对话样例
   呈现"提问 → 检索命中 → 结果引用"。 */

export const Chat = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="chat">
    <div className="chat-head">{title}</div>
    {children}
  </div>
);

export const You = ({ children }: { children: ReactNode }) => (
  <div className="chat-turn you">
    <b>你</b>
    <div>{children}</div>
  </div>
);

export const Agent = ({ children }: { children: ReactNode }) => (
  <div className="chat-turn agent">
    <b>Claude</b>
    <div>{children}</div>
  </div>
);

/** 一次工具调用。tool 是工具名，args 是人话描述的入参。 */
export const ToolCall = ({ tool, args }: { tool: string; args: string }) => (
  <div className="chat-turn tool">
    <b>调用工具</b>
    <div>
      <code>{tool}</code>
      <span>{args}</span>
    </div>
  </div>
);

/** 工具返回的要点，逐条列出。 */
export const ToolResult = ({ children }: { children: ReactNode }) => (
  <div className="chat-turn result">
    <b>返回</b>
    <div>{children}</div>
  </div>
);
