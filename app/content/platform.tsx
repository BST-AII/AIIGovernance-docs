import {
  Agent, Chat, Code, DocPage, Figure, FigureRow, Matrix, Note, ToolCall, ToolResult, Warn, You,
  consoleHref, consoleLoginHref, pageHref,
} from "../doc-kit";

export const consolePage: DocPage = {
  group: "知识平台", label: "管理平台使用说明", title: "AI 中台管理平台使用说明",
  intro: "管理平台是浏览器里的后台：看知识回流情况、审核与归类知识、管理账号与运行状态。它只呈现元数据，任何时候都不展示 Task 正文。",
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
        <Figure src="screenshots/console/services.png" alt="服务选择页" caption="服务选择页。卡片下方的数字由接口实时算出，不是页面里写死的常量；截图里的具体数值出自开发夹具。" source="console-fixture" />
        <p>进入某个服务之后，左侧边栏和顶栏才会出现；随时可以点左上角的品牌区或「切换服务」图标回到这一屏。</p>
      </>,
    },
    {
      id: "insight", title: "洞察区：看知识长成什么样",
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
      id: "admin", title: "管理区：审核与归类",
      body: <>
        <p>本节这三屏——知识管理、归类、批量审核——挂在知识审核能力（<code>knowledge:review</code>）上，「知识审核员」与「系统管理员」两档持有它。</p>
        <p>但顶栏那对「洞察 / 管理」切换按钮的出现条件比这一条宽，而且判的是能力不是角色：管理这一档下面挂着三项能力——知识管理（<code>knowledge:review</code>）、运行状态（<code>operations:read</code>）、系统诊断（<code>system:diagnose</code>），<b>命中其中任意一项，这对按钮就会渲染</b>，切过去的侧边栏也只列命中的那几项。所以遗留的「管理账号」（<code>console_admin</code>）进不了知识管理，却因为持有 <code>operations:read</code> 而照样看得见这对切换，切过去侧边栏里只有「运行状态」一项。三项一个都不命中的普通账号，这对按钮<b>根本不渲染</b>，不是灰掉。</p>
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
      id: "accounts-screen", title: "账号服务",
      body: <>
        <p>账号服务是平台级服务，从顶栏的服务切换器进入，不在知识平台的侧边栏里。<b>能不能看见它，由账号管理能力（<code>accounts:manage</code>）决定，不是由「系统管理员」这一个角色决定</b>：系统管理员有这项能力，遗留的「管理账号」（<code>console_admin</code>）也有；其余账号连入口都不渲染。</p>
        <Figure src="screenshots/console/accounts.png" alt="账号管理" caption="账号管理：左侧是账号清单（GitHub 身份、角色、状态、session epoch）与「改角色 / 暂停」两个动作；右侧是开通申请与预开通两块面板。右上那块面板自己写着「这张表恒为空」，底下却列着一条 bst-chenkai：那条记录是开发夹具造的，生产上不会有——原因见下。" source="console-fixture" />
        <p>左侧账号表是这一屏真正在用的部分：改角色、暂停与恢复都在这里，两种动作都会把该账号已经发出去的会话当场作废。账号身份取自 GitHub 的不可变数字 ID，不能修改。所有变更都要求填写原因并写入审计日志。</p>
        <Warn title="右侧的「待开通申请」在当前部署里恒为空">审批式开通在服务端实现完整，但它挂在一个默认关闭的开关（<code>AIIG_CONSOLE_REQUIRE_ACCOUNT_APPROVAL</code>）上，当前生产部署没有打开它。因此组织成员首次登录会被直接开通成 active 账号，<b>不会产生任何待批申请</b>——这块面板在生产上只会显示「当前没有待处理的开通申请」。同一列下方的「预开通账号」标着「待接入」：按 GitHub 登录名直接建账号需要一个创建端点，v2 契约还没有提供。</Warn>
        <p>角色与状态的完整规则见<a href={pageHref("account")}>平台账号与权限</a>。</p>
      </>,
    },
    {
      id: "ops", title: "运行状态与系统诊断",
      body: <>
        <p>这两屏面向维护者，两道门并不一样：运行状态的入口要 <code>operations:read</code>（系统管理员与遗留的「管理账号」都有），系统诊断整屏要 <code>system:diagnose</code>，<b>只有系统管理员有</b>。知识审核员两屏都进不去。</p>
        <p>但「进得去运行状态」不等于「看得见下面这张图」：<b>这一屏里还有第二道门，判的同样是 <code>system:diagnose</code></b>。服务健康、主机资源、队列与速率、分析器这四个区，连同死信表与重试动作，都只发给系统管理员——服务端把这几条接口整条挂在系统管理员上，不做字段级降级，理由是把逐家族密钥、各主机挂载点这类内部状态按字段挖空之后剩下的空壳既没有运维价值，「这里本来有东西」本身又是一次泄露。所以只持有 <code>operations:read</code> 的「管理账号」进到这一屏，看到的是顶部那四个队列总量（待处理、执行中、最旧等待、死信），四区与死信表的位置各是一块权限提示，写明这两块内容只对系统管理员开放。</p>
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
  group: "知识平台", label: "平台账号与权限", title: "平台账号与权限",
  intro: "管理平台不自助注册、不发邀请码，也没有开通申请这一步：门禁本身就是 GitHub 组织成员资格——BST-AII 组织的 active 成员首次登录即自动获得一个可用账号，拿到哪一档取决于你在组织里是普通成员还是 owner，再往上的角色由管理员单独授予。",
  sections: [
    {
      id: "who", title: "谁能登录",
      body: <>
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
          <li><b>账号被自动开通。</b>核验通过而平台上查不到你的账号时，平台按你的 GitHub 数字 ID 直接建一个状态为 <b>active</b> 的账号。没有人工介入，也没有排队。</li>
          <li><b>同一次登录直接放行。</b>平台随即签发会话 Cookie，把你落到服务选择页，按角色显示你能进的服务。</li>
        </ol>
        <Note title="没有「提交申请」，也没有「等待审批」">这两步在服务端确实实现了，但它们挂在一个默认关闭的开关上，当前生产部署没有打开——所以你不会看到申请表单、不会看到等待页面，账号服务里也不会出现待批申请。真正拦人的是上面第 2 步的组织成员资格核验。</Note>
      </>,
    },
    {
      id: "gate", title: "那门禁在哪",
      body: <>
        <p>自动开通不等于没有门禁。管住这个平台的是另外三样东西，它们都在服务端执行：</p>
        <div className="simple-table">
          <div><b>GitHub 组织成员资格</b><span>这是第一道也是最主要的一道门。谁能进 BST-AII 组织，由 GitHub 侧的组织管理员决定；平台每次登录都重新核对，不缓存这个结论。</span></div>
          <div><b>账号状态机</b><span>账号被改成 suspended 或 revoked 后，该账号已经发出去的<b>全部会话当场作废</b>，不必等 Cookie 过期。只有 active 状态能登录。</span></div>
          <div><b>角色授予</b><span>自动开通按你在 GitHub 组织里的成员角色发档：普通成员（member）落到普通账号，<b>组织 owner（成员角色为 admin）落到遗留的「管理账号」</b>，那一档带账号服务与运行状态两项能力（详见下一节的注）。知识审核员这一档自动开通给不出来，要管理员在账号服务里显式授予；每次角色变更都要填原因、写审计日志、使该账号现有会话失效。</span></div>
        </div>
        <p>换句话说：<b>门禁在组织名册和角色授予上，不在开通环节</b>。想收回一个人的访问权，正确动作是把他移出 GitHub 组织，或把账号改成 suspended / revoked——两者都立刻生效。</p>
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
        <Note title="一个例外：GitHub 组织 owner">自动开通读的是你在 GitHub 组织里的成员角色。普通成员（member）落到普通账号；<b>组织 owner（成员角色为 admin）会被映射成遗留的「管理账号」（<code>console_admin</code>）</b>——这一档拿到的是账号服务与运行状态两项能力（<code>accounts:manage</code>、<code>operations:read</code>）。它<b>进不了系统诊断</b>：那一屏要 <code>system:diagnose</code>，只发给系统管理员。运行状态那一屏它进得去，但只看得到顶部的队列总量——四区与死信表在屏内另有一道 <code>system:diagnose</code> 的门，详见<a href={pageHref("console")}>管理平台使用说明</a>。它也进不了知识管理，那条轴的授权是知识审核员。这是为早期账号保留的兼容档，不在上表三档之内。所以「组织 owner」这件事本身是有权重的：把谁设成 GitHub 组织 owner，等于同时给了他这个平台的账号管理入口。</Note>
      </>,
    },
    {
      id: "elevation", title: "系统管理员：双人复核，外加一条部署名单",
      body: <>
        <p><b>系统管理员这一档不能通过账号服务直接授予。</b>它必须走双人复核：一名管理员发起提名，再由<b>另一名</b>管理员确认——系统会拒绝自己确认自己发起的提名。</p>
        <p>这条规则不是流程建议，而是写在权限代码里的硬约束：可直接授予的角色集合被定义为「全部角色减去系统管理员」，请求里带上这一档会被当场拒绝。</p>
        <Warn title="有一条部署配置旁路，不经过账号服务">上面两条管的是账号表里的角色。还有一条路绕开账号表：部署时可以在环境变量 <code>AIIG_CONSOLE_SYSTEM_ADMIN_GITHUB_USER_IDS</code> 里列出若干 GitHub 数字 ID，<b>名单内的 ID 只要持有「管理账号」（<code>console_admin</code>），就直接按系统管理员放行</b>——账号表里那一行始终写着 console_admin，这次提升不落库。而且它不是登录时算一次就定下来的：签发会话时算一次，此后<b>每一个请求校验会话时都重算一次</b>。所以提升是对这个 ID 生效的，不是对某一次会话——他手上已有的全部会话立刻都是系统管理员；反过来，把 ID 从名单里删掉，他<b>下一次请求就掉回「管理账号」</b>，不必等会话过期，也不必让他重新登录。当前生产部署确实在用这份名单。把两件事接起来看：组织 owner 首次登录自动拿到 console_admin，如果他的 ID 又在这份名单里，那么他<b>第一次登录拿到的就是系统管理员会话，全程没有第二个人复核</b>。所以这份名单要按最高权限来管——改它是改部署配置并重启服务，不是在账号服务里点两下，也不会留下账号服务里的那条审计记录。</Warn>
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

export const mcp: DocPage = {
  group: "知识平台", label: "在会话里检索知识", title: "在会话里检索已有知识",
  intro: "装好治理框架的项目自带一组受治理的检索工具，让 Claude 在动手之前先查团队已经沉淀下来的知识，并在回答里给出可核对的出处。",
  sections: [
    {
      id: "where", title: "它装在哪里，怎么开始用",
      body: <>
        <p>安装器会在项目的 <code>.mcp.json</code> 里注册一个名为 <code>aiigovernance-records</code> 的本地服务。它跑在你自己的电脑上，随 Claude 会话启动，<b>不需要你手工开任何东西</b>。</p>
        <p>用法就是正常说话。想让 Agent 先查已有知识，直接要求即可：</p>
        <Code>{`先检索我们内部关于 Relay 死信重试的已有知识，再决定这次怎么改。`}</Code>
        <p>也可以点名某个具体工具，例如「用 knowledge_status 看看这个项目回流到哪一步了」。</p>
      </>,
    },
    {
      id: "tools", title: "七个工具：六个查云端，一个查本机",
      body: <>
        <p>桥一共暴露七个工具。<b>前六个是受治理的云端查询工具</b>，由公司侧的查询工作机执行，逐次按你的数据权限授权；<b>第七个是本地专属的诊断工具</b>，只读你这台电脑上的日志，数据不出本机。</p>
        <Matrix
          head={["工具", "做什么", "什么时候用"]}
          rows={[
            [<code key="t">search_knowledge</code>, "检索当前有效、可复用的知识条目，返回证据定位符与包元数据", "最常用。想知道「这件事以前有没有人做过」"],
            [<code key="t">get_knowledge</code>, "取单条知识的完整内容及其 Task 包证据", "search 命中之后，要看某一条的细节"],
            [<code key="t">related_knowledge</code>, "取与某条知识相关的其他有效知识", "顺着一条线索往外扩，找相邻经验"],
            [<code key="t">search_records</code>, "检索完整的受治理 Task 知识文档", "要看的不是提炼后的知识条目，而是当时那次任务的完整记录"],
            [<code key="t">list_projects</code>, "列出你可见的受治理项目", "跨项目检索前，先确认自己能看到哪些项目"],
            [<code key="t">knowledge_status</code>, "项目与 Task 包计数、最后入库时间、云端待处理批次", "确认回流是否正常，或某次任务是否已经入库"],
            [<code key="t">diagnostic_logs</code>, "读本机近期的 Sync Agent 错误（本地专属，不出本机）", "回流看起来卡住了，先自查本机同步日志"],
          ]}
        />
        <Note title="为什么强调「六 + 一」">六个云端工具与一个本地工具的信任边界完全不同：前者的每次查询都在你的电脑上签名、用公司公钥端到端加密，公共中继只搬密文；后者根本不联网。把它们笼统说成「七件套」会掩盖这个区别。</Note>
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
            <p>先别加自动重试。团队里已经有一条经过审核的结论（KI-2080）：死信必须先分类，确定性错误自动重放只会把同一个错误刷成一屏噪声。</p>
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
