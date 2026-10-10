---
name: xvsf · 她和她的猫
description: 猫主题技术博客的阅读、导航与内容组件。
colors:
  cat-blue: "#366593"
  cat-pink: "#eedce5"
  cat-wash: "#e8eff6"
  cat-border: "#d0d9e3"
  site-canvas: "#f2f4fa"
  site-surface: rgb(255, 255, 255)
  site-text: "#1a1b1c"
  site-secondary: "#666"
  site-content: "#333435"
  site-link: "#2d8cdc"
  cat-blue-dark: "#a4c9f0"
  cat-pink-dark: "#3e303e"
  cat-wash-dark: "#242f3d"
  cat-border-dark: "#3c4858"
  site-canvas-dark: "#181a1f"
  site-surface-dark: "#202329"
  site-text-dark: "#e4e6eb"
  site-secondary-dark: "#969ca8"
  site-content-dark: "#cfd2d8"
  site-link-dark: "#7aa7cc"
typography:
  display:
    fontFamily: "'Noto Sans SC', 'Inter', system-ui, -apple-system, sans-serif"
    fontSize: clamp(28px,3.5vw,38px)
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -.035em
  headline:
    fontFamily: "'Noto Sans SC', 'Inter', system-ui, -apple-system, sans-serif"
    fontSize: 21px
    fontWeight: 700
    lineHeight: 1.45
  body:
    fontFamily: "'Noto Sans SC', 'Inter', system-ui, -apple-system, sans-serif"
    fontSize: 1rem
    lineHeight: 1.9
  label:
    fontFamily: "'Inter', 'Noto Sans SC', system-ui, -apple-system, sans-serif"
    fontSize: 14px
  code:
    fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace"
rounded:
  focus: 5px
  control: 6px
  base: 8px
  menu: 10px
  route: 14px
  circle: 50%
spacing:
  compact: 8px
  small: 12px
  control: 16px
  content: 20px
  gap: 24px
  room: 32px
components:
  navigation-main:
    textColor: "{colors.site-text}"
    typography: "{typography.label}"
  card-reading-route:
    backgroundColor: "{colors.site-surface}"
    textColor: "{colors.site-text}"
    rounded: "{rounded.route}"
    padding: 24px
  article-row:
    textColor: "{colors.site-text}"
    padding: 24px 0
---

# Design System: xvsf

## Overview

**Creative North Star: "xvsf · 她和她的猫"**

保留已确认的蓝、粉、暖白猫主题身份、现有头像与站名。主站用清楚的标题、真实文章摘要和细分隔线组织阅读；首页九篇 Coding Agent 内容是有明确顺序的专题。作者写作区沿用独立的 workbench/DESIGN.md。

键盘、窄窗口、手机与减少动态效果均是正常使用状态。

## Colors

前置令牌保留源代码颜色格式。cat-* 来自 assets/css/extended/zzz-experience.css；site-* 来自 PaperMod、reading.css 与最后生效的 zz-theme-surface.css。逐项来源在 sidecar。

Cat 蓝用于链接、当前导航和焦点；正文链接保留 site-link。文字选中沿用 reading.css 的橙色文字强调。柔粉与浅蓝保留在原有主题配色中，site-canvas 和 site-surface 区分页面与内容容器。带 -dark 的令牌是实际暗色覆盖。

## Typography

主站沿用 Noto Sans SC / Inter，导航沿用 Inter / Noto Sans SC；代码沿用 Fira Code / JetBrains Mono。

- display：首页短标题，手机继续使用同一响应式字号。
- headline：首页专题标题；文章标题与正文层级继续遵循既有阅读样式。
- body / label：正文阅读行距与主导航；日期使用等宽数字。
- code：已有代码字体栈，具体字号由阅读样式控制。

## Layout

主站内容变量为 --main-width: 900px，导航变量为 --nav-width: 1380px；主容器另含左右留白。首页介绍与头像并排，专题为双列，近期文章使用日期窄列和正文宽列。不超过 700px 时导航换行、专题重排；文章侧目录沿用自己的断点。

搜索、终端和主题图标使用相同的 34 × 34px 操作区与 20 × 20px SVG。“更多”同为 34px 高，使用 SVG 箭头，避免字符基线错位。

## Elevation & Depth

主站专题容器和文章行主要依靠边线与底色分层，更多菜单和链接预览使用轻阴影。头像悬停或键盘聚焦时一秒旋转 360 度；系统的减少动态效果设置取消旋转。导航箭头跟随展开状态旋转。

## Shapes

小控件、菜单和专题容器使用前置 rounded 令牌。文章行保留连续分隔线，头像为圆形；保留现有图片，不替换为参考站角色素材。

## Components

### Navigation

主导航保留文章、项目、友链、关于，次级入口放入“更多”；当前页使用颜色和下划线。搜索、终端、主题切换保留具名且可聚焦的入口。

### Cards / Containers

专题容器使用 card-reading-route，九篇文章及顺序来自真实系列数据。文章行保留标题、摘要、分类和日期的层级，不改成重复的浮起卡片。

### Controls

悬停、内侧焦点与禁用状态必须可分辨。焦点使用 2px 描边与 -2px 偏移，触屏不依赖悬停才能访问文章。数据不可用时如实显示空状态。

## Rules

- 保留 xvsf、她和她的猫、已有头像与主站蓝粉色身份。
- 使用真实文章、专题、项目、友链与日期。
- 维护键盘焦点、手机布局和减少动态效果。
- 同步维护前置令牌与 schemaVersion 2 sidecar；写作区样式独立维护。
- 不复制参考站个人内容、壁纸或未确认许可的编译资源。
