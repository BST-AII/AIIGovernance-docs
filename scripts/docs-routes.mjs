export const docsRoutes = [
  { slug: "", path: "/", title: "让 AI 在项目规则内工作" },
  { slug: "installation", path: "/installation/", title: "安装并验证 AIIGovernance" },
  { slug: "robot", path: "/robot/", title: "为项目接入飞书机器人" },
  { slug: "usage", path: "/usage/", title: "在项目中开始一次任务" },
  { slug: "architecture", path: "/architecture/", title: "治理框架如何工作" },
  { slug: "laws", path: "/laws/", title: "任务会加载哪些规则" },
  { slug: "skills", path: "/skills/", title: "使用和管理 Skills" },
  { slug: "console", path: "/console/", title: "使用管理平台" },
  { slug: "account", path: "/account/", title: "账号、角色与访问权限" },
  { slug: "mcp", path: "/mcp/", title: "在会话中检索团队知识" },
  { slug: "data", path: "/data/", title: "登记和查找数据集" },
  { slug: "data-web", path: "/data-web/", title: "在网页上登记数据" },
  { slug: "data-agent", path: "/data-agent/", title: "用对话登记数据" },
  { slug: "data-review", path: "/data-review/", title: "查看数据和结果对比" },
  { slug: "data-transfer", path: "/data-transfer/", title: "在两地之间收发数据" },
  { slug: "upgrade", path: "/upgrade/", title: "升级、重装与修复" },
  { slug: "uninstall", path: "/uninstall/", title: "安全卸载治理组件" },
  { slug: "troubleshooting", path: "/troubleshooting/", title: "按现象排查问题" },
  { slug: "releases", path: "/releases/", title: "版本、安装包与校验信息" },
];

export const outputFileFor = (route) => route.slug
  ? `${route.slug}/index.html`
  : "index.html";
