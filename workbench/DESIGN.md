---
name: "xvsf Vditor 写作工作区"
description: "分类笔记本、多文档编辑与 GitHub PR 同步的浏览器写作区"
colors:
  canvas: "#1e2024"
  sidebar: "#181a1e"
  surface: "#23252a"
  raised: "#2d3037"
  border: "#373b43"
  text: "#e7e9ef"
  muted: "#a8aebc"
  accent: "#9bc4f0"
  selected: "#2b3b51"
  button: "#2865aa"
  button-hover: "#2e70b6"
  success: "#9bcab4"
  canvas-light: "#f6f7f9"
  sidebar-light: "#eef0f3"
  surface-light: "#fff"
  raised-light: "#e7eaf0"
  border-light: "#d5d9e1"
  text-light: "#252b34"
  muted-light: "#596270"
  accent-light: "#245f9e"
  selected-light: "#dce8f8"
  button-hover-light: "#21548e"
  success-light: "#347152"
  on-button: "#fff"
typography:
  body:
    fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif'
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  editor-body:
    fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif'
    fontSize: "15px"
    lineHeight: 1.95
  label:
    fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  action-label:
    fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif'
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
  meta:
    fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: 'Consolas, "Cascadia Mono", monospace'
    fontSize: "13px"
    lineHeight: 1.7
rounded:
  compact: "3px"
  control: "4px"
  field: "5px"
spacing:
  small: "8px"
  medium: "12px"
  inset: "16px"
  panel: "20px"
  writing: "28px"
components:
  button-primary:
    backgroundColor: "{colors.button}"
    textColor: "{colors.on-button}"
    typography: "{typography.action-label}"
    rounded: "{rounded.control}"
    padding: "6px 11px"
  button-primary-hover:
    backgroundColor: "{colors.button-hover}"
  button-primary-hover-light:
    backgroundColor: "{colors.button-hover-light}"
  button-text:
    typography: "{typography.action-label}"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "6px 11px"
  button-text-hover:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
  button-icon:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    size: "32px"
    padding: "0"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "5px 8px"
  search:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.field}"
    height: "30px"
    padding: "0 9px"
  notebook:
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "6px 8px"
  file:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.compact}"
    padding: "7px 10px 7px 30px"
  file-active:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.text}"
  tab-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    height: "39px"
---

# Design System: xvsf Vditor 写作工作区

## Overview

**Creative North Star: "熟悉的写作工作台"**

本规范只适用于此目录中的 Vditor 写作体验原型。界面遵循用户选定的 SiYuan / VS Code 式工作区：紧凑导航、连续的编辑表面、明确的选中状态，让文章分类、已打开的文档和当前写作内容保持可见。它不定义父级博客的全局设计。

表面以中性深浅层次和细分隔线组织空间，蓝色标记选择、焦点与主要操作。系统无衬线字体承担工作区与正文，等宽字体用于代码。没有独立图像概念稿；本记录提取自已实现的 style.css、index.html、app.mjs、image-ui.mjs 和 workspace-ui.mjs。

**Key Characteristics:**

- 分类笔记本与多文档标签构成连续工作区。
- 深浅主题共享组件形状、层次与交互。
- 界面紧凑，编辑正文保留更宽松的行距。

## Colors

配色由冷中性色、克制的蓝色和状态绿组成。前置 token 保留实际 CSS 数值；无后缀为默认深色主题，`-light` 为浅色主题的对应值。`button` 与 `on-button` 在两种主题中共用。

### Primary

- **工作区蓝**：`accent` 标记焦点、正文链接和标签图标；`selected` 承载当前文档行与文字选择。
- **操作蓝**：`button` 用于导出、创建等主要操作；`button-hover` 随主题提供悬停反馈。

### Secondary

- **状态绿**：`success` 用于本机状态与图床令牌已配置的圆点，不替代状态文字；图床圆点不表示上传权限已经验证。

### Neutral

- `canvas` 承载标签轨道、搜索背景与通知条；`sidebar` 承载顶栏、笔记本和底栏。
- `surface` 承载当前文档与编辑器；`raised` 用于悬停背景和短通知。
- `border` 分隔面板；`text` 与 `muted` 分别承担主要内容与辅助信息；`on-button` 保持主要按钮文字清晰。
- 浅色主题通过同名 CSS 变量替换颜色，组件不建立第二套布局。

**The State Color Rule.** 蓝色用于当前文档、可操作内容和键盘焦点；绿色用于本机状态与图床令牌已配置提示，不代表上传权限已验证。

## Typography

工作区与正文沿用前置 token 中的系统无衬线栈；代码采用等宽栈。这里没有展示字体或营销式字号层级。

### Hierarchy

- **Title**：文档标题使用（16px），单行溢出省略；分类和文件名放在标题下方一行，使用（12px）。日期、标签等信息在文章属性中查看。
- **Body / Label / Meta**：分别承担基础界面文字、导航及表单标签、路径和状态信息。
- **Editor body**：正文比导航更松；移动端使用（14px）与（1.9）行高。
- 编辑器一至三级标题分别相对正文放大为（1.7em / 1.35em / 1.12em），行高为（1.5）；首个内容块取消顶部间距。
- **Code**：代码块使用前置等宽 token；普通正文段落保留（1em）底部间距。
- 文章管理与导入列表的主要文字使用（14px），新增详情与提示使用（12px）；历史 Markdown 使用等宽栈、（14px）与（1.7）行高。

**The Reading Rhythm Rule.** 导航标签保持紧凑，编辑正文使用独立的字号与行距；不把界面标签密度带入正文。

## Layout

视窗是固定高度的纵向工作区，内容区内部滚动。顶栏（42px）、标签栏（39px）和底栏（27px）保持稳定；中间由笔记本、文档和可选大纲组成。桌面笔记本宽（280px），大纲宽（200px）。搜索位于顶栏右侧，桌面宽度上限（240px）。文章标题与路径在左，紧凑操作在右，文章栏高度约（58px）。

编辑正文以约（790px）的内容宽度居中，宽屏最小左右留白为（28px）。前置 spacing 记录重复使用的间距；按钮、列表行等保留各自紧凑的组件内边距。

| 最大视窗宽度 | 实际响应行为 |
| --- | --- |
| 1190px | 笔记本收为 252px，大纲为 166px；文章栏左右内边距收为 16px。 |
| 960px | 大纲隐藏，笔记本为 242px；正文左右留白为 24px，品牌副标题隐藏。 |
| 760px | 笔记本变为可关闭抽屉，宽度取 310px 与 85vw 中较小值；标题与操作仍并排，预览和同步收为具名图标，正文左右留白为 18px，标签栏继续水平滚动。 |

桌面可折叠笔记本；移动抽屉覆盖编辑区，打开时禁用后方编辑区交互，选中文档或关闭抽屉后恢复。

设置与属性对话框宽度取（540px）与视窗宽度减（28px）中较小值，上限高度为视窗高度减（36px），内容在框内滚动。表单内边距为（24px），相关字段可两列排列；在（760px）及以下收为单列，内边距改为（18px），输入文字增至（16px）。上传记录默认关闭，通过底栏入口显示右下方浮层，宽度上限（420px）、高度上限（360px），不改变编辑区高度；窄屏留足两侧间距，行内操作纵向排列。

文章管理与历史对话框扩宽至（740px），仍保留视窗两侧间距；管理列表独立滚动，最大高度为（300px），移动端为（34dvh），工具栏允许换行。博客预览使用上限（1500px）的宽幅对话框，桌面四周留（20px），移动端留（8px）；预览页填充剩余空间，标题、生成状态与操作保持可见。

## Elevation & Depth

常驻表面使用色阶与细边界（1px），不使用卡片阴影。短通知使用柔和下投影（`0 8px 24px #0003`），移动抽屉使用侧投影（`5px 0 20px #0002`）与遮罩（`#0005`）。原生对话框通过更深的遮罩（`#0008`）隔开后方工作区，不新增投影。投影值保存在 sidecar；没有背景虚化。

**The Panel First Rule.** 常驻面板依靠表面色和分隔线划分；投影只服务于浮层通知和移动端抽屉。

## Shapes

整体由直角面板构成，控件使用前置 rounded 的轻微圆角。搜索框和短通知采用 field 圆角，按钮与表单采用 control 圆角，文件行和快捷键采用 compact 圆角。活动标签以顶部细蓝线（1px）连接当前文档；小圆点只表示本机草稿或状态。

## Components

### Buttons

紧凑且可直接识别。主要按钮使用操作蓝和白字，文字按钮默认透明，图标按钮提供方形命中区。文字与主要按钮最小高度为（32px），移动端为（30px）。

悬停只改变背景或文字颜色，过渡为（0.16s ease-out）；禁用时透明度为（0.5）。按钮、链接、折叠入口和复选框保留工作区蓝键盘轮廓（2px）与间隔（2px）。文字字段和选择字段的焦点轮廓为（2px）、偏移（-2px），贴合原圆角并留在输入区域内；不叠加阴影。搜索容器承载唯一的内嵌焦点轮廓，内部输入不再另画一圈。减少动态效果偏好关闭按钮过渡并恢复自动滚动行为。

### Inputs / Fields

新建表单使用细边框、编辑表面背景与轻微圆角，最小高度为（33px）。搜索是顶栏内的紧凑字段，图标、输入与键盘快捷键共同排列；窄屏隐藏快捷键标签。

设置与属性字段使用 canvas 背景、主要文字、细边框和 control 圆角，最小高度为（36px），内边距为（7px 9px）。标签、说明、输入和结果分层排列；结果使用 selected 背景与文字说明，错误不依赖颜色区分。

新建文章与设置中的原生选择字段在支持 `appearance: base-select` 的浏览器中统一弹出菜单样式：surface 背景、细边框、（5px）圆角、（14px）选项文字，菜单高度上限为（288px）与（45dvh）中的较小值。选中项用 selected 背景及右侧勾号，悬停用 raised，键盘焦点保持清晰；方向键与确认仍由原生选择控件处理。Escape 先关闭下拉，再由下一次 Escape 关闭所属抽屉或对话框。不支持该能力的浏览器保留可用的传统原生下拉。该要求采用了个人知识库 D-009 的内嵌焦点与主题一致性原则，并非知识库规定必须使用某种下拉实现。

### Workspace Dialogs

图床设置与文章属性共用原生模态对话框、标题、具名关闭按钮和底部分隔操作区；主要提交操作靠右，次要操作可换行。对话框沿用 field 圆角，打开时限制后方交互并保持键盘焦点在表单内。

图床表单说明上传会写入 GitHub、令牌仅留在当前页面内存，以及连接检查未验证写入权限；有待上传图片时，主要按钮改为“保存并继续上传”。属性表单将相关分类与标签并排，定时字段默认折叠；本机保存、Markdown 导出与不会自动发布的说明紧邻操作区。二者都保留原位状态或错误消息。

文章属性中的文件名字段紧邻用途说明：未关联文章可调整首次同步文件名，已关联文章保持远端原路径并只读显示。文章管理延续原生对话框，以分段按钮切换文章与回收站；筛选、复选框、全选当前结果和已选数量共同控制批量操作。平面列表用细线分隔，标题与文件名、分类或移入时间分层排列，长文字换行。所选文章可统一归入一个分类、移入回收站或恢复；结果保留在操作区上方。

Markdown 导入与 JSON 备份恢复共用文件清单和确认操作，明确创建新副本、同名自动编号及已有文章保持不变；回收站条目带文字标记。备份包含本机草稿、历史与回收站，不含图床令牌。历史对话框以时间和原因选择版本，下方只读显示完整 Markdown；空状态禁用恢复。界面说明最近（20份）、约（4 MB）的留存上限，恢复正文与属性前先留存当前版本，并保留当前文件名。

### Upload Queue & Recovery Feedback

上传结果使用右下方轻通知，正文（14px）；成功通知约（4.2s）后关闭，悬停或键盘焦点在通知内时暂停计时，失败保留重试或查看入口。通知不主动取得焦点，主动关闭后将焦点返回之前的控件。底栏持续显示处理中或失败数量。

按需展开的上传记录使用平面列表、细分隔线和 surface 背景。每行保留文件名、所属文章和等待、上传中、失败或完成的文字状态；主要文字（14px）、详情（12px），长文件名省略，详情允许换行。失败项提供重试，缺少令牌时提供图床配置，上传完成后提供图片链接；点击外部或 Escape 关闭浮层。切换文档不改变图片归属；冲突时，待完成上传归入发起上传的编辑会话所生成的恢复副本，成功通知使用实际归属文章的标题。

冲突恢复使用文档标题下持续可见的 selected 色通知条，展示正在另存、两版已保留或本机保存失败的具体结果，用户可用“知道了”关闭。原文与恢复副本可分别继续编辑；失败信息指向导出 Markdown 副本，恢复结果不只依赖短通知。

### Navigation

分类以原生可折叠笔记本呈现，分类行最小高度为（36px），文档行最小高度为（34px）。文件名省略溢出部分，悬停使用 raised，选中使用 selected，并同步可访问状态。不同分类中的同一文章共享文档身份与草稿状态。

侧栏底部并列“导入 Markdown”与“文章管理”入口，在移动抽屉中继续可用。文档操作区的更多菜单使用带细边框的 surface 浮层，集中放置保存到本机、历史版本与移入回收站操作，悬停沿用 raised；点击外部、执行操作或按 Escape 关闭。自动保存与 Ctrl S 保留。属性、图片用具名图标，预览和同步用短标签；导出放在更多菜单。

### Document Tabs

标签支持水平滚动，当前标签使用编辑表面色、主要文字色与顶部蓝线。文档标签包含关闭按钮；键盘支持左右箭头、Home 和 End 在标签间切换。普通标签宽度范围为（125px–245px），移动端最大宽度为（210px）。

### Editor & Feedback

Vditor 的即时渲染、所见即所得与分屏源码模式共享正文样式和主题。右侧大纲服从响应规则。保存与导出状态由底栏及短通知反馈；体验示例的身份在标题下及侧栏标记中说明。截图只记录 QA 结果，不属于发布视觉资产。

博客预览在独立来源的内嵌页面中展示实际 Hugo 构建结果，沿用工作区对话框外壳；顶部呈现生成状态、生成时间、重新生成与独立打开操作，失败时原位显示错误。底部说明仅预览当前草稿、其余页面使用博客文件，草稿与排期文章也会显示；预览不发布到网上。

## Do's and Don'ts

### Do:

- **Do** 保持分类行、文档行和标签页的悬停、选中与键盘焦点可区分。
- **Do** 同步工作区和 Vditor 的明暗主题，并使用主题变量承载颜色。
- **Do** 用 SVG 线图标辅助文字，给独立图标按钮提供可访问名称。

### Don't:

- **Don't** 把此局部原型规范扩展为父级博客的全局设计规则。
- **Don't** 为常驻编辑面板增加装饰性卡片、营销式大标题或投影。
- **Don't** 让示例说明先于文档主标题；示例身份保留在侧栏标记与标题下元信息中。

## GitHub 同步

顶栏新增 GitHub 连接入口，沿用图床的文字按钮与状态点。连接只读取文章；主要文章动作改为“同步”，导出与“查看待合并 PR”移入更多菜单。原有自动保存和 Ctrl S 保持本机语义。底栏区分尚未同步、本机修改待同步、远端有更新及 PR 待合并。

GitHub 设置与提交确认沿用现有表单对话框。提交确认展示实际仓库、文件路径和草稿/排期效果。主分支要求 PR，所以保存写入专用分支，成功通知提供“查看并合并”；不显示已发布的承诺。令牌只在页面内存中使用。

远端冲突使用宽对话框：桌面并列本机与远端 Markdown，窄屏上下排列。先保存冲突副本再接受远端版本，避免覆盖；保存副本期间禁用该对话框操作，完成后恢复。

在线 Markdown 预览延续宽幅预览框，明确区分本机 Hugo 主题预览。文章内容进入无脚本的沙盒 iframe，避免让预览内容接触编辑器凭据。

验证使用隔离 Edge，检查 1440px 深色与 390px 浅色、连接/提交/冲突/预览。截图位于被忽略的 .impeccable/review/sync-*.png。同步 API 测试采用模拟响应，真实仓库仅做只读验证。
