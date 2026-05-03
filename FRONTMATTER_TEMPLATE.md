# Hugo Frontmatter 模板与分类归档建议

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

---

## 📚 分类归档建议

基于对博客现有 61 篇文章的全面分析，建议采用以下分类体系：

### 一级分类（Categories）

#### 1️⃣ Java基础&Java安全（25 篇）
**适用文章：** CC1-CC7 链、FastJson、Shiro、内存马系列、表达式注入、JNDI、RMI 等

**推荐子标签（Tags）：**
- `反序列化` - CC 链、FastJson、Shiro 等反序列化漏洞
- `内存马` - Tomcat/Spring/Agent 内存马
- `表达式注入` - EL/SpEL 注入
- `JNDI注入` - JNDI/RMI 相关
- `Java基础` - 序列化基础、注解反射等

**快速模板：**
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "反序列化"
categories:
  - "Java基础&Java安全"
---
```

---

#### 2️⃣ 代码审计（8 篇）
**适用文章：** Smartbi、JshERP、wuzhicms、yccms、DedeCMS、若依等系统审计

**推荐子标签（Tags）：**
- `企业系统` - ERP、BI 等企业级系统
- `CMS审计` - 内容管理系统
- `漏洞复现` - CVE 漏洞复现
- `代码分析` - 源码审计技巧

**快速模板：**
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "企业系统"
  - "漏洞复现"
categories:
  - "代码审计"
---
```

---

#### 3️⃣ 渗透测试（13 篇）
**适用文章：** 红日靶场系列、Pikachu、Bandit、内网渗透、永恒之蓝等

**推荐子标签（Tags）：**
- `红日靶场` - hongri1-5 系列
- `CTF` - CTF 竞赛题解
- `内网渗透` - 内网横向移动
- `漏洞利用` - 具体漏洞利用技术
- `靶场实战` - 各类靶场练习

**快速模板：**
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "红日靶场"
  - "内网渗透"
categories:
  - "渗透测试"
---
```

---

#### 4️⃣ 应急响应（3 篇）
**适用文章：** ATT&CK 蓝队防御系列、Linux 应急响应等

**推荐子标签（Tags）：**
- `ATT&CK` - ATT&CK 框架
- `蓝队防御` - 防御技术
- `应急处置` - 应急响应流程
- `Linux安全` - Linux 系统安全

**快速模板：**
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "ATT&CK"
  - "蓝队防御"
categories:
  - "应急响应"
---
```

---

#### 5️⃣ Python 爬虫（11 篇）
**适用文章：** Requests、BeautifulSoup、Scrapy、数据可视化系列等

**推荐子标签（Tags）：**
- `爬虫基础` - Requests、BeautifulSoup、正则表达式
- `爬虫框架` - Scrapy 框架
- `数据可视化` - pandas、词云等
- `动态爬取` - 动态网页爬取

**快速模板：**
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "爬虫基础"
  - "数据可视化"
categories:
  - "Python爬虫"
---
```

---

#### 6️⃣ 开发工具（5 篇）
**适用文章：** PHPStorm XDebug、JDK 切换、语雀工具、sqlmap、环境搭建等

**推荐子标签（Tags）：**
- `环境配置` - 开发环境搭建
- `调试工具` - XDebug 等调试工具
- `自动化工具` - 自研小工具
- `渗透工具` - sqlmap 等安全工具

**快速模板：**
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "环境配置"
  - "调试工具"
categories:
  - "开发工具"
---
```

---

#### 7️⃣ AI 开发（新增分类）
**适用文章：** AI 私厨、LangChain 项目、Agent 开发、大模型应用等

**推荐子标签（Tags）：**
- `LangChain` - LangChain 框架开发
- `Agent开发` - 智能体开发
- `大模型应用` - LLM 应用开发
- `AI工具` - AI 工具使用与学习
- `项目实战` - 完整项目实战
- `多模态` - 多模态模型应用
- `RAG` - 检索增强生成

**快速模板：**
```yaml
---
title: "文章标题"
date: 2025-08-12T10:00:00+08:00
tags:
  - "LangChain"
  - "Agent开发"
  - "项目实战"
categories:
  - "AI开发"
description: "AI 开发项目笔记"
showToc: true
tocOpen: true
---
```

---

## 🏷️ 通用标签（Tags）推荐

### 技术栈标签
- `Java` / `Python` / `PHP` / `JavaScript`
- `Spring` / `SpringBoot` / `Tomcat`
- `Linux` / `Windows`

### 漏洞类型标签
- `RCE` / `SQL注入` / `XSS` / `SSRF` / `XXE`
- `文件上传` / `文件包含` / `反序列化`
- `权限绕过` / `命令执行`

### 技术方向标签
- `Web安全` / `二进制安全` / `移动安全`
- `红队` / `蓝队` / `攻防演练`

---

## 📝 字段说明

- **title**: 文章标题（必需）
- **date**: 发布日期和时间（必需），格式: `YYYY-MM-DDTHH:MM:SS+08:00`
- **tags**: 标签数组（建议 2-4 个），每个标签一行以 `-` 开头
- **categories**: 分类数组（建议只用 1 个主分类）
- **description**: 文章描述/摘要（可选，建议填写以优化 SEO）
- **draft**: 是否为草稿（可选），`true`/`false`
- **showToc**: 显示目录（可选），`true`/`false`
- **tocOpen**: 目录默认展开（可选），`true`/`false`

---

## 🎯 分类使用建议

### 原则
1. **一篇文章只用一个主分类**（categories），避免分类混乱
2. **使用 2-4 个标签**（tags）来标注文章的多个维度
3. **分类体现文章的主要领域**，标签体现具体技术点
4. **保持分类体系稳定**，避免频繁新增分类

### 示例

**示例 1：Java 反序列化文章**
```yaml
---
title: "FastJson 反序列化漏洞分析"
date: 2025-08-12T10:00:00+08:00
tags:
  - "反序列化"
  - "FastJson"
  - "RCE"
categories:
  - "Java基础&Java安全"
description: "深入分析 FastJson 1.2.24-1.2.80 版本的反序列化漏洞原理与利用"
showToc: true
tocOpen: true
---
```

**示例 2：代码审计文章**
```yaml
---
title: "Smartbi v8.5 代码审计"
date: 2025-08-12T10:00:00+08:00
tags:
  - "企业系统"
  - "代码分析"
  - "Java"
categories:
  - "代码审计"
description: "Smartbi BI 系统 v8.5 版本的安全代码审计实战"
showToc: true
tocOpen: true
---
```

**示例 3：渗透靶场文章**
```yaml
---
title: "红日靶场 1 - 完整渗透记录"
date: 2025-08-12T10:00:00+08:00
tags:
  - "红日靶场"
  - "内网渗透"
  - "域渗透"
categories:
  - "渗透测试"
description: "红日安全靶场第一套环境的完整渗透测试过程"
showToc: true
tocOpen: true
---
```

**示例 4：Python 爬虫文章**
```yaml
---
title: "Scrapy 框架入门与实战"
date: 2025-08-12T10:00:00+08:00
tags:
  - "爬虫框架"
  - "Scrapy"
  - "Python"
categories:
  - "Python爬虫"
description: "Scrapy 爬虫框架的基础使用与实战案例"
showToc: true
tocOpen: true
---
```

---

## 📅 常用日期格式

- `2025-08-12T10:00:00+08:00` - 标准国际格式（推荐）
- `2025-08-12` - 仅日期（时间默认为 00:00:00）

---

## ⚠️ 注意事项

1. **中文字符必须使用引号包裹**（如: `"Java基础&Java安全"`）
2. **数组元素每行一个，以 `-` 开头**
3. **冒号后面必须有空格**
4. **YAML 严格要求缩进**（2 个空格为标准）
5. **日期格式必须准确**，建议使用 ISO 8601 格式
6. **标签和分类名称保持一致性**，避免出现 `Java基础&Java安全` 和 `java安全` 这种重复

---

## 🔄 文章迁移建议

### 当前文章分类映射

| 原分类 | 建议新分类 | 数量 |
|--------|-----------|------|
| Java基础 → | Java基础&Java安全 | ~7 篇 |
| Java基础&Java安全 → | Java基础&Java安全 | ~18 篇 |
| 代码审计 → | 代码审计 | ~8 篇 |
| 漏洞靶场 → | 渗透测试 | ~13 篇 |
| 环境搭建 → | 开发工具 | ~3 篇 |
| 示例 → | （根据内容重新分类） | ~1 篇 |
| 未分类 → | （根据内容分类） | ~11 篇 |

### 迁移步骤
1. 备份现有文章
2. 使用 `scripts/` 目录下的规范化脚本批量更新
3. 逐篇检查 frontmatter 是否符合新规范
4. 测试本地构建：`hugo server`
5. 确认无误后提交

---

## 🛠️ 批量修改工具

可以使用项目中的 `scripts/` 目录下的工具脚本进行批量 Front Matter 规范化处理。

---

**最后更新：** 2026-04-27  
**文章总数：** 61 篇  
**分类体系版本：** v2.0
