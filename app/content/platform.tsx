import {
  Agent, Chat, Code, DocPage, Figure, FigureRow, Maintainer, Matrix, Note, ToolCall, ToolResult, Warn, You,
  consoleHref, consoleLoginHref, pageHref,
} from "../doc-kit";

export const consolePage: DocPage = {
  group: "管理平台", label: "使用管理平台", title: "使用管理平台",
  intro: "管理平台用于查看知识元数据、处理审核与归类任务，以及在授权范围内管理账号和运行状态。",
  keywords: ["AI 中台", "登录", "知识管理", "账号服务", "运行状态", "系统诊断"],
  sections: [
    {
      id: "address", title: "平台地址与登录方式",
      body: <>
        <div className="link-list">
          <a href={consoleHref} target="_blank" rel="noreferrer"><b>打开 AI 中台管理平台</b><span>{consoleHref} →</span></a>
          <a href={consoleLoginHref} target="_blank" rel="noreferrer"><b>直接进入登录页</b><span>带「通过 GitHub 授权登录」按钮的那一屏 →</span></a>
        </div>
        <p>平台不设独立密码，也不发邀请码。登录方式只有一种：<b>用你的 GitHub 账号授权</b>，平台据此确认你是不是 BST-AII 组织的 active 成员——组织成员关系归 GitHub 管，每次登录都会重新核对一遍。</p>
        <Figure src="screenshots/console/signin.png" alt="管理平台登录页" caption="登录页。授权范围是最小权限 read:org，会话使用 HttpOnly、SameSite=Lax 的 Cookie。" source="console-fixture" />
        <p>还没有账号也不必先做什么：只要你是组织的 active 成员，<b>首次登录就会自动开通一个 active 账号并直接放行</b>，同一次登录就落到服务选择页。完整机制见<a href={pageHref("account")}>平台账号与权限</a>。</p>
      </>,
    },
    {
      id: "services", title: "登录后的第一屏：选择服务",
      body: <>
        <p>登录成功后落在服务选择页。AI 中台目前有三个服务，你看到几个取决于你的角色：</p>
        <div className="simple-table">
          <div><b>知识平台</b><span>所有账号都能进。治理知识的洞察、检索、审核与归类都在这里。</span></div>
          <div><b>数据平台</b><span>同一套登录会话下的另一个应用，从顶栏直接跳转。</span></div>
          <div><b>账号服务</b><span>要有账号管理能力（<code>accounts:manage</code>）才看得见：系统管理员有，遗留的「管理账号」也有。查看账号清单、变更角色、暂停与恢复账号。</span></div>
        </div>
        <Figure src="screenshots/console/services.png" alt="服务选择页" caption="服务选择页。数值来自接口；截图使用开发夹具，不代表生产统计。" source="console-fixture" />
        <p>进入某个服务之后，左侧边栏和顶栏才会出现；随时可以点左上角的品牌区或「切换服务」图标回到这一屏。</p>
      </>,
    },
    {
      id: "insight", title: "所有用户：查看知识概览与分布",
      body: <>
        <p>洞察区对所有登录账号开放，共四屏，全部只读。</p>
        <Figure src="screenshots/console/overview.png" alt="知识贡献概览" caption="概览：回流趋势、Project 分布、主题结构与贡献人排名。全部是聚合元数据。" source="console-fixture" />
        <Matrix
          head={["屏幕", "看什么", "谁能看"]}
          rows={[
            ["概览", "回流趋势、Project 分布、主题「知识 Cloud」、贡献人排名、最近回流", "全部账号"],
            ["我的知识", "你授权范围内的知识包与主题元数据，按最近回流排序", "全部账号"],
            ["项目", "按 Project 汇总的贡献量、参与人数与最近回流时间", "全部账号"],
            ["知识图谱", "Project → Task Package → 知识条目 → 主题 四层接线图", "全部账号"],
          ]}
        />
        <FigureRow>
          <Figure src="screenshots/console/my-knowledge.png" alt="我的知识" caption="我的知识：只列你有权看到的条目。" source="console-fixture" />
          <Figure src="screenshots/console/graph.png" alt="知识图谱" caption="知识图谱：层级固定，自左至右读。" source="console-fixture" />
        </FigureRow>
        <p>顶栏的搜索框检索的是<b>知识元数据</b>——标题、编号、主题、Project。有审核权限的账号回车后落到知识管理表，其他账号落到自己的知识列表。</p>
      </>,
    },
    {
      id: "admin", title: "知识审核人员：审核与归类",
      body: <>
        <p>知识管理、归类和批量审核只向知识审核人员及系统管理员开放。普通账号不会看到这些入口。</p>
        <Maintainer title="查看管理入口的能力判定">
          <p>具备任一管理能力时，平台显示“管理”入口；进入后只显示已获授权的功能。三个能力分别是知识管理（<code>knowledge:review</code>）、运行状态（<code>operations:read</code>）和系统诊断（<code>system:diagnose</code>）。</p>
          <p>兼容角色 <code>console_admin</code> 不具备知识审核能力，但持有 <code>operations:read</code>，因此能看到“管理”入口和其中的“运行状态”。普通账号不具备以上能力时，入口不会渲染。</p>
        </Maintainer>
        <Figure src="screenshots/console/knowledge-manage.png" alt="知识管理" caption="知识管理：检索、审核、归类与删除。左侧边栏底部那行灰字标明了当前角色的权限边界。" source="console-fixture" />
        <div className="simple-table">
          <div><b>知识管理</b><span>主表。按状态（待审核 / 已通过 / 未归类 / 已归档）与 Project、主题筛选，可单条处理，也可把当前筛选结果整批送进批量审核或归类。</span></div>
          <div><b>归类</b><span>把知识条目指派到主题词表。左边是待归类条目，右边是主题表。主题决定概览页「知识 Cloud」和图谱第四层的结构。</span></div>
          <div><b>批量审核</b><span>逐条列出当前状态与本次决定，可以单条改判后一次提交。每条决定都必须写原因——通过也不例外。</span></div>
        </div>
        <Figure src="screenshots/console/classify.png" alt="归类页" caption="归类页：左侧待归类条目，右侧主题词表。" source="console-fixture" />
        <Warn title="操作是异步的，且只作用于元数据">审核、归类、删除提交后返回的是一个受理凭据，真正的执行由公司侧工作机完成，通常 30–60 秒后列表才反映变化。删除只作用于知识索引与主题归类，密文归档按保留策略独立处理。所有操作都会写入审计日志。</Warn>
      </>,
    },
    {
      id: "accounts-screen", title: "账号管理员：管理账号",
      body: <>
        <p>账号服务从顶栏的服务切换器进入，用于查看账号、调整角色以及暂停或恢复账号。没有账号管理权限的用户不会看到入口。</p>
        <Maintainer title="查看账号服务的权限判定"><p>账号服务按 <code>accounts:manage</code> 能力开放，而不是按单一角色名开放。系统管理员和兼容角色 <code>console_admin</code> 均持有该能力。</p></Maintainer>
        <Figure src="screenshots/console/accounts.png" alt="账号管理" caption="账号管理页用于查看账号状态并执行授权范围内的管理操作。截图使用开发夹具，不代表生产账号或统计。" source="console-fixture" />
        <p>左侧账号表是这一屏真正在用的部分：改角色、暂停与恢复都在这里，两种动作都会把该账号已经发出去的会话当场作废。账号身份取自 GitHub 的不可变数字 ID，不能修改。所有变更都要求填写原因并写入审计日志。</p>
        <Note title="当前生产未启用账号申请流程">当前生产未启用账号申请流程，因此该区域不会出现待审批申请。符合条件的组织成员首次登录时会自动创建 active 账号。</Note>
        <Maintainer title="查看账号申请开关与预开通边界"><p>审批式开通由 <code>AIIG_CONSOLE_REQUIRE_ACCOUNT_APPROVAL</code> 控制，当前生产部署没有启用。下方「预开通账号」仍标记为「待接入」；v2 契约尚未提供按 GitHub 登录名直接创建账号的端点。</p></Maintainer>
        <p>角色与状态的完整规则见<a href={pageHref("account")}>平台账号与权限</a>。</p>
      </>,
    },
    {
      id: "ops", title: "系统管理员：运行状态与诊断",
      body: <>
        <p>运行状态用于查看队列概况；系统诊断用于查看服务健康、主机资源、处理速率和脱敏诊断信息。系统诊断只向系统管理员开放。</p>
        <Maintainer title="查看运行状态的两级权限">
          <p>运行状态入口需要 <code>operations:read</code>；系统诊断整屏需要 <code>system:diagnose</code>。知识审核员不具备这两项能力。</p>
          <p>运行状态屏内还有第二道门：服务健康、主机资源、队列与速率、分析器、死信表和重试操作均需要 <code>system:diagnose</code>。只有 <code>operations:read</code> 的兼容角色只能看到顶部四个队列总量，其余位置显示权限提示。</p>
        </Maintainer>
        <FigureRow>
          <Figure src="screenshots/console/operations.png" alt="运维总览" caption="运维总览：服务健康、主机资源、队列与速率、分析器，四个区取自同一时刻。这是系统管理员看到的样子；只有 operations:read 的账号在这一屏只看得到顶部四个队列总量。" source="console-fixture" />
          <Figure src="screenshots/console/system.png" alt="系统诊断" caption="系统诊断：脱敏快照，按域分组，不含任何 Task 或用户内容。" source="console-fixture" />
        </FigureRow>
        <p>运维总览里的死信可以在确认原因后显式重试——不会自动重放；重试同样只发给系统管理员，且在队列真的动了之后才写审计日志，记下的是发生过的重试而不是发起过的重试。</p>
      </>,
    },
    {
      id: "boundary", title: "平台边界：为什么看不到正文",
      body: <>
        <p>侧边栏底部常驻一行字：<b>仅元数据 · 不展示 Task 正文</b>。这不是尚未实现，而是设计约束：</p>
        <ul>
          <li>浏览器端只访问 Console 自己的 API，拿不到任何后端管理令牌。</li>
          <li>知识条目在这里呈现为标题、编号、Project、贡献人、主题与状态；正文与证据留在受治理的存储里。</li>
          <li>需要看正文时走会话里的检索工具，由公司侧按你的数据权限逐次授权——见<a href={pageHref("mcp")}>在会话里检索知识</a>。</li>
        </ul>
        <Note title="页面上的时间戳">顶栏右侧的「数据更新」是这一屏快照的生成时刻。显示「快照过期」时说明后台聚合落后了，数字仍可读，但不要用它判断刚刚发生的事。</Note>
      </>,
    },
  ],
};

export const account: DocPage = {
  group: "管理平台", label: "账号与权限", title: "账号、角色与访问权限",
  intro: "平台使用 GitHub 组织身份登录；账号状态和角色决定用户可以访问哪些功能。",
  keywords: ["GitHub", "OAuth", "自动开通", "角色", "权限", "suspended", "revoked"],
  sections: [
    {
      id: "who", title: "谁能登录",
      body: <>
        <p>BST-AII 的 active 组织成员可以使用 GitHub 登录。首次登录时，平台会核验组织成员资格；核验通过后自动创建 active 账号，并在同一次登录中进入服务选择页。当前生产环境没有启用账号申请和等待审批流程。</p>
        <p>只有 <b>BST-AII 组织的 active 成员</b>能登录。平台不保存密码，身份完全由 GitHub 提供，并以 GitHub 的不可变数字 ID 作为账号主键——改用户名不会变成另一个账号，也不会丢掉已有权限。</p>
        <p>组织成员资格<b>每次登录都重新核对一遍</b>：平台拿 <code>read:org</code> 读你在 BST-AII 的成员关系，不是 active 成员就当场拒绝——与你在平台上有没有账号无关。把人移出组织，他下次就登不进来。</p>
        <Note title="先确认组织成员身份">如果你还不是 BST-AII 成员，请先让组织管理员在 GitHub 上把你加进组织，并接受邀请。组织成员关系不在本平台管理，平台也不发 GitHub 组织邀请。</Note>
      </>,
    },
    {
      id: "flow", title: "首次登录会发生什么",
      body: <>
        <ol>
          <li><b>打开登录页。</b>访问 <a href={consoleLoginHref} target="_blank" rel="noreferrer">{consoleLoginHref}</a>，点「通过 GitHub 授权登录」，在 GitHub 页面上确认授权。平台申请的是最小权限 <code>read:org</code>。</li>
          <li><b>平台核验组织成员资格。</b>授权回来后，平台读一次你在 BST-AII 的成员关系。不是 active 成员的，登录到此为止。</li>
          <li><b>账号被自动开通。</b>核验通过而平台上查不到你的账号时，平台按你的 GitHub 数字 ID 创建状态为 <b>active</b> 的账号，不进入申请或审批队列。</li>
          <li><b>同一次登录直接放行。</b>平台随即签发会话 Cookie，把你落到服务选择页，按角色显示你能进的服务。</li>
        </ol>
        <Note title="没有「提交申请」，也没有「等待审批」">这两步在服务端确实实现了，但它们挂在一个默认关闭的开关上，当前生产部署没有打开——所以你不会看到申请表单、不会看到等待页面，账号服务里也不会出现待批申请。真正拦人的是上面第 2 步的组织成员资格核验。</Note>
      </>,
    },
    {
      id: "gate", title: "平台如何控制访问权限",
      body: <>
        <p>自动开通不等于没有门禁。管住这个平台的是另外三样东西，它们都在服务端执行：</p>
        <div className="simple-table">
          <div><b>GitHub 组织成员资格</b><span>这是第一道也是最主要的一道门。谁能进 BST-AII 组织，由 GitHub 侧的组织管理员决定；平台每次登录都重新核对，不缓存这个结论。</span></div>
          <div><b>账号状态机</b><span>账号被改成 suspended 或 revoked 后，该账号已经发出去的<b>全部会话当场作废</b>，不必等 Cookie 过期。只有 active 状态能登录。</span></div>
          <div><b>角色授予</b><span>普通成员首次登录获得普通账号。知识审核和系统管理权限需要由管理员按既定流程授予；角色变化会立即使已有会话失效。</span></div>
        </div>
        <p>换句话说：<b>门禁在组织名册和角色授予上，不在开通环节</b>。想收回一个人的访问权，正确动作是把他移出 GitHub 组织，或把账号改成 suspended / revoked——两者都立刻生效。</p>
        <Maintainer title="查看自动角色映射"><p>自动开通按 GitHub 组织成员角色映射：普通成员（member）获得普通账号；组织 owner（成员角色为 admin）获得兼容角色 <code>console_admin</code>，该角色持有账号服务和运行状态能力。知识审核员不能由首次登录自动获得。</p></Maintainer>
      </>,
    },
    {
      id: "roles", title: "三档角色",
      body: <>
        <p>平台上在用的角色有三档。组织的普通成员自动开通给到的是普通账号；需要更高权限时由管理员另行授予——组织 owner 是例外，见本节末尾那条注。</p>
        <Matrix
          head={["角色", "能做什么", "看不到什么"]}
          rows={[
            ["普通账号", "洞察区四屏全部可读：概览、我的知识、项目、知识图谱；在会话中使用受治理的检索工具", "管理区、账号服务、运行状态与系统诊断的入口都不渲染"],
            ["知识审核员", "普通账号的全部，加上知识管理、归类与批量审核", "账号服务、运行状态、系统诊断"],
            ["系统管理员", "全部功能：审核与归类知识、账号服务、运行状态、系统诊断", "—"],
          ]}
        />
        <Note title="权限是服务端说了算">前端只决定「哪些入口值得渲染」，真正的判定在服务端：每个接口都会独立再检查一次。因此手工拼 URL 进入无权限的页面不会绕过任何检查。</Note>
        <Maintainer title="维护者说明：GitHub 组织 owner 的兼容角色">自动开通会读取 GitHub 组织成员角色。普通成员（member）获得普通账号；<b>组织 owner（成员角色为 admin）映射为兼容角色 <code>console_admin</code></b>。该角色持有 <code>accounts:manage</code> 与 <code>operations:read</code>，但不持有 <code>system:diagnose</code>，因此进不了系统诊断；在运行状态页也只能看到队列总量。它不具备知识审核能力。详细页面边界见<a href={pageHref("console")}>管理平台使用说明</a>。</Maintainer>
      </>,
    },
    {
      id: "elevation", title: "维护者说明：系统管理员授权",
      body: <>
        <Maintainer>
          <p><b>系统管理员不能通过账号服务直接授予。</b>一名管理员发起提名后，必须由另一名管理员确认；系统拒绝发起人确认自己的提名。</p>
          <p>这不是流程建议，而是权限代码中的硬约束：可直接授予的角色集合不包含系统管理员。</p>
          <Warn title="部署配置可以提供系统管理员权限">环境变量 <code>AIIG_CONSOLE_SYSTEM_ADMIN_GITHUB_USER_IDS</code> 可以列出 GitHub 数字 ID。名单内的 ID 只要持有 <code>console_admin</code>，请求即按系统管理员处理；账号表仍保存 <code>console_admin</code>，提升不落库。签发会话时计算一次，此后<b>每一个请求校验会话时都重算</b>。从名单移除后，权限会在下一次请求时恢复为 <code>console_admin</code>，无需等待会话过期或重新登录。当前生产部署正在使用该名单，因此必须按最高权限配置管理。组织 owner 首次登录可获得 <code>console_admin</code>；若其 ID 同时在名单中，首次登录即具有系统管理员权限，不经过双人复核。</Warn>
        </Maintainer>
      </>,
    },
    {
      id: "states", title: "账号状态与会话失效",
      body: <>
        <p>账号有四个状态，流转方向是固定的。自动开通直接落在 active——首次登录建出来的账号就是这一档：</p>
        <Matrix
          head={["状态", "含义", "可以变成"]}
          rows={[
            ["active", "正常可用。自动开通的初始状态", "suspended、revoked"],
            ["suspended", "临时停用，登录被拒绝", "active（恢复）、revoked"],
            ["revoked", "永久注销", "终态，不能再流转"],
            ["approved", "已批准、尚未首次登录。只有启用审批式开通时才会出现，当前部署不会产生这个状态", "active（首次登录）、revoked"],
          ]}
        />
        <Warn title="暂停与注销立即生效">把账号改成 suspended 或 revoked 时，该账号<b>已经发出去的全部会话当场作废</b>，不需要等 Cookie 过期。只有 active 状态能登录。</Warn>
        <p>另外，管理员变更一个账号的角色时也会使其现有会话失效，用户需要重新登录才能拿到新权限。</p>
      </>,
    },
    {
      id: "troubleshoot", title: "登录不进去时",
      body: <div className="simple-table">
        <div><b>提示组织成员资格不是 active</b><span>你不在 BST-AII 组织里，或者邀请还没接受。这件事在 GitHub 侧解决，平台不管组织名册；重试登录不会有帮助。</span></div>
        <div><b>提示 suspended / revoked</b><span>账号被停用或注销。这是管理动作，需要联系系统管理员，重试登录不会有帮助。</span></div>
        <div><b>GitHub 授权页要求组织批准</b><span>组织启用了 OAuth App 访问限制，需要组织管理员批准该 OAuth App 一次。</span></div>
        <div><b>登录成功但看不到管理入口</b><span>这是正常的：你的角色是普通账号。入口不渲染而不是灰掉。</span></div>
      </div>,
    },
  ],
};

export const dataPlatform: DocPage = {
  group: "管理平台", label: "使用数据平台", title: "登记和查找数据集",
  intro: "数据平台记录每个项目、每个模块用到的数据放在哪里：原始数据、训练集、测试集，以及训练、模型、测试和它们之间的关系。数据本身不搬，平台只登记位置。可以在网页上操作，也可以让 agent 在会话里查和登记。",
  keywords: ["数据平台", "数据中心", "list_data_projects", "register_data_record", "search_data_records", "数据位置"],
  sections: [
    {
      id: "what", title: "它是什么、在哪里打开",
      body: <>
        <p>本地算法管理平台的数据中心已经搬到这里，原来登记的项目、模块和数据记录都已迁入，<b>从迁移那天起以这里为准</b>。登录方式与管理平台相同：在管理平台登录一次，打开下面的地址就能直接用。</p>
        <Code>{`https://service.pikso.art/AIIknowledgeService/admin/data/app/`}</Code>
        <p>层级是三级：<b>项目 → 模块 → 数据记录</b>。每条数据记录写明它是原始数据、训练集还是测试集，放在哪个数据位置（某台服务器或某个共享盘），完整路径是什么，有多少样本。</p>
      </>,
    },
    {
      id: "roles", title: "谁能做什么",
      body: <>
        <Matrix
          head={["角色", "能做什么"]}
          rows={[
            ["项目负责人", "管理成员、建模块、改模块名、归档和恢复模块，以及成员能做的一切"],
            ["成员", "登记、修改、删除数据记录，用 CSV 批量导入"],
            ["只读成员", "查看数据记录、复制路径、导出总览，看图并写评审备注；不能改数据"],
            ["数据管理员", "看得到全部项目；维护「数据位置」（服务器和共享盘的清单）"],
          ]}
        />
        <p>你只看得到自己参与的项目。要加入某个项目，找它的负责人在「成员管理」里加你。</p>
        <p>「成员管理」的账号下拉框只列用浏览器登录过网页的人。只装了同步程序、没登录过网页的人在里面找不到：让他用浏览器登录一次网页，或者负责人在 Claude Code 里说「把某某加进项目 X」，对话里能找到装过同步程序的人。</p>
      </>,
    },
    {
      id: "web", title: "两种登记方式",
      body: <>
        <div className="link-list">
          <a href={pageHref("data-web")}><b>网页登记教程</b><span>一步步点哪里、填什么，配截图 →</span></a>
          <a href={pageHref("data-agent")}><b>对话登记教程</b><span>说一句「数据登记」，agent 一步步问 →</span></a>
        </div>
        <Matrix
          head={["想做的事", "用哪种"]}
          rows={[
            ["不想记字段，让 agent 问", "对话"],
            ["逐项核对、批量导入 CSV", "网页"],
            ["修改、删除数据记录", "网页"],
            ["来源在别的模块", "对话"],
            ["看图", <>都要经 agent，见<a key="a" href={pageHref("data-review")}>查看数据和结果对比</a></>],
            ["把数据、测试结果发到另一地", <>经飞书收发，只能在对话里做，见<a key="a" href={pageHref("data-transfer")}>两地收发教程</a></>],
          ]}
        />
        <ul>
          <li><b>每一次修改都要写原因</b>，原因会记进审计。</li>
          <li>网页提交后先显示已提交，一两秒后变成「已生效」或「被拒绝」并写明原因。数据记录存在公司内网的数据服务器上，云端只转交请求。</li>
          <li>路径建议填训练服务器上的写法（以 <code>/</code> 开头）。Windows 共享地址和盘符写法也能登记，但训练服务器不能直接用。</li>
        </ul>
      </>,
    },
    {
      id: "mcp", title: "让 AI 在会话里查和登记",
      body: <>
        <p>直接用话说就行。登记数据说一句「数据登记」，agent 会一步步问，见<a href={pageHref("data-agent")}>对话登记教程</a>。查数据也一样，例如：</p>
        <Code>{`列出我能看到的数据平台项目，再看看 zoom-sr 下面有哪些模块。`}</Code>
        <Matrix
          head={["工具", "做什么", "谁能用"]}
          rows={[
            [<code key="t">list_data_projects</code>, "列出我能看到的项目，带我的角色、模块数、记录数", "所有人"],
            [<code key="t">list_data_modules</code>, "列出某个项目的模块，带三类数据各多少条", "项目成员，含只读"],
            [<code key="t">list_data_locations</code>, "列出可以选的数据位置：名字、IP、服务器还是共享盘", "所有人"],
            [<code key="t">search_data_records</code>, "按关键词、项目、模块、数据类型搜数据记录，可以跨模块。v0.3.87 起能按登记时间、名称、模块、大小、样本数、类型排序", "项目成员"],
            [<code key="t">get_data_record</code>, "看一条记录的详情和修改历史", "项目成员"],
            [<code key="t">list_data_accounts</code>, "列出已开通的账号，加成员时从这里挑", "数据管理员"],
            [<code key="t">create_data_project</code>, "建项目，调用的人成为负责人", "所有人"],
            [<code key="t">create_data_module</code>, "在项目里建模块，要给一个英文标识，建好后不能改", "项目负责人"],
            [<code key="t">set_data_project_member</code>, "加成员或改角色（负责人、成员、只读）", "项目负责人"],
            [<code key="t">register_data_record</code>, "登记一条数据，必须给数据类型（v0.3.83 起）。别名在模块里已存在时不写入，返回已有的那条", "负责人、成员"],
            [<code key="t">register_data_records</code>, "一次最多登记 200 条，每条都要给数据类型，每条单独检查，错的那条不影响其他条", "负责人、成员"],
            [<code key="t">list_data_assets</code>, "列出模块里的数据集版本、训练、模型、测试或对比（v0.3.80 起）。v0.3.87 起能按登记时间、名称、状态排序，数据集还能按大小、样本数排、按类型筛", "项目成员"],
            [<code key="t">get_data_asset</code>, "看一个对象的详情：路径、清单状态、血缘、说明，对比还带对齐报告（v0.3.80 起）。数据和测试结果还列出副本和收发记录", "项目成员"],
            [<code key="t">list_manifest_entries</code>, "翻看冻结清单里的文件（v0.3.80 起）。v0.3.87 起能按大小、文件类型排序，按类别筛（合并集的类别就是来源名）", "项目成员"],
            [<code key="t">manage_dataset_manifest</code>, <>冻结或复核文件清单，不复制文件（v0.3.80 起）。v0.3.88 起冻结在开会话的这台机器上算校验值，数据服务器抽查；也能停止冻结。v0.3.89 起还能经飞书发给另一地、收别人发来的、登记已有副本，见<a key="a" href={pageHref("data-transfer")}>两地收发教程</a></>, "负责人、成员"],
            [<code key="t">set_dataset_lineage</code>, "写清数据从哪几份数据来、输入和目标怎么配对（v0.3.80 起）。v0.3.86 起可以写多个来源，每个来源一段处理说明", "负责人、成员"],
            [<code key="t">update_asset_doc</code>, "写数据集、训练、模型的说明，每次保存留一个修订（v0.3.80 起）", "负责人、成员"],
            [<code key="t">register_data_asset</code>, "登记训练、模型、测试或对比（v0.3.80 起）。v0.3.86 起也能把几份已冻结的数据建成合并集", "负责人、成员"],
            [<code key="t">update_data_asset</code>, "修改训练、模型或测试。已冻结的结果目录不能改路径（v0.3.80 起）。v0.3.86 起也能重新对齐对比", "负责人、成员"],
            [<code key="t">get_review_bundle</code>, "查对比的摘要：样本数、总大小、类别分布、对齐报告、血缘（v0.3.81 起）", "项目成员"],
            [<code key="t">list_review_notes</code>, "读评审备注（v0.3.81 起）", "项目成员"],
            [<code key="t">open_review_viewer</code>, "把选中的样本从 NAS 拷到本机并打开查看器。先报方案，你点头才拷（v0.3.81 起）", "项目成员"],
            [<code key="t">close_review_viewer</code>, "关掉本机查看器，可以顺带清缓存（v0.3.81 起）", "本机"],
          ]}
        />
        <ul>
          <li><b>登记时填位置的名字，不填 IP。</b>位置名字要先在「数据位置」里登记过；不确定有哪些，让 AI 先调 <code>list_data_locations</code>。</li>
          <li><b>每个写入都要写原因</b>，会记进审计，审计里记的是你本人。</li>
          <li>AI 第一次调用写入工具时，Claude Code 或 Codex 会弹窗问你要不要允许，按自己的习惯选。</li>
          <li>被平台拒绝时（没有权限、名字重复、路径写法不对），工具会返回一句中文说明，AI 照着改了再试。</li>
          <li><b>看图和对比</b>的完整流程见<a href={pageHref("data-review")}>查看数据和结果对比</a>。评审页面对项目成员开放。</li>
          <li><b>看图要能访问 NAS。</b>Windows 上先在资源管理器里打开一次共享；macOS 和 Linux 要先挂载，并在身份目录的 <code>nas_mounts.json</code> 里写上共享名和挂载点。第一次打开评审页时，浏览器会问是否允许访问本地网络，点允许。</li>
          <li><b>冻结清单前，数据位置要填好 NAS 共享名。</b>数据管理员在「数据位置」页填写。没填的位置会被当成不在 NAS 上，冻结时报 <code>ssh_not_configured</code>。</li>
        </ul>
        <Note title="AI 的写入不在「操作记录」页里">网页上的修改会在数据平台的「操作记录」页留一行；AI 通过工具做的修改走另一条加密通道，记录在公司内网数据服务器的审计里，不出现在那一页。</Note>
        <Maintainer title="这条通道怎么保证路径和 IP 不外泄"><p>数据平台的工具与知识检索工具走同一种端到端加密：请求在本机签名，用公司公钥加密，云端只转发密文；公司内网的数据服务器核实是哪台设备、哪个人之后才查库或写库，结果签名后加密返回。路径和服务器 IP 只出现在密文里。</p></Maintainer>
      </>,
    },
    {
      id: "data-only", title: "只装数据工具（不装治理框架）",
      body: <>
        <p>v0.3.79 起，安装器首页有「只装数据工具」按钮。只想在 Claude Code 或 Codex 里查数据、登记数据，不需要治理框架时用它。</p>
        <ul>
          <li>不选项目目录，不装治理框架，不建后台同步任务，不要求装 Git。</li>
          <li>填 GitHub 用户名，按页面上的授权码完成授权。公司服务器核验你是 BST-AII 成员后，工具写进 Claude Code 和 Codex 的用户级配置。</li>
          <li>装完后，在任意目录新开一个会话就能用，工具与完整安装相同。可以先说一句「我想看数据对比」，见<a href={pageHref("data-review")}>查看数据和结果对比</a>。</li>
          <li>再运行一次就是升级。本机已经注册过的，不再弹授权。</li>
          <li>同一页有「卸载数据工具」：删掉两处用户级配置，本机身份保留。</li>
        </ul>
        <Matrix
          head={["写入位置", "内容"]}
          rows={[
            ["Claude Code 用户级配置", <>用 <code key="c">claude mcp add-json --scope user</code> 写入 <code key="n">aiigovernance-records</code></>],
            ["Codex 用户级配置", <><code key="p">~/.codex/config.toml</code> 中 <code key="n">aiig-records</code> 一段（本机有 Codex 时）</>],
            ["本机身份目录", "设备身份与登录状态"],
          ]}
        />
        <Note title="找不到 claude 命令时">完成页会给出一条 <code>claude mcp add-json --scope user …</code> 命令。装好 Claude Code 后，在终端运行这一条即可。</Note>
        <Note title="连续 30 天不用要重新授权">只装数据工具的电脑没有后台任务，登录状态只在使用工具时续期。连续 30 天不用，再用时工具会提示重新运行安装器；重新运行一次「只装数据工具」即可。</Note>
        <p>以后在同一台电脑上做完整安装，项目里会照常装上治理框架和工具，用户级那一条也会跟着更新，不需要先卸载。</p>
      </>,
    },
  ],
};

export const dataReview: DocPage = {
  group: "管理平台", label: "查看数据和结果对比", title: "查看数据和结果对比",
  intro: "在 Claude Code 里说要看什么，agent 查出已有的数据和对比，缺的部分登记好，再把选中的图拷到本机，给出对比网页地址。已经下载过的对比，再说一句就能接着看。",
  keywords: ["数据对比", "结果对比", "查看器", "评审", "open_review_viewer", "register_data_asset", "get_review_bundle", "备注", "HTML 报告", "export_review_report", "合并集", "数据已更新", "重新对齐", "没有图片", "lq", "gt", "自动对齐", "拍摄方向", "看图缓存位置", "缓存上限"],
  sections: [
    {
      id: "before", title: "使用前提",
      body: <>
        <Matrix
          head={["条件", "要求", "不满足时"]}
          rows={[
            ["安装器", "v0.3.90 起能在安装器首页改看图缓存的位置和上限，导出报告按拍摄方向画。v0.3.86 起能在对话里建合并集、重新对齐。v0.3.84 起能导出 HTML 报告。v0.3.83 起再次打开已下载的对比不用确认。v0.3.82 起带提问引导。v0.3.81 起有查看器", <>重新运行安装器。不用治理框架的电脑选<a key="a" href={pageHref("data") + "#data-only"}>只装数据工具</a></>],
            ["账号", "是这个项目的成员。负责人、成员、只读成员都能看图和写备注；登记数据要负责人或成员", "找项目负责人加成员"],
            ["访问 NAS", "Windows 在资源管理器里打开过一次共享；macOS、Linux 已挂载，并在身份目录的 nas_mounts.json 写上共享名和挂载点", "工具会提示先打开共享"],
            ["数据位置", "数据所在的位置填好了 NAS 共享名", "数据管理员在「数据位置」页补填"],
            ["浏览器", "Chrome 或 Edge。第一次打开页面时允许访问本地网络", "地址栏左侧的站点设置里打开「本地网络访问」"],
          ]}
        />
        <Note title="项目目录里的配置优先">完整安装会在项目里写 <code>.mcp.json</code>，它优先于用户级配置。老项目目录里的 <code>.mcp.json</code> 可能指向旧版本，这时在该项目重新安装一次，或者到没有 <code>.mcp.json</code> 的目录开新会话。</Note>
      </>,
    },
    {
      id: "start", title: "开始方式",
      body: <>
        <p>新开一个会话，说要看什么。知道多少说多少，已经说清楚的内容 agent 不再问。</p>
        <Matrix
          head={["情况", "可以这样说"]}
          rows={[
            ["还不确定看什么", "我想看数据对比"],
            ["已经有对比", "打开项目 data-platform-acceptance 里对比 ab-test2 的查看器，全部看"],
            ["只看一份数据", "打开数据集 variant_a 看图"],
            ["导出成报告发给别人", "把对比 ab-test2 导出成 HTML 报告"],
            ["几份测试集合在一起评测", "把 reg-test-set 和 reg-test-set2 原样合并成测试集 reg-test-mset"],
            ["对比标着数据已更新", "把对比 ab-test2 重新对齐"],
            ["从头建一个结果对比", "在 data-platform-acceptance 的 phase2 里，把 <测试集路径> 登记成测试数据 testset2 并冻结。把 <结果目录 A>、<结果目录 B> 登记成两次测试，都用 testset2，建结果对比 ab-test2，然后打开查看器全部看"],
            ["装过本地的对比技能", "带上「数据平台」，比如：看数据平台上 phase2 的结果对比。否则「对比」这个词可能走到本地技能"],
          ]}
        />
        <Note title="引导不是固定程序">提问顺序是写给 agent 的说明，agent 可能合并或跳过某一步。跳错了直接说要做什么。</Note>
        <Note title="用 Codex 时">v0.3.84 起安装器会写好 Codex 要的规则。更早的版本只说「我想看数据对比」不会触发，要手动加一段规则，见<a href={pageHref("data-agent") + "#codex"}>在 Codex 里使用</a>。</Note>
      </>,
    },
    {
      id: "flow", title: "提问顺序",
      body: <>
        <Matrix
          head={["步骤", "agent 问什么", "用到的工具"]}
          rows={[
            ["1. 范围", "看哪个项目、哪个模块。只有一个选项时不问", <><code key="a">list_data_projects</code>、<code key="b">list_data_modules</code></>],
            ["2. 目标", "看单份数据、同一原始数据的多个版本，还是同一测试集的多次结果", "无"],
            ["3. 现有内容", "列出已有的对比和数据。有合适的就直接用，跳到第 5 步", <code key="a">list_data_assets</code>],
            ["4. 补数据、建对比", <>缺数据时先登记，问法见<a key="a" href={pageHref("data-agent")}>对话登记教程</a>。建好后报告匹配了多少样本、有什么问题</>, <><code key="a">register_data_asset</code>、<code key="b">get_review_bundle</code></>],
            ["5. 查看", "看全部还是随机几个。还要拷贝时原样报出方案，确认后拷贝；图都在本机时直接给网页地址", <code key="a">open_review_viewer</code>],
          ]}
        />
        <Chat title="示例：结果对比已经存在">
          <You>我想看数据对比</You>
          <ToolCall tool="list_data_projects" args="" />
          <Agent>你要看哪个项目？你负责的有 data-platform-acceptance 和 mcp-selftest，其他项目列在下面。</Agent>
          <You>data-platform-acceptance，比较两次测试结果</You>
          <ToolCall tool="list_data_assets" args='project: "data-platform-acceptance", module: "phase2", kind: "comparison"' />
          <Agent>phase2 里有结果对比 ab-test2，10 个样本全部匹配。看全部还是随机几个？</Agent>
          <You>全部</You>
          <ToolCall tool="open_review_viewer" args='kind: "comparison", sampling: {mode: "all"}' />
          <Agent>将从 NAS 拷贝 10 个样本、30 个文件，共 29.6 MB，到本机缓存。确认后才开始拷贝。</Agent>
          <You>确认</You>
          <Agent>拷贝完成，打开这个地址查看：https://service.pikso.art/…</Agent>
        </Chat>
      </>,
    },
    {
      id: "page", title: "看懂对比页",
      body: <>
        <p>页面从上到下是血缘、成员、对齐报告、样本与备注。</p>
        <Figure src="screenshots/data/lineage.png" alt="对比页的血缘图" caption="血缘：数据、训练、模型、测试之间的关系。衍生多次会逐级画出来，点节点能跳到对应页面。" source="console-fixture" />
        <p>看图区一次看一个样本。用「上一张」「下一张」翻，也可以搜样本名、按类别筛，或在「样本」下拉框里直接选。</p>
        <Figure src="screenshots/data/review-cards.png" alt="看图区：三个窗口显示同一个样本的三列" caption="勾几列就开几个窗口，最多 6 列。各窗口显示原图上同一块区域，一起缩放、一起拖动。" source="console-fixture" />
        <Matrix
          head={["想做的事", "怎么做"]}
          rows={[
            ["放大、缩小", "鼠标停在图上滚动滚轮，以鼠标所在的点为中心"],
            ["移动", "在图上按住拖动"],
            ["回到全图", "双击图，或点「适应窗口」"],
            ["看原始像素", "点「100%」：一个原图像素对屏幕上一个像素。再往上放大只按整数倍（200%、300%……），每个原图像素画成一样大的方块，不做平滑"],
            ["放大一块", "勾「框选放大」，在图上拖一个框"],
            ["和参照比", "「对比参照」选一列，默认第一列。鼠标停在图上按住空格，所有窗口临时换成参照，松开换回来"],
            ["左右对照着看", "勾「滑动对比」，每个窗口竖线左边显示参照，拖滑块改竖线位置"],
          ]}
        />
        <Figure src="screenshots/data/review-wipe.png" alt="滑动对比：窗口左边是参照，右边是这一列" caption="滑动对比：竖线左边是参照（这里是测试输入），右边是这一列自己的图。" source="console-fixture" />
        <p>各列尺寸不同时，面积最大的那张当基准，其他列按下面的办法画到基准上：</p>
        <Matrix
          head={["情况", "怎么画", "窗口标题"]}
          rows={[
            ["按比例缩放来的，比如超分的测试输入比结果小", "放大到和基准一样大", "放大 ×2 显示"],
            ["视野不同，比如 360 拍的是输入中间一块、放大倍数不是整数", "按画面内容自动对齐（2026-11-13 起）：试左上角、居中两种放法和一串倍数，找最像的位置。每个样本第一次打开时显示「正在自动对齐…」，约半秒", "自动对齐：放大 1.185 倍、居中，相似度 0.99"],
            ["找不到对得上的位置，比如两列不是同一块画面", "不画", "自动对齐没找到对得上的位置（最像的地方相似度 0.41），没有画"],
            ["手机拍的 JPEG 带转向标记，模型没按标记转（结果是横的）", "原图也画成没转的样子，和结果一致", "按拍摄方向标记没转，和其他列一致"],
            ["方向挑过了宽高还是对调", "不画", "宽高对调，多半是拍摄方向不一致，没有画"],
          ]}
        />
        <p>相似度低于 0.8 时，看一眼边缘对不对得上。自动对齐只在数据平台网页上有，导出的 HTML 报告里没有，见<a href="#report">导出 HTML 报告</a>。</p>
        <p>备注有两种，写的地方不同：</p>
        <ul>
          <li><b>写在这张图上</b>：用图下面的备注框。默认勾着「带上当前查看区域」：框选过就记框的那块，没框就记当时窗口里看到的那块，旁边写着是原图上哪一块。</li>
          <li><b>写给整个对比</b>：点右侧的「写整体备注」，写完自动收起。</li>
        </ul>
        <Figure src="screenshots/data/review-notes.png" alt="点备注跳回后，各窗口用虚线框出当时那块" caption="点备注上的「跳到这个区域」，换到那个样本，所有窗口用虚线框出写备注时的那块。" source="console-fixture" />
        <p>改版以前写的备注只记了中心和倍数，点「跳到这个位置」回到当时的中心和倍数，不框。</p>
      </>,
    },
    {
      id: "kinds", title: "两种对比",
      body: <>
        <Matrix
          head={["", "结果对比", "数据对比"]}
          rows={[
            ["用途", "同一测试集上的多次测试", "同一原始数据派生的多个版本"],
            ["基准", "已冻结的测试数据，可以是合并集", "已冻结的原始数据，可以是合并集"],
            ["成员", "至少两次测试，结果目录都已冻结", "至少两个训练数据版本，都已冻结，来源能追到这份原始数据，都有配对规则。基准是合并集时，要能追到它的每一份成员"],
            ["配对规则", <>测试的 <code key="a">pairing_rule</code>：<code key="b">same_stem</code>（同名）、<code key="c">pattern</code>、<code key="d">strip</code>、<code key="e">mapping</code></>, <>版本的 <code key="a">pair_rule</code>：<code key="b">dirs</code>（如 lq 和 gt 两个目录）、<code key="c">suffix</code>、<code key="d">mapping</code></>],
            ["页面的列", "测试输入，加上每次测试的结果", "原图，加上每个版本的输入和目标"],
          ]}
        />
        <p>建对比时平台会按规则逐个样本配对，报告匹配数、缺失、多余、一对多和尺寸不符。基准和每个成员都要有图片，没有图片的会被拒绝，见<a href="#no-images">没有图片的数据</a>。对比的基准和成员建好后不能改，建错了就新建一个。基准或成员后来变了，报告不会自动重算，见<a href="#stale">数据已更新和重新对齐</a>。</p>
      </>,
    },
    {
      id: "merged-test", title: "合并集作测试集",
      body: <>
        <p>几份测试集原样合并成一个合并集后（网页上见<a href={pageHref("data-web") + "#merge"}>合并数据</a>，对话里见<a href={pageHref("data-agent") + "#merge"}>虚拟合并</a>），可以和普通测试集一样登记测试、建结果对比。合并集里每个样本的类别是它的来源名，查看器里按类别筛选就是按来源筛选。</p>
        <Figure src="screenshots/data/review-merged-lineage.png" alt="对比页血缘图：两份测试集合并成 seg_test_all，两次测试都在它上面" caption="合并测试集上的结果对比。两份测试集经「合并」线连到合并集，两次测试都用这个合并集。" source="console-fixture" />
        <p>测试结果目录有两种放法。下面的例子里，合并集有「晴天」「雨夜」两个来源，测试集里的文件是 <code>0001.png</code> 这样的名字。</p>
        <Matrix
          head={["放法", "结果目录里的样子", "什么时候能用"]}
          rows={[
            ["按来源名分子目录", <><code key="a">&lt;结果目录&gt;/晴天/0001.png</code>、<code key="b">&lt;结果目录&gt;/雨夜/0001.png</code></>, "都能用，推荐"],
            ["平铺", <><code key="a">&lt;结果目录&gt;/0001.png</code>、<code key="b">&lt;结果目录&gt;/0002.png</code></>, "只在各来源之间没有重名文件时能用"],
          ]}
        />
        <ul>
          <li><b>子目录名要和来源名完全一样。</b>子目录里的相对路径和文件名，按测试的配对规则要能对上那一份测试集。</li>
          <li><b>平铺时重名的样本对不上。</b>两份测试集里都有 <code>0001.png</code>，平铺的结果分不清是哪一份的。全都重名时一个也对不上，实测建对比被拒，提示「有一次测试的结果按它的配对规则一个样本都配不上」。</li>
          <li><b>拿不准就按来源名分子目录。</b>结果目录登记后就冻结了，放错了要按新目录重新登记一次测试。</li>
          <li><b>测试记着登记时那一版测试集。</b>合并集后来重新合成了，已登记的测试仍算在旧数据上；要算在新数据上，重新登记测试。</li>
        </ul>
        <p>合并集作为数据集打开时，全部成员都设了配对规则就分「输入」「目标」两列，否则一列「文件」。某个成员不在 NAS 时，只有这个成员的样本看不了，提示里写着来源名，其他成员照常看。</p>
      </>,
    },
    {
      id: "stale", title: "数据已更新和重新对齐",
      body: <>
        <p>对比建好后，基准或成员重新冻结过，或者改过配对规则，对比页的对齐报告上会显示「数据已更新」，对比列表的对齐状态旁边也会标出来。这时对齐报告和样本还是按旧数据算的。平台不会自动重新对齐，由你决定。</p>
        <Figure src="screenshots/data/review-stale.png" alt="对齐报告上方的数据已更新提示和重新对齐按钮" caption="对齐报告上的「数据已更新」。右边是「重新对齐」按钮。" source="console-fixture" />
        <Matrix
          head={["在哪里", "怎么做"]}
          rows={[
            ["网页", "对比页点「重新对齐」，写对齐原因。负责人和成员能看到这个按钮，只读成员看不到"],
            ["对话", "说「把对比 ab-test2 重新对齐」（v0.3.86 起）"],
          ]}
        />
        <p>重新对齐会替换旧的对齐报告，已经写的备注不动。基准和成员不变，要换成员就新建对比。成员改了配对规则后，样本的键可能跟着变，写在旧键上的备注会对不上。</p>
        <p>重新冻结别处用着的数据之前，网页对话框会列出用着它的训练、测试、对比、合并集和下级数据；agent 也应该先告诉你，等你确认。数据真的变了，建议登记成新版本，来源选旧的那份。</p>
      </>,
    },
    {
      id: "one-dataset", title: "只看一份数据",
      body: <>
        <p>对比至少要两个成员，只选一个时网页会提示「至少选两个成员」。只想看一个版本的 lq 和 gt，不用建对比，说「打开数据集 variant_a 看图」就行。</p>
        <p>用的是同一个查看器：同样拷到本机，缩放、拖动、勾选列、写备注都一样。和对比页的区别如下。</p>
        <Matrix
          head={["", "数据集", "对比"]}
          rows={[
            ["页面的列", "设了配对规则：输入、目标。没设：一列「文件」。合并集要全部成员都设了才分两列", "见上一节"],
            ["血缘图、成员表、对齐报告", "没有。点页面右上角的「查看明细」看来源和清单", "有"],
            ["备注标签", "问题、标记", "改善、持平、变差"],
            ["条件", "已冻结", "所有成员已冻结"],
          ]}
        />
      </>,
    },
    {
      id: "fill", title: "补登记缺少的数据",
      body: <>
        <p>完整步骤见<a href={pageHref("data-agent")}>对话登记教程</a>和<a href={pageHref("data-web")}>网页登记教程</a>。</p>
        <ul>
          <li><b>路径写完整。</b>服务器写法（/…）、Windows 共享地址（\\主机\共享名\…）或盘符（X:\…）。路径要在所选位置的根目录之下。</li>
          <li><b>名字在模块内不能重复。</b>重名时 agent 应该问你换什么名字。</li>
          <li><b>冻结只记录文件清单，不复制文件。</b><code>Thumbs.db</code>、<code>desktop.ini</code> 这类系统文件不进清单。</li>
          <li><b>在对话里冻结，校验值在开会话的这台机器上算（v0.3.88 起）。</b>算好交给数据服务器随机抽查，对上了才算冻结。读不到目录时 agent 会先问你。网页上冻结仍由数据服务器算，异地 NAS 上的大数据可能要几个小时。详见<a href={pageHref("data-agent") + "#freeze"}>对话登记教程的冻结一节</a>。</li>
          <li><b>冻结可以停：</b>在对话里说「停掉这个冻结」。排队时 agent 和网页都会说排第几、前面谁在跑。</li>
          <li><b>测试带结果路径时，结果目录会自动冻结</b>，不用再单独冻结。</li>
          <li><b>数据对比的每个版本都要设来源和配对规则。</b>版本目录下分 lq、gt 时，配对规则是 <code>{`{mode: dirs, input: lq, target: gt}`}</code>。</li>
          <li><b>写入都要写原因</b>，记进审计。经 MCP 的写入不会出现在云端「操作记录」页。</li>
        </ul>
      </>,
    },
    {
      id: "viewer", title: "拷贝与查看",
      body: <>
        <ul>
          <li><b>拷贝前先报方案。</b>工具先报样本数、文件数和大小，已有一部分在本机时会写明还要拷多少，你确认后才拷贝。默认随机 100 个，还要拷的量超过 5 GB 时要再确认一次。</li>
          <li><b>图拷到本机缓存并逐个核对。</b>缓存默认在 C 盘的身份目录下，上限 20 GB，最久没用的先淘汰；v0.3.90 起可以换位置、调上限，见<a href="#cache">看图缓存放哪</a>。页面在数据平台上，图从你自己的电脑读取。</li>
          <li><b>写在某张图上的备注</b>：用图下面的备注框。备注会记下这张图和当前查看区域。</li>
          <li><b>写给整个对比或数据集的备注</b>：点右侧的「写整体备注」，写完自动收起。</li>
          <li><b>同项目成员能看到备注。</b>备注记在写的人的账号下。网页上能看，也可以让 agent 用 <code>list_review_notes</code> 查。</li>
        </ul>
        <p>TIFF、EXR 看不了。支持 PNG、JPG、BMP、WebP、PFM 和裸 YUV。配对规则用 <code>mapping</code> 的测试结果也看不了图，要看图就换成其他三种规则。</p>
      </>,
    },
    {
      id: "no-images", title: "没有图片的数据",
      body: <>
        <p>数据里一张图片都没有时（比如只有 .npy），建对比会被拒绝，打开查看器和导出报告时也会写明原因是没有图片。提示里写着主要是哪种文件、有多少个。</p>
        <p>平台不做格式转换。在训练环境里把它转成图片，把转好的目录登记成新版本，来源选这份数据，处理说明写清楚怎么转的，再拿新版本建对比。只有标注文件的数据不能看图，也不用转换。步骤见<a href={pageHref("data-web") + "#no-images"}>网页登记教程</a>和<a href={pageHref("data-agent") + "#no-images"}>对话登记教程</a>。</p>
      </>,
    },
    {
      id: "reopen", title: "再次查看已下载的对比",
      body: <>
        <p><b>不用重新下载，也不用重新授权。</b>再说一句「打开对比 X」，拿到新地址就能接着看。图都在本机时 agent 不会问确认（v0.3.83 起）。</p>
        <Matrix
          head={["项", "情况"]}
          rows={[
            ["页面地址", "只在当前查看期间有效。半小时没人取图，本机小服务自动退出，旧地址失效；刷新页面后也要重新打开"],
            ["下载过的图", "还在本机，不会重新拷贝"],
            ["浏览器的本地网络权限", "允许过一次就不用再点"],
            ["样本", "抽样方式相同才是同样的样本。换了样本数或抽样方式，会补拷没有的部分"],
          ]}
        />
        <Figure src="screenshots/data/review-no-viewer.png" alt="小服务退出后的提示和复制按钮" caption="小服务没在运行时，血缘、对齐报告和备注照常显示，图片位置给出可以复制的那句话。" source="console-fixture" />
        <p>两个限制：要能连上数据平台，因为页面在云端，图片清单也要向公司服务器取，不能完全离线；所有对比共用一个缓存（默认 20 GB），超过后最久没用的会被淘汰，再看时要重新拷贝。</p>
      </>,
    },
    {
      id: "cache", title: "看图缓存放哪",
      body: <>
        <p>v0.3.90 起，看图缓存可以换到别的文件夹、调上限。C 盘不够用，或者想一次看完一个大测试集（比如 447 个样本、23 GB）时用。</p>
        <ol>
          <li>打开安装器（0.3.90 或更新），首页点「看图缓存位置」。不选项目、不登录，同一版安装器随时打开都能改。</li>
          <li>页面先写现在的位置、用了多少、上限、开着几个查看器。</li>
          <li>选「改到这个文件夹」，点「选择文件夹…」挑一个，比如 <code>E:\aiig</code>；或者选「放回默认位置」。上限选 20、50、100 或 200 GB，这个盘放不下的档位是灰的。</li>
          <li>点「应用」。成功后完成页写新位置、上限、旧位置清掉了多少。</li>
        </ol>
        <Figure src="screenshots/installer/viewer_cache.png" alt="安装器的看图缓存位置页：现在的位置和用量，改到某个文件夹或放回默认位置，上限下拉框" caption="看图缓存位置页。会在选的文件夹里建一个 AIIGovernance-viewer-cache 文件夹，只有你自己能看。" source="installer-stub" />
        <Warn title="换位置会清掉旧缓存">开着的查看器会关掉，旧位置的图会删掉（都是 NAS 上图的副本），之后要看的图从 NAS 重新拷。导出报告前也要先重新打开一次查看器。升级前就开着的 Claude Code 会话跑的还是旧程序，不认新位置，重开一次。</Warn>
        <Matrix
          head={["点「应用」后页面说", "原因", "处理"]}
          rows={[
            ["在网络盘上", "选了网络盘或映射的网络驱动器", "选这台电脑自己的磁盘"],
            ["设不了只给你自己看的权限", "这个盘是 U 盘格式（FAT32、exFAT）", "换一个 NTFS 盘"],
            ["这个路径太长了", "Windows 上整条路径不能超过 260 个字符，缓存还要往下建几层", "选浅一点的文件夹，页面会写最长多少个字符，比如 E:\\aiig"],
            ["这个盘只剩 X GB，上限放不下", "剩余空间比上限小", "选小一点的上限，或者换一个盘"],
            ["里面已经有别的东西", "选的文件夹里已经有同名的 AIIGovernance-viewer-cache 文件夹，又不是这台电脑建的", "换一个文件夹"],
          ]}
        />
        <p>选的盘没接上、盘符变了时，看图会直接说「看图缓存设在 …，现在找不到这个文件夹」，不会悄悄拷回 C 盘。接上盘再试，或者重开安装器换位置。卸载不删缓存，换到别处的缓存不用了要自己删。</p>
      </>,
    },
    {
      id: "report", title: "导出 HTML 报告",
      body: <>
        <p>v0.3.84 起，看过的对比、数据集或测试可以导出成一个本地网页，发给没有平台账号的人也能打开，不联网也能看。说「把对比 ab-test2 导出成 HTML 报告」。</p>
        <ol>
          <li>先在查看器里打开过这批样本。报告只用本机已有的图，没打开过时 agent 会让你先打开。</li>
          <li>agent 报样本数、文件数、总大小和目录，你确认后才复制。默认收录上次在查看器里选中的全部样本，不再抽样。</li>
          <li>复制完 agent 给出 <code>index.html</code> 的路径，双击打开。</li>
        </ol>
        <Figure src="screenshots/data/report-page.png" alt="报告顶部：内部资料提示、血缘图、成员表" caption="报告顶部：内部资料提示、血缘图、成员表和对齐报告。" source="console-fixture" />
        <Figure src="screenshots/data/report-cards.png" alt="报告里的看图区，三个窗口，框出备注里的区域" caption="报告和查看页面是同一种看法：勾选列、缩放、拖动、框选、参照、滑动对比都能用。备注只读，点「跳到这个区域」会框出那块。" source="console-fixture" />
        <p>v0.3.88 起导出的报告是这个样子。之前导出的报告还是一样本一张卡片，点带区域的备注只移到当时的中心。</p>
        <p>v0.3.90 起，报告按 JPEG 的拍摄方向画，规则和网页一样：原图带转向标记、模型结果没转的，原图画成没转的样子，标题写「按拍摄方向标记没转」。报告里<b>不能按内容自动对齐</b>：双击打开的报告读不了本机图片的像素，视野不同的列不画，写「报告里不能自动对齐，请在数据平台网页上看」。</p>
        <Code>{`夜景两次测试-20261102-1530/     默认放在用户目录的 AIIGovernance-reports 下
  index.html                    报告页面
  images/                       原图
  display/                      只有 PFM、裸 YUV 才有，转成 PNG 给页面显示`}</Code>
        <Warn title="发给别人前">要发整个目录，只发 <code>index.html</code> 看不到图。报告里是真实样本图，发之前确认对方可以看这些数据。报告不含 NAS 路径和内部 IP。</Warn>
        <Matrix
          head={["现象", "原因", "处理"]}
          rows={[
            ["提示图不在本机", "没打开过查看器、抽样方式不同，或缓存已被淘汰", "先打开查看器，已有的不重拷"],
            ["提示目录里已经有文件", "指定的输出目录不是空的", "换一个目录，或者不指定，自动生成新目录"],
            ["发给别人后图不显示", "只发了 index.html", "发整个目录"],
            ["某一列只有「原图」链接", "TIFF、EXR 或转不了的文件，浏览器显示不了", "点链接下载原图"],
            ["某一列写「报告里不能自动对齐」", "这一列和基准视野不同，要按内容对齐，报告里做不了", "在数据平台网页上看这个样本"],
          ]}
        />
        <p>报告生成后不会更新，新写的备注不会进去，要最新内容就再导出一份。报告不计入看图缓存，用完自己删。备注只能在查看页面上写。</p>
      </>,
    },
    {
      id: "limits", title: "MCP 不支持的操作",
      body: <>
        <Matrix
          head={["操作", "在哪里做"]}
          rows={[
            ["写备注、删备注", "查看页面"],
            ["修改、删除已登记的数据记录", "数据平台网页"],
            ["登记、修改数据位置", "数据平台「数据位置」页，只有数据管理员能进"],
            ["同步到 NAS", "数据平台网页。NAS 平台区还没有配置，目前不能使用"],
          ]}
        />
      </>,
    },
    {
      id: "trouble", title: "常见问题",
      body: <>
        <Matrix
          head={["现象", "原因", "处理"]}
          rows={[
            ["agent 没有主动提问，或说没有这些工具", "安装器版本低，或当前目录的 .mcp.json 指向旧版本；用 Codex 时没加规则", "升级到最新版，开新会话；老项目在该目录重新安装；Codex 见对话登记教程"],
            ["提示路径必须是绝对路径", "路径写法不对", "按上文的三种写法写完整路径"],
            ["「有一次测试的结果按它的配对规则一个样本都配不上」", "结果文件名和测试集文件名对不上", "检查文件命名，或换一种配对规则"],
            ["测试集是合并集，建对比提示一个样本都配不上","结果平铺，而且文件名在各来源之间重复", <>结果按来源名分子目录放，重新登记测试，见<a key="a" href="#merged-test">合并集作测试集</a></>],
            ["对比显示「数据已更新」", "基准或成员重新冻结过，或改过配对规则", <>重新对齐，见<a key="a" href="#stale">数据已更新和重新对齐</a></>],
            ["建对比或打开查看器提示没有可看的图片", "数据是 .npy 等非图片文件", "在训练环境转成图片，转好的目录登记成新版本，来源选原数据"],
            ["合并集里某个来源的图看不了", "那个成员不在 NAS 上", "按下面 not_on_nas 那一行处理这个成员"],
            ["提示请先在资源管理器里打开共享", "Windows 还没有对这个共享认证", "在资源管理器打开一次，再让 agent 重试"],
            ["工具回 not_on_nas", "位置没填 NAS 共享名，或数据在训练机本地盘", "前者找数据管理员补填；后者目前看不了图"],
            ["页面提示要打开查看器", "小服务已退出，或页面刷新后地址失效", "在 Claude Code 里再说一句「打开对比 X」，不会重新下载"],
            ["小服务在跑但图片全空", "浏览器没有允许访问本地网络", "地址栏左侧的站点设置里打开「本地网络访问」"],
            ["进评审页提示没有权限", "账号不属于任何项目", "找项目负责人加成员"],
            ["按空格没有反应", "鼠标不在图上，或光标在输入框里", "把鼠标移到图上再按"],
            ["窗口写「自动对齐：放大 N 倍、居中，相似度 0.xx」", "这一列和基准视野不同，按画面内容对齐的", "正常；相似度低于 0.8 时看一眼边缘对不对得上"],
            ["窗口写「自动对齐没找到对得上的位置」", "两列不是同一块画面，或者裁的位置既不在左上也不在中间；夜里的暗图也常对不上", "单独打开那张图看"],
            ["窗口写「按拍摄方向标记没转，和其他列一致」", "原图带转向标记，模型结果没转", "正常"],
            ["窗口写「宽高对调，多半是拍摄方向不一致」", "方向挑过了还是对不上", "把原图转正后另存为 PNG 再登记"],
            ["工具说「看图缓存设在 …，现在找不到这个文件夹」", "缓存换到了移动硬盘之类，盘没接上或盘符变了", <>接上盘再试，或者重开安装器换位置，见<a key="a" href="#cache">看图缓存放哪</a></>],
            ["拷图失败写「写不进看图缓存」", "缓存文件夹被删了、盘被拔掉，或者路径太长", "接上盘，或者在安装器里换一个浅一点的文件夹"],
            ["窗口写「放大 ×2 显示」", "这一列原图比别的列小，比如超分的输入", "正常，看到的像素块就是原图的像素"],
            ["报告里点备注只移了位置，没有框", "报告是 v0.3.88 以前导出的", "升级后重新导出"],
          ]}
        />
        <Maintainer title="引导流程写在哪里">
          <p>提问顺序写在 records 仓 <code>src/aiig_bridge/server.py</code> 的 <code>SERVER_INSTRUCTIONS</code>，由 MCP 的 <code>server/discover</code> 和 <code>initialize</code> 返回。它跟工具一起到每台电脑，所以没有做成技能文件：只装数据工具的电脑没有技能。改它要发同步程序和安装器。Claude Code 只读前 2048 个字符，测试钉了长度上限和里面提到的工具名。</p>
          <p>评审页对项目成员开放靠云端配置 <code>AIIG_DATA_CONSOLE_REVIEW_OPEN=1</code>，每个对象仍按项目成员校验。</p>
        </Maintainer>
      </>,
    },
  ],
};

export const mcp: DocPage = {
  group: "管理平台", label: "检索团队知识", title: "在会话中检索团队知识",
  intro: "Claude 可以在动手前检索授权范围内的历史知识，并在回答中给出可核对的知识编号和证据来源。",
  keywords: ["MCP", "search_knowledge", "get_knowledge", "related_knowledge", "diagnostic_logs"],
  sections: [
    {
      id: "where", title: "它装在哪里，怎么开始用",
      body: <>
        <p>安装器会在项目的 <code>.mcp.json</code> 里注册一个名为 <code>aiigovernance-records</code> 的本地服务。它跑在你自己的电脑上，随 Claude 会话启动，<b>不需要你手工开任何东西</b>。</p>
        <p>用法就是正常说话。想让 Agent 先查已有知识，直接要求即可：</p>
        <Code>{`先检索我们内部关于 Relay 死信重试的已有知识，再决定这次怎么改。`}</Code>
        <p>也可以点名某个具体工具，例如「用 knowledge_status 看看这个项目回流到哪一步了」。</p>
        <p>同一个服务里还有数据平台的 11 个工具（查项目、登记数据集等），见<a href={pageHref("data")}>使用数据平台</a>。</p>
      </>,
    },
    {
      id: "tools", title: "知识检索工具及其数据边界",
      body: <>
        <p>知识检索工具分为两类：<b>六个受治理的云端查询工具</b>由公司侧查询工作机执行，并逐次按数据权限授权；<b>本地诊断工具</b>只读取当前电脑的日志，数据不离开本机。</p>
        <Matrix
          head={["工具", "做什么", "什么时候用"]}
          rows={[
            [<code key="t">search_knowledge</code>, "检索当前有效、可复用的知识条目，返回证据定位符与包元数据", "最常用。想知道「这件事以前有没有人做过」"],
            [<code key="t">get_knowledge</code>, "取单条知识的完整内容及其 Task 包证据", "search 命中之后，要看某一条的细节"],
            [<code key="t">related_knowledge</code>, "取与某条知识相关的其他有效知识", "从一条已知结果继续查找相关经验"],
            [<code key="t">search_records</code>, "检索完整的受治理 Task 知识文档", "要看的不是提炼后的知识条目，而是当时那次任务的完整记录"],
            [<code key="t">list_projects</code>, "列出你可见的受治理项目", "跨项目检索前，先确认自己能看到哪些项目"],
            [<code key="t">knowledge_status</code>, "项目与 Task 包计数、最后入库时间、云端待处理批次", "确认回流是否正常，或某次任务是否已经入库"],
            [<code key="t">diagnostic_logs</code>, "读本机近期的 Sync Agent 错误（本地专属，不出本机）", "回流看起来卡住了，先自查本机同步日志"],
          ]}
        />
        <Maintainer title="为什么区分六个云端工具和一个本地工具"><p>六个云端工具与一个本地工具的信任边界不同：云端查询在本机签名并使用公司公钥端到端加密，公共 Relay 只传递密文；本地诊断工具不联网。</p></Maintainer>
      </>,
    },
    {
      id: "session", title: "一段示例会话",
      body: <>
        <p>下面是一次典型的「提问 → 检索命中 → 结果引用」。这里用排版好的对话样例而不是终端截图：终端截图信息密度低，版本一变就得重截，而对话内容本身才是要说明的东西。</p>
        <Chat title="示例：动手前先查已有知识">
          <You>Relay 的死信队列最近老是堆积，我想加个自动重试。动手前先查一下我们内部有没有相关经验。</You>
          <ToolCall tool="search_knowledge" args='query: "Relay 死信 重试"' />
          <ToolResult>
            <ul>
              <li><b>KI-2080　Relay 死信重试判定</b>　project: AIIGovernance　主题: governance　状态: 已通过</li>
              <li><b>KI-2081　回流游标恢复流程</b>　project: AIIGovernance　主题: testing　状态: 待审核</li>
            </ul>
          </ToolResult>
          <Agent>检索到两条相关知识，其中 KI-2080 已通过审核，直接对上了你要做的事。我取一下它的完整内容和证据。</Agent>
          <ToolCall tool="get_knowledge" args="knowledge_id: KI-2080" />
          <ToolResult>
            结论：死信<b>不自动重放</b>。判据是死信分两类——确定性错误（如 SQL 语义错误）重试多少次都不会成功，临时性错误才值得重试。证据定位符指向 Task 包 T-00147 的判定表与当时的失败样本。
          </ToolResult>
          <Agent>
            <p>先不要增加自动重试。团队里已有一条经过审核的结论（KI-2080）：死信必须先分类，自动重试确定性错误只会重复产生相同失败。</p>
            <p>建议改成两步：先按错误码把死信分成「确定性」和「临时性」两类，只有后者进重试队列并配退避；确定性错误保持人工确认后显式重试——这也正是管理平台运维总览现在的做法。</p>
            <p>出处：KI-2080《Relay 死信重试判定》，证据在 Task 包 T-00147。要我把这条判定表拉出来对照你现在的错误码吗？</p>
          </Agent>
        </Chat>
        <Note title="注意最后一段">受治理的回答会带出处。你可以拿着知识编号到<a href={pageHref("console")}>管理平台</a>上核对它的状态、贡献人和审核记录——这就是「证据生于设计」在使用侧的样子。</Note>
      </>,
    },
    {
      id: "visibility", title: "你能查到什么",
      body: <>
        <p>六个云端工具共用同一条可见性规则，它在公司侧执行，不由你的客户端决定：</p>
        <ul>
          <li>只返回状态为 <b>active</b> 的知识，且其 Task 包投影必须是当前的、已核验的、未撤回、未被取代。</li>
          <li>默认只能查到<b>你自己</b>的数据；跨用户查询需要公司数据库里的管理员授权。</li>
          <li>每次查询结果都绑定请求 ID、查询 ID、用户与工具，由公司侧签名后加密返回；客户端验签并核对全部绑定字段之后才确认收货。</li>
        </ul>
        <p>因此「查不到」通常有明确原因：知识还在待审核、已被归档或取代、或者不在你的权限范围内——不是检索失灵。</p>
      </>,
    },
    {
      id: "limits", title: "检索不出结果时",
      body: <div className="simple-table">
        <div><b>会话开始一段时间后集体失败</b><span>0.3.53 之前的后台令牌轮换竞态会让六个云端工具在会话中途开始返回 404。升级到 {"v0.3.53"} 或更高版本即可根治。</span></div>
        <div><b>结果里有中文就断开</b><span>同样是 0.3.53 之前的缺陷：非 ASCII 结果在部分终端编码下会打断连接。升级即可。</span></div>
        <div><b>一条都查不到</b><span>先用 <code>knowledge_status</code> 看回流有没有到位、有没有待处理批次；再用 <code>list_projects</code> 确认你能看到的项目范围。</span></div>
        <div><b>怀疑本机没在同步</b><span>用 <code>diagnostic_logs</code> 读本机近期的 Sync Agent 错误。这个工具不联网，能安全地先自查。</span></div>
      </div>,
    },
  ],
};
