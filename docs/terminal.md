# 博客终端

终端已接入 Hugo + PaperMod。导航最右侧的 ^_ 是唯一入口；普通页面只加载入口脚本，第一次点击后再加载终端模块、样式、模板和内容目录。

## 使用

- 启动自检完成后停留约一秒，再向上收起。猫咪和站点信息常驻，下方命令区独立滚动。
- 在猫咪区域向上滚轮可翻回日志；手机下拉、键盘聚焦上半区后按 Home/↑ 也可展开。回到命令区输入时收起。
- Ctrl+L 清屏并恢复自检内容，随后自动收起；保留目录和命令历史。Esc 逐层关闭文章目录、阅读器、文件树，再退出终端。
- 文件树默认折叠，文章和文件可以点击，点击会留下对应的 cat/open 命令。
- 文章在独立阅读文档中完整显示，保留标题层级、代码复制/折叠、图片预览、Mermaid，以及 math: true 时的 KaTeX。
- 宠物有 230 条中英文短句，本地匹配与洗牌回复，不接 AI、不上传对话。回看旧输出或读文章时暂停主动闲聊。

~~~text
help
ls /posts
cat /posts/CC1.md
search InvokerTransformer
search --page 2 Java
tree
pet hi
pet 你好
pet 喵喵
pet nap
pet wake
pet feed
pet play
pet quiet
pet auto
random
trail
man cat
manifest --url
exit
~~~

书签、Ctrl+R 历史搜索、related 等候选功能未加入。

## 配置和维护

config/_default/params.yaml 中的 terminal.enabled 控制入口与导出，默认 true。关闭后通过下述正式构建命令清理重建。

- data/terminal/phrases.json：按语言、主题维护猫咪短句。作者介绍和链接来自现有站点配置。
- assets/js/terminal/loader.js：唯一入口、按需加载和失败重试。
- assets/js/terminal/commands.mjs：独立命令注册、结构化文本/表格输出与显式操作；浏览器视图统一执行。
- assets/js/terminal/core.mjs：路径、分词、目录与引用解析；独立单元测试。
- assets/js/terminal/content.mjs：网络请求、Pagefind 与目录检索降级。
- assets/js/terminal/app.js：终端视图、命令、宠物与焦点/滚动生命周期。
- assets/js/terminal/reader.js：独立阅读文档的目录、站内跳转和消息通道。
- assets/css/terminal/ 与 assets/terminal/shell.html：确认过的终端外观及骨架。终端使用 Shadow DOM 隔离普通站点样式；阅读器使用同源 iframe 隔离文章 ID 和脚本。
- assets/js/reading-enhancements.js、reading_lightbox.html：普通文章和阅读器共用的代码操作、图片预览。Mermaid 继续复用既有实现；数学公式共用 reading_math.html，保留 KaTeX 0.16.21 并修正其资源校验值。
- layouts/partials/header.html、head.html：覆盖主题对应模板以加入入口并共用 site_styles.html；升级 PaperMod 时检查这两个覆盖文件。

## 正式构建

~~~sh
npm run build:site -- --minify --panicOnWarning --cleanDestinationDir --destination .ci-site/xvsf
npm run terminal:validate
npm run search:index
npm run validate:html
npm run terminal:test
~~~

GitHub Pages 上传步骤必须设置 include-hidden-files: true，否则上传工具默认忽略 .well-known，导致线上终端目录接口返回 404。terminal:validate 同时校验这项打包设置；上传范围仅为生成站点目录。

必须用 build:site 清理并构建发布目录：Hugo 的 --cleanDestinationDir 会保留部分之前经资源 API 发布的文件。脚本仅清理指定输出目录下的 terminal/ 和 .well-known/xvsf-manifest.json，检查路径在工作区内，再运行 Hugo。正式与预览工作流已共用此流程。

开发时可以运行 hugo server；关闭功能、删除文章或检查到期导出时，仍应做一次上述清理构建。未生成 Pagefind 时 search 降级到标题、描述、分类和标签检索，并打印 catalog mode；不会把降级结果称作全文搜索。每页 20 条，search --page N <query> 翻页；结果显示总数与页数，超过一页时打印下一页命令。失败可再次尝试。

## 公开接口

相对于站点 baseURL（当前生产站点含 /xvsf/）：

| 路径 | 内容 |
|---|---|
| .well-known/xvsf-manifest.json | version、站点信息、读取说明、posts 与 tree |
| terminal/content/<id>.json | 完整 HTML、纯文本、标题顺序及层级、公开元数据和内容哈希 |
| terminal/reader/<id>.html | noindex 的独立阅读文档，canonical 指向普通文章 |

Manifest 的 tree 是绝对虚拟路径的平面节点表，目录 children 列出直接子节点路径；ref 节点按 id 引用 posts，不复制正文。节点类型为 dir/file/link/ref。文章 ID 对标准化源文件相对路径做 SHA-256，标题改变不会改变 ID；content_hash 随正文和公开内容元数据变化，generated_at 不参与哈希。home/reading.log 属于本次浏览器会话，不向公开接口导出。

所有目录和导出都来自同一批可发布 posts；searchHidden 排除，草稿/未来/过期状态跟随 Hugo 构建参数。受保护预览可按工作流参数包含草稿；链接跟随预览 baseURL。Pagefind 的结果再次与 manifest 匹配，阅读文档不重复入索引。

接口供抓取工具直接读取，与猫咪是否使用 AI 无关。没有新增跨域代理，也未宣称 CORS 已开放。不要向接口另行填入后台配置或原始 front matter。

## 计划完成度

上轮审计列出的实现缺口已补齐：搜索分页、阅读分类、跨文章锚点、命令拆分、children、关闭资源撤下与加载重试。人工验收和发布前检查仍待完成，见 [逐项核对记录](terminal-plan-audit.md)。

## 验证记录（2026-09-21）

- 开始前本地无未提交改动；main 位于 214c1ff，比 origin/main 4c056c1 多一个文章提交，对应未合并 PR #34。GitHub 最近部署通过。功能分支从当前提交建立，保留文章更新。
- Hugo 0.162.0 严格/压缩构建通过；78 篇公开文章和 156 个正文/阅读端点有效，Pagefind 只索引 78 篇。
- 核心测试覆盖中文路径、引号、根路径、目录引用、异常 manifest、全文结果过滤与检索降级。
- Hugo 场景测试覆盖草稿、未来发布、过期、searchHidden、预览 URL、跨平台路径、H1/H2/H6、稳定 ID、内容哈希、删除清理和关闭开关；真实站点关闭开关后无入口和 manifest。
- CMS、内容质量（0 错误，145 个既有警告）、原定时发布测试及生成 HTML 校验通过。
- Windows 工作副本使用 CRLF，现有 Front Matter 校验器按字节比较 LF，因此原地检查有换行差异；隔离 LF 副本中 79 篇验证通过。没有重写文章。当地 Node 为 24.15.0，CI 仍按仓库固定版本 24.18.0；未升级依赖。
- DOMParser 检查 360 个 HTML 中的 494 个站内 href/src 地址无缺失，沿用 CI 三个已知图片排除项。未在本机运行 Lychee；不将此检查等同于完整 Lychee 的所有规则。
- 桌面 1440×900、手机视口 375×812 验证入口按需加载、自动收起、宠物、全文检索、目录点击、完整阅读与移动目录、代码展开、图片预览、Ctrl+L、主题同步、Mermaid 渲染。
- 模拟 HTTP 503 后可重试；快速切换只保留最新文章；清屏取消待加载文章。读取器消息检查同源及来源窗口。
- 手机测试使用浏览器视口和事件模拟，未声称真机软键盘验证。公开文章没有 math: true 样本；本轮另建隔离样本，发现并修复旧 SRI 不匹配后，普通文章与阅读器均正确显示 2 个公式、Mermaid 和图片短代码。

本轮追加：7 项核心/命令测试、实际导出校验、Edge 153 和真实 200% 浏览器缩放通过；304 个唯一同源 href/src 无缺失。入口首次实际 404 后恢复并重试成功。详细证据在 tmp/terminal-completion-verification.json 和 terminal-completion-*.png；上一轮证据也保留。tmp 不随站点发布。

## 实现依据

[Hugo resources.FromString](https://gohugo.io/functions/resources/fromstring/) 用于静态导出；[Hugo Fragments](https://gohugo.io/methods/page/fragments/) 用于保留标题顺序和层级。界面与宠物交互参考 Joye 的设计方向，代码独立实现；原型研究和迭代计划保留在 tmp/。

项目和友链页面安排下一次提交，新计划保存在 tmp/projects-links-plan.md；赞助区域已取消。

## 发布范围（2026-09-21）

本次只上线终端及必要的共享阅读增强、构建校验与导航改动。额外完整链接检查已取消；发布工作区使用 Node 24.18.0、Hugo 0.162.0 和 Git 的 LF 检出验证。既有文章 PR #34 不包含在本次发布中。
