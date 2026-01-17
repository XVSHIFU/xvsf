# Hugo Frontmatter 模板

## 完整模板
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "标签1"
  - "标签2"
categories:
  - "分类名称"
description: "文章描述"
draft: false
showToc: true
tocOpen: true
---
```

## 简化模板（必要字段）
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "标签"
categories:
  - "分类"
---
```

## 字段说明
- **title**: 文章标题（必需）
- **date**: 发布日期和时间（必需），格式: YYYY-MM-DDTHH:MM:SS+08:00
- **tags**: 标签数组（可选），每个标签一行以 `-` 开头
- **categories**: 分类数组（可选），通常只需一个分类
- **description**: 文章描述/摘要（可选）
- **draft**: 是否为草稿（可选），true/false
- **showToc**: 显示目录（可选），true/false
- **tocOpen**: 目录默认展开（可选），true/false

## 快速复制模板

### Java基础
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "标签"
categories:
  - "Java基础"
---
```

### Java安全
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "标签"
categories:
  - "Java安全"
---
```

### 代码审计
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "标签"
categories:
  - "代码审计"
---
```

### 漏洞靶场
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "标签"
categories:
  - "漏洞靶场"
---
```

### 环境搭建
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "标签"
categories:
  - "环境搭建"
---
```

### 示例
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "标签"
categories:
  - "示例"
---
```

## 常用日期格式
- `2025-08-12T10:00:00+08:00` - 标准国际格式
- `2025-08-12` - 仅日期（时间默认为00:00:00）

## 注意事项
1. 中文字符使用引号包裹（如: `"Java基础"`）
2. 数组元素每行一个，以 `-` 开头
3. 冒号后面需要空格
4. YAML 严格要求缩进（2个空格为标准）
