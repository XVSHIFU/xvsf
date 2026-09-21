# 终端集成计划核对

更新：2026-09-21。基准：tmp/terminal-integration-plan.md v5 与当前 feat/blog-terminal 工作副本。

**上轮审计列出的实现缺口已补齐；终端主要功能与本地自动验收通过，整份计划仍保留人工验收与发布前检查。** 本记录不把模拟输入等同于真机输入，不把旧的 GitHub 运行当作当前功能已通过 CI。

## 本轮完成

| 原缺口 | 当前结果 | 验证 |
|---|---|---|
| 搜索分页 | search [--page N] <query>，每页 20 条，显示总数、页码和下一页文本命令；取消 50 条截断。 | 65 篇含重复/隐藏结果测试、越界页、空结果、降级分页及重试通过；真实 Java 检索 40 条分两页。 |
| 阅读器分类 | 日期后显示真实分类并链接到分类页。 | CC1 展示 Java基础&Java安全；HTML 校验通过。 |
| 跨文章锚点 | 传递目标 hash 到 iframe，加载后定位；原文和失败重试也保留 hash。 | CC1 跳到 CC3 的“总结”，地址与滚动位置一致。 |
| 命令模块 | commands.mjs 注册命令并返回文本/表格数据与显式操作，app.js 统一渲染；同步 open 保留用户手势，异步结果检查会话状态。 | 所有注册命令结果契约、中文路径、错误输入、原型属性名、禁止脚本 URL、文本输出与宠物不联网测试通过。 |
| Manifest children | 保留平面路径表与 posts 集合，所有目录新增 children，内容为直接子节点的绝对虚拟路径。 | 构建场景与真实 441 个节点逐项校验通过。 |
| 关闭入口样式 | 关闭后从全站 CSS 构建集合排除 terminal-entry.css；修正 Windows 路径分隔符匹配。 | 实际关闭构建无入口、loader、入口 CSS、manifest 或 terminal 导出目录。 |
| 公式实测 | 修复既有 KaTeX 0.16.21 的错误 SRI；普通页面与终端共用 reading_math.html，未升级版本。 | 隔离样本 2 个公式、0 渲染错误，Mermaid 和 figure 短代码均正常；普通文章样本同样通过。 |
| 首次加载重试 | 模块导入失败后使用新的请求 URL 重试，避免浏览器缓存失败。 | 首次实际 404，文件恢复后再次点击成功，使用 terminal-retry=1。 |
| 工程验收 | 新增 validate-terminal-site.mjs / npm run terminal:validate 并接入 CI。 | 校验全部 ID、目录引用、端点和 canonical 文件；78 篇公开文章。 |

## 已有功能仍保留

导航唯一 ^_ 入口、右侧主题切换、自检与回看、常驻字符猫和分隔线、独立命令滚动、Ctrl+L、默认折叠的 SVG 文件树、目录点击留下命令、H1–H6 目录、230 条中英文词库、pet、random/trail/man cat、主题继承、正文加载竞态保护和 Pagefind 去重。未添加宣传区、示例按钮或聊天面板。

## 验收状态

- 7 项核心/命令测试（含多组断言）、Hugo 发布场景、CMS、原定时发布、内容质量、严格构建、生成 HTML 和 git diff --check 通过。
- 当前正式导出 78 篇、441 个虚拟节点；Pagefind 仍索引 78 篇，无阅读副本重复。
- Chromium 桌面与 375×812 手机视口：分页、分类、章节跳转、历史草稿恢复、补全、输入法组合事件保护、文本注入边界、宠物、按需加载和入口重试已核查。
- Edge 153 实测入口、第二页全文结果、Ctrl+L（零记录、六行日志）与退出。
- 真实 200% 页面缩放：在独立浏览器设置中将默认缩放设为 2，devicePixelRatio=2、CSS 视口 632×312；输入、pet、清屏和退出可操作，无横向溢出，退出恢复入口焦点。
- 本轮 DOMParser 检查 360 个 HTML 的 304 个唯一同源 href/src，沿用三个已知图片排除项，未发现缺失。此结果不覆盖完整 Lychee 的规则。
- 隔离阅读样本位于 tmp，未放入正式 content。截图为 tmp/terminal-completion-reader-final.png、terminal-completion-mobile-final.png；结构化记录为 tmp/terminal-completion-verification.json。

## 尚未完成的验收与交付

1. 真机软键盘和真实中文输入法、读屏体验；系统剪贴板的稳定端到端确认仍待实机检查。现有组合事件测试和响应式检查不能代替这些。
2. 用户已取消额外完整链接检查，不再作为本轮待办。仓库已有 CI 检查随发布流程执行。Front Matter 将在采用 LF 的独立发布工作区验证，不改写原工作区文章。
3. 已获用户授权提交并上线终端。发布验证使用单独下载并校验 SHA-256 的 Node 24.18.0，以及既有 Hugo 0.162.0；不升级系统 Node 或项目依赖。发布分支从 origin/main 建立，不包含未合并的文章 PR #34。实际 CI 与部署结果以对应发布 PR 为准。

## 下一阶段与暂缓项

项目与星图友链页面留到下一次提交；用户已取消赞助区域。计划保存在 tmp/projects-links-plan.md。mark/marks/jump、Ctrl+R、related 继续按用户要求暂缓，不计为遗漏。
