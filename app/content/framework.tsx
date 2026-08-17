import { Code, DocPage, Note, pageHref } from "../doc-kit";
import { SkillCatalog } from "../skill-catalog";

export const architecture: DocPage = {
  group: "使用指南", label: "治理如何工作", title: "治理框架如何工作",
  intro: "了解规则如何加载、任务如何执行，以及事实记录和决策记录如何共同形成审计证据。",
  keywords: ["Law", "Spec", "Execution", "Task", "审计", "知识回流"],
  sections: [
    {
      id: "layers", title: "三层治理模型",
      body: <div className="simple-table"><div><b>Law</b><span>定义什么不可违反：基本法、编码法、治理法、PM 法与审计法。</span></div><div><b>Spec</b><span>定义规则如何运转：记录、路由、工作区、初始化和 Skill 规范。</span></div><div><b>Execution</b><span>负责执行和核验：Hooks、bootstrap、check.py、gen_views.py 和安装器。</span></div></div>,
    },
    {
      id: "deployment", title: "项目级部署",
      body: <><p>每个项目在 <code>.governance/</code> 下独立挂载 AIIGovernance 和 Wildskills，并通过 Git submodule 钉定版本。离线安装使用内置 Git bundle，安装结束后远端地址指回 GitHub。</p><Code>{`.governance/AIIGovernance\n.governance/Wildskills\n.claude/settings.local.json\n.claude/skills/\nrecords/\ntools/python/`}</Code></>,
    },
    {
      id: "flow", title: "任务治理流程",
      body: <ol><li>收到任务并完成职能分诊。</li><li>加载基本法和对应业务法。</li><li>明确目标、验收标准与验证手段。</li><li>执行任务，Hooks 写事件，Agent 写决策。</li><li>运行机械核验，交由用户验收并归档。</li></ol>,
    },
    {
      id: "evidence", title: "双流水与派生视图",
      body: <p><code>events.jsonl</code> 保存 Hooks 观察到的事实；<code>decisions.jsonl</code> 保存 Agent 申报的判断。<code>board.md</code> 和任务视图由两条原始流水生成，可以随时重建。</p>,
    },
    {
      id: "backflow", title: "知识如何安全回流",
      body: <>
        <p>项目内的记录不会自己跑到云上。后台 Sync Agent 只上传完整的 JSONL 行，在你的电脑上签名并用公司公钥端到端加密，公共 Relay 只承担密文队列的角色——它看不到内容。公司侧独立核验设备绑定与数据权限后入库，Agent 收到入库确认才推进游标。</p>
        <p>入库之后的知识去两个地方：一是<a href={pageHref("console")}>管理平台</a>供人查看与审核，二是通过<a href={pageHref("mcp")}>受治理的检索工具</a>回到会话里被复用。</p>
      </>,
    },
  ],
};

export const laws: DocPage = {
  group: "使用指南", label: "规则与 Skills", title: "任务会加载哪些规则",
  intro: "所有任务遵守共同的基本规则，并根据工作类型加载对应的业务规则。",
  keywords: ["基本法", "业务法", "coding", "governance", "pm", "audit", "Skills"],
  sections: [
    {
      id: "constitution", title: "基本法",
      body: <p><code>law/constitution.md</code> 按“接收任务、开始前、执行中、交付和高风险操作”组织，覆盖分诊、任务定义、用户确认、范围控制、验证和诚实申报。</p>,
    },
    {
      id: "business-laws", title: "三部业务法",
      body: <div className="simple-table"><div><b>coding_law</b><span>代码修改、测试、缺陷修复、提交质量和工程边界。</span></div><div><b>governance_law</b><span>修改法条、Spec、Hooks 和治理框架自身时适用。</span></div><div><b>pm_law</b><span>需求澄清、PRD、多任务协调和验收管理。</span></div></div>,
    },
    {
      id: "audit-law", title: "审计法",
      body: <p><code>audit_law.md</code> 保留审计复核所需的独立性、可追踪性、禁止猜测和限制声明；未挂载条款不会在普通任务中增加上下文负担。</p>,
    },
    {
      id: "routing", title: "业务法如何加载",
      body: <><p>Agent 先按 <code>spec/route_spec.md</code> 判断职能。一个会话第一次进入某职能时读取对应业务法；无法归类的组织性事务只使用基本法。</p><Note title="按需加载">业务法不是每次全量阅读，路由决定本次任务真正需要的规则。</Note></>,
    },
  ],
};

export const skills: DocPage = {
  group: "使用指南", label: "Skill 目录", title: "使用和管理 Skills",
  intro: "Skills 为 Agent 提供可复用的专业能力，治理框架负责发现、加载并约束其使用范围。",
  keywords: ["Wildskills", "Skill", "技能", "目录", "调用"],
  sections: [
    {
      id: "location", title: "Skills 安装在哪里",
      body: <p>技能库挂载在 <code>.governance/Wildskills</code>，安装器再把可用 Skill 接入 <code>.claude/skills/</code>。目标项目保留自己的版本钉定，不依赖全局安装。</p>,
    },
    {
      id: "discovery", title: "如何发现 Skill",
      body: <p>Claude Code 会从项目级 Skills 目录读取可用能力。治理框架通过 <code>spec/skill_spec.md</code> 保存注册和使用约定，避免出现同一能力的多份手工清单。</p>,
    },
    {
      id: "selection", title: "什么时候应该使用 Skill",
      body: <ul><li>用户明确点名某个 Skill 时必须使用。</li><li>任务与 Skill 描述明确匹配时按需使用。</li><li>使用前读取对应 <code>SKILL.md</code> 的完整说明。</li><li>Skill 不能扩大用户授权范围。</li></ul>,
    },
    {
      id: "catalog", title: "浏览 Skill 目录",
      body: <><p>目录直接读取 Wildskills 仓库中全部 <code>SKILL.md</code> 的元数据。先搜索名称、用途或关键词，再按需展开对应类别。</p><SkillCatalog /></>,
    },
    {
      id: "add", title: "增加或升级 Skill",
      body: <p>在 Wildskills 中维护 Skill 源，再更新目标项目的 Wildskills submodule 和项目接线。不要直接手改生成后的 <code>.claude/skills</code> 副本。</p>,
    },
  ],
};

export const usage: DocPage = {
  group: "使用指南", label: "日常使用", title: "在项目中开始一次任务",
  intro: "在项目目录中启动 Claude Code，然后用自然语言说明目标、验收标准和限制条件。",
  keywords: ["Claude Code", "任务", "验收标准", "Skill", "知识检索"],
  sections: [
    {
      id: "start-session", title: "进入治理项目",
      body: <><Code>{`cd your-project\nclaude`}</Code><p>新会话读取项目根目录的 <code>CLAUDE.md</code>，再进入治理框架的基本法与会话初始化流程。首条回复出现“治理已加载”表示接线正常。</p></>,
    },
    {
      id: "automatic", title: "自然语言自动调用",
      body: <><p>直接描述任务即可，例如：</p><Code>{`帮我修复登录接口的超时问题，验收标准是现有测试通过并新增一个超时回归测试。`}</Code><p>框架会将任务路由到 coding 职能，读取编码业务法，建立任务记录并按工作流执行。</p></>,
    },
    {
      id: "explicit-skill", title: "明确指定 Skill",
      body: <><p>需要固定能力时可以直接点名：</p><Code>{`请使用 security-review Skill 检查这次认证模块修改，并列出可复现证据。`}</Code><p>Agent 应先读取对应 Skill 的说明，再在治理规则限定的范围内执行。</p></>,
    },
    {
      id: "knowledge", title: "让它先查已有知识",
      body: <><p>装了治理框架的项目还带着一套受治理的检索工具。想让 Agent 动手前先看看别人踩过的坑，直接说出来即可：</p><Code>{`先检索我们内部关于这个错误的已有知识，再决定怎么改。`}</Code><p>完整的工具清单和一段示例会话见<a href={pageHref("mcp")}>在会话里检索知识</a>。</p></>,
    },
    {
      id: "check", title: "手动运行核验",
      body: <Code>{`.\\tools\\python\\python.exe .governance\\AIIGovernance\\tool\\check.py --lint\n.\\tools\\python\\python.exe .governance\\AIIGovernance\\tool\\check.py --run`}</Code>,
    },
  ],
};
