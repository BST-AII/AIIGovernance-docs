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
  { slug: "upgrade", path: "/upgrade/", title: "升级、重装与修复" },
  { slug: "uninstall", path: "/uninstall/", title: "安全卸载治理组件" },
  { slug: "troubleshooting", path: "/troubleshooting/", title: "按现象排查问题" },
  { slug: "releases", path: "/releases/", title: "版本、安装包与校验信息" },
];

export const outputFileFor = (route) => route.slug
  ? `${route.slug}/index.html`
  : "index.html";
