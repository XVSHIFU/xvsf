# Front Matter 规范

文章 Front Matter 使用 YAML，并由 `schemas/frontmatter.schema.json` 定义字段类型。

```yaml
---
title: "文章标题"
date: "2026-07-22T10:00:00+08:00"
draft: true
description: "文章摘要，可暂时留空"
categories:
  - "分类名称"
tags:
  - "标签名称"
showToc: true
tocOpen: true
---
```

必填字段为 `title`、`date`、`draft`、`categories` 和 `tags`。`categories` 至少包含一个非空分类；`tags` 可以是空数组。不要为了通过校验而编造 `description`、`aliases` 或 `lastmod`。

## 命令

- `npm run frontmatter:check`：只读校验全部文章并确认格式已经规范化。
- `npm run frontmatter:write`：无损规范化 Front Matter；正文部分必须保持逐字节不变。

新文章优先使用 `hugo new posts/文章名.md`，Hugo 会读取 `archetypes/default.md` 生成上述结构。
