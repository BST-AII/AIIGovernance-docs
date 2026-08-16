import {
  Code, DocPage, Figure, Level, Matrix, Note, Warn,
  installerIssueHref, latestReleaseHref, pageHref, releaseHistoryHref,
} from "../doc-kit";
import { assetSize, placeholderName, release, versionLabel } from "../release-data";

const asset = (platform: string) =>
  release.assets.find((entry) => entry.platform === platform) ?? release.assets[0];

const win = asset("Windows x64");
const linux = asset("Ubuntu / WSL x64");
const macArm = asset("macOS Apple Silicon");
const macIntel = asset("macOS Intel");

export const overview: DocPage = {
  group: "开始使用", label: "概览", title: "AIIGovernance 治理框架",
  intro: "AIIGovernance 将治理规则、执行 Hooks、审计记录和 Wildskills 安装到项目内部，让 AI 的每一次工作有规则、有边界、有证据、可核验。",
  sections: [
    {
      id: "what-it-is", title: "它解决什么问题",
      body: <><p>AI Agent 能读写代码、运行命令并调用外部工具，但仅靠提示词很难持续保证工作边界，也很难在任务结束后还原“做了什么、为什么这样做”。</p><p>AIIGovernance 把治理落到项目文件、Git 版本和机械检查中，使团队共享同一套规则和证据。</p></>,
    },
    {
      id: "principle", title: "治理落入代码，证据生于设计",
      body: <><p className="english-line">Governance as code. Evidence by design.</p><p>治理规则像代码一样可版本化、可执行、可检查；证据不是事后补写，而是在任务执行过程中由 Hooks 和 Agent 分别产生。</p></>,
    },
    {
      id: "capabilities", title: "核心能力",
      body: <ul><li>项目级安装和独立版本钉定</li><li>基本法与业务法按任务职能加载</li><li>Wildskills 项目级接入和调用</li><li>事件与决策双流水审计</li><li>不可逆动作前置闸和机械核验</li><li>安装、升级、机器人接入与安全卸载</li><li>知识回流到公司知识平台，并可在会话中反向检索</li></ul>,
    },
    {
      id: "pieces", title: "你会用到的三件东西",
      body: <><p>整套系统对用户呈现为三个入口，装一次之后各司其职：</p><div className="simple-table"><div><b>安装器</b><span>一个可视化向导，把治理框架装进项目、完成身份核验、注册后台同步与检索通路。Windows、Ubuntu/WSL、macOS 共用同一套向导。</span></div><div><b>项目里的 Claude 会话</b><span>日常工作发生的地方。治理规则自动加载，知识检索作为工具随会话可用。</span></div><div><b>AI 中台管理平台</b><span>浏览器里的后台：看知识回流情况、审核与归类知识、管理账号与运行状态。</span></div></div></>,
    },
    {
      id: "start", title: "从这里开始",
      body: <div className="link-list"><a href={pageHref("installation")}><b>安装治理框架</b><span>Windows、Ubuntu/WSL 与 macOS 的完整安装步骤 →</span></a><a href={pageHref("account")}><b>平台账号与权限</b><span>组织成员首次登录即自动开通，角色如何授予 →</span></a><a href={pageHref("mcp")}><b>在会话里检索知识</b><span>六个受治理查询工具和一段示例会话 →</span></a><a href={pageHref("architecture")}><b>了解治理架构</b><span>理解 Law、Spec、Execution 和双流水 →</span></a></div>,
    },
  ],
};

export const installation: DocPage = {
  group: "开始使用", label: "安装治理框架", title: "安装治理框架",
  intro: "同一套可视化安装向导支持 Windows、Ubuntu / WSL 和 macOS，把 AIIGovernance、Wildskills、Hooks、Records Agent 与 MCP Bridge 一次性接入目标项目。",
  sections: [
    {
      id: "latest-release", title: `下载最新正式版本：${versionLabel}`,
      body: <>
        <p>当前正式版本 <b>{versionLabel}</b>，发布于 {release.releaseDate}。Windows、Ubuntu x64、macOS Apple Silicon 和 macOS Intel 由同一个 Release 交付，四个包版本号一致。</p>
        <div className="link-list">
          <a href={latestReleaseHref} target="_blank" rel="noreferrer"><b>打开最新 Installer Release</b><span>永久指向当前最新版本；登录 GitHub 后选择自己的平台 →</span></a>
          <a href={releaseHistoryHref} target="_blank" rel="noreferrer"><b>查看全部历史版本</b><span>查看旧版本、发布时间和校验文件 →</span></a>
        </div>
        <Matrix
          head={["平台", "安装包", "体积", "SHA256"]}
          rows={release.assets.map((entry) => [
            entry.platform,
            <code key="f">{entry.file}</code>,
            assetSize(entry.bytes),
            <code key="s" className="sha">{entry.sha256}</code>,
          ])}
        />
        <p>上表的版本号、体积与 SHA256 直接来自 <code>{release.tag}</code> 这次 Release 的发布记录，可以逐字与 Release 页面核对。</p>
        <Note title="Private Release">请先登录拥有 BST-AII 权限的 GitHub 账号；未登录或无权限时 GitHub 会显示 404，这不是链接失效。安装包文件名带版本号，因此本站的下载入口一律使用不会过期的 <code>releases/latest</code>。</Note>
      </>,
    },
    {
      id: "requirements", title: "安装前准备",
      body: <>
        <p>三个平台的共同前提只有三条：一个需要治理的项目目录、一个已加入 BST-AII 的 GitHub 账号、以及已安装并登录的 Claude Code。目标电脑<b>不需要预装 Python</b>——Hooks、Sync Agent 与 MCP Bridge 使用安装包内自带的可重定位 CPython 3.12。</p>
        <Matrix
          head={["平台", "系统要求", "必须先装", "安装包已自带"]}
          rows={[
            ["Windows", "Windows 10 或 Windows 11（x64）", <>Git（缺失时可用安装器内置的 PortableGit）</>, "CPython 3.12、离线 wheelhouse、WebView2 运行时检查"],
            ["Ubuntu / WSL2", "Ubuntu 22.04 LTS 或 24.04 LTS；WSL 必须启用 WSLg", <>Git 2.38+（<code>sudo apt install -y git</code>）</>, "CPython 3.12、Qt 及其 XCB 运行库（不需要手工装 libxcb-cursor0）"],
            ["macOS", "Apple Silicon 或 Intel；先用 uname -m 确认架构", <>Git 2.38+（<code>brew install git</code>）</>, "CPython 3.12，不依赖 Homebrew 或 python.org 的 Python"],
          ]}
        />
        <Note title="为什么 Linux 包体积明显更大">Linux 冻结包必须在最老受支持的 Ubuntu 22.04（glibc 2.35）上构建，并把 Qt 与全部 XCB 运行库打进包内，才能同时在 22.04 与 24.04 上运行。这是刻意的：在 24.04 上构建的成品会要求 GLIBC_2.38，22.04 用户连安装器窗口都进不去。</Note>
      </>,
    },
    {
      id: "verify-download", title: "校验安装包",
      body: <>
        <p>每个安装包旁边都有同名的 <code>.sha256</code> 文件。下载后先核对再运行，核对通过才双击。</p>
        <Code>{`# Windows PowerShell
Get-FileHash .\\${placeholderName(win.file)} -Algorithm SHA256

# Ubuntu / WSL
sha256sum ${placeholderName(linux.file)}

# macOS
shasum -a 256 ${placeholderName(macArm.file)}`}</Code>
        <p>把命令输出与上一节表格里对应平台的 SHA256、或与 Release 里的 <code>.sha256</code> 文件内容比对，两者必须完全一致。</p>
      </>,
    },
    {
      id: "windows", title: "Windows 10 / 11",
      body: <>
        <ol>
          <li>下载 <code>{placeholderName(win.file)}</code> 与同名 <code>.sha256</code>。</li>
          <li>用上一节的 <code>Get-FileHash</code> 核对校验值。</li>
          <li>双击运行。一般使用普通用户权限即可，不需要右键“以管理员身份运行”。</li>
        </ol>
        <Note title="出现 Access is denied">先确认项目不在系统目录、只读网络盘或其他账号的目录下，并关闭仍占用旧安装器、cc-connect 或载荷缓存的进程。计划任务被公司策略拒绝时，新版会自动改用当前用户启动项，不需要提权；只有错误步骤明确要求提升权限时才用管理员身份运行。</Note>
      </>,
    },
    {
      id: "linux", title: "Ubuntu 22.04 / 24.04 与 WSL2",
      body: <>
        <p>正式支持 Ubuntu 22.04 LTS、24.04 LTS 及对应的 WSL2，前置依赖只有 Git 2.38+。WSL 必须启用 WSLg 才能显示窗口。</p>
        <Code>{`sudo apt update
sudo apt install -y git
tar -xzf ${placeholderName(linux.file)}
cd ${placeholderName(linux.file).replace(".tar.gz", "")}
chmod +x ${placeholderName(linux.file).replace(".tar.gz", "")}
./${placeholderName(linux.file).replace(".tar.gz", "")}`}</Code>
        <Note title="窗口打不开">先确认自己在 Ubuntu 桌面上、或已启用 WSLg，并检查 <code>echo $DISPLAY</code> 有值。纯 SSH / headless 会话里不会有 GUI。</Note>
        <Warn title="出现 Could not initialize GLX">这说明 Qt 找不到可用的 GLX 或显卡配置，<b>不是 CPU 架构不匹配</b>。v0.3.31 已确认可能出现；之后的版本在用户未显式配置图形后端时会自动改用软件渲染，但显卡驱动、远程桌面环境或用户自己设置的 Qt 变量仍可能触发。任何版本遇到该错误都可以先用下面的应急命令启动；这些变量只影响本次启动，不会永久改系统，也不是安装后的运行依赖。</Warn>
        <Code>{`QT_OPENGL=software \\
QT_QUICK_BACKEND=software \\
QT_XCB_GL_INTEGRATION=none \\
LIBGL_ALWAYS_SOFTWARE=1 \\
QTWEBENGINE_CHROMIUM_FLAGS=--disable-gpu \\
./${placeholderName(linux.file).replace(".tar.gz", "")}`}</Code>
        <p>启动时刷出 <code>libgvfscommon.so</code> 或 <code>libgvfsdbus.so</code> 的符号警告，通常只是桌面 GVFS 模块与包内 GLib 的组合产生的伴随信息；只要窗口能起来就不是失败判据。致命判据是随后出现的 <code>Could not initialize GLX</code> 与 <code>Aborted</code>。</p>
      </>,
    },
    {
      id: "macos", title: "macOS Intel 与 Apple Silicon",
      body: <>
        <ol>
          <li>运行 <code>uname -m</code>：返回 <code>arm64</code> 选 Apple Silicon 包 <code>{placeholderName(macArm.file)}</code>；返回 <code>x86_64</code> 选 Intel 包 <code>{placeholderName(macIntel.file)}</code>。</li>
          <li>下载对应 ZIP 与 <code>.sha256</code>，运行 <code>shasum -a 256 文件名.zip</code> 并核对。</li>
          <li>解压后把应用拖到「应用程序」；首次启动请在 Finder 中<b>右键点击应用并选择“打开”</b>，不要直接双击。</li>
          <li>仍被拦截时进入「系统设置 → 隐私与安全性」，在安全提示下选择“仍要打开”。</li>
        </ol>
        <Warn title="提示“Apple 无法检查是否包含恶意软件”">当前内部预览包尚未使用 Apple Developer ID 签名与公证，因此 Gatekeeper 一定会提示。正确做法是：核对 SHA256 后，只针对这一个应用执行“仍要打开”。<b>不要关闭 Gatekeeper 的全局保护。</b></Warn>
        <Note title="企业代理证书错误">若飞书凭据校验时出现 <code>CERTIFICATE_VERIFY_FAILED: self-signed certificate in certificate chain</code>，请让 IT 把公司根证书装到 macOS 系统钥匙串并设为受信任；也可以通过 <code>AIIG_ENTERPRISE_CA_FILE</code> 明确追加 IT 提供的 PEM。任何情况下都不要关闭 TLS 校验。</Note>
      </>,
    },
    {
      id: "wizard", title: "向导会做哪些事",
      body: <>
        <p>三个平台走同一条流程，侧栏的七步进度条对应下面这八件事。<b>身份核验在写入之前</b>：核验失败时项目里不会留下 <code>.governance</code>、<code>.mcp.json</code> 或任何其他安装痕迹。</p>
        <Figure src="screenshots/installer/welcome.png" alt="安装器首页" caption="安装器首页的四个入口：首次安装、升级已有项目、已有项目添加机器人，以及从升级入口进入的卸载。" source="installer-stub" />
        <ol>
          <li>首页选择首次安装、升级、卸载，或为已有项目添加机器人。</li>
          <li>环境检查：图形后端、Python、Git 和 Claude Code。Linux/macOS 不显示 Windows 的 PortableGit 按钮，而是给出系统包管理器命令。</li>
          <li>选择项目目录；首次安装时如果目录还不是 Git 仓库，会先征求你的同意再执行 <code>git init</code>。</li>
          <li>完成 GitHub Device Flow 与 BST-AII 组织成员核验。安装器申请的是最小权限 <code>read:org</code>，用于独立核验组织成员身份，不授予仓库写入或组织管理权限。</li>
          <li>离线挂载治理框架与 Wildskills，建立用户级运行时，渲染 <code>CLAUDE.md</code>、settings 与 skills。</li>
          <li>注册 Records Agent 与项目 <code>.mcp.json</code>，运行 lint 与 selftest。</li>
          <li>可选配置飞书机器人；同一个机器人已绑定其他项目时，要求你明确选择迁移或改用新机器人。</li>
          <li>完成页列出<b>已验证项与未验证项</b>、版本号和本次更新说明。</li>
        </ol>
        <Note title="一台电脑一个后台 Agent">同一个用户只运行一个共享的 Sync Agent。该用户的多个项目通过稳定的 Project ID 分开同步 <code>records/events.jsonl</code>，互不覆盖；多个 Claude 会话可以同时写入，Agent 只上传完整的 JSONL 行，并在公司侧确认入库后才推进游标。</Note>
      </>,
    },
    {
      id: "autostart", title: "后台服务与自启动",
      body: <>
        <p>安装器会把两类后台服务注册成随登录自启：Records Agent（知识回流）与 cc-connect（飞书机器人守护进程，仅在你选装机器人时出现）。三个平台用各自的系统机制。</p>
        <Matrix
          head={["平台", "Records Agent 自启", "cc-connect 自启", "检查命令"]}
          rows={[
            ["Windows", "计划任务，被策略拒绝时降级为当前用户启动项", "同左", <code key="c">cc-connect daemon status</code>],
            ["Ubuntu / WSL", "systemd 用户服务", "systemd 用户服务（未经真机验证）", <code key="c">systemctl --user status aiig-records-agent.service</code>],
            ["macOS", "LaunchAgent", "LaunchAgent（未经真机验证）", <code key="c">launchctl print gui/$(id -u)/art.aiigovernance.records-agent</code>],
          ]}
        />
        <Warn title="如实声明：Linux/macOS 的 cc-connect 自启注册尚未经真机验证">打包与断言都存在，但历次发布的证据文档里没有一次真跑记录，因此按“已声明、未验证”对待。已知的同构失败面是：Linux 上没有用户级 systemd（SSH 未 enable-linger、WSL 未启用 systemd、容器环境），以及 macOS 上没有图形会话的 launchd 域。安装器从 0.3.52 起对这两种情况做装前预检并给出定向的错误分类。Records Agent 的自启不在此列。</Warn>
        <Code>{`# Ubuntu / WSL
systemctl --user status aiig-records-agent.service
journalctl --user -u aiig-records-agent.service -n 100 --no-pager
~/.cc-connect/cc-connect/bin/cc-connect daemon status

# macOS
launchctl print gui/$(id -u)/art.aiigovernance.records-agent
tail -n 100 ~/Library/Logs/AIIGovernance/records-agent.stderr.log
~/.cc-connect/cc-connect/bin/cc-connect daemon status`}</Code>
        <p>共享运行时装在当前用户目录下，不会替换系统 Python：Linux 是 <code>~/.local/share/aiigovernance/runtime/&lt;版本&gt;/</code>，macOS 是 <code>~/Library/Application Support/AIIGovernance/Runtime/&lt;版本&gt;/</code>。</p>
      </>,
    },
    {
      id: "codex", title: "Codex 接入与平台支持范围",
      body: <>
        <Warn title="发布状态">Codex 接线随 <b>0.3.54</b> 发布，当前正式版 {versionLabel} 的安装器<b>还不会</b>写入任何 Codex 配置。下面这张矩阵先行公布，用于选型与采购判断；等 0.3.54 正式发布后，本页会同步改成安装步骤。</Warn>
        <p>治理接入的锚点是 <b>codex 核心引擎</b>，不是前端形态。hooks、MCP 与 <code>AGENTS.md</code> 三个挂载面全部内建于共享 core，CLI 与 VSCode 插件只是同一个引擎的两个壳——因此一套治理配置同时覆盖两种会话，不需要为插件单独铺一条加载通道。</p>
        <Matrix
          head={["平台", "Codex CLI", "接入形态建议", "备注"]}
          rows={[
            ["Windows x64", <Level key="l" kind="yes" />, "CLI 必装 + 插件亦可", "三个挂载面已在本平台完成查勘"],
            ["macOS Apple Silicon", <Level key="l" kind="yes" />, "CLI 必装 + 插件亦可", "插件形态按共享 core 推定，未逐面复验"],
            ["Linux x64", <Level key="l" kind="yes" />, "CLI 必装 + 插件亦可", "musl 静态链接，依赖面最小"],
            ["macOS Intel", <Level key="l" kind="best" />, "CLI 必装；桌面版不支持", "CLI 官方 README 明示支持，桌面版官方不支持 Intel"],
            ["Windows arm64", <Level key="l" kind="best" />, "CLI 可装", "有官方资产，桌面版故障集中"],
            ["Linux arm64", <Level key="l" kind="best" />, "CLI 可装", "官方有 musl 资产，已知段错误问题未关闭"],
            ["WSL1", <Level key="l" kind="no" />, "不纳入支持范围", "官方文档明示不支持（0.115 起沙箱改用 bubblewrap）"],
            ["Android / Termux", <Level key="l" kind="no" />, "不纳入支持范围", "npm 直接以 EBADPLATFORM 拒绝安装，官方从未声明支持"],
          ]}
        />
        <Note title="两个硬前置">其一，项目必须是 trusted：项目层 hooks 只在该项目被信任时加载，不信任时<b>静默不加载且没有报错</b>——这是最危险的失效点。其二，本机 codex 必须在 hooks 默认开启的版本区间内，验收口径统一为 <code>codex features list</code> 显示 <code>hooks stable true</code>。</Note>
      </>,
    },
    {
      id: "verify", title: "安装后验证",
      body: <>
        <p>安装器已经自动执行了 bootstrap、lint 和 selftest，<b>普通用户不需要再次运行任何脚本</b>。使用侧的验证只有一步：重新打开 Claude 会话并进入项目，首条回复出现“治理已加载”即表示接线成功。</p>
        <Figure src="screenshots/installer/done_success.png" alt="安装器完成页" caption="完成页把「已验证」和「本向导未验证」分开列出。未验证项是如实声明——例如没装机器人就不会声称验证过消息收发。" source="installer-stub" />
        <p>想确认知识检索也通了，可以直接在会话里问一句需要检索的问题，看是否触发了 <code>search_knowledge</code>；具体做法见<a href={pageHref("mcp")}>在会话里检索知识</a>。</p>
        <p>项目维护者可以另外运行 <code>git status</code> 审阅安装器产生的治理文件，并按团队流程提交。手工运行 <code>bootstrap.py --check</code> 仅用于高级排查。</p>
      </>,
    },
    {
      id: "report-issue", title: "如何报告安装问题",
      body: <>
        <ol>
          <li>点击安装器右上角、或失败页上的“报告问题”。</li>
          <li>填写复现步骤并检查脱敏预览。预览内容包含版本、平台、当前状态、Hook Doctor 结论和最多 200 行日志。</li>
          <li>确认后提交。已完成设备身份核验时可以自动创建私有 Issue；否则按钮会变成“打开 GitHub Issue 表单”，登录后手工提交预填内容。Issue 表单放在安装包下载仓库，不需要安装器源码仓库的权限。</li>
        </ol>
        <div className="link-list"><a href={installerIssueHref} target="_blank" rel="noreferrer"><b>直接打开 Installer Issue 表单</b><span>用于安装器无法启动、或报告窗口不可用的情况 →</span></a></div>
        <Note title="隐私边界">不采集 App Secret、Token、对话内容、Records、Task 正文、真实 HOME 路径、完整项目路径或 Hook 命令全文；提交前始终由你预览确认。</Note>
        <p>提交之前，可以先在<a href={pageHref("troubleshooting")}>常见故障对照表</a>里按症状查一遍，多数问题在那里有明确处置。</p>
      </>,
    },
  ],
};

export const robot: DocPage = {
  group: "开始使用", label: "安装飞书机器人", title: "为已有项目安装飞书机器人",
  intro: "已有治理项目无需重装或升级框架，可从安装器首页直接进入飞书机器人配置链。",
  sections: [
    {
      id: "entry", title: "从安装器进入",
      body: <ol><li>双击安装器。</li><li>选择“已有项目添加机器人”。</li><li>选择已经安装 AIIGovernance 的项目根目录。</li><li>安装器检测到治理标记后直接进入机器人接入页面。</li></ol>,
    },
    {
      id: "feishu-app", title: "创建飞书应用",
      body: <><p>在飞书开放平台创建智能体应用，保存 App ID 和 App Secret。安装器中的“查看示例”会打开三步图文说明。</p><Note title="凭据保护">App Secret 不写入向导状态和安装日志，只在验证与配置装配期间保存在内存中。</Note></>,
    },
    {
      id: "identity", title: "确认消息身份",
      body: <ol><li>输入 App ID 和 App Secret，并执行真实凭据校验。</li><li>按提示向机器人发送第一条消息。</li><li>安装器通过隔离探针捕获你的 <code>open_id</code>。</li><li>把机器人的 <code>allow_from</code> 收窄到该身份。</li></ol>,
    },
    {
      id: "binding", title: "一个机器人只绑一个项目",
      body: <>
        <p>同一个飞书 App ID 只能绑定一个治理项目。如果同一个 App ID 出现在多个项目配置里，每个项目都会各自处理并回复同一条消息，因此这种配置被明确禁止。</p>
        <p>安装器在凭据校验通过之后、启动探针之前会读取现有配置。发现该机器人已绑定其他项目时会停下来并列出绑定位置，此时你有两个选择：</p>
        <ul>
          <li><b>迁移到当前项目</b>：安装器原子地移除该 App ID 的旧项目块，复用原有的 <code>allow_from</code>，追加当前项目，并要求重启 cc-connect。若旧配置块里还包含其他平台的配置，安装器会拒绝自动删除，要求你改用新机器人。</li>
          <li><b>不迁移</b>：现有绑定保持不变，页面退回到创建/凭据步骤，当前项目必须使用一个新的 App ID。</li>
        </ul>
      </>,
    },
    {
      id: "daemon", title: "启动与验证",
      body: <>
        <p>安装器注册或复用现有的 cc-connect 服务，然后要求你发送第二条消息完成端到端验证。最终验证的单轮等待是 180 秒；超时只记为 pending，会保留日志偏移量并允许继续等待，只有看到新的一轮完整回复才判通过——机器人回复慢不会导致整体安装失败。</p>
        <Note title="已有 cc-connect">如果本机已有的二进制与安装包内的一致，安装器会直接安全复用，不覆盖正在运行的程序；版本不同且文件被占用时，会提示先停止 <code>cc-connect</code> 再重试。</Note>
      </>,
    },
  ],
};
