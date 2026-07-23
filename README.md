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

- [Hugo Extended](https://gohugo.io/installation/) v0.162.0
- [Node.js](https://nodejs.org/) v24.18.0
- [Git](https://git-scm.com/)

### 启动

```bash
# 克隆仓库（含子模块）
git clone --recurse-submodules <repo-url>
cd xvsf

# 启动本地开发服务器
npm ci
hugo server --environment development
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
├── config/              # Hugo 分层配置和 CMS 可编辑网站设置
├── content/posts/       # 博客文章（Markdown）
├── data/                # 分类、标签、友情链接和构建数据
├── layouts/             # 自定义布局模板（覆盖主题）
│   ├── _default/        # 默认布局（文章页、列表页、归档、搜索等）
│   ├── partials/        # 可复用组件（TOC、元信息、评论等）
│   └── shortcodes/      # 自定义短代码
├── scripts/             # 工具脚本（Front Matter 规范化等）
├── static/              # 静态资源（图片、JS）
├── themes/PaperMod/     # PaperMod 主题（Git 子模块）
└── .pages.yml           # Pages CMS 后台模型与操作
```

## 自定义短代码

| 短代码 | 用途 | 示例 |
|--------|------|------|
| `admonition` | 提示框 | `{{</* admonition tip "标题" */>}}内容{{</* /admonition */>}}` |
| `collapse` | 折叠代码块 | `{{</* collapse title="点击展开" */>}}代码{{</* /collapse */>}}` |
| `gallery` | 图片画廊 | `{{</* gallery cols=3 */>}}` |

提示框类型：`note` / `tip` / `warning` / `danger` / `info` / `success`

## 部署

推送到 `main` 分支后，GitHub Actions 会先运行 Front Matter、内容质量、HTML 和链接检查，再部署到 GitHub Pages。定时任务每小时第 7、22、37、52 分钟重新构建，使 `publishDate` / `expiryDate` 自动生效。

Pages CMS 后台可以管理文章、网站设置、分类与标签词库、友情链接和图片，并可触发受 Cloudflare Access 保护的草稿预览。

手动部署也可使用 `bushu.ps1` 脚本。

## License

MIT
