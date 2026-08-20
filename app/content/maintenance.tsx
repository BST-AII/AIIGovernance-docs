import {
  Code, DocPage, Figure, Maintainer, Matrix, Note, Warn,
  installerIssueHref, pageHref,
} from "../doc-kit";
import { versionLabel } from "../release-data";

export const upgrade: DocPage = {
  group: "维护", label: "升级、重装与修复", title: "升级、重装与修复",
  intro: "安装器会识别项目当前状态，并根据所选模式更新受管组件，同时保留业务代码、记录和项目身份。",
  keywords: ["升级", "重装", "修复", "覆盖", "恢复安装", "安装模式"],
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
        <Figure src="screenshots/installer/upgrade_check.png" alt="安装器版本检查页" caption="版本检查页列出项目已安装版本与当前安装包版本。已是最新版时，仍可选择「重装当前版本（修复）」。" source="installer-stub" />
      </>,
    },
    {
      id: "modes", title: "选择正确的安装模式",
      body: <>
        <p>安装器会先识别项目和上一次安装的状态，再显示适用操作。以下名称用于区分行为边界，不要求用户记住内部代码名。</p>
        <Matrix
          head={["操作", "适用情况", "处理范围"]}
          rows={[
            ["首次安装（fresh）", "项目尚未接入治理框架", "安装受管组件并建立项目身份、Hooks、MCP 与后台服务接线。"],
            ["升级（upgrade）", "项目已有较早版本", "只更新版本号发生变化的受管组件。"],
            ["覆盖受管组件（overwrite_managed）", "需要重新铺设安装器管理的组件", "仅清理并重建受管组件，不删除业务代码、记录、身份和无关接线。"],
            ["修复（repair）", "当前版本文件缺失、损坏或行为异常", "按当前安装包重新安装并验证全部受管组件。"],
            ["继续安装（resume）", "上一次安装中断且存在可恢复状态", "从已记录的安全检查点继续；无法安全恢复时转入修复，不猜测完成状态。"],
            ["卸载（uninstall）", "不再在当前项目使用治理组件", "只移除当前项目的受管组件和接线，保留业务数据与治理记录。"],
          ]}
        />
        <Warn title="覆盖不等于清空项目">无论选择覆盖、修复还是卸载，安装器都不得删除业务代码、Records、Task/frozen、Agent Outbox、Project identity、device identity、第三方 Hook 或无关 submodule。</Warn>
      </>,
    },
    {
      id: "semantics", title: "三条版本规则",
      body: <>
        <p>下面三条自 {versionLabel} 起生效，用于确保安装结果与所选版本一致。</p>
        <Matrix
          head={["规则", "内容", "为什么"]}
          rows={[
            ["重装 = 全量重装", "重装、覆盖安装和首次安装都会重新落位所需受管组件，即使版本号完全相同。", "修复路径不能把磁盘上的既有文件视为已验证结果。"],
            ["升级 = 只安装版本号提升的组件", "升级按组件版本号精确更新；版本未变化的组件保持原状。", "减少不必要的写入，并使升级结果可预测。"],
            ["代码变化必须对应版本变化", "发布中只要修改了组件代码，组件版本号就必须同步提升。", "否则升级会按既定规则跳过该组件，导致新代码没有安装。"],
          ]}
        />
        <Maintainer title="维护者说明：版本规则的历史原因"><p>{versionLabel} 之前，Linux 与 macOS 上的共享运行时曾因固定包版本未提升而被包管理器跳过，导致升级后仍运行旧版 Agent 与 Bridge。当前语义固定为：修复和重装强制重新安装受管组件，升级受组件版本号门控。</p></Maintainer>
        <Note title="如何选择">日常更新选择「升级」。如果文件缺失、安装损坏，或发布后的功能没有生效，选择「重装当前版本（修复）」重新安装并验证受管组件。</Note>
      </>,
    },
    {
      id: "rewire", title: "更新本机已登记项目的接线",
      body: <>
        <p>升级和重装<b>不只处理你选中的那个项目</b>。安装器会通过后台 Agent 枚举这台机器上全部已挂载的治理项目，逐个重写它们的 <code>.mcp.json</code>，指向本次的载荷与运行时。</p>
        <p>这样可以避免多项目机器上的其他项目继续引用旧版载荷的绝对路径。</p>
        <Note title="单个项目失败不阻断">更新接线时，单个项目失败会被记录并显示在完成页，不会中断其他项目的处理。</Note>
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
        <li><code>records/</code>、Task/frozen 与原始治理记录</li>
        <li>Agent Outbox、Project identity 与 device identity</li>
        <li>升级前 settings 的 <code>*.aiig-upgrade.bak</code> 备份</li>
        <li>第三方 Hook，以及非 AIIG 管理的 Skills、submodule 与全部业务源码</li>
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
  group: "维护", label: "安全卸载", title: "安全卸载治理组件",
  intro: "卸载仅移除当前项目中由安装器管理的组件和接线，不删除业务代码与治理记录。",
  keywords: ["卸载", "移除", "保留数据", "后台服务"],
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
        <li><code>records/</code>、Task/frozen 与审计证据</li>
        <li>Agent Outbox、Project identity 与 device identity</li>
        <li>用户权限配置</li>
        <li>全局项目 Trust 记录</li>
        <li>第三方 Hook，以及非 AIIG 管理的 Skills、submodule 与全部业务源码</li>
      </ul>,
    },
    {
      id: "safety", title: "安全保护",
      body: <p>如果治理 submodule 内存在未提交修改，卸载会停止，不会强制删除。Git 删除结果保留在项目工作区或暂存区，由维护者审核后提交。</p>,
    },
  ],
};

export const troubleshooting: DocPage = {
  group: "维护", label: "排查问题", title: "按现象排查问题",
  intro: "先根据错误现象确认故障所在环节，再执行对应检查；无法定位时提交脱敏问题报告。",
  keywords: ["故障", "报错", "诊断", "Hook", "检索", "登录"],
  sections: [
    {
      id: "install", title: "安装与启动",
      body: <div className="simple-table">
        <div><b>Windows：Access is denied</b><span>项目可能在系统目录、只读网络盘或其他账号目录下；也可能有进程仍占用旧安装器或载荷缓存。先换目录、关掉占用进程再试。计划任务被公司策略拒绝时，新版会自动改用当前用户启动项，不需要提权。</span></div>
        <div><b>Ubuntu/macOS 升级报 No module named <code>aiig_protocol.canonical</code></b><span>从 0.3.53 或更早版本升级时的已知缺陷：卸载旧组件时误删了新协议包的文件。<b>用「重装当前版本（修复）」代替「升级」即可修好</b>（0.3.57 起升级路径会自动自愈，不再需要手动绕行）。<b>撞上之后请尽快修复重装</b>：后台同步服务下次重启会进入崩溃循环，放着不管这台机器就停止回流了。全新安装不受影响。</span></div>
        <div><b>Ubuntu：Could not initialize GLX</b><span>Qt 找不到可用的 GLX 或显卡配置，<b>不是 CPU 架构不匹配</b>。用<a href={pageHref("installation")}>安装页的应急变量</a>启动即可；这些变量只影响本次启动。</span></div>
        <div><b>Ubuntu：窗口根本不出现</b><span>确认在 Ubuntu 桌面或已启用 WSLg，并检查 <code>echo $DISPLAY</code> 有值。纯 SSH / headless 会话不会有 GUI。</span></div>
        <div><b>Ubuntu：提示需要 GLIBC_2.38</b><span>拿到的是在 24.04 上构建的包。请使用标注支持 22.04+ 的正式安装包。</span></div>
        <div><b>macOS：Apple 无法检查是否包含恶意软件</b><span>预览包尚未签名公证，Gatekeeper 必然提示。核对 SHA256 后右键应用选“打开”，或到「隐私与安全性」选“仍要打开”。不要关闭 Gatekeeper 全局保护。</span></div>
        <div><b>安装包校验值对不上</b><span>不要继续安装。重新下载，并确认下的是同一个 Release 里配套的 <code>.sha256</code>。</span></div>
      </div>,
    },
    {
      id: "identity", title: "GitHub 身份与授权",
      body: <>
      <div className="simple-table">
        <div><b>一直停在“等待 GitHub 与公司身份核验”，看不到授权码</b><span>本机没有可用的浏览器，授权页打不开。日志里会看到 <code>xdg-open: no method available</code>，前面还有一串 <code>not found</code>。<b>这不是必须装浏览器</b>：GitHub 的设备授权流程本来就允许在任意一台设备上完成，详见下方处置方法。0.3.56 起授权码与网址直接显示在安装器页面上，不再只落在日志里。</span></div>
        <div><b>Device Code 返回 400 / device_flow_disabled</b><span>组织的 OAuth App 没有启用 Device Flow。这不是用户名拼错，此时还没走到用户名比对那一步，需要管理员在 OAuth App 设置里开启。</span></div>
        <div><b>授权之后一直等待</b><span>保持安装器开着。公司侧核验严格关联页面上显示的 Enrollment ID；超时后可以直接重试。</span></div>
        <div><b>提示身份被拒，但你确实是组织成员</b><span>先确认安装器版本申请了 <code>read:org</code> 权限——没有这个权限就无法独立核验组织成员身份。</span></div>
        <div><b>GitHub 显示 404 打不开 Release</b><span>安装包在 Private 仓库。先登录 GitHub，并确认账号有 <code>BST-AII/AIIGovernance-releases</code> 的访问权限。</span></div>
        <div><b>组织要求批准 OAuth App</b><span>组织启用了 OAuth App 访问限制，需要组织管理员批准该应用一次。</span></div>
      </div>
      <Note title="本机打不开浏览器时，这样完成授权（0.3.53 / 0.3.55 适用）">
        <p>授权码其实已经生成了，只是落在安装日志里。<b>不需要在这台机器上装浏览器</b>，也不需要重装：</p>
        <ol>
          <li>展开安装器底部的“安装日志·实时”面板，往上翻，找到形如
            <code>{'{"event": "github_device_code", "user_code": "XXXX-XXXX", …}'}</code> 的那一行。
            它可能被紧随其后的一串 <code>not found</code> 顶出了可视区。</li>
          <li>用手机或另一台电脑打开 <code>https://github.com/login/device</code>，输入那八位授权码并授权。</li>
          <li>安装器几秒内就会接上，继续往下走。<b>授权码有效期约十分钟</b>，超时就重新点一次“验证身份并安装”换一个新码。</li>
        </ol>
        <p>另外确认用户名框里没有重复粘贴（例如 <code>name</code> 被写成 <code>namename</code>）：
          授权成功后安装器会拿 GitHub 的实际登录名和这里比对，不一致会在授权之后才报错。</p>
      </Note>
      </>,
    },
    {
      id: "hooks", title: "Hook 故障决策树",
      body: <>
        <p>治理未生效时，请按以下顺序定位。每一层对应不同的处理方式。</p>
        <div className="simple-table">
          <div><b>没有 UserPromptSubmit 配置</b><span>属于安装/升级接线问题。用“升级/修复”重建 <code>.claude/settings.local.json</code>。</span></div>
          <div><b>配置存在，但隔离执行失败</b><span>检查便携 Python、脚本权限、文件哈希和路径引号。</span></div>
          <div><b>隔离执行成功，真实会话却没有锚点</b><span>核对 Claude Code 版本、启动目录，以及它实际加载的项目配置。</span></div>
          <div><b>锚点已落盘，但没有注入文本</b><span>属于 Hook 输出协议、输出大小或 Claude Code 版本兼容问题。</span></div>
          <div><b>Stop 反复拦截</b><span>首次拦截后的 <code>stop_hook_active=true</code> 必须静默成功返回；否则是 Stop 重入回归。</span></div>
        </div>
        <Note title="使用安装器诊断">安装器的“报告问题”会自动运行只读的 <code>hook-doctor</code>。它只读取真实项目配置；Hook 的实际执行发生在临时项目中，不会修改当前项目。</Note>
      </>,
    },
    {
      id: "retrieval", title: "知识检索与回流",
      body: <div className="simple-table">
        <div><b>会话开始十几分钟后检索工具集体 404</b><span>{versionLabel} 之前的后台令牌轮换竞态。升级到 {versionLabel} 或更高版本根治。</span></div>
        <div><b>结果里有中文就断开连接</b><span>同为 {versionLabel} 之前的缺陷，非 ASCII 结果在部分终端编码下会打断连接。升级即可。</span></div>
        <div><b>升级后问题仍然存在（Linux/macOS）</b><span>可能受到旧版本升级未落地缺陷的影响。改用“重装当前版本（修复）”重新安装受管组件，详见<a href={pageHref("upgrade")}>三条版本规则</a>。</span></div>
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
        <p>如果问题不符合上述情况，请使用安装器内置的问题报告。报告会附带版本、平台、当前状态、Hook Doctor 结论和最多 200 行脱敏日志。</p>
        <ol>
          <li>点安装器右上角或失败页的“报告问题”。</li>
          <li>填写复现步骤，检查脱敏预览。</li>
          <li>确认提交。已完成设备核验时可自动创建私有 Issue，否则会打开预填好的 GitHub 表单。</li>
        </ol>
        <div className="link-list"><a href={installerIssueHref} target="_blank" rel="noreferrer"><b>直接打开 Installer Issue 表单</b><span>用于安装器无法启动、或报告窗口不可用的情况 →</span></a></div>
        <Code>{`# 提交前检查后台服务状态
# Ubuntu / WSL
systemctl --user status aiig-records-agent.service

# macOS
launchctl print gui/$(id -u)/art.aiigovernance.records-agent`}</Code>
      </>,
    },
  ],
};
