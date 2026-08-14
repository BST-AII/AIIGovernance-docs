import type { ReactNode } from "react";
import { SkillCatalog } from "./skill-catalog";

type Section = { id: string; title: string; body: ReactNode };
type DocPage = { group: string; label: string; title: string; intro: string; sections: Section[] };

const Code = ({ children }: { children: string }) => <pre className="code-block"><code>{children}</code></pre>;
const Note = ({ title, children }: { title: string; children: ReactNode }) => <aside className="note"><b>{title}</b><div>{children}</div></aside>;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const pageHref = (slug: string) => `${basePath}${slug === "overview" ? "/" : `/${slug}/`}`;
const latestReleaseHref = "https://github.com/BST-AII/AIIGovernance-releases/releases/latest";
const releaseHistoryHref = "https://github.com/BST-AII/AIIGovernance-releases/releases";
const installerIssueHref = "https://github.com/BST-AII/AIIGovernance-releases/issues/new?template=installer-bug.yml";
const domesticMirrorHref = "https://service.pikso.art/AIIGovernance-docs/";

const pages: Record<string, DocPage> = {
  overview: {
    group: "开始使用", label: "概览", title: "AIIGovernance 治理框架",
    intro: "AIIGovernance 将治理规则、执行 Hooks、审计记录和 Wildskills 安装到项目内部，让 AI 的每一次工作有规则、有边界、有证据、可核验。",
    sections: [
      { id: "what-it-is", title: "它解决什么问题", body: <><p>AI Agent 能读写代码、运行命令并调用外部工具，但仅靠提示词很难持续保证工作边界，也很难在任务结束后还原“做了什么、为什么这样做”。</p><p>AIIGovernance 把治理落到项目文件、Git 版本和机械检查中，使团队共享同一套规则和证据。</p></> },
      { id: "principle", title: "治理落入代码，证据生于设计", body: <><p className="english-line">Governance as code. Evidence by design.</p><p>治理规则像代码一样可版本化、可执行、可检查；证据不是事后补写，而是在任务执行过程中由 Hooks 和 Agent 分别产生。</p></> },
      { id: "capabilities", title: "核心能力", body: <ul><li>项目级安装和独立版本钉定</li><li>基本法与业务法按任务职能加载</li><li>Wildskills 项目级接入和调用</li><li>事件与决策双流水审计</li><li>不可逆动作前置闸和机械核验</li><li>安装、升级、机器人接入与安全卸载</li></ul> },
      { id: "start", title: "从这里开始", body: <div className="link-list"><a href={pageHref("installation")}><b>安装治理框架</b><span>在第一个 Windows 项目中完成离线安装 →</span></a><a href={pageHref("robot")}><b>安装飞书机器人</b><span>让已有治理项目接入消息机器人 →</span></a><a href={pageHref("architecture")}><b>了解治理架构</b><span>理解 Law、Spec、Execution 和双流水 →</span></a></div> },
    ],
  },
  installation: {
    group: "开始使用", label: "安装治理框架", title: "安装治理框架",
    intro: "同一套可视化安装向导支持 Windows、Ubuntu / WSL 和 macOS，把 AIIGovernance、Wildskills、Hooks、Records Agent 与 MCP Bridge 一次性接入目标项目。",
    sections: [
      { id: "latest-release", title: "下载最新正式版本", body: <><div className="link-list"><a href={latestReleaseHref} target="_blank" rel="noreferrer"><b>打开最新 Installer Release</b><span>永久指向当前最新版本；登录 GitHub 后选择自己的平台 →</span></a><a href={releaseHistoryHref} target="_blank" rel="noreferrer"><b>查看全部历史版本</b><span>查看旧版本、发布时间和校验文件 →</span></a></div><div className="simple-table"><div><b>Windows x64</b><span><code>AIIGovernance-Setup-installer-vX.Y.Z.exe</code></span></div><div><b>Ubuntu / WSL x64</b><span><code>AIIGovernance-Setup-linux-x64-vX.Y.Z.tar.gz</code></span></div><div><b>Apple Silicon</b><span><code>AIIGovernance-Setup-macos-arm64-vX.Y.Z.zip</code></span></div><div><b>Intel Mac</b><span><code>AIIGovernance-Setup-macos-x64-vX.Y.Z.zip</code></span></div></div><Note title="Private Release">请先登录拥有 BST-AII 权限的 GitHub 账号；未登录或无权限时 GitHub 会显示 404。安装包文件名带版本号，因此网页使用不会过期的 <code>releases/latest</code> 入口。</Note></> },
      { id: "requirements", title: "安装前准备", body: <><ul><li>Windows 10 或 Windows 11</li><li>一个需要治理的项目目录</li><li>一个已加入 BST-AII 的 GitHub 账号</li><li>建议安装 Claude Code 并完成登录</li></ul><Note title="Git 与 Python">Git 缺失时可使用安装器内置的 PortableGit；目标电脑不需要预装 Python，Hooks、Sync Agent 与 MCP Bridge 使用安装包内的便携 Python。</Note></> },
      { id: "download", title: "下载安装器", body: <><div className="link-list"><a href="https://github.com/BST-AII/AIIGovernance-releases/releases/latest" target="_blank" rel="noreferrer"><b>下载最新 Windows 安装程序</b><span>进入组织内部安装包 Release，选择 EXE 和对应 SHA256 →</span></a><a href="https://github.com/BST-AII/AIIGovernance-releases/releases" target="_blank" rel="noreferrer"><b>查看历史发布版本</b><span>进入 AIIGovernance-releases 的版本列表 →</span></a></div><Note title="访问权限">安装程序存放在 Private 仓库中。请先登录 GitHub，并确认账号拥有 <code>BST-AII/AIIGovernance-releases</code> 的访问权限。</Note><ol><li>下载最新的 Windows 安装程序和对应的 <code>.sha256</code> 文件。</li><li>在 PowerShell 中校验 EXE 的 SHA256。</li><li>确认校验值一致后双击运行。</li></ol><Code>{`Get-FileHash .\\AIIGovernance-Setup-installer-vX.Y.Z.exe -Algorithm SHA256`}</Code></> },
      { id: "install", title: "完成首次安装", body: <ol><li>双击安装器，选择“首次安装”。</li><li>选择项目根目录；如果还不是 Git 仓库，确认是否执行 <code>git init</code>。</li><li>安装器离线挂载 AIIGovernance 和 Wildskills。</li><li>确认 Claude 权限基线和项目 Trust，并完成 bootstrap、lint 和自检。</li><li>输入 GitHub 用户名，在 GitHub 官方页面完成设备授权；用户名或 BST-AII 组织身份不匹配时安装会停止。</li><li>安装器自动注册共享 Sync Agent、当前项目和 <code>aiigovernance-records</code> MCP Bridge。</li><li>选择是否继续安装飞书机器人。</li></ol> },
      { id: "windows", title: "Windows 10 / 11", body: <><p>下载 EXE 和同名 <code>.sha256</code>，使用上方 PowerShell 命令核验后双击运行。一般使用普通用户权限即可。</p><Note title="Access is denied">先确认项目不在系统目录、只读网络盘或其他账号目录，并关闭仍占用旧安装器、cc-connect 或载荷缓存的进程。计划任务被公司策略拒绝时，新版会尝试当前用户启动项；只有错误步骤明确要求提升权限时才右键“以管理员身份运行”。</Note></> },
      { id: "linux", title: "Ubuntu 22.04 / 24.04 / WSL2", body: <><p>Ubuntu 桌面只需要 Git；安装包已携带 Python、Qt 和所需 XCB 运行库。WSL 必须启用 WSLg 才能显示窗口。请使用标注支持 Ubuntu 22.04+ 的最新安装包。</p><Code>{"sudo apt update\nsudo apt install -y git\ntar -xzf AIIGovernance-Setup-linux-x64-vX.Y.Z.tar.gz\ncd AIIGovernance-Setup-linux-x64-vX.Y.Z\nchmod +x AIIGovernance-Setup-linux-x64-vX.Y.Z\n./AIIGovernance-Setup-linux-x64-vX.Y.Z"}</Code><Note title="窗口打不开">先确认正在 Ubuntu 桌面或已启用 WSLg，并检查 <code>echo $DISPLAY</code>。不要在纯 SSH/headless 会话中期待 GUI。</Note><Note title="出现 Could not initialize GLX">这是 Qt 无法使用当前显卡、虚拟机或远程桌面的 GLX 配置，不是 CPU 架构不匹配。v0.3.31 已确认可能出现；后续版本默认自动选择软件渲染，但显卡驱动、远程桌面环境或用户自定义 Qt 变量仍可能触发。任何版本遇到该错误都可以先用下面的应急命令启动；这些变量只影响本次启动，不会永久修改系统，也不是安装后的运行依赖。</Note><Code>{"QT_OPENGL=software \\\nQT_QUICK_BACKEND=software \\\nQT_XCB_GL_INTEGRATION=none \\\nLIBGL_ALWAYS_SOFTWARE=1 \\\nQTWEBENGINE_CHROMIUM_FLAGS=--disable-gpu \\\n./AIIGovernance-Setup-linux-x64-vX.Y.Z"}</Code><p><code>libgvfscommon.so</code> 或 <code>libgvfsdbus.so</code> 的符号提示通常只是伴随警告；本问题的致命判据是随后出现 <code>Could not initialize GLX</code> 和 <code>Aborted</code>。</p></> },
      { id: "macos", title: "macOS Intel / Apple Silicon", body: <><ol><li>运行 <code>uname -m</code>：<code>arm64</code> 选择 Apple Silicon 包，<code>x86_64</code> 选择 Intel 包。</li><li>下载对应 ZIP 和 <code>.sha256</code>，运行 <code>shasum -a 256 文件名.zip</code> 并核对。</li><li>解压后把应用拖到 Applications；首次启动在 Finder 中右键应用并选择“打开”。</li><li>仍被拦截时进入“系统设置 → 隐私与安全性”，在安全提示下选择“仍要打开”。</li></ol><Note title="Apple 无法检查是否包含恶意软件">当前内部预览包尚未使用 Apple Developer ID 签名与公证，因此 Gatekeeper 会提示。核对 SHA256 后只为这个应用执行“仍要打开”；不要关闭 Gatekeeper 全局保护。</Note><Note title="企业代理证书错误">若飞书凭据校验出现 <code>CERTIFICATE_VERIFY_FAILED: self-signed certificate in certificate chain</code>，请让 IT 把公司根证书安装到 macOS 系统钥匙串并设为受信任。也可通过 <code>AIIG_ENTERPRISE_CA_FILE</code> 明确追加 IT 提供的 PEM；禁止关闭 TLS 校验。</Note></> },
      { id: "troubleshooting", title: "常见问题与解决方法", body: <div className="simple-table"><div><b>GitHub Device Code 400</b><span>组织 OAuth App 必须启用 Device Flow；这不是用户名拼写错误。</span></div><div><b>授权后一直等待</b><span>保持安装器开启；公司核验严格关联页面显示的 Enrollment ID，超时后可重试。</span></div><div><b>Claude 已安装但未检测</b><span>关闭并重新打开安装器；仍失败时在终端确认 <code>claude --version</code>。</span></div><div><b>机器人回复超过三分钟</b><span>点击“继续等待/重新等待我的消息”；单轮超时不会撤销已完成的治理安装。</span></div><div><b>机器人已绑定其他项目</b><span>明确选择迁移到当前项目，或返回飞书创建新机器人；同一 App ID 不能同时绑定多个项目。</span></div></div> },
      { id: "hook-diagnostics", title: "Hook 故障决策树", body: <><div className="simple-table"><div><b>没有 UserPromptSubmit 配置</b><span>属于安装/升级接线问题；使用“升级/修复”重建 <code>.claude/settings.local.json</code>。</span></div><div><b>配置存在，隔离执行失败</b><span>检查便携 Python、脚本权限、文件哈希和路径引号。</span></div><div><b>隔离执行成功，真实会话无锚点</b><span>核对 Claude Code 版本、启动目录与它实际加载的项目配置。</span></div><div><b>锚点已落盘，但无注入文本</b><span>属于 Hook 输出协议、输出大小或 Claude Code 版本兼容问题。</span></div><div><b>Stop 反复拦截</b><span>首次拦截后的 <code>stop_hook_active=true</code> 必须静默成功返回；否则是 Stop 重入回归。</span></div></div><p>安装器的“报告问题”会自动运行只读 <code>hook-doctor</code>。它只读真实项目配置，Hook 实跑发生在自动删除的临时项目。</p></> },
      { id: "report-issue", title: "如何报告安装问题", body: <><ol><li>点击安装器右上角或失败页的“报告问题”。</li><li>填写复现步骤并检查脱敏预览；预览包含版本、平台、当前状态、Hook Doctor 结论和最多 200 行日志。</li><li>确认后提交。已完成设备身份核验时可自动创建私有 Issue；否则按钮显示“打开 GitHub Issue 表单”，登录后手工提交预填内容。Issue 表单放在安装包下载仓库，不再要求安装器源码仓库权限。</li></ol><div className="link-list"><a href={installerIssueHref} target="_blank" rel="noreferrer"><b>直接打开 Installer Issue 表单</b><span>用于安装器无法启动或报告窗口不可用的情况 →</span></a></div><Note title="隐私边界">不采集 App Secret、Token、对话、Records、Task 正文、真实 HOME 路径、完整项目路径或 Hook 命令全文；提交前始终由用户预览确认。</Note></> },
      { id: "records-sync", title: "知识回流与 MCP", body: <><p>每个 Windows 用户只运行一个后台 Sync Agent；同一用户的多个项目通过稳定的 Project ID 分开同步 <code>records/events.jsonl</code>，互不覆盖。多个 Claude Session 可以同时写入，Agent 只上传完整 JSONL 行，并在公司侧确认入库后推进游标。</p><Note title="凭据边界">GitHub token 不保存到本机或云端中继；设备私钥与 Relay Session 由 Windows DPAPI 保护。云端只能看到端到端加密信封，10.65.2.137 独立核验组织身份。</Note></> },
      { id: "verify", title: "安装后验证", body: <><p>安装器已经自动执行 bootstrap、lint 和 selftest，普通用户不需要再次运行脚本。重新打开 Claude 会话并进入项目，首条回复出现“治理已加载”即完成使用侧验证。</p><p>项目维护者可选地运行 <code>git status</code> 审阅安装器产生的治理文件，并按团队流程提交；手工运行 <code>bootstrap.py --check</code> 仅用于高级排查。</p></> },
    ],
  },
  robot: {
    group: "开始使用", label: "安装飞书机器人", title: "为已有项目安装飞书机器人",
    intro: "已有治理项目无需重装或升级框架，可从安装器首页直接进入飞书机器人配置链。",
    sections: [
      { id: "entry", title: "从安装器进入", body: <ol><li>双击安装器。</li><li>选择“已有项目添加机器人”。</li><li>选择已经安装 AIIGovernance 的项目根目录。</li><li>安装器检测到治理标记后直接进入机器人接入页面。</li></ol> },
      { id: "feishu-app", title: "创建飞书应用", body: <><p>在飞书开放平台创建智能体应用，保存 App ID 和 App Secret。安装器中的“查看示例”会打开三步图文说明。</p><Note title="凭据保护">App Secret 不写入向导状态和安装日志，只在验证与配置装配期间保存在内存中。</Note></> },
      { id: "identity", title: "确认消息身份", body: <ol><li>输入 App ID 和 App Secret，并执行真实凭据校验。</li><li>按提示向机器人发送第一条消息。</li><li>安装器通过隔离探针捕获你的 <code>open_id</code>。</li><li>把机器人的 <code>allow_from</code> 收窄到该身份。</li></ol> },
      { id: "daemon", title: "启动与验证", body: <><p>安装器注册或复用现有 cc-connect 服务，然后要求发送第二条消息完成端到端验证。</p><Note title="已有 cc-connect">如果已有二进制与安装包一致，安装器直接安全复用，不覆盖运行中的 EXE；版本不同且文件被占用时，会提示先停止 <code>cc-connect</code> 计划任务再重试。</Note></> },
    ],
  },
  architecture: {
    group: "治理框架", label: "治理架构", title: "治理框架架构",
    intro: "框架采用 Law、Spec、Execution 三层分立，并以事件和决策双流水形成可核验的项目证据。",
    sections: [
      { id: "layers", title: "三层治理模型", body: <div className="simple-table"><div><b>Law</b><span>定义什么不可违反：基本法、编码法、治理法、PM 法与审计法。</span></div><div><b>Spec</b><span>定义规则如何运转：记录、路由、工作区、初始化和 Skill 规范。</span></div><div><b>Execution</b><span>负责执行和核验：Hooks、bootstrap、check.py、gen_views.py 和安装器。</span></div></div> },
      { id: "deployment", title: "项目级部署", body: <><p>每个项目在 <code>.governance/</code> 下独立挂载 AIIGovernance 和 Wildskills，并通过 Git submodule 钉定版本。离线安装使用内置 Git bundle，安装结束后远端地址指回 GitHub。</p><Code>{`.governance/AIIGovernance\n.governance/Wildskills\n.claude/settings.local.json\n.claude/skills/\nrecords/\ntools/python/`}</Code></> },
      { id: "flow", title: "任务治理流程", body: <ol><li>收到任务并完成职能分诊。</li><li>加载基本法和对应业务法。</li><li>明确目标、验收标准与验证手段。</li><li>执行任务，Hooks 写事件，Agent 写决策。</li><li>运行机械核验，交由用户验收并归档。</li></ol> },
      { id: "evidence", title: "双流水与派生视图", body: <><p><code>events.jsonl</code> 保存 Hooks 观察到的事实；<code>decisions.jsonl</code> 保存 Agent 申报的判断。<code>board.md</code> 和任务视图由两条原始流水生成，可以随时重建。</p></> },
    ],
  },
  laws: {
    group: "治理框架", label: "业务法说明", title: "基本法与业务法",
    intro: "基本法规定所有任务共同遵守的工作秩序，业务法根据任务职能按需加载。",
    sections: [
      { id: "constitution", title: "基本法", body: <p><code>law/constitution.md</code> 按“接活、动手前、执行中、收尾、不可逆动作”组织，覆盖分诊、任务定义、用户确认、范围控制、验证和诚实申报。</p> },
      { id: "business-laws", title: "三部业务法", body: <div className="simple-table"><div><b>coding_law</b><span>代码修改、测试、缺陷修复、提交质量和工程边界。</span></div><div><b>governance_law</b><span>修改法条、Spec、Hooks 和治理框架自身时适用。</span></div><div><b>pm_law</b><span>需求澄清、PRD、多任务协调和验收管理。</span></div></div> },
      { id: "audit-law", title: "审计法", body: <p><code>audit_law.md</code> 保留审计复核所需的独立性、可追踪性、禁止猜测和限制声明；未挂载条款不会在普通任务中增加上下文负担。</p> },
      { id: "routing", title: "业务法如何加载", body: <><p>Agent 先按 <code>spec/route_spec.md</code> 判断职能。一个会话第一次进入某职能时读取对应业务法；无法归类的组织性事务只使用基本法。</p><Note title="按需加载">业务法不是每次全量阅读，路由决定本次任务真正需要的规则。</Note></> },
    ],
  },
  skills: {
    group: "治理框架", label: "Skills 说明", title: "Wildskills 与项目 Skills",
    intro: "Wildskills 提供可复用的专业工作能力，AIIGovernance 负责把它们接入项目并约束调用过程。",
    sections: [
      { id: "location", title: "Skills 安装在哪里", body: <><p>技能库挂载在 <code>.governance/Wildskills</code>，安装器再把可用 Skill 接入 <code>.claude/skills/</code>。目标项目保留自己的版本钉定，不依赖全局安装。</p></> },
      { id: "discovery", title: "如何发现 Skill", body: <p>Claude Code 会从项目级 Skills 目录读取可用能力。治理框架通过 <code>spec/skill_spec.md</code> 保存注册和使用约定，避免出现同一能力的多份手工清单。</p> },
      { id: "selection", title: "什么时候应该使用 Skill", body: <ul><li>用户明确点名某个 Skill 时必须使用。</li><li>任务与 Skill 描述明确匹配时按需使用。</li><li>使用前读取对应 <code>SKILL.md</code> 的完整说明。</li><li>Skill 不能扩大用户授权范围。</li></ul> },
      { id: "catalog", title: "全部 Wildskills", body: <><p>下面的目录直接来自 Wildskills 仓库中全部 <code>SKILL.md</code> 的元数据，可以按名称、用途和类别筛选。</p><SkillCatalog /></> },
      { id: "add", title: "增加或升级 Skill", body: <p>在 Wildskills 中维护 Skill 源，再更新目标项目的 Wildskills submodule 和项目接线。不要直接手改生成后的 <code>.claude/skills</code> 副本。</p> },
    ],
  },
  usage: {
    group: "治理框架", label: "怎么调用", title: "如何调用治理框架与 Skills",
    intro: "治理框架通常由 Claude Code 在项目会话中自动加载；用户也可以明确指定职能、Skill 和验收要求。",
    sections: [
      { id: "start-session", title: "进入治理项目", body: <><Code>{`cd your-project\nclaude`}</Code><p>新会话读取项目根目录的 <code>CLAUDE.md</code>，再进入治理框架的基本法与会话初始化流程。</p></> },
      { id: "automatic", title: "自然语言自动调用", body: <><p>直接描述任务即可，例如：</p><Code>{`帮我修复登录接口的超时问题，验收标准是现有测试通过并新增一个超时回归测试。`}</Code><p>框架会将任务路由到 coding 职能，读取编码业务法，建立任务记录并按工作流执行。</p></> },
      { id: "explicit-skill", title: "明确指定 Skill", body: <><p>需要固定能力时可以直接点名：</p><Code>{`请使用 security-review Skill 检查这次认证模块修改，并列出可复现证据。`}</Code><p>Agent 应先读取对应 Skill 的说明，再在治理规则限定的范围内执行。</p></> },
      { id: "check", title: "手动运行核验", body: <Code>{`.\\tools\\python\\python.exe .governance\\AIIGovernance\\tool\\check.py --lint\n.\\tools\\python\\python.exe .governance\\AIIGovernance\\tool\\check.py --run`}</Code> },
    ],
  },
  upgrade: {
    group: "维护与更新", label: "升级", title: "升级已有治理项目",
    intro: "新版安装器会检测项目已安装版本，在用户确认后覆盖框架并重新完成 Skills、设置和验证步骤。",
    sections: [
      { id: "check", title: "检测版本", body: <ol><li>运行更新版本的安装器。</li><li>选择“升级已有项目”。</li><li>选择项目根目录。</li><li>安装器比较项目安装元数据与当前 EXE 版本。</li></ol> },
      { id: "overwrite", title: "升级会覆盖什么", body: <><p>升级会把两个治理 submodule 更新到安装包钉定版本，并备份后重建 <code>.claude/settings.json</code> 和 <code>settings.local.json</code>。</p><Note title="升级前确认">升级会覆盖治理框架和治理 Settings。安装器在真正写入前展示版本和覆盖提醒。</Note></> },
      { id: "preserve", title: "升级会保留什么", body: <ul><li><code>project_profile.yaml</code></li><li><code>records/</code> 原始治理记录</li><li>升级前 settings 的 <code>*.aiig-upgrade.bak</code> 备份</li></ul> },
      { id: "finish", title: "升级完成", body: <p>安装器重新渲染 Skills 和 <code>CLAUDE.md</code>，重新应用权限与 Trust，运行完整验证，并展示旧版本到新版本以及本次更新说明。</p> },
    ],
  },
  uninstall: {
    group: "维护与更新", label: "卸载", title: "安全卸载治理框架",
    intro: "卸载只拆除安装器管理的治理接线和运行时，保留项目业务数据与可审阅的 Git 变更。",
    sections: [
      { id: "entry", title: "进入卸载", body: <ol><li>运行安装器并选择“升级已有项目”。</li><li>选择已安装治理框架的项目。</li><li>在版本检查页面选择“卸载治理框架”。</li><li>阅读删除与保留清单后再次确认。</li></ol> },
      { id: "remove", title: "会被移除", body: <ul><li>AIIGovernance 与 Wildskills submodule</li><li>AIIG Hooks 接线</li><li>安装器接入的项目 Skills</li><li>当前项目的 Sync Agent 注册与 MCP Bridge 接线</li><li>项目内便携 Python</li><li>安装器管理的元数据</li></ul> },
      { id: "shared-agent", title: "不会影响其他项目", body: <p>卸载只注销当前项目的游标和 MCP 配置。若同一 Windows 用户还有其他治理项目，后台 Sync Agent 继续运行；只有最后一个项目被卸载时才删除共享计划任务。</p> },
      { id: "keep", title: "会被保留", body: <ul><li><code>project_profile.yaml</code></li><li><code>records/</code> 与审计证据</li><li>用户权限配置</li><li>全局项目 Trust 记录</li></ul> },
      { id: "safety", title: "安全保护", body: <><p>如果治理 submodule 内存在未提交修改，卸载会停止，不会强制删除。Git 删除结果保留在项目工作区或暂存区，由维护者审核后提交。</p></> },
    ],
  },
  releases: {
    group: "参考", label: "版本说明", title: "版本与发布说明",
    intro: "这里汇总当前正式安装器、跨平台产物和面向用户的版本变化；安装包仍从组织内部 Release 仓库下载。",
    sections: [
      { id: "latest", title: "当前正式版本：v0.3.53", body: <><p>发布时间：2026-08-14。Windows、Ubuntu x64、macOS Apple Silicon 和 macOS Intel 由同一个 Release 交付。</p><ul><li>根治 Ubuntu/macOS 升级不更新组件的缺陷：重装一律全量重铺（即使版本相同），升级按组件版本号精确更新。</li><li>知识检索通路修复：查询结果含中文/特殊字符时连接中断、后台令牌轮换竞态导致的 404 均已修复。</li><li>升级与重装会自动重新接线本机全部已挂载项目（多项目机器不再残留旧配置）。</li><li>安装器事务修复：中断的卸载不再阻塞后续覆盖重装。</li><li>知识检索工具升级为六件套（search_knowledge / get_knowledge / related_knowledge / search_records / list_projects / knowledge_status）。</li></ul><div className="link-list"><a href={latestReleaseHref} target="_blank" rel="noreferrer"><b>打开 v0.3.53 / 最新 Release</b><span>未来发布新版本后，此入口会自动指向新版本 →</span></a></div></> },
      { id: "current", title: "0.3.x", body: <ul><li>首次安装与已有项目升级入口</li><li>强制 GitHub/BST-AII 身份核验</li><li>自动安装多项目 Sync Agent 与 MCP Bridge</li><li>版本检测、Settings 备份和升级说明</li><li>项目级安全卸载</li><li>已有项目独立添加飞书机器人</li><li>已有 cc-connect 相同版本安全复用</li><li>EXE Windows 文件版本和自动 GitHub Release</li></ul> },
      { id: "automation", title: "自动版本规则", body: <p>推送到安装器 <code>main</code> 分支后，自动发布流程递增 PATCH 版本，并在 Windows、Ubuntu、macOS Intel 与 Apple Silicon Runner 上测试和构建。成功后生成统一 Tag、四平台安装包、SHA256 与来源 manifest。</p> },
      { id: "artifacts", title: "发布产物", body: <ul><li><code>AIIGovernance-Setup-installer-vX.Y.Z.exe</code>：Windows x64。</li><li><code>AIIGovernance-Setup-linux-x64-vX.Y.Z.tar.gz</code>：Ubuntu / WSL x64。</li><li><code>AIIGovernance-Setup-macos-arm64-vX.Y.Z.zip</code>：Apple Silicon。</li><li><code>AIIGovernance-Setup-macos-x64-vX.Y.Z.zip</code>：Intel Mac。</li><li>每个安装包对应的 SHA256 与来源 manifest。</li></ul> },
      { id: "history", title: "查看历史版本", body: <><p>本页保留当前版本面向用户的主要变化；精确 Tag、发布时间、校验文件和旧安装包位于完整 Release 历史。</p><div className="link-list"><a href={releaseHistoryHref} target="_blank" rel="noreferrer"><b>查看完整 Release 历史</b><span>需要先登录拥有 BST-AII 权限的 GitHub 账号 →</span></a><a href={pageHref("installation")}><b>返回跨平台安装说明</b><span>查看下载、macOS 权限、故障处理和问题报告 →</span></a></div></> },
    ],
  },
};

export const docSlugs = Object.keys(pages).filter((slug) => slug !== "overview");
const groups = ["开始使用", "治理框架", "维护与更新", "参考"];
const order = ["overview", "installation", "robot", "architecture", "laws", "skills", "usage", "upgrade", "uninstall", "releases"];

export function DocsPage({ slug }: { slug: string }) {
  const page = pages[slug] || pages.overview;
  const position = order.indexOf(slug);
  const previous = position > 0 ? order[position - 1] : null;
  const next = position >= 0 && position < order.length - 1 ? order[position + 1] : null;
  return <div className="docs-site">
    <header className="docs-header">
      <a className="docs-brand" href={pageHref("overview")}><img src={`${basePath}/app-icon.png`} alt=""/><span>AIIGovernance</span><em>Docs</em></a>
      <div className="header-tools"><button aria-label="搜索文档">⌕&nbsp;&nbsp;搜索文档 <kbd>Ctrl K</kbd></button><a href="https://bst-aii.github.io/AIIGovernance-docs/">使用说明</a><a href={domesticMirrorHref}>国内镜像</a><a href="https://github.com/BST-AII/AIIGovernance-docs">GitHub ↗</a></div>
    </header>
    <nav className="category-nav" aria-label="文档分类"><a href={pageHref("installation")}>开始使用</a><a href={pageHref("architecture")}>治理框架</a><a href={pageHref("upgrade")}>维护与更新</a><a href={pageHref("releases")}>版本说明</a></nav>
    <div className="docs-grid">
      <aside className="left-nav">
        {groups.map(group => <section key={group}><h3>{group}</h3>{order.filter(key => pages[key].group === group).map(key => <a className={key === slug ? "current" : ""} href={pageHref(key)} key={key}>{pages[key].label}</a>)}</section>)}
      </aside>
      <main className="article">
        <div className="article-label">{page.group}</div><h1>{page.title}</h1><p className="article-intro">{page.intro}</p>
        {page.sections.map(section => <section className="article-section" id={section.id} key={section.id}><h2><a href={`#${section.id}`}>#</a>{section.title}</h2>{section.body}</section>)}
        <nav className="page-turn">{previous ? <a href={pageHref(previous)}><span>上一页</span><b>← {pages[previous].label}</b></a> : <i/>}{next ? <a className="next" href={pageHref(next)}><span>下一页</span><b>{pages[next].label} →</b></a> : null}</nav>
      </main>
      <aside className="right-nav"><h3>本页内容</h3>{page.sections.map(section => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}<div><a href="https://github.com/BST-AII/AIIGovernance-docs">查看网页仓库 ↗</a></div></aside>
    </div>
    <footer className="docs-footer"><span>治理落入代码，证据生于设计</span><small>Governance as code. Evidence by design.</small></footer>
  </div>;
}
