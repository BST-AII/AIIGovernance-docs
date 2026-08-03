# AIIGovernance Docs

AIIGovernance 的公开文档站源码，使用 Next.js 静态导出并部署到 GitHub Pages。

- 在线地址：https://bst-aii.github.io/AIIGovernance-docs/
- 治理框架：`BST-AII/Wildmeerkat`（组织内部 Private）
- 安装器：`BST-AII/AIIGovernance-installer`（组织内部 Private）
- 安装包：`BST-AII/AIIGovernance-releases`（组织内部 Private）

## 本地开发

```bash
npm ci
npm run dev
```

访问 `http://localhost:3000`。

## 验证 GitHub Pages 构建

```powershell
$env:GITHUB_PAGES_BUILD = "true"
$env:NEXT_PUBLIC_BASE_PATH = "/AIIGovernance-docs"
npm test
```

向 `main` 推送后，`.github/workflows/deploy-pages.yml` 会自动构建并发布，
不需要提交 `out/` 或其他构建产物。
