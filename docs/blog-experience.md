# 博客阅读体验

本次开发基于 main@05b5f81，位于独立工作区 E:/MyBlog2.0/xvsf-experience 的 codex/blog-experience。原工作区未提交的写作区文件保留。这个分支尚未发布。

## 入口与内容

- 主站沿用 Hugo / PaperMod。首页保留真实的九篇 Coding Agent 专题/学习路线及文章摘要。头像支持一秒 360 度旋转，点击进入关于页。
- “更多”使用 SVG 箭头与 34px 高度；搜索、终端、主题切换图标统一 20 × 20px 并居中对齐。二级入口放入“更多”。
- 导航栏保留现有终端阅读入口，使用公开文章 manifest 与 reader。
- /admin/ 是原来的作者写作区，同步文章仍然创建/更新 PR。
- /notes/ 是作者公开随记，来自 content/posts/ 内带 format: note 的文章。写作区“文章属性 → 内容类型 → 随记（公开）”可设置；继续走原有草稿、同步和 PR 流程。当前没有凭空补写示例随记。

## 数据

layouts/partials/terminal/build.html 生成公共文章 manifest、reader 与正文增强；九篇系列的顺序由 data/reading_series.json 定义。项目与贡献日历继续使用真实 GitHub 数据及已有缓存。

## 阅读增强

短代码（不超过 14 行）默认展开，长代码默认折叠，复制仍可用；`open=true/false` 可覆盖。代码围栏支持 Hugo 原生高亮参数，例如：

````md
```js {filename="agent.mjs" hl_lines=[2] open=true}
const budget = 2;
console.log(budget);
```

```diff {title="修改说明"}
-old
+new
```

{{< explain term="术语" >}}就地展开的解释。{{< /explain >}}
````

第一篇 Agent 文章已加入一个就地解释。站内链接在悬停/键盘聚焦时预览标题摘要；触屏直接打开。反向引用在构建时从真实链接生成，不虚构关系。

## 友链订阅

`scripts/friend-feeds.mjs` 在构建时将已经登记的 RSS/Atom 聚合为静态 JSON；浏览器无需代理或跨域请求。只有启用且 active 的真实友链会参与。

在对应 `data/friends/*.yaml` 中填写 `feed: https://站点域名/atom.xml` 后生效，URL 必须与该友链使用同一 HTTPS origin。当前六个友链首页没有声明订阅地址，常见 Atom/index 地址也未返回可用订阅，故未填入猜测地址。页面如实显示没有更新。

请求限时 8 秒、响应限制 2 MiB、拒绝跳转和 DTD、仅抽取标题/原文链接/日期，丢弃外域及未来条目。失败保留缓存，停用或移除订阅会清除对应展示。缓存通过 Pages 工作流按日期保存，沿用现有定时构建。`npm run friends:refresh` 手动刷新；`FRIEND_FEEDS_OFFLINE=1` 可在本地使用缓存。

## 开发与验证

先运行 npm ci，再使用 npm run build:site -- --minify --panicOnWarning --cleanDestinationDir --destination .preview-site/xvsf --baseURL http://127.0.0.1:4320/xvsf/。用静态服务器提供 .preview-site 后访问 /xvsf/。构建命令刷新项目/友链缓存、生成 Hugo 网站和作者写作区；发布使用现有 GitHub Pages 工作流。

npm run experience:test 覆盖公开随记元数据、RSS/Atom 安全解析、订阅缓存失败恢复、Hugo 标题锚点和代码展开规则。现有同步、终端、项目活动、定时发布、Pagefind 和 HTML 校验继续保留。

公共视觉规范在根目录 DESIGN.md，其 YAML 前置令牌与 .impeccable/design.json 一同维护；sidecar 为 schemaVersion 2，承载源文件映射、色阶预览、阴影/动效/断点、叙述和三个独立 HTML/CSS 样本。workbench/DESIGN.md 属于作者写作区，独立维护。主站体验样式使用 assets/css/extended/zzz-experience.css。

本地预览从 E:/MyBlog2.0/xvsf-experience/.preview-site 提供于 http://127.0.0.1:4320/xvsf/。

## 参考与许可

PaperGrid 借鉴蓝粉色与角色识别；Wakusei 借鉴信息分组与贡献天际线；Quartz 借鉴链接预览/反向引用；Nutshell 借鉴就地解释；Expressive Code 借鉴代码文件名与高亮信息。具体链接见 blog-experience-direction.md。没有复制这些站点的角色图片、私人资料或编译代码。

XML 解析使用 [saxes 6.0.0](https://github.com/lddubeau/saxes)，只在构建脚本运行，输入有大小限制及回归测试。贡献图为基于日历真实数据的独立 Canvas 2D 实现，没有引入 WebGL 或另一套前端框架。既有 Joye 交互复用来源与许可继续保留在 docs/joye-interaction-reference.md 和 static/licenses/joye-blog.txt。
