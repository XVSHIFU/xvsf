# xvsf · 个人安全技术博客

记录安全研究、漏洞分析、代码审计与开发实践。基于 Hugo + PaperMod 构建，使用 GitHub Pages 托管、GitHub Actions 验证和部署。

[访问博客](https://xvshifu.github.io/xvsf/) · [项目](https://xvshifu.github.io/xvsf/projects/) · [友链](https://xvshifu.github.io/xvsf/links/)

## 页面与功能

- 文章阅读：章节目录、代码折叠与复制、图片灯箱、Mermaid 图表和 KaTeX 公式。
- 内容发现：Pagefind 全文搜索、分类与标签、归档和随机文章。
- 项目展示：GitHub 年度贡献热力图、日期提示和置顶仓库卡片，也支持手动选择项目。
- 友链：星图、悬停资料卡、完整名单、Link History Book 和本站资料复制。
- 交互：明暗主题、响应式导航，以及与文章页共用的 Giscus 评论。
- 浏览器终端：目录探索、文章阅读、搜索和固定词库猫咪互动。

## 本地开发

环境与 CI 保持一致：Hugo Extended **0.162.0**、Node.js **24.18.0**，以及 Git。主题源码已随仓库保存。

```bash
git clone https://github.com/XVSHIFU/xvsf.git
cd xvsf
npm ci
hugo server --environment development
```

访问 `http://localhost:1313/xvsf/`。普通 Hugo 开发服务器不会自动生成 Pagefind 索引，终端搜索会降级为目录检索。

正式构建与全文索引：

```bash
npm run build:site -- --minify --panicOnWarning --cleanDestinationDir --destination .ci-site/xvsf
npm run search:index
```

使用构建脚本可刷新 GitHub 公开数据并清理过期终端导出。GitHub 请求失败时保留已有快照；离线构建可设置环境变量 `PROJECT_ACTIVITY_OFFLINE=1`。

## 写作与内容管理

```bash
hugo new posts/文章标题.md
```

文章位于 `content/posts/`，字段约定见 [Front Matter 模板](FRONTMATTER_TEMPLATE.md)。支持草稿、定时发布与到期撤下。分类和标签可直接写入文章；`data/categories/`、`data/tags/` 是 CMS 选词库，不是发布白名单。

Pages CMS 可管理文章、网站设置、分类标签、友链与图片，并触发受 Cloudflare Access 保护的草稿预览。

常用短代码：

| 短代码 | 用途 |
| --- | --- |
| `admonition` | 提示框，支持 note、tip、warning、danger、info、success |
| `collapse` | 折叠内容或代码 |
| `gallery` | 图片画廊 |

## 项目展示

编辑 [`data/projects.yaml`](data/projects.yaml)：

- `source: pinned`：跟随 GitHub 概览页的置顶项目及顺序。
- `source: manual`：使用 `items` 中配置的项目及顺序。

置顶项目和贡献热力图在构建时刷新，本地缓存有效期为 24 小时。调整 GitHub Pin 后，下一次成功刷新并部署才会反映到博客；需要立即刷新时运行：

```bash
node scripts/project-activity.mjs --force
```

更多字段、缓存与交互说明见 [项目与友链维护文档](docs/projects-links.md)。

## 手动添加友链

1. 将头像放到 `static/uploads/friends/`，例如 `friend.png`。也可以使用对方允许引用的 HTTPS 头像地址。
2. 生成一个 UUID：`node -e "console.log(crypto.randomUUID())"`。
3. 在 `data/friends/` 新建 `<UUID>.yaml`，文件名与 `id` 使用同一个 UUID。以下仅为填写示例，请替换站名、地址、日期等资料：

```yaml
id: "替换为生成的 UUID"
name: "朋友的博客"
url: "https://example.com/"
description: "一句话介绍这个小站"
avatar: "/uploads/friends/friend.png"
added: "2026-09-21"
status: "active"
enabled: true
weight: 40
```

- 本地头像路径从 `/uploads/` 开始，不写 `static/` 或部署前缀 `/xvsf/`；模板会补上站点路径。
- `weight` 越小越靠前；`enabled: false` 完全隐藏该友链。
- `status: active` 出现在星图、完整名单和终端；`paused` 移到暂停列表，保留已有历史。
- `added` 填实际添加日期，History Book 显示“添加友链”。若知道实际结识日期，可增加 `since: "YYYY-MM-DD"`，历史会优先显示该日期与“遇见”；不确定就留空。
- `note` 可选，用于记录结识故事。日期建议始终加引号。

运行 `npm run cms:check` 并本地预览 `/links/`，确认头像、跳转和历史记录，再将 YAML 与头像一起提交。页面和终端共用这份数据，无须再改模板或维护第二份名单。

## 验证与部署

常用检查：

```bash
npm run cms:check
npm run frontmatter:check
npm run quality:check
npm run schedule:test
npm run pages:test
npm run terminal:test
# 以下检查在正式构建后运行
npm run terminal:validate
npm run validate:html
```

Pull Request 会运行内容、构建、终端、HTML 和链接检查。合并到 `main` 后自动部署到 GitHub Pages；定时任务在每小时第 7、22、37、52 分钟重建，使 `publishDate` / `expiryDate` 生效。仅推送功能分支不会更新正式网站。

Windows 也可使用已有发布脚本（需要登录 GitHub CLI）：

```powershell
.\bushu.ps1 -WhatIf  # 预演构建与发布范围
.\bushu.ps1          # 确认范围后创建 PR，检查通过再合并
```

脚本要求输入 `PUBLISH` 确认，支持 `-PublishPath` 限定路径。

## 目录速查

| 路径 | 内容 |
| --- | --- |
| `content/` | 文章与独立页面 |
| `config/` | Hugo 配置与网站设置 |
| `data/` | 项目、友链、终端词库与构建数据 |
| `assets/` | 样式和前端脚本 |
| `layouts/` | 页面、组件、短代码与终端导出模板 |
| `static/` | 图片及其他静态资源 |
| `scripts/` | 构建、校验与维护工具 |
| `docs/` | 维护文档 |
| `themes/PaperMod/` | 随仓库保存的主题源码 |
| `.pages.yml` | Pages CMS 数据模型 |

## 博客终端

点击导航右侧的 `^_` 进入，输入 `exit` 或按 Esc 返回页面。终端直接跟随博客明暗主题，支持 `help`、`ls`、`cd`、`cat`、`search`、`tree` 等命令；文章保留完整正文与分层目录，`Ctrl+L` 清屏。

`pet hi`、`pet 你好` 可以和字符猫互动；回复来自本地固定词库，不接入 AI。`random` 随机阅读，`trail` 查看本次会话的阅读足迹。

公开内容目录位于站点的 `.well-known/xvsf-manifest.json`，也可用 `manifest --url` 查看地址。配置开关、命令和接口说明见 [终端维护文档](docs/terminal.md)。

## 许可证

MIT。PaperMod 保留其 [MIT 许可证](themes/PaperMod/LICENSE)。项目与友链交互参考 Joye Blog，相关适配保留 [Apache-2.0 许可证](static/licenses/joye-blog.txt)及[来源与修改说明](docs/joye-interaction-reference.md)。
