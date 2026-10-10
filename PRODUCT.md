# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Product Purpose
xvsf 的个人技术博客，记录漏洞研究、代码审计、网络实践与开发工具。项目页展示真实公开作品；友链页帮助读者发现其他个人网站。

## Operating Context
Hugo / PaperMod，GitHub Pages 子路径 /xvsf/。文章、页面、网站设置和友链数据直接在仓库维护，通过 Pull Request 验证和发布。

## Capabilities and Constraints
顶部导航包含项目与友链，保留明暗切换和伪终端；全站页脚不再重复项目与友链导航。新页面沿用现有字体、颜色和阅读宽度。项目页展示公开贡献日历及 GitHub 置顶仓库，也支持手动选择项目；日历提供星期轴、日期与贡献数提示、指针聚光、选中格放大，以及贡献数、年份和日期数字滚动。友链页与终端共用真实名单；页面另可显示明确标注的临时空位，支持悬停、键盘聚焦或触摸查看邻近资料卡。页面提供完整交换资料、默认折叠的 Link History Book 和 Giscus 留言；无 JavaScript 时仍可访问静态内容。不加入赞助区域，不执行额外完整外链检查。新页面完成后交付审阅，不自动发布。

主站提供真实的九篇 Coding Agent 专题顺序、文章摘要、代码折叠、就地解释、链接预览、反向引用、公开随记与静态友链订阅。首页头像保留一秒完整旋转，点击进入关于页；“更多”与搜索、终端、主题切换图标保持对齐。

/admin/ 是独立作者写作区，继续通过 PR 同步。没有真实内容时显示空状态，不编造随记、订阅、贡献或友链。所有路径继续兼容 /xvsf/，本次工作只交付本地审阅。

## Brand Commitments
undefined

保留主站蓝、粉、暖白猫主题身份。公共界面规范见根目录 DESIGN.md，作者写作区继续使用 workbench/DESIGN.md。

## Evidence on Hand
undefined

博客体验的已批准方向与维护说明分别位于 docs/blog-experience-direction.md、docs/blog-experience.md；当前友链名单以 data/friends/ 为准。data/reading_series.json 是九篇顺序的唯一来源。根目录 DESIGN.md 与 schemaVersion 2 的 .impeccable/design.json 记录博客的视觉令牌及组件。

## Accessibility & Inclusion
博客页面支持键盘、移动端、明暗主题、减少动态效果及无 JavaScript 阅读。所有地址兼容子路径部署。按钮与链接保留可见键盘焦点和可访问名称，触屏可直接打开文章。
