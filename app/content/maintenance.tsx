import {
  Code, DocPage, Figure, Matrix, Note, Warn,
  installerIssueHref, pageHref,
} from "../doc-kit";
import { versionLabel } from "../release-data";

export const upgrade: DocPage = {
  group: "维护与更新", label: "升级与重装", title: "升级与重装已有治理项目",
  intro: "安装器会检测项目已安装的版本，在你确认后更新框架并重新完成 Skills、设置与验证。升级和重装是两套不同的语义，选错会得到不同的结果。",
  sections: [
    {
      id: "check", title: "检测版本",
      body: <>
        <ol>
          <li>运行新版本的安装器。</li>
          <li>选择“升级已有项目”。</li>
          <li>选择项目根目录。</li>
          <li>安装器比较项目里的安装元数据与当前安装包的版本。</li>
        </ol>
        <Figure src="screenshots/installer/upgrade_check.png" alt="安装器版本检查页" caption="版本检查页：列出项目已安装版本与当前安装包版本。已是最新版时，这一页仍然提供「重装当前版本（修复）」的出路。" source="installer-stub" />
      </>,
    },
    {
      id: "semantics", title: "三条版本规则",
      body: <>
        <p>下面三条自 {versionLabel} 起生效。它们解释了一个曾经让人困惑很久的现象：明明点了升级，机器上跑的还是旧代码。</p>
        <Matrix
          head={["规则", "内容", "为什么"]}
          rows={[
            ["重装 = 全量重装", "重装、覆盖安装和首次安装都会把所有组件重新落位，即使版本号完全相同也一样。", "重装是修复路径。修复路径绝不信任盘上已有的内容——否则你为了修问题而重装，装完还是那份坏的。"],
            ["升级 = 只装版本号提升的组件", "升级按组件版本号精确更新：版本没变的组件跳过不装。", "升级要快，也要可预测。只动真正变了的东西，其余保持原状。"],
            ["每次改代码的发布必须提升版本号", "只要发布里改了代码，配套的组件版本号就必须跟着提升。", "这是上一条的前提。版本号不提升，升级就会正确地跳过它——代码改了却装不上，而且是静默的。"],
          ]}
        />
        <Warn title="这三条是从真实事故里立出来的">{versionLabel} 之前，Linux 与 macOS 上的共享运行时按固定版本号钉安装，而包版本长期停在同一个值。包管理器认为条件已满足，于是什么都不装——每次升级之后机器上跑的仍是上一版的 Agent 与 Bridge，且没有任何报错。一位 Ubuntu 使用者的知识检索 404 因此跨了好几个版本都没被修掉。现在语义写死了：重装强制重装，升级受版本号门控。</Warn>
        <Note title="怎么选">日常跟版本用「升级」。遇到怀疑装坏了、文件被误删、或某个功能明明发布了却不生效——用「重装当前版本（修复）」，它会把所有组件重新铺一遍。</Note>
      </>,
    },
    {
      id: "rewire", title: "整机重接线",
      body: <>
        <p>升级和重装<b>不只处理你选中的那个项目</b>。安装器会通过后台 Agent 枚举这台机器上全部已挂载的治理项目，逐个重写它们的 <code>.mcp.json</code>，指向本次的载荷与运行时。</p>
        <p>这解决的是多项目机器上的一类顽固问题：你升级了项目 A，项目 B 的配置还指着上一版载荷的绝对路径，于是 B 的检索莫名其妙地坏掉，而你以为自己已经升级过了。</p>
        <Note title="单个项目失败不阻断">重接线过程中某个项目失败只会被记录下来，不会中断整体升级。完成页会如实列出结果。</Note>
      </>,
    },
    {
      id: "overwrite", title: "会覆盖什么",
      body: <>
        <p>升级会把两个治理 submodule 更新到安装包钉定的版本，并在备份之后重建 <code>.claude/settings.json</code> 与 <code>settings.local.json</code>。</p>
        <Note title="升级前确认">升级会覆盖治理框架和治理 Settings。安装器在真正写入之前会展示版本与覆盖提醒。治理 submodule 里存在未提交修改时，升级会停下来，不会强行覆盖你的改动。</Note>
      </>,
    },
    {
      id: "preserve", title: "会保留什么",
      body: <ul>
        <li><code>project_profile.yaml</code></li>
        <li><code>records/</code> 原始治理记录</li>
        <li>升级前 settings 的 <code>*.aiig-upgrade.bak</code> 备份</li>
        <li>非 AIIG 管理的 skills、submodule 与全部业务源码</li>
      </ul>,
    },
    {
      id: "finish", title: "升级完成",
      body: <>
        <p>安装器重新渲染 Skills 与 <code>CLAUDE.md</code>，重新应用权限与 Trust，运行完整验证，并展示旧版本到新版本的变化以及本次更新说明。</p>
        <Figure src="screenshots/installer/done_success.png" alt="安装器完成页" caption="完成页同时列出已验证项与「本向导未验证」项。未验证项是如实声明，不是失败。" source="installer-stub" />
      </>,
    },
  ],
};

export const uninstall: DocPage = {
  group: "维护与更新", label: "卸载", title: "安全卸载治理框架",
  intro: "卸载只拆除安装器管理的治理接线和运行时，保留项目业务数据与可审阅的 Git 变更。",
  sections: [
    {
      id: "entry", title: "进入卸载",
      body: <>
        <ol>
          <li>运行安装器并选择“升级已有项目”。</li>
          <li>选择已安装治理框架的项目。</li>
          <li>在版本检查页面选择“卸载治理框架”。</li>
          <li>阅读删除与保留清单后再次确认。</li>
        </ol>
        <Figure src="screenshots/installer/uninstall_confirm.png" alt="卸载确认页" caption="卸载确认页在动手之前完整列出将被移除与将被保留的内容。" source="installer-stub" />
      </>,
    },
    {
      id: "remove", title: "会被移除",
      body: <ul>
        <li>AIIGovernance 与 Wildskills submodule</li>
        <li>AIIG Hooks 接线</li>
        <li>安装器接入的项目 Skills</li>
        <li>当前项目的 Sync Agent 注册与 MCP Bridge 接线</li>
        <li>项目内便携 Python</li>
        <li>安装器管理的元数据</li>
      </ul>,
    },
    {
      id: "shared-agent", title: "不会影响其他项目",
      body: <>
        <p>卸载只注销当前项目的游标与 MCP 配置。如果同一个用户还有其他治理项目，后台 Sync Agent 继续运行；只有最后一个项目被卸载时，才会停止并删除共享的服务注册。</p>
        <p>共享运行时目录同理：它被本机所有项目的配置以绝对路径引用，因此只有在最后一个受管项目注销之后才会被移除。</p>
      </>,
    },
    {
      id: "keep", title: "会被保留",
      body: <ul>
        <li><code>project_profile.yaml</code></li>
        <li><code>records/</code> 与审计证据</li>
        <li>用户权限配置</li>
        <li>全局项目 Trust 记录</li>
        <li>非 AIIG 管理的 skills、submodule 与全部业务源码</li>
      </ul>,
    },
    {
      id: "safety", title: "安全保护",
      body: <p>如果治理 submodule 内存在未提交修改，卸载会停止，不会强制删除。Git 删除结果保留在项目工作区或暂存区，由维护者审核后提交。</p>,
    },
  ],
};

export const troubleshooting: DocPage = {
  group: "维护与更新", label: "常见故障对照表", title: "常见故障对照表",
  intro: "按症状查处置。先在这里对一遍，多数问题有明确解法；确实对不上再提交问题报告。",
  sections: [
    {
      id: "install", title: "安装与启动",
      body: <div className="simple-table">
        <div><b>Windows：Access is denied</b><span>项目可能在系统目录、只读网络盘或其他账号目录下；也可能有进程仍占用旧安装器或载荷缓存。先换目录、关掉占用进程再试。计划任务被公司策略拒绝时，新版会自动改用当前用户启动项，不需要提权。</span></div>
        <div><b>Ubuntu：Could not initialize GLX</b><span>Qt 找不到可用的 GLX 或显卡配置，<b>不是 CPU 架构不匹配</b>。用<a href={pageHref("installation")}>安装页的应急变量</a>启动即可；这些变量只影响本次启动。</span></div>
        <div><b>Ubuntu：窗口根本不出现</b><span>确认在 Ubuntu 桌面或已启用 WSLg，并检查 <code>echo $DISPLAY</code> 有值。纯 SSH / headless 会话不会有 GUI。</span></div>
        <div><b>Ubuntu：提示需要 GLIBC_2.38</b><span>拿到的是在 24.04 上构建的包。请使用标注支持 22.04+ 的正式安装包。</span></div>
        <div><b>macOS：Apple 无法检查是否包含恶意软件</b><span>预览包尚未签名公证，Gatekeeper 必然提示。核对 SHA256 后右键应用选“打开”，或到「隐私与安全性」选“仍要打开”。不要关闭 Gatekeeper 全局保护。</span></div>
        <div><b>安装包校验值对不上</b><span>不要继续安装。重新下载，并确认下的是同一个 Release 里配套的 <code>.sha256</code>。</span></div>
      </div>,
    },
    {
      id: "identity", title: "GitHub 身份与授权",
      body: <div className="simple-table">
        <div><b>Device Code 返回 400 / device_flow_disabled</b><span>组织的 OAuth App 没有启用 Device Flow。这不是用户名拼错，此时还没走到用户名比对那一步，需要管理员在 OAuth App 设置里开启。</span></div>
        <div><b>授权之后一直等待</b><span>保持安装器开着。公司侧核验严格关联页面上显示的 Enrollment ID；超时后可以直接重试。</span></div>
        <div><b>提示身份被拒，但你确实是组织成员</b><span>先确认安装器版本申请了 <code>read:org</code> 权限——没有这个权限就无法独立核验组织成员身份。</span></div>
        <div><b>GitHub 显示 404 打不开 Release</b><span>安装包在 Private 仓库。先登录 GitHub，并确认账号有 <code>BST-AII/AIIGovernance-releases</code> 的访问权限。</span></div>
        <div><b>组织要求批准 OAuth App</b><span>组织启用了 OAuth App 访问限制，需要组织管理员批准该应用一次。</span></div>
      </div>,
    },
    {
      id: "hooks", title: "Hook 故障决策树",
      body: <>
        <p>治理没生效时，按下面的顺序定位——每一层的处置不同，跳着猜会白费时间。</p>
        <div className="simple-table">
          <div><b>没有 UserPromptSubmit 配置</b><span>属于安装/升级接线问题。用“升级/修复”重建 <code>.claude/settings.local.json</code>。</span></div>
          <div><b>配置存在，但隔离执行失败</b><span>检查便携 Python、脚本权限、文件哈希和路径引号。</span></div>
          <div><b>隔离执行成功，真实会话却没有锚点</b><span>核对 Claude Code 版本、启动目录，以及它实际加载的项目配置。</span></div>
          <div><b>锚点已落盘，但没有注入文本</b><span>属于 Hook 输出协议、输出大小或 Claude Code 版本兼容问题。</span></div>
          <div><b>Stop 反复拦截</b><span>首次拦截后的 <code>stop_hook_active=true</code> 必须静默成功返回；否则是 Stop 重入回归。</span></div>
        </div>
        <Note title="让安装器替你查">安装器的“报告问题”会自动运行只读的 <code>hook-doctor</code>。它只读取真实项目配置，Hook 的实际执行发生在一个用完即删的临时项目里，不会动你的项目。</Note>
      </>,
    },
    {
      id: "retrieval", title: "知识检索与回流",
      body: <div className="simple-table">
        <div><b>会话开始十几分钟后检索工具集体 404</b><span>{versionLabel} 之前的后台令牌轮换竞态。升级到 {versionLabel} 或更高版本根治。</span></div>
        <div><b>结果里有中文就断开连接</b><span>同为 {versionLabel} 之前的缺陷，非 ASCII 结果在部分终端编码下会打断连接。升级即可。</span></div>
        <div><b>升级过了，问题还在（Linux/macOS）</b><span>很可能撞上了旧版本的升级不落地缺陷。改用“重装当前版本（修复）”走全量重铺，详见<a href={pageHref("upgrade")}>三条版本规则</a>。</span></div>
        <div><b>多项目机器上某个项目检索坏了</b><span>该项目的配置可能仍指向旧载荷。{versionLabel} 起升级/重装会自动重接线本机全部项目；先升级再看。</span></div>
        <div><b>一条知识都查不到</b><span>先用 <code>knowledge_status</code> 看回流是否到位、有没有待处理批次，再用 <code>list_projects</code> 确认可见项目范围。也可能是知识仍在待审核或已被归档。</span></div>
        <div><b>怀疑本机没在同步</b><span>用 <code>diagnostic_logs</code> 读本机近期的 Sync Agent 错误。它不联网，可以安全地先自查。</span></div>
      </div>,
    },
    {
      id: "console", title: "管理平台",
      body: <div className="simple-table">
        <div><b>登录被拒，提示组织成员资格不是 active</b><span>平台每次登录都重新核对 BST-AII 组织成员关系。先在 GitHub 侧确认你已被加入组织并接受了邀请；重试登录没有帮助。详见<a href={pageHref("account")}>平台账号与权限</a>。</span></div>
        <div><b>提示 suspended / revoked</b><span>账号被停用或注销，需要联系系统管理员处理。</span></div>
        <div><b>登录了但看不到管理入口</b><span>正常现象：无权限的入口不渲染，而不是灰掉。你的角色是普通账号。</span></div>
        <div><b>提交审核后列表没变化</b><span>操作是异步的：提交返回受理凭据，由公司侧工作机执行，通常 30–60 秒后列表才反映变化。</span></div>
        <div><b>顶栏显示「快照过期」</b><span>后台聚合落后了。数字仍可读，但不要用它判断刚刚发生的事。</span></div>
      </div>,
    },
    {
      id: "robot", title: "飞书机器人",
      body: <div className="simple-table">
        <div><b>机器人回复超过三分钟</b><span>点“继续等待/重新等待我的消息”。单轮超时只记为 pending，不会撤销已完成的治理安装。</span></div>
        <div><b>提示机器人已绑定其他项目</b><span>同一个 App ID 不能同时绑定多个项目。明确选择迁移到当前项目，或回飞书创建一个新机器人。</span></div>
        <div><b>凭据校验报证书错误</b><span>企业代理拦截。让 IT 把公司根证书装进系统信任库，或用 <code>AIIG_ENTERPRISE_CA_FILE</code> 追加 IT 提供的 PEM。不要关闭 TLS 校验。</span></div>
        <div><b>cc-connect 版本不同且文件被占用</b><span>先停止正在运行的 <code>cc-connect</code> 再重试；安装器不会覆盖正在运行的程序。</span></div>
      </div>,
    },
    {
      id: "escalate", title: "还是没解决",
      body: <>
        <p>对不上表里任何一条时，用安装器内置的问题报告——它会自动附上版本、平台、当前状态、Hook Doctor 结论和最多 200 行脱敏日志，比手写描述有用得多。</p>
        <ol>
          <li>点安装器右上角或失败页的“报告问题”。</li>
          <li>填写复现步骤，检查脱敏预览。</li>
          <li>确认提交。已完成设备核验时可自动创建私有 Issue，否则会打开预填好的 GitHub 表单。</li>
        </ol>
        <div className="link-list"><a href={installerIssueHref} target="_blank" rel="noreferrer"><b>直接打开 Installer Issue 表单</b><span>用于安装器无法启动、或报告窗口不可用的情况 →</span></a></div>
        <Code>{`# 提交前可以先自己看一眼后台服务状态
# Ubuntu / WSL
systemctl --user status aiig-records-agent.service

# macOS
launchctl print gui/$(id -u)/art.aiigovernance.records-agent`}</Code>
      </>,
    },
  ],
};
