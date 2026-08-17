"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SearchEntry = {
  title: string;
  context: string;
  href: string;
  searchText: string;
  page: boolean;
};

export type NavGroup = {
  label: string;
  links: { label: string; href: string; current: boolean }[];
};

const normalize = (value: string) => value.trim().toLocaleLowerCase("zh-CN");

export function DocsControls({
  entries,
  groups,
  homeHref,
  mirrorHref,
  repositoryHref,
}: {
  entries: SearchEntry[];
  groups: NavGroup[];
  homeHref: string;
  mirrorHref: string;
  repositoryHref: string;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const needle = normalize(query);
    const source = needle
      ? entries.filter(entry => normalize(entry.searchText).includes(needle))
      : entries.filter(entry => entry.page);
    return source.slice(0, 12);
  }, [entries, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenuOpen(false);
        setQuery("");
        setActive(0);
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [searchOpen]);

  const openSearch = () => {
    setMenuOpen(false);
    setQuery("");
    setActive(0);
    setSearchOpen(true);
  };

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(value => Math.min(value + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(value => Math.max(value - 1, 0));
    } else if (event.key === "Enter" && results[active]) {
      window.location.assign(results[active].href);
    }
  };

  return <>
    <div className="header-tools desktop-tools">
      <button className="search-trigger" type="button" onClick={openSearch} aria-label="搜索文档">
        <span aria-hidden="true">⌕</span><span>搜索文档</span><kbd>Ctrl K</kbd>
      </button>
      <a href={homeHref}>使用说明</a>
      <a href={mirrorHref}>国内镜像</a>
      <a href={repositoryHref}>GitHub ↗</a>
    </div>
    <div className="mobile-tools">
      <button type="button" onClick={openSearch} aria-label="搜索文档">⌕</button>
      <button type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="mobile-site-menu">菜单</button>
    </div>

    {menuOpen ? <div className="mobile-menu" id="mobile-site-menu">
      <div className="mobile-menu-head"><b>文档导航</b><button type="button" onClick={() => setMenuOpen(false)} aria-label="关闭菜单">×</button></div>
      <nav aria-label="移动端文档导航">
        {groups.map(group => <section key={group.label}>
          <h3>{group.label}</h3>
          {group.links.map(link => <a className={link.current ? "current" : ""} href={link.href} key={link.href}>{link.label}</a>)}
        </section>)}
      </nav>
      <div className="mobile-external"><a href={homeHref}>使用说明</a><a href={mirrorHref}>国内镜像</a><a href={repositoryHref}>GitHub</a></div>
    </div> : null}

    {searchOpen ? <div className="search-backdrop" onMouseDown={event => {
      if (event.currentTarget === event.target) setSearchOpen(false);
    }}>
      <section className="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <div className="search-head">
          <label id="search-title" htmlFor="docs-search">搜索文档</label>
          <button type="button" onClick={() => setSearchOpen(false)} aria-label="关闭搜索">×</button>
        </div>
        <input
          id="docs-search"
          ref={inputRef}
          value={query}
          onChange={event => { setQuery(event.target.value); setActive(0); }}
          onKeyDown={onSearchKeyDown}
          placeholder="输入页面、功能或错误关键词"
          autoComplete="off"
        />
        <div className="search-results" role="listbox" aria-label="搜索结果">
          {results.map((entry, index) => <a
            className={index === active ? "active" : ""}
            href={entry.href}
            key={`${entry.href}-${entry.title}`}
            role="option"
            aria-selected={index === active}
            onMouseEnter={() => setActive(index)}
          ><b>{entry.title}</b><span>{entry.context}</span></a>)}
          {!results.length ? <p>没有匹配内容，请换一个关键词。</p> : null}
        </div>
        <div className="search-help"><span>↑↓ 选择</span><span>Enter 打开</span><span>Esc 关闭</span></div>
      </section>
    </div> : null}
  </>;
}
