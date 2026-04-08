# xvsf - 个人安全技术博客

基于 Hugo + PaperMod 主题构建的个人安全技术博客，专注于漏洞研究与代码审计。

## 技术栈

- [Hugo](https://gohugo.io/) — 静态站点生成器
- [PaperMod](https://github.com/adityatelange/hugo-PaperMod/) — 主题（深度定制）
- [GitHub Pages](https://pages.github.com/) — 托管
- [GitHub Actions](https://github.com/features/actions) — CI/CD 自动部署
- [Giscus](https://giscus.app/) — 基于 GitHub Discussions 的评论系统

## 功能特性

- 深色 / 浅色主题切换（10 种过渡动画效果）
- 侧边目录自动滚动跟踪高亮
- 代码块折叠 / 展开 + 一键复制
- 图片灯箱（Lightbox）查看
- 全文搜索 + 标签筛选
- 阅读进度条 + 环形回到顶部按钮
- 樱花飘落动画（桌面端，15 秒）
- 打字机效果首页
- KaTeX 数学公式支持
- Giscus 评论（主题自动跟随切换）
- 响应式设计 + 智能导航栏
- 随机文章跳转
- Konami Code 隐藏彩蛋

## 本地开发

### 前提条件

- [Hugo Extended](https://gohugo.io/installation/)（建议 v0.120+）
- [Git](https://git-scm.com/)

### 启动

```bash
# 克隆仓库（含子模块）
git clone --recurse-submodules <repo-url>
cd xvsf

# 启动本地开发服务器
hugo server --config hugo.yaml,hugo.development.yaml
```

访问 `http://localhost:1313/xvsf/`

### 新建文章

```bash
hugo new posts/文章标题.md
```

Front Matter 模板参考 [FRONTMATTER_TEMPLATE.md](FRONTMATTER_TEMPLATE.md)。

## 目录结构

```
├── archetypes/          # 文章模板
├── assets/css/extended/ # 自定义样式
├── content/posts/       # 博客文章（Markdown）
├── layouts/             # 自定义布局模板（覆盖主题）
│   ├── _default/        # 默认布局（文章页、列表页、归档、搜索等）
│   ├── partials/        # 可复用组件（TOC、元信息、评论等）
│   └── shortcodes/      # 自定义短代码
├── scripts/             # 工具脚本（Front Matter 规范化等）
├── static/              # 静态资源（图片、JS）
├── themes/PaperMod/     # PaperMod 主题（Git 子模块）
├── hugo.yaml            # 主配置
└── hugo.development.yaml # 本地开发配置
```

## 自定义短代码

| 短代码 | 用途 | 示例 |
|--------|------|------|
| `admonition` | 提示框 | `{{</* admonition tip "标题" */>}}内容{{</* /admonition */>}}` |
| `collapse` | 折叠代码块 | `{{</* collapse title="点击展开" */>}}代码{{</* /collapse */>}}` |
| `gallery` | 图片画廊 | `{{</* gallery cols=3 */>}}` |

提示框类型：`note` / `tip` / `warning` / `danger` / `info` / `success`

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

手动部署也可使用 `bushu.ps1` 脚本。

## License

MIT
