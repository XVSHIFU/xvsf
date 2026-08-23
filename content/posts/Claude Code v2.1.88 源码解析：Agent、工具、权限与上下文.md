---
title: Claude Code v2.1.88 源码解析：Agent、工具、权限与上下文
date: 2026-08-22T16:00:00+08:00
draft: false
description: 基于 Claude Code v2.1.88 源码还原快照，解析状态机、工具协议、并发、权限、上下文与子 Agent 运行时。
categories:
  - AI Agent
tags:
  - Agent
  - Claude Code
  - 代码分析
---
# Claude Code v2.1.88 源码解析：Agent、工具、权限与上下文

> 这篇继续对照我们在 `06-多Agent与工程化/src/` 里手搓的 mini Claude Code。
>
> 这次研究的是 `参考源码/claude-code-source-code-main/`：由 Claude Code v2.1.88 意外公开的 source map 还原，并由社区补充研究文档和构建脚本的源码副本。

## 阅读前定位：这份源码是什么，应该怎么读

> **它确实来自 Claude Code v2.1.88 的源码泄露，足够研究生产级 Agent Harness；但它是社区还原快照，不是 Anthropic 内部 Git 仓库。**

2026 年 3 月 31 日，`@anthropic-ai/claude-code@2.1.88` 误带约 60 MB 的 `cli.js.map`。其中的 `sourcesContent` 可恢复约 1,900 个 TypeScript 文件，版本随后被撤回。这是发布包暴露，不是入侵窃取，也不代表 Anthropic 主动开源。

从官方发布物到本地副本，公开记录可以连成一条链：

| 时间 | 公开记录 |
|---|---|
| 2026-03-31 09:07 | `sanbuphy/learn-coding-agent` 创建 |
| 09:08 | 根提交 [`a988ee13`](https://github.com/willin/claude-code-source-code/commit/a988ee13cb0be2720a3542367cc6b61686088e1c) 加入 v2.1.88 的 `src/` 和 `vendor/` |
| 09:11–13:31 | 陆续增加 README、构建脚本、stub 和分析文档 |
| 15:00 | [`willin/claude-code-source-code`](https://github.com/willin/claude-code-source-code) 创建 fork，保存上述历史 |
| 15:42 | [`ZluxYao/claude-code-hub`](https://github.com/ZluxYao/claude-code-hub) 建立独立备份，保存 tgz、source map、恢复源码和整理仓库 |
| 2026-04-01 06:48 | [`Icon-T/claude-code-source-code`](https://github.com/Icon-T/claude-code-source-code) 创建 fork，继续保留源码树 |
| 10:55 | 父仓库 `main` 指向新的孤立根提交 [`ce8ca4a8`](https://github.com/sanbuphy/learn-coding-agent/commit/ce8ca4a8e7224817f46e5db08973b4022bd1eb0a)，只留下文档 |
| 2026-04-03 | Issues [#59](https://github.com/sanbuphy/learn-coding-agent/issues/59) 和 [#61](https://github.com/sanbuphy/learn-coding-agent/issues/61) 继续公开指向备份 |

两个根提交都没有父提交，所以当前父仓库与 fork 的旧历史已经断开。`forked from` 是仓库级谱系；父仓库 force-push 或换成 orphan 历史，不会删除 fork 里的旧文件。公开记录没有说明重写原因，不应继续猜测。

本地目录又与 Issue #61 指向的 [`Icon-T` 备份](https://github.com/Icon-T/claude-code-source-code)做过全量 Git blob 哈希校验：

> 远端 tree 为 `1b6b4ab07d0d7b795129852183137c28099c5550`；远端和本地各 1,952 个文件，缺失、内容差异和本地额外文件均为 0。

`src/` 共 1,902 个文件，其中 `.ts/.tsx` 1,884 个；tree 为 `7640f58ea271eb60952ebdbe0dfa173fc96ebe30`，与 `willin`、`Icon-T` 和 [`ZluxYao`](https://github.com/ZluxYao/claude-code-hub) 的备份相同。因此本地没有二次缺失或改写。

本文统一称它为“泄露源码还原版”：泄露指 source map 被公开分发，解包指提取发布物，源码还原指读取 `sourcesContent`，反编译只是社区的宽泛称呼；README、分析文档、构建脚本和 stub 属于后续整理。

**可信边界与学习价值。** 本地 `package.json` 标注 `@anthropic-ai/claude-code-source@2.1.88`、`decompiled source for research`。源码可作为 v2.1.88 的架构证据；README、研究报告和补建脚本只代表社区整理者。

`QUICKSTART.md` 说明原产品依赖 Bun 的 `feature()`、`MACRO`、`bun:bundle` 等编译期能力，当前目录缺少约 108 个 gated 内部模块，只能用 esbuild 做 best-effort 构建。例如 `query.ts` 引用的 `query/transitions.js` 就不在目录中。

这不妨碍研究主循环、Tool 协议、权限、并发、Compact、Skills、Memory、子 Agent、Plugin 和 PowerShell 工程，但不足以完整复现官方构建、研究服务端和模型权重，也不能代表 Claude Code 当前版本。

| 规模 | 本地结果 |
|---|---:|
| PowerShell 统计 / README 自报 | 477,418 / 约 512,664 行 |
| `query.ts` / `QueryEngine.ts` / `toolExecution.ts` | 约 1,700 / 1,200 / 1,700 行 |

行数差异来自还原格式、空行和生成内容。真正的结论是：Agent Loop 只占很小一部分，产品复杂度主要落在协议、状态、安全、兼容性和恢复。缺失模块只会阻挡对应 gated 功能的内部算法研究。

源码仍是 Anthropic 的专有实现。本文只总结架构和取舍，不复制大段实现，也不把研究副本当作可再发行的开源项目。

**三份代码的定位。** 它们不是互相替代，而是回答不同问题：

| 对照对象 | 性质 | 最适合学习 | 不要误解为 |
|---|---|---|---|
| 我们的 mini Claude Code | 教学实现，JS ESM，零依赖 | Agent Loop 的最小闭环；每层机制为什么存在 | 可以直接承担生产流量的产品 |
| `claude-code-best` | 社区维护的逆向/反编译重建版，继续修复和重组 | 可构建工程、模块拆分、测试、跨模型兼容 | Anthropic 官方仓库 |
| `claude-code-source-code-main` | v2.1.88 泄露 source map 的社区还原版，缺少部分内部模块 | 该版本真实出现过的接口、状态和边缘情况 | Anthropic 内部 Git 仓库或完整可构建源码 |

本文继续追问：**当 Agent 真正成为产品后，哪些写在注释和 prompt 里的约定，必须升级成代码中的显式状态？**

**阅读路径。** 不要从混合 CLI 参数、认证、恢复、MCP 和 UI 的 `main.tsx` 硬啃，先沿主执行链建立骨架：

```text
entrypoints/cli.tsx
        ↓
main.tsx / REPL.tsx
        ↓
QueryEngine.submitMessage()
        ↓
query() → queryLoop()
        ↓
callModel() → 流式 assistant/tool_use 消息
        ↓
StreamingToolExecutor 或 runTools()
        ↓
toolExecution.ts：校验 → hook → 权限 → 执行 → hook → 结果
        ↓
消息回填，进入下一次状态迁移
```

| 阅读主题 | 关键文件 |
|---|---|
| 会话与循环 | `src/QueryEngine.ts`、`src/query.ts`、`src/query/deps.ts`、`src/query/config.ts` |
| Tool 协议与注册 | `src/Tool.ts`、`src/tools.ts` |
| 执行与并发 | `src/services/tools/toolExecution.ts`、`src/services/tools/toolOrchestration.ts` |
| 权限与 Shell 安全 | `src/utils/permissions/permissions.ts`、`src/utils/bash/`、`src/tools/PowerShellTool/` |
| 上下文与记忆 | `src/services/compact/`、`src/memdir/`、`src/utils/attachments.ts` |
| 渐进披露 | `src/skills/loadSkillsDir.ts`、`src/utils/toolSearch.ts`、`src/tools/ToolSearchTool/` |
| 子 Agent 与插件 | `src/tools/AgentTool/`、`src/utils/plugins/`、`src/types/plugin.ts` |

---

## 差异一：while 循环没有消失，但已经变成显式状态机

我们在 `06/src/agent.mjs` 里的主循环大致是：

```js
while (true) {
  const reply = await callModel(messages)
  if (!reply.tool_calls?.length) return reply
  const results = await runTools(reply.tool_calls)
  messages.push(reply, ...results)
}
```

2.1.88 的 `queryLoop()` 仍然是 `while (true)`，但循环外有一个 `State`，每个 `continue` 都先构造下一状态，并记录本次迁移原因。

代码中能看到 7 种继续原因：

| transition reason | 含义 |
|---|---|
| `next_turn` | 正常工具回填后继续 |
| `collapse_drain_retry` | 上下文溢出后先提交已暂存的局部折叠，再试一次 |
| `reactive_compact_retry` | API 已报 prompt too long，现场压缩后重试 |
| `max_output_tokens_escalate` | 提高单次输出上限后重试同一请求 |
| `max_output_tokens_recovery` | 输出仍被截断，注入“从中断处续写”的元消息 |
| `stop_hook_blocking` | Stop Hook 阻止结束，把错误反馈给模型继续修正 |
| `token_budget_continuation` | 任务预算允许继续，注入下一步提示 |

它还把终止原因结构化为 `completed`、`model_error`、`prompt_too_long`、`aborted_tools`、`max_turns` 等，而不是只用“return 或 throw”表示所有结局。

### 真正值得抄的不是 7 个分支，而是状态迁移写法

```js
state = {
  ...nextState,
  transition: { reason: "reactive_compact_retry" },
}
continue
```

这样做的价值是：

- 能从日志回答“为什么又请求了一次模型”；
- 每条恢复路径明确重置或保留哪些字段；
- 可以给某种重试单独加次数上限，避免不同恢复机制互相触发成死循环；
- 将来可以把循环拆成 `step(state, event, config)` 形式做单元测试。

`src/query/config.ts` 甚至已经把一次 query 内不应变化的配置提前快照，并在注释里写明这是为未来提取纯 reducer 做准备。

**对 mini 的启发**：我们不必立刻实现所有恢复策略，但 08 综合项目应把 `continueReason` 和 `terminalReason` 变成显式数据。只加十几行状态定义，调试体验会提升一个量级。

---

## 差异二：Tool 不再是“函数”，而是一份完整运行协议

我们现在的工具是“JSON Schema 声明 + `executeTool()` switch”。2.1.88 的 `Tool` 类型已经承担一整份协议：

- 身份：`name`、`aliases`、`searchHint`；
- 输入输出：Zod schema、JSON Schema、output schema；
- 执行：`call()`、progress、context modifier；
- 安全属性：`isReadOnly()`、`isConcurrencySafe()`、`isDestructive()`、`isOpenWorld()`；
- 交互：新消息到来时是 `cancel` 还是 `block`；
- 校验与授权：`validateInput()`、`checkPermissions()`；
- 渐进披露：`shouldDefer`、`alwaysLoad`；
- Hooks：为权限规则准备 matcher；
- UI：如何渲染调用、进度、拒绝、错误、结果和分组结果；
- 输出预算：`maxResultSizeChars`，超限时落盘并返回指针。

`buildTool()` 为常见字段提供保守默认值：默认不可并发、默认不算只读；工具自己的 `checkPermissions` 若省略，则把输入交回通用权限流程。也就是说，新工具少写了并发或只读属性时，系统不会为了提速而擅自把它当成安全读操作。

### 一次工具调用经历的流水线

从 `toolExecution.ts` 可以还原为：

```text
查找工具
  → schema.safeParse
  → 工具自己的 validateInput
  → PreToolUse Hooks（可改输入、可给权限结论、可中止）
  → 通用权限 + 工具权限 + 用户确认
  → tool.call
  → 结果映射 / 大结果落盘 / 上下文修改
  → PostToolUse Hooks
  → 失败时 PostToolUseFailure Hooks
  → 生成 tool_result + 遥测
```

这里有一个非常细的设计：**给 SDK、Hooks、日志看的输入副本，与真正回送 API/执行工具的原输入分开**。兼容字段可以补在观测副本上，但不会意外改变 prompt cache 的字节序列。只有 Hook 或权限明确返回 `updatedInput` 时，修改才进入执行路径。

这说明生产级 Agent 里“参数”至少有三种身份：

1. 模型原始输出；
2. 给观察者看的规范化输入；
3. 最终授权并执行的输入。

我们的 mini 把三者当成同一个对象，教学阶段足够，但一旦加入 Hooks、审计和参数修正，就会互相污染。

---

## 差异三：并发不是工具名单，而是按输入判定的有序批处理

我们的 mini 用 `CONCURRENCY_SAFE_TOOLS` 判断哪些工具可进 `Promise.all()`。2.1.88 调用 `tool.isConcurrencySafe(parsedInput)`，因此同一种工具可以因为参数不同而得到不同结论。

它的编排规则是：

1. 连续的安全调用组成并发批次；
2. 每个不安全调用单独成为串行批次；
3. 默认最大并发为 10；
4. 并发工具产生的 `contextModifier` 先排队，等整批结束后再按原 tool call 顺序应用。

例如：

```text
Read A ─┐
Grep B ─┼─ 并发批次
Read C ─┘
Edit D ─── 串行
Read E ─┐
Glob F ─┘─ 新的并发批次
```

关键不是“能并发就全并发”，而是同时守住两件事：

- 独立 I/O 尽量重叠，降低延迟；
- 会改状态的操作保持模型给出的相对顺序。

**对 mini 的启发**：08 可以保留现在的批次算法，但把 `Set<toolName>` 改成工具自己的 `isConcurrencySafe(input)`，并让校验失败自动退回串行。这是很小但很深的升级。

---

## 差异四：权限系统已经变成策略引擎，Windows 是独立安全边界

我们的 `permissions.mjs` 有 5 种模式、allow/deny 规则和危险命令正则。2.1.88 对外仍暴露这 5 种模式：

- `default`
- `plan`
- `acceptEdits`
- `bypassPermissions`
- `dontAsk`

内部还存在受 feature gate 控制的 `auto`，以及不对用户直接开放的状态。规则来源被保留为显式字段：用户、项目、本地、命令行、策略、命令和会话等。判定结果也不是布尔值，而是带来源和理由的 `allow / deny / ask / passthrough`。

### Bash：从正则走向结构理解

`src/utils/bash/` 不只是若干危险正则。它提供与 tree-sitter Bash AST 兼容的结构，并分析：

- 命令替换、进程替换；
- 管道、`&&`、`||`、子 shell、命令组；
- heredoc 和重定向；
- 环境变量与声明命令；
- `cd` 改变后续相对路径语义；
- parse timeout / node budget，解析中止时 fail closed。

这个还原目录里实际能看到一份纯 TypeScript 的兼容解析器；部分注释仍保留了原生 tree-sitter/NAPI 路径的历史描述。研究时应该相信当前 import 和调用链，不要只看旧注释。

### PowerShell：不是把 Bash 正则换个命令名

对 Windows 用户，这部分尤其值得看：

- `src/utils/powershell/parser.ts` 会启动 PowerShell，用 `System.Management.Automation.Language.Parser.ParseInput()` 得到真实 AST；
- 用户命令先 Base64 编码传给解析脚本，避免直接拼接进脚本产生注入；
- `PowerShellTool` 下又分出 read-only allowlist、危险 cmdlet、路径校验、Git 安全、CLM、命令语义和权限归约；
- 解析失败、未知 AST 形态、脚本块、动态命令名等情况倾向于询问，而不是自动放行。

只看文件规模就能感受到产品成本：PowerShell 的 parser、permissions、path validation、security、read-only validation 等模块合计数千行。我们之前遇到的 `chcp 65001` 只是输出编码问题；生产级 Windows 支持还包括**语法、执行语义和授权模型**。

### 拒绝也有状态

`denialTracking.ts` 记录：

- 连续拒绝达到 3 次；或
- 总拒绝达到 20 次；

就回退到人工询问，避免自动分类器和模型反复互相拒绝。一次成功调用会清零“连续拒绝”，但保留总数。

这和 Query Loop 的显式 transition 是同一个思想：**“用户拒绝过”不能只是一条 UI 消息，而要进入控制状态。**

---

## 差异五：上下文管理不是“做摘要”，而是维护可恢复的状态边界

我们的 4 层压缩方向是对的。2.1.88 让这条链更完整：

```text
旧工具结果清理 / cache edits
        ↓
microcompact
        ↓
主动 auto compact
        ↓ 失败或 API 413
context collapse drain
        ↓
reactive compact
        ↓
仍失败才向用户暴露错误
```

压缩结果不只有 summary，而是一个组合结构：

```text
compact boundary
+ summary messages
+ 原样保留的近期消息
+ 重新注入的文件 / 记忆 / 技能附件
+ hooks 的补充结果
```

其中 `compact boundary` 是关键。它把“这里发生过历史替换”变成日志里的正式事件，使会话恢复、SDK 输出、垃圾回收和消息重连都知道压缩发生在哪里。

还有一个跨模块细节：动态发现过的工具名会写入 compact metadata。否则带 `tool_reference` 的旧消息被摘要吃掉后，系统会忘记模型已经加载过哪些工具，下一轮 schema 集合就会漂移。

### 输出截断也属于上下文恢复

当模型撞到 `max_output_tokens` 时，系统会：

1. 在特定条件下把上限提高后重试同一请求；
2. 仍截断时，注入一条要求从断点继续、不要道歉和复述的元消息；
3. 最多恢复 3 次，再暴露错误。

这让我重新理解“上下文管理”：它不仅是节省 token，更是在任何历史变形后，维持**消息配对、工具可见性、执行进度和用户体验的连续性**。

---

## 差异六：Skills、工具、记忆都采用“两阶段披露”

这份还原源码里反复出现同一个模式：

```text
先给模型一个很便宜的索引
        ↓
模型或 side query 判断相关性
        ↓
再加载少量完整内容
```

### Skills

`loadSkillsDir.ts` 支持：

- managed / user / project / additional / MCP 多来源；
- `allowed-tools`、`model`、`effort`、`hooks`、`context: fork`、`agent` 等 frontmatter；
- `paths` 条件：只有触碰到匹配路径时才激活；
- 在子目录工作时动态发现更近的 `.claude/skills/`；
- 同文件去重、来源优先级和缓存失效。

启动时估算的 token 只基于 `name / description / whenToUse`，完整正文在调用时才需要进入上下文。

### Tools

Tool 有 `shouldDefer` 和 `alwaysLoad`。当延期工具的 schema 占用过大时，模型先看到 `ToolSearchTool`，再通过关键词或 `select:<tool_name>` 加载具体工具。

自动模式的默认阈值是：延期工具定义约占模型上下文窗口 10% 时启用搜索。已经发现的工具从消息历史里的 `tool_reference` 恢复，并跨 compaction 保存。

### Memory

自动记忆目录也分两层：

- `MEMORY.md` 是始终加载的索引，限制为 200 行、25,000 字节；
- 具体记忆按主题放在独立 Markdown 文件里。

一次用户请求到来时，相关记忆流程是：

1. 扫描最多 200 个记忆文件的 frontmatter；
2. 用一个 Sonnet side query 从 manifest 里挑最多 5 个；
3. 排除本会话已经注入或已经读过的文件；
4. 主模型流式生成和执行工具时，记忆检索并行进行；
5. 只有检索已经完成才在本轮末尾消费，否则下一轮再试，永不阻塞主路径；
6. Abort 时通过 disposable 句柄取消 side query。

它还区分个人记忆、团队记忆、Agent 记忆、会话记忆与 transcript，并给记忆附带 mtime，提醒模型旧记忆只是历史观察，需要和当前代码核对。

**对 mini 的判断**：我们的 memory prefetch、最多 5 条、freshness 提示、already surfaced 去重已经在正确方向上；主要缺的是 scope、compact 后的状态衔接和统一生命周期，而不是再加一种相似度算法。

---

## 差异七：子 Agent 已从“函数调用”演化成任务运行时

我们的子 Agent 是经典 fork-return：干净上下文启动，完成后只把文本结果带回主 Agent。这仍然是最重要、最容易教清楚的骨架。

2.1.88 的 `AgentTool` 在骨架上又增加了：

- 前台同步执行；
- `run_in_background` 后台执行，完成后主动通知；
- 长任务在特定条件下自动转后台；
- 自定义 Agent 类型、模型和权限模式；
- 独立 `cwd`；
- Git worktree 隔离；
- 远程环境（受内部 feature gate 控制）；
- 输出文件、进度、token 和工具调用计数；
- `SendMessage` 邮箱式继续沟通；
- TeamCreate / TeamDelete / TaskCreate / TaskUpdate / TaskList 等共享任务系统；
- tmux、iTerm2 或进程内 teammate backend；
- 父子 Agent 权限同步、重连与清理。

这时子 Agent 已经不只是：

```text
result = await runSubAgent(prompt)
```

而更接近：

```text
task = spawn(runtimeConfig)
watch(task.progress)
send(task.mailbox, message)
await task.terminalState
cleanup(task.isolation)
```

一个很典型的生产细节是：后台任务结束或被杀时，代码会先更新 terminal status，让等待 `TaskOutput(block=true)` 的消费者立即解除阻塞，再清理 worktree。因为 Git 清理可能卡住，不能让资源清理挡住状态完成通知。

**对 mini 的启发**：多 Agent 的下一次升级不应先做“更多角色 prompt”，而应先做 `taskId + status + result + abort + notification`。有了任务协议，后台、恢复和团队协作才有落脚点。

---

## 差异八：Plugin 是扩展能力的发行单元

我们的 Skills、自定义 Agent 和 MCP 已经能分别加载，但三套机制彼此独立。2.1.88 的 Plugin 把多个扩展面装进一个发行单元：

- commands
- agents
- skills
- hooks
- output styles
- MCP servers
- LSP servers
- settings

围绕它又长出了 manifest 校验、Marketplace、安装缓存、版本 pin、自动更新、企业 allow/block policy、依赖解析和错误分类。

Hooks 也不只是 `PreToolUse / PostToolUse`。SDK 类型里列出了 27 个生命周期事件，包括：

- SessionStart / SessionEnd
- UserPromptSubmit
- PreToolUse / PostToolUse / PostToolUseFailure
- PermissionRequest / PermissionDenied
- Stop / StopFailure
- SubagentStart / SubagentStop
- PreCompact / PostCompact
- TaskCreated / TaskCompleted / TeammateIdle
- Setup / Notification
- ConfigChange / WorktreeCreate / WorktreeRemove
- InstructionsLoaded / CwdChanged / FileChanged
- Elicitation / ElicitationResult

这揭示了 Plugin 的真正作用：它不是“多一个安装命令”，而是为原本分散的扩展能力提供统一的**发现、版本、策略和生命周期边界**。

08 综合项目不需要实现 Marketplace，但可以提前留下一个统一扩展描述：

```js
{
  name,
  tools: [],
  skills: [],
  agents: [],
  hooks: {},
  mcpServers: {}
}
```

这样以后增加 Plugin 时，是加装载与分发层，不是重写 Agent 内核。

---

## 对 08 综合项目的取舍

### 值得现在补：少量代码就能换来结构收益

| 优先级 | 建议 | 最小做法 |
|---|---|---|
| P0 | 显式循环状态与终止原因 | `state + transition + terminalReason`，先支持正常下一轮、压缩重试、停止三类 |
| P0 | Tool 契约代替大 switch | 写零依赖 `defineTool()`，集中 schema、validate、permission、concurrency、execute |
| P0 | 工具执行流水线 | 把校验、授权、执行、结果预算、错误回填拆成独立步骤 |
| P1 | 输入级并发判断 | `isConcurrencySafe(input)`，失败默认串行 |
| P1 | 压缩边界事件 | 在 JSONL 中记录 compact boundary，而不只是原地替换数组 |
| P1 | 动态工具状态跨压缩 | 保存已激活工具名，避免摘要后 schema 回退 |
| P1 | 子 Agent 任务状态 | 先做 `taskId/status/result/abort`，再考虑后台 UI |

### 暂时不要补：会把综合项目拖成产品复刻

| 暂缓项 | 原因 |
|---|---|
| 完整 Bash / PowerShell AST 安全引擎 | 数千行语言与平台工程；08 先把 ShellProvider 接口留出来 |
| Team / Swarm / tmux backend | 要解决邮箱、共享任务、权限同步、重连和进程清理，不是多写几个 prompt |
| Plugin Marketplace | 分发、缓存、版本、签名与企业策略远超 Agent 核心 |
| MCP OAuth / Elicitation 全协议 | 适合独立章节，不应挤进主循环 |
| Remote Control / Bridge | 属于多端会话产品能力，不是 Coding Agent 最小闭环 |
| 27 种 Hooks 全实现 | 先选 4 个稳定缝：会话开始、工具前、工具后、停止 |

---

## 最后结论

先回答材料真实性：这不是网友凭空仿写的“Claude Code 风格项目”。本地 1,952 个文件与公开 fork 全量哈希一致，`src/` 主体来自 v2.1.88 意外公开的 source map。

再回答仓库完整性：它也不是 Anthropic 内部 Git 仓库的原样副本。社区补充内容、缺失模块和构建环境断层都客观存在，因此不能把每个文件都视为 Anthropic 原仓库中的原始文件。

这两个判断并不矛盾：

> **源代码内容的真实性较高，不代表当前研究目录在仓库层面完整、原始且可复现。**

在这个边界内做架构对照是有价值的。上一篇的结论仍然成立：**核心 while 循环两边一样，复杂度来自边缘情况。**

读完 v2.1.88 后，还可以再补一句：

> **生产级 Agent 的成长过程，就是不断把隐式约定升级为显式状态。**

- “再试一次”变成 transition reason；
- “这个工具应该安全”变成输入级安全属性；
- “用户拒绝过”变成 denial state；
- “历史被压缩过”变成 compact boundary；
- “这个工具已经加载”变成可持久化 discovered set；
- “子 Agent 还在跑”变成 task terminal state；
- “扩展应该能装进去”变成 Plugin 生命周期。

我们的 mini 不是方向错了，而是把这些状态暂时压缩进一个类、几个数组和一些约定里。

08 综合项目最值得做的，不是照着 47 万行继续加功能，而是挑出三四个关键状态，把它们从“大家默认知道”变成“代码明确表达”。做到这一步，mini 才会从能跑的 demo 变成可以继续生长的内核。

---

## 公开资料

- [Zscaler：Claude Code v2.1.88 source map 泄露分析](https://www.zscaler.com/blogs/security-research/anthropic-claude-code-leak)
- [sanbuphy/learn-coding-agent：当前已重写历史的父仓库](https://github.com/sanbuphy/learn-coding-agent)
- [旧历史根提交：加入 v2.1.88 还原源码](https://github.com/willin/claude-code-source-code/commit/a988ee13cb0be2720a3542367cc6b61686088e1c)
- [当前父仓库根提交：重建为文档仓库](https://github.com/sanbuphy/learn-coding-agent/commit/ce8ca4a8e7224817f46e5db08973b4022bd1eb0a)
- [willin/claude-code-source-code：旧历史的 fork 快照](https://github.com/willin/claude-code-source-code)
- [Icon-T/claude-code-source-code：与本地目录完全一致的 fork 快照](https://github.com/Icon-T/claude-code-source-code)
- [Issue #59：ZluxYao 独立备份线索](https://github.com/sanbuphy/learn-coding-agent/issues/59)
- [Issue #61：Icon-T fork 备份线索](https://github.com/sanbuphy/learn-coding-agent/issues/61)
- [ZluxYao/claude-code-hub：tgz、source map 与源码副本备份](https://github.com/ZluxYao/claude-code-hub)
- [chauncygu/collection-claude-code-source-code：不同性质源码项目的集合说明](https://github.com/chauncygu/collection-claude-code-source-code)

> GitHub 元数据和提交用于确认仓库传播链；外部报道用于确认泄露事件。具体架构结论仍以本地 `src/` 的实际代码、导入关系和调用路径为准。

---

## 本地参考路径

- `../参考源码/claude-code-source-code-main/package.json`
- `../参考源码/claude-code-source-code-main/QUICKSTART.md`
- `../参考源码/claude-code-source-code-main/src/QueryEngine.ts`
- `../参考源码/claude-code-source-code-main/src/query.ts`
- `../参考源码/claude-code-source-code-main/src/Tool.ts`
- `../参考源码/claude-code-source-code-main/src/services/tools/toolExecution.ts`
- `../参考源码/claude-code-source-code-main/src/services/tools/toolOrchestration.ts`
- `../参考源码/claude-code-source-code-main/src/utils/permissions/`
- `../参考源码/claude-code-source-code-main/src/utils/bash/`
- `../参考源码/claude-code-source-code-main/src/tools/PowerShellTool/`
- `../参考源码/claude-code-source-code-main/src/services/compact/`
- `../参考源码/claude-code-source-code-main/src/memdir/`
- `../参考源码/claude-code-source-code-main/src/skills/loadSkillsDir.ts`
- `../参考源码/claude-code-source-code-main/src/utils/toolSearch.ts`
- `../参考源码/claude-code-source-code-main/src/tools/AgentTool/`
- `../参考源码/claude-code-source-code-main/src/utils/plugins/`
