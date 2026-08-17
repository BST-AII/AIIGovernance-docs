import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

import { release } from "../app/release-data.ts";
import { noteFor } from "../app/release-notes.ts";

const outputRoot = new URL("../out/", import.meta.url);
const read = (path) => readFile(new URL(path, outputRoot), "utf8");

test("exports the documentation home page", async () => {
  const html = await read("index.html");
  assert.match(html, /AIIGovernance/);
  assert.match(html, /治理落入代码/);
});

test("exports every documented category", async () => {
  const slugs = [
    "installation", "robot",
    "architecture", "laws", "skills", "usage",
    "console", "account", "mcp",
    "upgrade", "uninstall", "troubleshooting",
    "releases",
  ];
  await Promise.all(
    slugs.map((slug) => access(new URL(`${slug}/index.html`, outputRoot))),
  );
});

test("uses the GitHub Pages base path for generated assets", async () => {
  const html = await read("index.html");
  assert.match(html, /\/AIIGovernance-docs\/_next\//);
  assert.match(html, /https:\/\/service\.pikso\.art\/AIIGovernance-docs\//);
  assert.match(html, /国内镜像/);
});

/* 版本单源化的回归闸。
   这条测试以前写死了版本号，页面涨到 v0.3.53 之后它就一直是红的。
   现在断言的是"页面等于数据文件"，数据文件本身由 npm run sync:release
   从真实 Release 写入——因此版本更新时这里不需要跟着改，而页面若与
   数据文件脱节则立刻失败。 */
test("release pages render the single source of version data", async () => {
  const releases = await read("releases/index.html");
  const installation = await read("installation/index.html");

  assert.equal(release.source, "github-release",
    "release-data.ts 仍是占位数据；请运行 npm run sync:release");
  assert.match(release.version, /^\d+\.\d+\.\d+$/);

  for (const html of [releases, installation]) {
    assert.ok(html.includes(`v${release.version}`),
      `页面缺少当前版本号 v${release.version}`);
  }
  assert.ok(releases.includes(release.releaseDate), "版本说明页缺少发布日期");
  assert.ok(releases.includes(release.tag), "版本说明页缺少 Release tag");

  // 四平台产物与真实 SHA256 必须逐条出现在页面上，且是真值而非占位。
  assert.equal(release.assets.length, 4);
  for (const asset of release.assets) {
    assert.match(asset.sha256, /^[0-9a-f]{64}$/,
      `${asset.file} 的 SHA256 不是有效摘要`);
    assert.ok(releases.includes(asset.file), `版本说明页缺少产物 ${asset.file}`);
    assert.ok(releases.includes(asset.sha256), `版本说明页缺少 ${asset.file} 的 SHA256`);
    assert.ok(installation.includes(asset.sha256),
      `安装页缺少 ${asset.file} 的 SHA256`);
  }

  // 页面上不应再出现任何硬编码的旧版本号。
  const stale = releases.match(/v0\.3\.\d+/g)?.filter((hit) => hit !== `v${release.version}`);
  assert.deepEqual(stale ?? [], [], "版本说明页仍残留硬编码的旧版本号");
});

test("release notes come from the human-maintained file", async () => {
  const releases = await read("releases/index.html");
  const note = noteFor(release.version);
  assert.ok(note, `app/release-notes.ts 缺少 ${release.version} 的更新说明`);
  for (const line of note.highlights) {
    // 逐条要点的开头必须真的渲染出来（整句里含实体转义，只比对前缀）。
    assert.ok(releases.includes(line.slice(0, 12)),
      `版本说明页缺少要点：${line.slice(0, 20)}…`);
  }
});

test("publishes cross-platform installation guidance", async () => {
  const installation = await read("installation/index.html");
  assert.match(installation, /AIIGovernance-Setup-macos-arm64-vX\.Y\.Z\.zip/);
  assert.match(installation, /Apple 无法检查是否包含恶意软件/);
  assert.match(installation, /如何报告安装问题/);
  assert.match(installation, /AIIGovernance-releases\/releases\/latest/);
  assert.match(installation, /普通用户不需要再次运行任何脚本/);
  // 三平台步骤各自成节
  assert.match(installation, /Windows 10 \/ 11/);
  assert.match(installation, /Ubuntu 22\.04 \/ 24\.04 与 WSL2/);
  assert.match(installation, /macOS Intel 与 Apple Silicon/);
  assert.match(installation, /Could not initialize GLX/);
  // 自启动的如实声明必须在页面上
  assert.match(installation, /cc-connect 自启注册尚未经真机验证/);
});

test("publishes the Codex platform support matrix", async () => {
  const installation = await read("installation/index.html");
  assert.match(installation, /Codex 接入状态与平台矩阵/);
  // 官方不支持的两个平台必须明确标注
  assert.match(installation, /WSL1/);
  assert.match(installation, /Android/);
  assert.match(installation, /不支持/);
  assert.match(installation, /best-effort/);
  // 未发布的能力必须标状态，不能写成已经能用
  assert.match(installation, /0\.3\.54/);
});

/* 0.3.53 起生效的三条版本法必须出现在升级页——这是此前的内容缺口。 */
test("upgrade page states the reinstall and upgrade semantics", async () => {
  const upgrade = await read("upgrade/index.html");
  assert.match(upgrade, /重装 = 全量重装/);
  assert.match(upgrade, /升级 = 只安装版本号提升的组件/);
  assert.match(upgrade, /代码变化必须对应版本变化/);
  assert.match(upgrade, /更新本机已登记项目的接线/);
  assert.match(upgrade, /即使版本号完全相同/);
  for (const mode of ["fresh", "upgrade", "overwrite_managed", "repair", "resume", "uninstall"]) {
    assert.ok(upgrade.includes(mode), `升级页缺少安装模式 ${mode}`);
  }
  for (const preserved of ["Task/frozen", "Agent Outbox", "Project identity", "device identity", "第三方 Hook"]) {
    assert.ok(upgrade.includes(preserved), `升级页缺少保留边界：${preserved}`);
  }
});

/* MCP 工具的表述闸：实际是七个（六云端 + 一本地），
   页面上不得再出现"六件套"这种把本地诊断工具算漏的说法。 */
test("knowledge tools are described as six governed plus one local", async () => {
  const mcp = await read("mcp/index.html");
  for (const tool of [
    "search_knowledge", "get_knowledge", "related_knowledge",
    "search_records", "list_projects", "knowledge_status", "diagnostic_logs",
  ]) {
    assert.ok(mcp.includes(tool), `客户端页缺少工具 ${tool}`);
  }
  assert.match(mcp, /六个/);
  assert.match(mcp, /本地/);
  assert.match(mcp, /aiigovernance-records/);

  const pages = await Promise.all(
    ["mcp", "releases", "installation", "index"].map((slug) =>
      read(slug === "index" ? "index.html" : `${slug}/index.html`)),
  );
  for (const html of pages) {
    assert.ok(!html.includes("六件套"),
      "页面仍把知识检索工具说成六件套，实际是六个云端工具加一个本地诊断工具");
  }
});

test("publishes the console and account guides", async () => {
  const consoleHtml = await read("console/index.html");
  assert.match(consoleHtml, /service\.pikso\.art\/AIIknowledgeService/);
  assert.match(consoleHtml, /仅元数据/);
  assert.match(consoleHtml, /知识管理/);
  assert.match(consoleHtml, /运维总览/);
  assert.match(consoleHtml, /系统诊断/);

  const account = await read("account/index.html");
  assert.match(account, /系统管理员/);
  assert.match(account, /知识审核员/);
  assert.match(account, /普通账号/);
  // 系统管理员的双人复核是硬约束，必须写明
  assert.match(account, /双人复核/);
  assert.match(account, /suspended/);
  assert.match(account, /revoked/);
});

/* 账号开通表述的如实闸。
   这条断言原先钉的是"等待审批"。2026-08-16 的对抗核查证实那句话在生产上
   不会发生：审批式开通挂在 AIIG_CONSOLE_REQUIRE_ACCOUNT_APPROVAL 上，服务端
   默认关闭（src/aiig_console/config.py 的 require_account_approval: bool =
   False），线上 compose 用显式 environment 映射、既没有透传这个变量也没有
   env_file，生产库里待批准申请 0 条。owner 裁决维持现状不打开审批流，文档
   改成说实情。于是这条断言必须跟着改——否则它就在替一句与现实不符的话
   站岗，而测试站岗的正是"不许改回去"。 */
test("account provisioning is documented as it actually behaves", async () => {
  const account = await read("account/index.html");

  // 实情：组织成员首次登录即自动拿到 active 账号，同一次登录直接放行。
  assert.match(account, /首次登录/);
  assert.match(account, /自动开通/);
  assert.match(account, /不进入申请或审批队列/);

  // 旧说法要显式否掉，不能只是删掉——读者可能正是带着"要申请"的印象来的。
  assert.match(account, /没有「提交申请」/);
  assert.match(account, /默认关闭的开关/);

  // 自动开通不等于没有门禁：三道门都得写明，否则"自动"读起来像是敞开的。
  assert.match(account, /GitHub 组织成员资格/);
  assert.match(account, /账号状态机/);
  assert.match(account, /角色授予/);
  assert.match(account, /门禁在组织名册和角色授予上，不在开通环节/);

});

/* 方向性守卫：审批式开通的字眼只允许出现在否定它的句子里。
   正面出现就意味着页面又把一个当前部署不会发生的步骤写成了用户要走的一步。

   四处比上一版收紧：
   ① 账号页与管理平台页都查——这两页都在讲开通路径，只钉住其中一页，
      另一页写错了守卫是哑的（AC-01 那一屏的说明正住在管理平台页上）。
   ② 判据从"往前数 24 个字符"改成"回看到本句开头"。定长窗口是个假判据：
      渲染出来的 HTML 里一个 <b>…</b> 或 <code>…</code> 就能吃掉二十几个
      字符，把否定词挤出窗口外，于是纯排版改动会让守卫红——而它红的时候
      文案其实是对的。这里先去标签再按句号切句：真正的规矩本来就是
      "这几个字必须处在一个否定它的句子里"，句子边界才是它的判据。
   ③ 短语表补进了真正引发这次事故的那两句原文形态。守卫上一版只钉
      "等待审批"，而 Console 界面上写错的原话是「首次登录会提交开通申请，
      由管理员审批后激活」「审批开通申请」——原样抄进正文，守卫一声不吭。
      钉住的必须是犯过的错，不是它的近义词。
   ④ 否定判据改成本句内双向回看。只看短语之前的文本是个半边判据：中文
      里否定词落在后半句是常态，"「等待审批」这一步在当前部署并不存在"
      整句明明是否定的，守卫却因为"并不存在"在短语之后而判红。规矩是
      "这几个字必须处在一个否定它的句子里"，那就该把整句取全再判。 */
const APPROVAL_PHRASES = [
  /等待审批/g, /等待管理员批准/g,
  // 事故原句：Console 的登录页与服务卡片曾照这两种说法写。
  /提交开通申请/g, /由管理员审批后激活/g, /审批开通申请/g,
];
/* 否定词表刻意不跟着扩：这是守卫的放行口，每加一个词就多一条绕过它的路。
   ④ 改的是取句范围，不是放行条件。 */
const NEGATED = /没有|不会|不存在|无需|不必|并非|恒为空/;

test("no page presents approval-gated provisioning as a step users take", async () => {
  for (const slug of ["account", "console"]) {
    const html = await read(`${slug}/index.html`);
    // 读者读到的是文字，不是标签；属性里的字符不该参与判定。
    const text = html.replace(/<[^>]+>/g, "");
    for (const phrase of APPROVAL_PHRASES) {
      for (const hit of text.matchAll(phrase)) {
        // 本句 = 短语之前回看到上一个句末 + 短语 + 短语之后前看到下一个句末。
        const before = text.slice(0, hit.index).split(/[。；！？\n]/).pop() ?? "";
        const after = text.slice(hit.index + hit[0].length).split(/[。；！？\n]/)[0] ?? "";
        const sentence = `${before}${hit[0]}${after}`;
        assert.match(
          sentence, NEGATED,
          `${slug} 页出现了正面表述的「${hit[0]}」：审批式开通挂在默认关闭的` +
            "AIIG_CONSOLE_REQUIRE_ACCOUNT_APPROVAL 上，当前部署没有启用，" +
            `这几个字只能出现在否定它的句子里。所在句子：「${sentence}」`,
        );
      }
    }
  }
});

/* AC-01（账号服务）那一屏的"待开通申请"面板：后端实现完整，但当前部署没有
   打开开关，因此这块面板在生产上恒为空。截图上它是有的，所以页面必须当场
   说清楚，否则读者会以为自己将来能在这里看到待批申请。 */
test("the account-request panel is labelled as not in use on this deployment", async () => {
  const consoleHtml = await read("console/index.html");
  assert.match(consoleHtml, /当前生产未启用账号申请流程/);
  assert.match(consoleHtml, /AIIG_CONSOLE_REQUIRE_ACCOUNT_APPROVAL/);
  assert.match(consoleHtml, /不会出现待审批申请/);
});

/* 权限边界的如实闸（2026-08-16 第二轮对抗核查）。
   上一轮把开通流程改成了实情，却在新写的文案里留下三处与实现不符：把遗留的
   「管理账号」（console_admin）说成能进系统诊断、把账号服务说成只有系统管理员
   可见、把自动开通说成"只给最低那一档"。判据在 records-service：
     · system:diagnose 只在 role == "system_admin" 时下发（app.py 的 /me v2），
       遗留页面走的也是 page_system_admin；
     · 账号服务的入口判的是 accounts:manage（ServicePickerPage / AppShell），
       console_admin 同样持有；
     · ensure_from_oauth 把 oauth_role=admin 映射成 console_admin（access.py），
       所以组织 owner 自动拿到的不是最低那一档。
   这条测试钉住改正后的说法，免得下一次改写又把它们抹平。 */
test("the legacy 管理账号 tier is documented with the reach it actually has", async () => {
  const account = await read("account/index.html");
  assert.match(account, /console_admin/, "账号页没写出遗留档的角色名");
  assert.match(account, /accounts:manage/);
  assert.match(account, /operations:read/);
  // 它进不了系统诊断：这正是上一轮写错的那一处。
  assert.match(
    account, /进不了系统诊断/,
    "账号页没有写明遗留的「管理账号」进不了系统诊断——system:diagnose 只发给系统管理员。",
  );

  const consoleHtml = await read("console/index.html");
  assert.match(
    consoleHtml, /accounts:manage/,
    "管理平台页仍把账号服务的可见性说成某一个角色的事，实际判的是 accounts:manage 能力。",
  );
});

/* 运行状态那一屏的第二道门（2026-08-16 第三轮）。
   入口判 operations:read，遗留的「管理账号」因此进得去——但屏内还有一道门：
   四区、死信表与重试三样都判 system:diagnose，而且是整条接口挂上去的，不做
   字段级降级（app.py 的 /admin/api/v2/system/ops-overview、/admin/api/dead-letters
   与它的 retry 全部 Depends(system_admin)；前端 OperationsPage.tsx:56 的
   privileged 同样取 system:diagnose）。只写第一道门，等于告诉一个 console_admin
   "运行状态你有"，而他点进去只看得到顶部四个队列总量加两块权限提示——
   截图上却是四区俱全的系统管理员视角。 */
test("the operations screen's second gate is documented, not just its entry gate", async () => {
  const consoleHtml = await read("console/index.html");
  assert.match(consoleHtml, /operations:read/);
  assert.match(
    consoleHtml, /第二道门/,
    "管理平台页只写了运行状态的入口能力，没写屏内那道 system:diagnose 的门。",
  );
  assert.match(
    consoleHtml, /队列总量/,
    "没写只有 operations:read 的账号在运行状态屏上实际看得到什么。",
  );
  // 图注必须说明这张图是系统管理员视角，否则截图本身在替另一档账号许诺。
  const opsFigure = consoleHtml.split("<figure").find(
    (block) => block.includes("screenshots/console/operations.png"));
  assert.ok(opsFigure, "管理平台页没有引用 operations.png");
  assert.match(
    opsFigure, /系统管理员看到的样子/,
    "运维总览的图注没有声明它是系统管理员视角——只有 operations:read 的账号看到的不是这一屏。",
  );
});

/* 最高权限并非"完全无法自动获得"：名单旁路必须写在页面上。
   AIIG_CONSOLE_SYSTEM_ADMIN_GITHUB_USER_IDS 里的 GitHub ID 只要持有
   console_admin，签发会话时即按 system_admin 放行（access.py 的
   effective_console_role，OAuth 回调与会话校验两处都传这个判断），生产在用。
   接口直授被挡、双人复核拒绝自确认这两条是真的，但只写这两条会让读者以为
   最高权限完全拿不到——所以旁路和它们必须同时在场。 */
test("the deploy-list route to system admin is disclosed alongside the dual review", async () => {
  const account = await read("account/index.html");
  assert.match(account, /双人复核/);
  assert.match(account, /AIIG_CONSOLE_SYSTEM_ADMIN_GITHUB_USER_IDS/,
    "账号页没有写出那条部署名单旁路，读者会以为系统管理员完全无法自动获得。");

  /* 旁路的粒度：这条以前只钉一个"会话"字样，于是页面写成"被提升的是这一次
     的会话"也能过——那读起来像是退出重登就能甩掉它，或者名单删了还得等会话
     过期。实际 effective_console_role 有两处调用（app.py:507 的 OAuth 回调、
     app.py:406 的 authenticated 依赖），后者是每个请求都跑的会话校验，所以
     提升对该 ID 的全部会话持续生效，从名单删掉则下一次请求即掉档。 */
  assert.match(account, /每一个请求校验会话时都重算/,
    "账号页没写清旁路是每次请求重算的：写成「这一次的会话」会让人以为重新登录能甩掉它。");
  assert.match(account, /权限会在下一次请求时恢复为/,
    "账号页没写清从名单删掉之后何时失效——是下一次请求，不必等会话过期。");
  assert.match(account, /不落库/,
    "账号页没写清这次提升不写进账号表，账号行仍是 console_admin。");
});

/* 登录链接必须落在真有那颗按钮的页面上。
   <console>/admin/login 是后端的一条 302，直奔 GitHub OAuth：浏览器打开它
   只会闪一下就跳走，页面上没有任何可点的东西。正文却让读者"点『通过 GitHub
   授权登录』"——那颗按钮在 SPA 的 /admin/app/signin 上（console SPA 的
   BrowserRouter basename 是 <public>/admin/app，signin.png 也正出自这条路由，
   见 scripts/screenshots/capture-console.mjs）。 */
test("the console login link points at the screen that has the button", async () => {
  for (const slug of ["console", "account"]) {
    const html = await read(`${slug}/index.html`);
    assert.match(
      html, /AIIknowledgeService\/admin\/app\/signin/,
      `${slug} 页的登录入口没有指向带按钮的 SPA 登录屏。`,
    );
    assert.ok(
      !/href="[^"]*AIIknowledgeService\/admin\/login"/.test(html),
      `${slug} 页仍然链到 /admin/login——那是一条直奔 GitHub 的 302，` +
        "页面上没有正文让读者去点的那颗按钮。",
    );
    assert.match(
      html, /通过 GitHub 授权登录/,
      `${slug} 页没有写出登录屏上那颗按钮的原文字。`,
    );
  }
});

test("publishes the user-facing troubleshooting table", async () => {
  const html = await read("troubleshooting/index.html");
  assert.match(html, /Hook 故障决策树/);
  assert.match(html, /hook-doctor/);
  assert.match(html, /device_flow_disabled/);
  assert.match(html, /Could not initialize GLX/);
  assert.match(html, /diagnostic_logs/);
});

/* 出处标注的回归闸。
   站点上的截图目前全部出自自动化流水的造数据：Console 走 dev 夹具，
   安装器走假 pywebview 桥。安装器界面自己还常驻一行「所有进度与日志
   均来自真实执行结果」——那句话对真跑的安装器成立，对截图里的演示数据
   不成立。因此每张图都必须自带出处说明，否则这张图就替产品做了一个它
   没资格做的声明。Figure 的 source 是必填参数，这条测试守的是它确实
   渲染进了 HTML，而不是只在源码里写了个没人看见的属性。 */
test("every screenshot carries its provenance", async () => {
  /* public/screenshots 下两个目录整体都是脚本产出的造数据：
     console/ 出自 dev 夹具，installer/ 出自假 pywebview 桥。因此凡是引用
     这两个目录的 figure，都必须带出处标注。将来若有真环境人工截的图
     （source="real-capture"），它不落在这两个目录里，自然不受此约束。 */
  let checked = 0;
  for (const slug of ["installation", "console", "upgrade", "uninstall"]) {
    const html = await read(`${slug}/index.html`);
    // 按 <figure 切块，逐块判断：这一块引用了造数据截图就必须有标注。
    for (const block of html.split("<figure").slice(1)) {
      const figure = block.slice(0, block.indexOf("</figure>"));
      if (!/screenshots\/(console|installer)\//.test(figure)) continue;
      checked += 1;
      assert.match(
        figure, /class="figure-source"/,
        `${slug} 页有一张造数据截图没有出处标注：` +
          `${/screenshots\/[^"'\s]+?\.png/.exec(figure)?.[0]}。` +
          "每张截图都必须声明像素来源（Figure 的 source 参数）。",
      );
    }
  }
  assert.ok(checked > 0, "一张截图都没检到，测试本身失效了");
});

/* 演示数据不许被说成真跑证据。安装器截图里就印着「所有进度与日志均来自
   真实执行结果」，页面必须把这句话挡回去。 */
test("installer screenshots are not passed off as real run evidence", async () => {
  for (const slug of ["installation", "upgrade", "uninstall"]) {
    const html = await read(`${slug}/index.html`);
    if (!html.includes("screenshots/installer/")) continue;
    assert.match(
      html, /非某一次真实安装的执行记录/,
      `${slug} 页用了安装器截图，却没有声明那是演示数据。`,
    );
  }
});

/* 引用了截图就必须真有那个文件，否则站点上是一堆破图。 */
test("every referenced screenshot exists in public/", async () => {
  const publicRoot = new URL("../public/", import.meta.url);
  const slugs = ["installation", "console", "upgrade", "uninstall"];
  const referenced = new Set();
  for (const slug of slugs) {
    const html = await read(`${slug}/index.html`);
    for (const match of html.matchAll(/\/AIIGovernance-docs\/(screenshots\/[^"'\s]+?\.png)/g)) {
      referenced.add(match[1]);
    }
  }
  assert.ok(referenced.size > 0, "页面里一张截图都没有引用");
  await Promise.all(
    [...referenced].map(async (path) => {
      try {
        await access(new URL(path, publicRoot));
      } catch {
        throw new Error(
          `页面引用了 public/${path}，但文件不存在。` +
            "运行 npm run shots:console / npm run shots:installer 重新出图。",
        );
      }
    }),
  );
});
