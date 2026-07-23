---
title: xss_lab
date: 2025-10-29T20:31:00+08:00
draft: false
description: xss_lab
categories:
  - 渗透测试
tags:
  - XSS靶场
showToc: true
tocOpen: true
demoAlert: true
---

## XSS 弹窗演示

进入本页时会执行一次固定的弹窗，用于保留这篇靶场文章原本的演示效果。

```javascript
alert(1);
```

这里没有开放 Markdown 原始脚本执行；弹窗由主题模板根据本页的 `demoAlert` 字段安全触发，不会影响其他文章。
