"use client";

import { useMemo, useState } from "react";
import { wildSkills } from "./wildskills-data";

const labels: Record<string, string> = {
  "pm-ai-shipping": "AI 交付与审计",
  "pm-data-analytics": "数据分析",
  "pm-execution": "产品执行",
  "pm-go-to-market": "市场进入",
  "pm-market-research": "市场研究",
  "pm-marketing-growth": "营销与增长",
  "pm-product-discovery": "产品发现",
  "pm-product-strategy": "产品战略",
  "pm-toolkit": "产品工具箱",
  "doc-reader": "文档处理",
  "pm": "PM 工作流",
  "skill-creator": "Skill 开发",
  "version-mgmt": "版本与治理",
  "external": "外部扩展",
};

export function SkillCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const categories = useMemo(() => Array.from(new Set(wildSkills.map(skill => skill.category))).sort(), []);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return wildSkills.filter(skill => (category === "all" || skill.category === category) &&
      (!needle || `${skill.name} ${skill.description} ${labels[skill.category] || skill.category}`.toLowerCase().includes(needle)));
  }, [query, category]);
  const grouped = useMemo(() => categories.map(key => ({
    key, skills: visible.filter(skill => skill.category === key),
  })).filter(group => group.skills.length), [categories, visible]);

  return <div className="skill-catalog">
    <div className="catalog-summary"><b>{wildSkills.length} 个 Skills</b><span>{categories.length} 个类别 · 来源于 BST-AII/Wildskills</span></div>
    <div className="catalog-controls">
      <label><span>搜索</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="名称、用途或关键词" /></label>
      <label><span>类别</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">全部类别</option>{categories.map(key => <option key={key} value={key}>{labels[key] || key}</option>)}</select></label>
    </div>
    <p className="catalog-result">当前显示 {visible.length} 个 Skill</p>
    {grouped.map(group => <section className="skill-group" key={group.key}>
      <h3>{labels[group.key] || group.key}<span>{group.skills.length}</span></h3>
      <div className="skill-list">{group.skills.map(skill => <article key={skill.path}>
        <div><code>{skill.name}</code><a href={skill.href}>查看 SKILL.md ↗</a></div>
        <p>{skill.description || "该 Skill 的用途说明请查看源文件。"}</p>
        <small>{skill.path}</small>
      </article>)}</div>
    </section>)}
    {!visible.length && <div className="catalog-empty">没有匹配的 Skill，请更换关键词或类别。</div>}
  </div>;
}
