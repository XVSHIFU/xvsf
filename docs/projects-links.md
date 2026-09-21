# 项目与友链页面维护

## 导航与页面

顶部导航已加入项目 /projects/ 与友链 /links/；/friends/ 保留跳转。全站页脚已移除重复的项目与友链导航，保留顶部导航与现有明暗主题。终端 /links 与友链页共用真实名单 data/friends/*.yaml，作者社交资料位于终端 /home/profiles。

## 项目展示：自动置顶或手动选择

data/projects.yaml 的 source 默认是 pinned。构建脚本读取 https://github.com/XVSHIFU 的匿名公开置顶项目，保留顺序、仓库名、简介、语言、Star 和 Fork。现在是 I_have_a_cat-、xvsf、myEnv、DesktopFan。没有 GitHub 简介时，同仓库的本地 items.description 可作为补充；没有资料则留空，不编造介绍。

在 GitHub 概览页调整 Pin 后，博客下次成功刷新并部署时更新。刷新发生在构建时，已有缓存 24 小时内复用；它不是浏览器实时请求。需要立即更新时运行 node scripts/project-activity.mjs --force，再构建/发布。

如要独立管理博客项目，把 source 改成 manual，编辑下方 items 的顺序及 name、repo、description、note、credit。手动选择不会改动 GitHub 的 Pin；贡献日历仍然使用 GitHub 公开数据。

## 贡献日历与缓存

- 年度日历读取 https://github.com/users/XVSHIFU/contributions，与匿名公开主页一致，逐日校验日期、数量及全年合计。
- 每次刷新最多两个并发匿名请求，各 6 秒超时，无 Token、无浏览器密钥、无第三方代理。
- data/github_activity.json 为已核实的公开快照；data/github_activity_live.json 是忽略提交的本地缓存。
- 构建入口 scripts/build-site.mjs 自动刷新。PROJECT_ACTIVITY_OFFLINE=1 禁止请求。直接运行 hugo 只使用已有数据。
- 公开 HTML 结构变化、限流、断网、缺失日期、总数不一致，均保留上次有效快照；页面展示实际更新日期。每次全新 CI 检出仅带提交快照，超过 24 小时后会重新请求。
- 定时部署沿用已有 Pages 工作流，本站不额外创建自动提交或 GitHub 密钥。
- 回归测试：npm run pages:test。

日历保留周日到周六的星期轴。悬停、键盘聚焦或触摸日期格会显示自定义日期与贡献数提示；鼠标移动时有局部聚光，选中格放大，贡献数、年份和日期采用数字滚动，月份直接更新。方向键切换日期，Home / End 跳到首末日期，Esc 关闭提示。移动端日历可横向滚动；减少动态效果时停用过渡、聚光和格子放大。无脚本时保留静态日历及原生日期提示。

交互适配来源与改动说明见 docs/joye-interaction-reference.md，Apache-2.0 许可保留于 static/licenses/joye-blog.txt。

## 友链与 History Book

当前真实友链为 bxhhf（https://bxhhf.github.io/）、十七.（https://zc-18.github.io/）、Piggy Sprint（https://zhz0177.github.io/）与 qinghe（https://ccc666yyyy.github.io/），站名、简介与头像来自公开页面，尚未填写结识日期。通过 Pages CMS 原有友链集合或 data/friends/*.yaml 管理，字段：name、url、description、avatar、weight、enabled，新增可选 added（添加日期）、since（结识日期，均为 YYYY-MM-DD）、status（active / paused）与 note。

只有 active 且启用的真实朋友进入星图和终端；paused 进入折叠名单，enabled: false 完全隐藏。桌面最多展示 12 颗星、手机 6 颗，完整真实名单默认收起，通过无边框的“查看全部友链”文字行展开，使用加号 / 减号指示状态；无脚本也可展开访问。

data/friend_preview.yaml 当前 enabled: true：没有 active 真实友链时，仅在友链页显示三个明确标注的临时空位。空位不包含虚构站点、网址或结识日期，不进入真实名单、终端或历史记录；加入启用且 active 的真实友链后自动替换，设为 false 可关闭预览。启用脚本时仅显示占位星图，无脚本时可读占位列表。

悬停、键盘聚焦或触摸星点，在其邻近显示资料卡，位置限制在星图内。真实友链资料卡提供访问入口；占位卡仅显示临时说明。Esc、点击星图外部或焦点离开星图可关闭资料卡。

查看全部友链与 Link History Book 是并排的无边框折叠入口，展开内容占整行，窄屏空间不足时换行。使用原生 details / summary，默认折叠，支持点击、键盘和无脚本操作。历史优先读取 since 并显示“遇见”，否则读取 added 并显示“添加友链”，按日期倒序排列；两者都没有时不生成记录。note 可记录结识故事，不自动猜测交换日期。已暂停的连接仍保留历史。

## 交换资料与评论

交换资料是一个整体，可一次复制站名、简介、网址和头像；浏览器禁止剪贴板时会选中文本并提示手动复制。不开脚本时资料仍可读。

友链页使用文章页同一 layouts/partials/comments.html Giscus 配置，按 pathname 绑定独立讨论，跟随博客明暗主题；访客可以直接在下方申请。现有评论按需懒加载，滚动到留言区域后加载；首次留言前尚无讨论属于正常状态。当前已展示四位真实朋友，临时空位自动隐藏。

赞助区域和完整外链检查仍不在本轮范围。本地修改经审阅后再单独提交与发布。

### 历史日期

2026-09-21 添加的 bxhhf、十七.、Piggy Sprint、qinghe 已记录 added 日期，History Book 显示“添加友链”。since 留空，不推定双方结识或互换时间。以后添加友链时同步填写 added；若有明确 since，则历史展示该结识日期和“遇见”。
