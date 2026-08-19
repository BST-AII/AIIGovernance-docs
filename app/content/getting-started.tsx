import {
  Code, DocPage, Figure, Level, Maintainer, Matrix, Note, Warn,
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
  group: "快速开始", label: "产品概览", title: "让 AI 在项目规则内工作",
  intro: "AIIGovernance 把治理规则、专业 Skills、执行检查和审计记录接入项目。你可以照常使用 Claude Code；系统会根据任务加载适用规则、记录关键事实，并在高风险操作前要求确认。",
  keywords: ["产品概览", "治理", "审计", "快速开始"],
  sections: [
    {
      id: "first-use", title: "第一次使用",
      body: <div className="simple-table"><div><b>安装到项目</b><span>选择你的系统，下载并校验安装包，然后按照向导接入治理框架。</span></div><div><b>开始一次任务</b><span>在项目目录中启动 Claude Code，直接描述目标、验收标准和限制条件。</span></div><div><b>查看知识回流</b><span>登录管理平台，查看已经入库的知识元数据、项目分布和处理状态。</span></div></div>,
    },
    {
      id: "capabilities", title: "它会为你做什么",
      body: <ul><li>为不同任务加载对应规则和 Skills。</li><li>在删除、覆盖、部署等高风险操作前检查授权。</li><li>分别记录工具观察到的事实和 Agent 作出的判断。</li><li>在任务结束时执行机械检查并保留可追溯证据。</li><li>将授权范围内的知识安全回流，并允许后续会话检索复用。</li></ul>,
    },
    {
      id: "pieces", title: "系统由三部分组成",
      body: <div className="simple-table"><div><b>项目内治理框架</b><span>规则、Hooks、Skills 和任务记录随项目版本管理。</span></div><div><b>本机后台服务</b><span>负责知识回流、身份签名和检索接入。</span></div><div><b>管理平台</b><span>展示知识元数据、审核状态、账号权限和运行情况。</span></div></div>,
    },
    {
      id: "boundary", title: "数据与权限边界",
      body: <p>管理平台只展示知识元数据，不展示 Task 或 Transcript 正文。需要读取知识内容时，由会话中的受治理工具按用户和 Project 权限逐次查询。公共 Relay 只传递加密信封，不能读取其中内容。</p>,
    },
    {
      id: "start", title: "按你的目标继续",
      body: <div className="link-list"><a href={pageHref("installation")}><b>我要安装治理框架</b><span>下载、校验、安装和验证 →</span></a><a href={pageHref("usage")}><b>我要开始使用</b><span>在项目中开始一次受治理的任务 →</span></a><a href={pageHref("console")}><b>我要登录管理平台</b><span>查看知识回流和授权功能 →</span></a><a href={pageHref("troubleshooting")}><b>我要排查问题</b><span>按错误现象查找处置方法 →</span></a><a href={pageHref("architecture")}><b>我负责部署和维护</b><span>了解架构、证据和运行边界 →</span></a></div>,
    },
  ],
};

export const installation: DocPage = {
  group: "快速开始", label: "安装与验证", title: "安装并验证 AIIGovernance",
  intro: "选择你的系统，下载并校验安装包，然后按照向导完成项目接入、身份核验和安装后验证。",
  keywords: ["Windows", "Ubuntu", "WSL", "macOS", "SHA256", "安装器", "验证"],
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
      id: "choose-platform", title: "选择你的系统",
      body: <div className="link-list"><a href="#windows"><b>Windows 10 / 11</b><span>下载 EXE，使用 PowerShell 校验 →</span></a><a href="#linux"><b>Ubuntu 22.04 / 24.04 与 WSL2</b><span>安装 Git，解压后启动图形向导 →</span></a><a href="#macos"><b>macOS Intel 与 Apple Silicon</b><span>确认芯片架构，下载对应 ZIP →</span></a></div>,
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
          <li>选择这个目录所属的<b>产品线</b>（下一节详述）。可以不选。</li>
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
      id: "catalog", title: "装机时选产品线",
      body: <>
        <p>选完目录之后，安装器会让你选这个目录属于哪条<b>产品线</b>。产品线由管理员在管理平台上统一维护，装机时只能从中选，不能新建。选中之后，这台机器上这个目录产生的知识与数据都会归到它名下。</p>
        <p><b>文件夹名从此只是二级记录。</b>此前一行记录等于“某台电脑上的某个文件夹”，所以同一个真实项目换台电脑、换个目录名，在管理平台上就成了两个项目——生产库里同一个项目最多碎成过四行。选了产品线之后，同一条产品线下的多个工作目录在管理平台上合并显示为一行，展开才看到它们分别在哪台机器上。</p>
        <ul>
          <li><b>可以不选。</b>装机照常完成，之后由管理员在管理平台上补挂。0.3.55 之前装的机器都是未归类状态，它们不受影响，也不需要重装。</li>
          <li><b>不联网也能装。</b>连不上管理平台时，下拉会自动改用安装包内置的清单，页面上会明说这批是离线的——如果你要的产品线不在里面，多半是清单旧了（内置清单在出包时导出），先不选、装完再补挂即可。</li>
          <li><b>升级与重装会记住上次的选择。</b>选择记在项目目录下的 <code>.governance/aiig-install.json</code> 里，<b>会随仓库提交</b>——同事克隆这个仓库后首次装机，下拉会自动停在同一条产品线上。它是随仓走的项目属性，不是本机偏好。</li>
        </ul>
        <Note title="改名不会打断归属">管理员在管理平台上给产品线改名之后，已经归到它名下的历史数据不受影响：归属记的是产品线的稳定标识，不是名字。新装的机器会拿到新名字。</Note>
      </>,
    },
    {
      id: "autostart", title: "维护者说明：后台服务与自启动",
      body: <Maintainer title="查看后台服务、自启动与运行时路径">
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
      </Maintainer>,
    },
    {
      id: "codex", title: "维护者说明：Codex 支持范围",
      body: <Maintainer title="查看 Codex 接入状态与平台矩阵">
        <Warn title="装完 Codex 之后还有两步，只能你自己在 Codex 里点">安装器写完 <code>AGENTS.md</code>、项目级 <code>.codex/hooks.json</code> 与项目级 <code>.codex/config.toml</code> 里的 Governance MCP 之后，Codex 出于安全<b>不会自动启用它们</b>。两步不做，治理<b>静默不工作</b>——不报错，只是什么都不记录，而你看到的报错（“治理分诊服务不可用”“未提供 session_id”）指向的地方跟真实原因毫无关系。</Warn>
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
        <h4>装完必须做的两步</h4>
        <ol>
          <li><b>逐个信任项目钩子并重启会话。</b>打开 <b>Codex Settings → Hooks</b>，在 <b>From Projects</b> 下找到你的项目，把列出的五个钩子逐个打开，然后<b>重启 Codex 会话</b>。Codex 按钩子文件内容的哈希记信任，所以<b>每次升级治理框架之后要重新信任一次</b>——升级会重写钩子文件，旧信任随即失效，而且没有任何提示。</li>
          <li><b>放行 Governance MCP。</b>Codex 首次用到 <code>aiig-governance</code> 时会询问权限，选 <b>always allow</b>（一律允许）。也可以在 <b>Settings → MCP servers</b> 里查看它的状态。这条配置写在<b>项目自己的</b> <code>.codex/config.toml</code> 里，所以你在几台机器上装几个项目都互不影响；从旧版本升级时，安装器会把此前写在用户级 <code>~/.codex/config.toml</code> 的那一条收走。Claude Code 那边会问同样的问题，同样选“一律允许”；两边各问各的，互不影响。</li>
        </ol>
        <Note title="两个硬前置">其一，项目必须是 trusted：项目层 hooks 只在该项目被信任时加载，不信任时<b>静默不加载且没有报错</b>——这是最危险的失效点，也正是上面第一步要解决的。其二，本机 codex 必须在 hooks 默认开启的版本区间内，验收口径统一为 <code>codex features list</code> 显示 <code>hooks stable true</code>。</Note>
      </Maintainer>,
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
        <p>提交之前，可以先在<a href={pageHref("troubleshooting")}>排查问题</a>页面按现象检查，多数问题都有对应的处理方法。</p>
      </>,
    },
  ],
};

export const robot: DocPage = {
  group: "快速开始", label: "接入飞书机器人", title: "为项目接入飞书机器人",
  intro: "已安装治理框架的项目可以单独接入飞书机器人，无需重新安装或升级框架。",
  keywords: ["飞书", "机器人", "cc-connect", "App ID", "open_id"],
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
      id: "binding", title: "一个机器人对应一个项目",
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
