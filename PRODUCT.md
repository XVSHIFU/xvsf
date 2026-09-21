# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Product Purpose
xvsf 的个人技术博客，记录漏洞研究、代码审计、网络实践与开发工具。项目页展示真实公开作品；友链页帮助读者发现其他个人网站。

## Operating Context
Hugo / PaperMod，GitHub Pages 子路径 /xvsf/。文章、页面和数据在仓库维护，Pages CMS 编辑已有内容与友链。

## Capabilities and Constraints
顶部导航包含项目与友链，保留明暗切换和伪终端；全站页脚不再重复项目与友链导航。新页面沿用现有字体、颜色和阅读宽度。项目页展示公开贡献日历及 GitHub 置顶仓库，也支持手动选择项目；日历提供星期轴、日期与贡献数提示、指针聚光、选中格放大，以及贡献数、年份和日期数字滚动。友链页与终端共用真实名单；页面另可显示明确标注的临时空位，支持悬停、键盘聚焦或触摸查看邻近资料卡。页面提供完整交换资料、默认折叠的 Link History Book 和 Giscus 留言；无 JavaScript 时仍可访问静态内容。不加入赞助区域，不执行额外完整外链检查。新页面完成后交付审阅，不自动发布。

## Brand Commitments
站名 xvsf，首页“她和她的猫”，头像沿用配置。参考 Joye 的年度贡献日历与友链星图交互，项目采用 GitHub 置顶仓库卡片；适配实现与许可说明见 docs/joye-interaction-reference.md 和 static/licenses/joye-blog.txt，不复制个人资料或虚构友链。页面少提示、少装饰性按钮。

## Evidence on Hand
config/_default/params.yaml、content/posts/myEnv.md、公开 GitHub 仓库、tmp/projects-links-direction.md、docs/projects-links.md。data/friends/ 已按用户要求加入 bxhhf、十七.、Piggy Sprint 与 qinghe 四个真实友链；简介和头像取自各自站点，结识日期暂未提供。data/friend_preview.yaml 当前启用三个临时空位，供页面交互预览，不含虚构网址或结识日期、不进入终端；添加启用且 active 的真实友链后自动替换空位，也可将 enabled 设为 false 关闭。

## Accessibility & Inclusion
页面支持键盘、移动端、明暗主题、减少动态效果及无 JavaScript。所有地址兼容子路径部署。
