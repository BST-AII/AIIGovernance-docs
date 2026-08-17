/* 文档站的外壳与页面注册表。
 * 正文内容按分组放在 app/content/ 下，共用的排版组件在 app/doc-kit.tsx。 */

import { basePath, domesticMirrorHref, pageHref, type DocPage } from "./doc-kit";
import { DocsControls, type NavGroup, type SearchEntry } from "./docs-controls";
import { installation, overview, robot } from "./content/getting-started";
import { architecture, laws, skills, usage } from "./content/framework";
import { account, consolePage, mcp } from "./content/platform";
import { troubleshooting, uninstall, upgrade } from "./content/maintenance";
import { releases } from "./content/reference";

const pages: Record<string, DocPage> = {
  overview, installation, robot,
  architecture, laws, skills, usage,
  console: consolePage, account, mcp,
  upgrade, uninstall, troubleshooting,
  releases,
};

export const docSlugs = Object.keys(pages).filter((slug) => slug !== "overview");

const groups = ["快速开始", "使用指南", "管理平台", "维护", "参考"];

/* 左侧栏与上下翻页共用这一份顺序。 */
const order = [
  "overview", "installation", "robot",
  "usage", "architecture", "laws", "skills",
  "console", "account", "mcp",
  "upgrade", "uninstall", "troubleshooting",
  "releases",
];

/* 顶部分类导航：每个分组指向它的第一页。 */
const categories: { label: string; slug: string }[] = [
  { label: "快速开始", slug: "overview" },
  { label: "使用指南", slug: "usage" },
  { label: "管理平台", slug: "console" },
  { label: "维护", slug: "upgrade" },
  { label: "版本与下载", slug: "releases" },
];

export function DocsPage({ slug }: { slug: string }) {
  const page = pages[slug] || pages.overview;
  const position = order.indexOf(slug);
  const previous = position > 0 ? order[position - 1] : null;
  const next = position >= 0 && position < order.length - 1 ? order[position + 1] : null;
  const activeGroup = page.group;
  const navGroups: NavGroup[] = groups.map(group => ({
    label: group,
    links: order.filter(key => pages[key].group === group).map(key => ({
      label: pages[key].label,
      href: pageHref(key),
      current: key === slug,
    })),
  }));
  const searchEntries: SearchEntry[] = order.flatMap(key => {
    const entry = pages[key];
    const pageEntry = {
      title: entry.title,
      context: entry.intro,
      href: pageHref(key),
      searchText: [entry.title, entry.label, entry.intro, ...(entry.keywords ?? [])].join(" "),
      page: true,
    };
    return [pageEntry, ...entry.sections.map(section => ({
      title: section.title,
      context: entry.title,
      href: `${pageHref(key)}#${section.id}`,
      searchText: [section.title, entry.title, entry.label, ...(entry.keywords ?? [])].join(" "),
      page: false,
    }))];
  });

  return <div className="docs-site">
    <header className="docs-header">
      <a className="docs-brand" href={pageHref("overview")}><img src={`${basePath}/app-icon.png`} alt=""/><span>AIIGovernance</span><em>Docs</em></a>
      <DocsControls entries={searchEntries} groups={navGroups} homeHref={pageHref("overview")} mirrorHref={domesticMirrorHref} repositoryHref="https://github.com/BST-AII/AIIGovernance-docs" />
    </header>
    <nav className="category-nav" aria-label="文档分类">
      {categories.map(category => <a
        key={category.slug}
        className={pages[category.slug].group === activeGroup ? "current" : ""}
        href={pageHref(category.slug)}
      >{category.label}</a>)}
    </nav>
    <div className="docs-grid">
      <aside className="left-nav">
        {groups.map(group => <section key={group}><h3>{group}</h3>{order.filter(key => pages[key].group === group).map(key => <a className={key === slug ? "current" : ""} href={pageHref(key)} key={key}>{pages[key].label}</a>)}</section>)}
      </aside>
      <main className="article">
        <div className="article-label">{page.group}</div><h1>{page.title}</h1><p className="article-intro">{page.intro}</p>
        <details className="mobile-page-toc"><summary>本页导航</summary>{page.sections.map(section => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</details>
        {page.sections.map(section => <section className="article-section" id={section.id} key={section.id}><h2><a href={`#${section.id}`}>#</a>{section.title}</h2>{section.body}</section>)}
        <nav className="page-turn">{previous ? <a href={pageHref(previous)}><span>上一页</span><b>← {pages[previous].label}</b></a> : <i/>}{next ? <a className="next" href={pageHref(next)}><span>下一页</span><b>{pages[next].label} →</b></a> : null}</nav>
      </main>
      <aside className="right-nav"><h3>本页内容</h3>{page.sections.map(section => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}<div><a href="https://github.com/BST-AII/AIIGovernance-docs">查看网页仓库 ↗</a></div></aside>
    </div>
    <footer className="docs-footer"><span>治理落入代码，证据生于设计</span><small>Governance as code. Evidence by design.</small></footer>
  </div>;
}
