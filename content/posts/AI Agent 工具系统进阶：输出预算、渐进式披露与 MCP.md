---
title: AI Agent 工具系统进阶：输出预算、渐进式披露与 MCP
date: 2026-08-19T10:00:00+08:00
draft: false
description: 从工具注册表出发，实践工具输出预算、渐进式工具披露，并实现可动态挂载的 MCP 客户端与 Server。
categories:
  - AI开发
tags:
  - Agent
  - 工具系统
  - MCP
---
# AI Agent 工具系统进阶：输出预算、渐进式披露与 MCP

> 目标：吃透工具系统边界（输出预算 / 渐进披露），写出第一个能被外部调用的自定义 MCP Server。

## 工具系统（s02）

加一个工具，要同时改两个地方——给模型看的 TOOLS 声明数组，和真正干活的 if-else 执行分支。工具一多，两处早晚对不上：声明了工具却忘了写分支，模型兴冲冲调用，只得到一句"未知工具"。

另一个问题出在改文件上：shell 理论上万能，但让模型拼 `sed -i 's/old/new/' file` 去改文件很不可靠——引号转义、正则特殊字符、跨平台差异（Windows 没有 sed）、多行文本，每一项都容易出错。

### 解决方案

解法是把工具收拢成一张**注册表**——说明和实现放在同一处，天然不会失配。这就是**单一事实来源**（single source of truth）：同一份信息只写在一个地方，其余都从它生成。从此加工具 = 加一个条目。真实产品都是这个形状——Claude Code、Codex、Reina，本质都是一张注册表。

改文件的可靠性问题，靠读、写、改文件的专用工具解决。**专用文件工具不是为了省事，是为了可靠。**

### 实现：

#### agent.mjs

```js
#!/usr/bin/env node
// v1 —— 工具箱与调度。
//
// v0 只有一双手（run_shell）。v1 建立真正的工具系统：
//   · 工具注册表（registry）：加一个工具 = 加一个条目，主循环一行不改
//   · 专用文件工具：read_file / write_file / edit_file —— 比让模型拼 sed 命令
//     可靠一个数量级（edit_file 的"唯一匹配"契约就是 Claude Code Edit 的契约）
//   · 错误即信息：工具永远不抛异常打死进程，错误文本回填给模型，它会自己改道
//
// 运行方式与 v0 相同：AGENT_API_KEY=sk-xxx node agent.mjs

import readline from "node:readline/promises";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const BASE_URL = process.env.AGENT_BASE_URL ?? "https://api.deepseek.com/v1";
const API_KEY = process.env.AGENT_API_KEY;
const MODEL = process.env.AGENT_MODEL ?? "deepseek-chat";

if (!API_KEY) {
  console.error("缺少 AGENT_API_KEY。任何 OpenAI 兼容的 key 都行（DeepSeek / Kimi / GLM / OpenRouter / 本地 Ollama）。");
  process.exit(1);
}

const SYSTEM = `你是一个运行在用户终端里的编程助手。
优先用专用工具（read_file / write_file / edit_file）操作文件，它们比 shell 命令可靠；
run_shell 用于其余一切（跑测试、git、查环境）。
先观察真实世界再行动，不要凭空猜测文件内容。
当前目录：${process.cwd()}
操作系统：${process.platform}`;

// ---------------------------------------------------------------------------
// 工具注册表：v1 的核心。每个工具 = 描述（给模型看）+ 参数 schema + handler。
// 主循环只认识这张表，永远不需要知道具体有哪些工具 —— 这就是"开闭"的最小形态。
// ---------------------------------------------------------------------------

const REGISTRY = {
  run_shell: {
    description: "在用户的终端里执行一条 shell 命令，返回 stdout 和 stderr。",
    parameters: {
      type: "object",
      properties: { command: { type: "string", description: "要执行的命令" } },
      required: ["command"],
    },
    handler: ({ command }) => {
      console.log(`\x1b[33m  $ ${command}\x1b[0m`);
      try {
        const out = execSync(command, {
          encoding: "utf8",
          timeout: 30_000,
          maxBuffer: 1024 * 1024,
          stdio: ["ignore", "pipe", "pipe"],
        });
        return out.trim() || "(命令执行成功，无输出)";
      } catch (err) {
        return `命令失败（exit ${err.status ?? "?"}）：\n${err.stdout ?? ""}${err.stderr ?? err.message}`;
      }
    },
  },

  read_file: {
    description: "读取一个文本文件，返回带行号的内容。",
    parameters: {
      type: "object",
      properties: { path: { type: "string", description: "文件路径（相对或绝对）" } },
      required: ["path"],
    },
    handler: ({ path: p }) => {
      console.log(`\x1b[33m  read ${p}\x1b[0m`);
      const text = readFileSync(p, "utf8");
      // 悬念：如果这个文件有 2MB 呢？一次 read 就把上下文撑爆。
      // 这里先用最粗暴的上限顶着，第 4 章（预算与无损溢出）会正面解决它。
      const CAP = 50_000;
      const body = text.length > CAP ? text.slice(0, CAP) + `\n…(截断，共 ${text.length} 字符)` : text;
      return body
        .split("\n")
        .map((line, i) => `${String(i + 1).padStart(4)}\t${line}`)
        .join("\n");
    },
  },

  write_file: {
    description: "写入一个文件（整体覆盖）。父目录不存在时自动创建。",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "文件路径" },
        content: { type: "string", description: "完整的文件内容" },
      },
      required: ["path", "content"],
    },
    handler: ({ path: p, content }) => {
      console.log(`\x1b[33m  write ${p} (${content.length} 字符)\x1b[0m`);
      mkdirSync(path.dirname(path.resolve(p)), { recursive: true });
      writeFileSync(p, content);
      return `已写入 ${p}`;
    },
  },

  edit_file: {
    description:
      "对文件做一次精确替换。old_string 必须在文件中出现且仅出现一次（带上足够的上下文来保证唯一），否则会失败。",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "文件路径" },
        old_string: { type: "string", description: "要被替换的原文（必须唯一匹配）" },
        new_string: { type: "string", description: "替换成的新文本" },
      },
      required: ["path", "old_string", "new_string"],
    },
    handler: ({ path: p, old_string, new_string }) => {
      console.log(`\x1b[33m  edit ${p}\x1b[0m`);
      const text = readFileSync(p, "utf8");
      const first = text.indexOf(old_string);
      if (first === -1) return `编辑失败：old_string 在 ${p} 中找不到。请先 read_file 确认原文。`;
      if (text.indexOf(old_string, first + 1) !== -1)
        return `编辑失败：old_string 在 ${p} 中出现多次。请带上更多上下文让它唯一。`;
      // 不能用 text.replace(old, new)：new_string 里的 $$ / $& 会被 JS 当替换模式展开，静默写坏文件。
      writeFileSync(p, text.slice(0, first) + new_string + text.slice(first + old_string.length));
      return `已编辑 ${p}`;
    },
  },
};

// 由注册表自动生成 API 所需的 tools 参数 —— 单一事实来源。
const TOOLS = Object.entries(REGISTRY).map(([name, t]) => ({
  type: "function",
  function: { name, description: t.description, parameters: t.parameters },
}));

// 统一调度：找不到工具、参数解析失败、handler 抛异常，一律变成文本回给模型。
function dispatch(call) {
  const tool = REGISTRY[call.function.name];
  if (!tool) return `未知工具：${call.function.name}`;
  let args;
  try {
    args = JSON.parse(call.function.arguments || "{}");
  } catch (err) {
    return `工具参数不是合法 JSON：${err.message}`;
  }
  try {
    return tool.handler(args);
  } catch (err) {
    return `工具执行出错：${err.message}`;
  }
}

// ---------------------------------------------------------------------------
// 主循环：和 v0 逐字相同（除了 dispatch 那一行）。这是 v1 最重要的一章 ——
// 工具系统翻了四倍，循环没有动。以后每一章都是这样：机制围着循环长，循环不变。
// ---------------------------------------------------------------------------

async function chat(messages) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM }, ...messages],
      tools: TOOLS,
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}：${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message;
}

async function runTurn(messages) {
  while (true) {
    const msg = await chat(messages);
    messages.push(msg);

    if (msg.content) console.log(`\n${msg.content}`);
    if (!msg.tool_calls?.length) return;

    for (const call of msg.tool_calls) {
      messages.push({ role: "tool", tool_call_id: call.id, content: dispatch(call) });
    }
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const messages = [];

console.log(`v1 agent 已上线（${MODEL}）。工具：${Object.keys(REGISTRY).join("、")}。Ctrl+C 退出。`);

while (true) {
  const line = (await rl.question("\n你> ")).trim();
  if (!line) continue;
  messages.push({ role: "user", content: line });
  await runTurn(messages);
}

```

#### 工具注册表

注册表就是一个对象，每个工具一个条目，说明（description + parameters）和实现（handler）放一起：

```js
const REGISTRY = {
  run_shell: {
    description: "在用户的终端里执行一条 shell 命令……",
    parameters: { type: "object", properties: { command: {...} }, required: ["command"] },
    handler: ({ command }) => { ... },
  },
  read_file:  { description, parameters, handler },
  write_file: { description, parameters, handler },
  edit_file:  { description, parameters, handler },
};
```

API 需要的 TOOLS 数组不再手写，由注册表生成（单一事实来源）；调度也从 if-else 变成查表 `dispatch(call)`：

```js
const TOOLS = Object.entries(REGISTRY).map(([name, t]) => ({
  type: "function",
  function: { name, description: t.description, parameters: t.parameters },
}));

function dispatch(call) {
  const tool = REGISTRY[call.function.name];
  if (!tool) return `未知工具：${call.function.name}`;
  try { return tool.handler(JSON.parse(call.function.arguments || "{}")); }
  catch (err) { return `工具执行出错：${err.message}`; }
}
```

dispatch 把 s01 的"错误即信息"升级成了系统性约定：未知工具、坏参数、handler 抛异常，三条失败路径全部变成文本回给模型，任何一条都不打死进程。主循环唯一的变化是把 if-else 换成 `dispatch(call)`，之后不再修改。

#### edit_file：唯一匹配规则

```js
// old_string 必须在文件中出现且仅出现一次，否则拒绝执行
if (first === -1) return `编辑失败：old_string 在 ${p} 中找不到。请先 read_file 确认原文。`;
if (text.indexOf(old_string, first + 1) !== -1)
  return `编辑失败：old_string 在 ${p} 中出现多次。请带上更多上下文让它唯一。`;
```

这条规则把"模型脑中的文件"和"磁盘上的文件"强制对齐：

- 匹配不到 → 模型的记忆过期了（文件被改过，或它记错了）→ 报错引导它先 `read_file` 刷新认知，而不是改错地方；
- 匹配到多处 → 定位有歧义 → 报错引导它带上更多上下文行，精确到唯一。

**报错是写给模型看的界面**：好的报错直接告诉模型下一步动作，模型照做就能自愈；坏的报错（"Error: -1"）只会让它原地打转。

### 运行：

```powershell
$env:AGENT_API_KEY = "sk-xxx"
node .\03-工具系统与MCP\s02_tool_system\agent.mjs
```

两个实验：

1. 工具组合：对它说"在 demo/ 下建一个 hello.js 打印当前时间，然后把打印内容改成中文，最后跑给我看"。你会看到 `write` → `edit` → `$ node` 三种黄色行依次出现——一条指令，模型自己编排了三种工具。
2. 触发唯一性检查：挑一个文件里出现多次的短语让它替换。观察 edit_file 报"出现多次"、模型带上更长的上下文重试成功——这是唯一匹配规则的现场演示。

### 练习

加一个 `list_dir` 工具：列出目录内容，标注类型（文件/目录）和大小。

这次你只需要加一个条目。对比 s01 挑战题的体验，可以体会注册表的价值，也是"机制围着循环长，循环不变"的第一次兑现。

### 练习的答案

在 REGISTRY 里加一个条目（文件顶部 import 补 `readdirSync, statSync`）：

```js
// import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";

list_dir: {
  description: "列出目录内容，标注类型（文件/目录）和大小。",
  parameters: {
    type: "object",
    properties: { path: { type: "string", description: "目录路径（相对或绝对），默认当前目录" } },
  },
  handler: ({ path: p = "." }) => {
    const entries = readdirSync(p, { withFileTypes: true });
    return entries
      .map((e) => {
        const full = path.join(p, e.name);
        const st = statSync(full);
        const type = e.isDirectory() ? "目录" : "文件";
        return `${type.padEnd(4)} ${String(st.size).padStart(10)}  ${e.name}`;
      })
      .join("\n");
  },
},
```

要点：**加一个工具 = 加一个条目**，TOOLS 生成和 dispatch 查表都是自动的，主循环一行不改——这就是注册表兑现的"开闭"：对扩展开放（加条目），对修改封闭（循环不动）。

### 与真实产品对照（延伸阅读）

- Claude Code 的 Edit 工具与本章 `edit_file` 规则相同（还多一个 `replace_all` 参数处理"全部替换"的场景，留作思考题）。
- 为什么用字面量匹配而不用正则替换？因为正则转义是模型的常见出错点。字面量匹配 + 唯一性规则比正则可靠，这是各家产品从生产事故中得出的共同结论。
- Reina 的工具注册表在 `packages/tools/src/`，每个工具一个文件，形态和本章 REGISTRY 一致；它的 CLAUDE.md 里有一条规则："加新工具要注册进 tool registry，不许给引擎类加方法"——注册表一旦建立，就要守住它。
- CRLF 问题：Windows 文件是 `\r\n` 换行，模型给的 old_string 是 `\n`，会匹配不上。真实产品都遇到过。最简单的对策是让报错引导模型重试；更彻底的做法留作思考题。

---

## 工具输出预算与溢出（s04）

你让 agent 检查一个导出文件，它顺手执行了 `cat data.json`——一个 2MB 的文件。轻则这轮请求直接失败：2MB 约等于五十多万 token，超出模型一次能读的上限（上下文窗口），API 返回 400；就算窗口装得下，这五十万 token 也从此留在对话历史里，每一轮都重新计费——一次 cat，成本翻倍。

s02 给 `read_file` 加过一个 50KB 截断。但截掉的部分模型永远看不到，它也不知道自己错过了什么——如果问题恰好在第 51KB，就查不出来了。这三种坏结局（撑爆窗口、持续计费、截断丢信息）的共同根源是：**模型每轮能看到多少，完全没有预算约束**。

### 解决方案

给工具输出设预算，超出的部分完整存到磁盘（落盘），对话里只留一张"取件条"——写明存在哪、有多大、怎么取——不丢任何信息。解法不是截得更狠。截断和溢出是两种思路：

| | 截断 | 溢出 |
|---|---|---|
| 超限的部分去哪了 | 删除——永远消失 | 落盘——完整保存 |
| 模型知道自己错过了什么吗 | 不知道 | 知道：指针写明全文在哪、有多大、怎么取 |
| 需要细节时 | 只能重跑命令（贵，还可能不可重现） | `read_file` 分段取回 |

### 实现：

#### spill.mjs

```js
// 工具输出的观测预算与无损溢出 —— 本章的机制模块。
//
// 从真实产品 Reina 简化移植，对应两处生产实现：
//   · packages/core/src/engine.ts 的 enforceTurnObservationBudget
//     （单条上限 + 整轮总量上限，超限的从最大者开始溢出）
//   · packages/tools/src/log-compress.ts 的 compressLogOutput
//     （按"重要性"折叠构建/测试日志：错误行永远保留，噪声行折叠成标记）
//
// 核心原则：截断是有损的，溢出是无损的。
// 超预算的输出完整落盘，回给模型的是"头尾节选 + 指针"——细节永远只差一次 read_file。

import { writeFileSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

// 演示尺度的预算（Reina 生产值：单条 100_000 字符、整轮 200_000 字符，
// 小窗口模型按窗口的 15% / 30% 缩放；节选 6_000~16_000 随窗口浮动）。
export const DEFAULTS = {
  perResult: 50_000, // 单条工具输出超过这个字符数 → 必溢出（s02 的 50KB，从截断线变成溢出线）
  turnTotal: 100_000, // 一轮所有工具输出的总量超过这个 → 从最大的开始溢出
  preview: 2_000, // 溢出后回给模型的节选大小（头部为主 + 一小段尾部）
  dir: ".agent-spill", // 落盘目录
};

/** 把一段完整输出落盘，返回相对路径。文件内容是逐字原文 ——
 *  指针文案单独拼在节选里，磁盘上的副本保持干净，模型（和人）都能直接读。 */
export function saveSpill(content, dir = DEFAULTS.dir) {
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${Date.now()}-${randomUUID().slice(0, 8)}.txt`);
  writeFileSync(file, content, "utf8");
  return file;
}

/** 头尾节选：头部占大头（开头通常是"这是什么"），留一小段尾部
 *  （shell 输出的 exit code / 总结常在结尾）。中间打省略标记。 */
export function excerpt(text, cap = DEFAULTS.preview) {
  if (text.length <= cap) return text;
  const tailLen = Math.min(200, Math.floor(cap / 4));
  return `${text.slice(0, cap - tailLen)}\n… [中间省略 ${text.length - cap} 字符] …\n${text.slice(-tailLen)}`;
}

/** 单条溢出：全文落盘，返回可以直接回给模型的"节选 + 指针"。
 *  指针的三要素：全文在哪、有多大、怎么分段取 —— 缺一个模型就用不起来。 */
export function spillOne(text, opts = {}) {
  const { preview, dir } = { ...DEFAULTS, ...opts };
  const file = saveSpill(text, dir);
  const content =
    `${excerpt(text, preview)}\n` +
    `[输出超过预算：全文共 ${text.length} 字符，已完整保存到 ${file}。` +
    `需要被省略的部分时，用 read_file（配 offset/limit）分段读取，不要重跑命令。]`;
  return { content, file };
}

/** 整轮观测预算：records 是本轮所有工具调用的 [{ output, spillable }]。
 *  规则与 Reina 一致 —— 候选按体积从大到小排；只要「这条超单条上限」或
 *  「整轮总量还超标」就溢出这一条，直到两个条件都满足为止。
 *  spillable=false 的条目跳过（如 read_file：文件本来就在磁盘上，
 *  落盘一份副本毫无意义，它用 offset/limit 自我设限）。原地改写 output。 */
export function enforceTurnBudget(records, opts = {}) {
  const { perResult, turnTotal, preview, dir } = { ...DEFAULTS, ...opts };
  let total = records.reduce((sum, r) => sum + r.output.length, 0);
  const before = total;
  const candidates = records
    .filter((r) => r.spillable !== false && r.output.length > preview)
    .sort((a, b) => b.output.length - a.output.length);
  const spilled = [];
  for (const record of candidates) {
    if (record.output.length <= perResult && total <= turnTotal) break;
    const { content, file } = spillOne(record.output, { preview, dir });
    total -= record.output.length - content.length;
    record.output = content;
    spilled.push(file);
  }
  return { spilled, before, after: total };
}

// ─── 日志压缩：溢出之前的第一道减负 ─────────────────────────────────────
//
// 构建/测试日志 95% 是噪声（passing 行、进度条、下载提示），有信号的只有
// 错误、失败总结和它们旁边的堆栈。按行分三类：
//   anchor —— 错误/警告/总结行，永远保留，连同前后 2 行上下文；
//   trace  —— 堆栈帧，挨着保留行时整块保留（堆栈只有完整才有用）；
//   noise  —— 其余，成片折叠成 "… [N 行省略]"。
// 两条保险：行数太少不碰（没赚头），省不到 15% 就原样返回（别为了 3% 打乱原文）。

const ANCHOR_RE = /error|exception|failed|failure|fatal|panic|timeout|warn|deprecated/i;
const SUMMARY_RE = [
  /^\s*(FAIL|PASS)\b/, // jest / vitest 的每文件判决
  /^\s*Tests?:?\s/i, // "Tests: 1 failed, 2 passed" / vitest 的 "Tests  2 failed"
  /={3,}.*\b(passed|failed|error)\b/i, // pytest / vitest 横幅
  /^\s*npm (ERR|WARN)!/,
  // 本 agent 自己盖的失败戳（run_shell 失败时的首行前缀，见 agent.mjs）。
  // 它是最高信号的"失败总结行"，必须永远保留 —— 否则长失败日志（一堆 passing
  // 之后末尾才报错）会把这行折进省略标记，下游 FAILURE_RE 便认不出这条失败了。
  /^(命令失败|编辑失败|工具执行出错|未知工具|工具参数)/,
];
const TRACE_RE = [/^\s+at\s/, /^\s*File ".*", line \d+/, /^\s*-->\s/, /^\s*\^+/];

function classify(line) {
  if (SUMMARY_RE.some((re) => re.test(line)) || ANCHOR_RE.test(line)) return "anchor";
  if (TRACE_RE.some((re) => re.test(line))) return "trace";
  return "noise";
}

export function compressLog(text, { minLines = 40, context = 2, minSavings = 0.15 } = {}) {
  const lines = text.split(/\r?\n/);
  const unchanged = { content: text, compressed: false, inputLines: lines.length, outputLines: lines.length, savings: 0 };
  if (lines.length < minLines) return unchanged; // 短输出不碰

  const classes = lines.map(classify);
  const keep = new Array(lines.length).fill(false);
  for (let i = 0; i < lines.length; i++) {
    if (classes[i] !== "anchor") continue;
    for (let j = Math.max(0, i - context); j <= Math.min(lines.length - 1, i + context); j++) keep[j] = true;
  }
  // 堆栈块整块保留 —— 但只在它挨着一条已保留的行时（孤儿堆栈没有归属，不值钱）。
  for (let i = 0; i < lines.length; i++) {
    if (classes[i] !== "trace") continue;
    let start = i, end = i;
    while (start > 0 && classes[start - 1] === "trace") start--;
    while (end < lines.length - 1 && classes[end + 1] === "trace") end++;
    if ((start > 0 && keep[start - 1]) || (end < lines.length - 1 && keep[end + 1])) {
      for (let j = start; j <= end; j++) keep[j] = true;
    }
    i = end;
  }

  const out = [];
  for (let i = 0; i < lines.length; ) {
    if (keep[i]) { out.push(lines[i]); i++; continue; }
    let j = i;
    while (j < lines.length && !keep[j]) j++;
    // 成片的噪声折叠成标记；只有一两行的缝隙留着比标记还便宜。
    if (j - i >= 3) out.push(`… [${j - i} 行省略]`);
    else out.push(...lines.slice(i, j));
    i = j;
  }

  const content = out.join("\n");
  const savings = text.length > 0 ? 1 - content.length / text.length : 0;
  if (savings < minSavings) return unchanged; // 赚得太少 → 原样返回，绝不白白打乱原文
  return { content, compressed: true, inputLines: lines.length, outputLines: out.length, savings };
}

```

#### ① 指针的三要素：在哪、多大、怎么取

溢出后回给模型的不是一句"(已截断)"，而是头尾节选加一条指针（那张取件条）：

```
row 26830: id=187810 name=user_26830 email=user_26830@example.com status=active
[输出超过预算：全文共 2097212 字符，已完整保存到 .agent-spill\1783040027411-7dc4a787.txt。
需要被省略的部分时，用 read_file（配 offset/limit）分段读取，不要重跑命令。]
```

三个要素缺一不可：**在哪**（路径），**多大**（模型据此决定要不要读、分几段读），**怎么取**（read_file + offset/limit，外加一句"不要重跑命令"——没有这句，模型的第一反应往往是把 cat 再跑一遍）。

#### ② 预算要两层：单条上限 + 整轮总量

只设"单条不超过 50KB"防不住：模型一轮发起十个工具调用，每条 30KB，单条都不超限，合计 300KB 照样超窗。所以预算是两层的，溢出从最大的一条开始（largest-first）：

```js
// 候选按体积从大到小排；「这条超单条上限」或「整轮总量还超标」就溢出这一条
for (const record of candidates) {
  if (record.output.length <= perResult && total <= turnTotal) break;
  const { content, file } = spillOne(record.output, { preview, dir });
  total -= record.output.length - content.length;
  record.output = content;
}
```

从最大的开始效率最高：溢出一条 60KB 通常就能让整轮回到预算内，剩下三条 30KB 原文保留，细节仍在上下文里。达标就停——预算的目的是保住窗口，不是压缩所有输出。

#### ③ read_file 是特例：文件本身就是指针

`enforceTurnBudget` 跳过了 `spillable: false` 的条目。`read_file` 读出来的内容本来就在磁盘上，再落盘一份副本是浪费。它的正确形状是自我设限——用 offset/limit 分段读取，尾注告诉模型总量和续读位置：

```js
// agent.mjs —— 替换掉 s02 的 50KB 截断
const slice = lines.slice(start - 1, start - 1 + limit);
// ……
body += `\n…(文件共 ${lines.length} 行，本次返回第 ${start}–${end} 行；继续读用 offset=${end + 1})`;
```

同一个思想的两种形态：内存里的大输出 → 落盘 + 指针；磁盘上的大文件 → 指针就是它自己。所有大内容最终收敛到同一个动作：read_file 分段读取。

#### ④ 日志先压缩，再计预算

测试/构建日志是大输出里最常见的一种，其中大部分是噪声。所以在预算之前先做一道按重要性的压缩（anchor 保留 + trace 整块 + noise 折叠）。两条保险规则：行数太少不处理；省不到 15% 就原样返回。压缩会不会丢信息？不会——折叠真的发生时，全文同样落盘、同样给指针。**压缩决定"回给模型多少"，落盘保证"完整保存"。**

### 运行：

免 key 演示：

```sh
node .\03-工具系统与MCP\s04_output_budget\demo.mjs
```

三个场景，真实输出节选：

```
━━━ 场景一：单条 2MB 输出（模拟 cat 大文件）━━━
  原始输出：2097212 字符
  回给模型：2144 字符（压到 0.10%）
  落盘全文：.agent-spill\1783040027411-7dc4a787.txt

━━━ 场景二：一轮 4 条输出合计超总量（largest-first 溢出）━━━
  整轮总量：150000 → 92140 字符（预算 100000）
  ⤵ 溢出  run_shell(git log)：60000 → 2140 字符
  · 保留  run_shell(grep -r)：30000 → 30000 字符

━━━ 场景三：vitest 风格日志的重要性压缩 ━━━
  394 行 → 13 行，省 97.0%（错误行一行没丢）
```

有 key 的话跑 `node .\03-工具系统与MCP\s04_output_budget\agent.mjs`，让它 cat 一个大文件——你会看到紫色的 `⤵ 溢出` 行，然后模型拿着指针自己去 read_file 取细节。

### 练习

1. 现在的 `excerpt` 固定"头部为主、尾部 200 字符"。对失败的测试日志这个比例是错的——总结和 exit code 在尾部。给 `spillOne` 加一个 `mode: "head" | "tail"` 参数，让 `run_shell` 的失败输出保尾部。判定"该保哪头"的信号已经在 records 里了（提示：`status`）。

2. 一场长会话会在 `.agent-spill/` 里积累几十个文件，谁来删？设计一个清理策略并想清楚什么时候删是安全的——指针还留在 messages 历史里时删掉文件，模型按指针去读就会失败。（这个问题在 s06 会更突出：压缩历史时，指针是保还是弃？）

### 练习 1 的答案：excerpt 的 head/tail 模式

```js
// spill.mjs —— excerpt 加第三个参数 mode
export function excerpt(text, cap = DEFAULTS.preview, mode = "head") {
  if (text.length <= cap) return text;
  if (mode === "tail") {
    // 失败输出：尾部才是精华（exit code / 失败总结），头部只留一小段做锚
    const headLen = Math.min(200, Math.floor(cap / 4));
    return `${text.slice(0, headLen)}\n… [中间省略 ${text.length - cap} 字符] …\n${text.slice(-(cap - headLen))}`;
  }
  const tailLen = Math.min(200, Math.floor(cap / 4));
  return `${text.slice(0, cap - tailLen)}\n… [中间省略 ${text.length - cap} 字符] …\n${text.slice(-tailLen)}`;
}

// spillOne 透传 mode
// …const content = `${excerpt(text, preview, mode)}\n` + `[输出超过预算：…]`;

// enforceTurnBudget 里按 status 决定保哪头 —— 信号已经在 records 里，不用猜
export function enforceTurnBudget(records, opts = {}) {
  // …
  for (const record of candidates) {
    if (record.output.length <= perResult && total <= turnTotal) break;
    const mode = record.status === "failed" ? "tail" : "head";
    const { content, file } = spillOne(record.output, { preview, dir, mode });
    // …
  }
}
```

要点：信号就在 `record.status` 里。成功输出的头部是"这是什么"，失败输出的尾部是"为什么失败"——模式跟着状态走，不需要模型自己猜。这也呼应 Reina 的工具层默认"shell 输出保留尾部"。

### 练习 2 的答案：.agent-spill/ 清理策略

**安全条件**：只有"没有任何现存消息还引用该文件"时才可删。指针还在 messages 历史里时删文件，模型按指针去读就失败。

**指针怎么找**：从 tool 消息内容里用正则提取——`/已完整保存到 ([^。\s\]]+)/`。

**三个安全时机**：

| 时机 | 为什么安全 | 说明 |
|---|---|---|
| **压缩时（主时机，s06 联动）** | 压缩把含指针的 tool 消息压进中段 → 那些文件不再被引用 | 压缩成功后，把被压中段里提取到的 spill 文件删掉 |
| **会话关闭时** | 退出前扫一遍现存 messages 的引用，删掉未被引用的 | 兜底，覆盖没被压缩的会话 |
| **引用计数 + 延迟** | 维护 Set 记录被引用的文件；不再被引用且存在超过 N 天才删 | 防误删的最后防线 |

**绝对不要**：单纯按"文件年龄"删——一个 30 天前的指针可能还在未压缩的长历史里，按年龄删就会让模型读不到。

### 与真实产品对照（延伸阅读）

本章是 Reina 输出管线的简化版，生产实现分两层：

- **工具层**（`packages/tools/src/utils.ts`）：每个内置工具的输出上限 50KB / 2000 行；shell 输出保留尾部（exit code 和失败总结都在结尾），全文落盘到 `.reina/tool_outputs/` 并附 read_file 指针。
- **引擎层**（`packages/core/src/engine.ts` 的 `enforceTurnObservationBudget`）：每个请求前跑一遍整轮观测预算——单条超 100,000 字符、或整轮总量超 200,000 字符时 largest-first 溢出；替换成头尾节选 + `.reina/tool_outputs/<callId>.txt` 指针。这层聚合预算有一个很现实的动机：**MCP（接入外部工具的协议）这类外部工具的输出不经过你的单条截断——外部工具不受你控制，聚合预算是它们唯一的兜底**。另有一个 24,000 字符的紧急裁剪，只在请求即将超出窗口时启用——那是有损的最后手段，但它也带指针，不留死路。

"read_file 不落盘副本"这条特例是踩过坑的：Reina 早期版本给 read_file 的输出也落盘了一份副本，纯属浪费，后来修掉了。

日志压缩在 `packages/tools/src/log-compress.ts`，比本章多一个细节：把行里的数字/十六进制地址归一化后，相邻近似重复的行折叠成 `(line) ×N`。真实 vitest 输出实测省约 65%；eslint 输出则是 safe no-op——省不到 15% 阈值，原样返回。`REINA_LOG_COMPRESS=0` 可整体关闭。

Claude Code 的同类行为：Bash 工具输出超过 30,000 字符会截断——超长命令后看到的 "output truncated" 就是它的观测预算在工作。

---

## 渐进式工具披露（s15）

工具只有三五个时一切正常；接上 MCP、工具涨到几十个之后，每轮请求都要把全部工具定义（名字 + 描述 + JSON schema）原样发一遍，几千 token 轮轮都付。更隐蔽的是：工具数组一变，prompt 缓存整段失效，账单不降反升。

第一笔账好懂：没用到的工具定义，每轮白付。第二笔来自 s07（缓存命中工程）：tools 数组和 system 一起位于缓存前缀的最前部（Anthropic 的序列化顺序是 tools 在前），数组一变，前缀从头失效，后面全部按全价重算。

### 解决方案

自然的想法：不常用的工具先藏起来（标成 `deferred`），只放一个 `search_tool` 入口；模型需要时按关键词搜，搜到后再放开给模型用——这个"放开"的动作，下文称**解蔽**。冷启动的 tools 数组因此明显变小。但解蔽这个动作如果实现不当，会反过来砸掉缓存：把搜到的工具加回 tools 数组，每解蔽一次，数组变一次，缓存失效一次。正确做法是**数组恒定**——搜到的工具永不加回数组，schema 走搜索结果文本，调用走常驻的代理工具。

### 实现：

#### demo.mjs

```js
#!/usr/bin/env node
// s15 免 key 演示 —— 工具多了，"按需披露"怎么才不撞缓存（接 s07）。
//   坏做法：搜到就把工具"回灌"进 tools 数组 → 每解蔽一次，前缀断一次
//   好做法：搜到的工具永不进数组，调用走一个稳定的代理工具 → 数组字节恒定
//
// tools 数组紧跟 system 之后，是 prompt cache 前缀的一部分（s07 讲过）。
// 数组一变，前缀就断，后面全按全价重算。这里用字符近似把"断在哪"算给你看。
//
// 运行：node s15_tool_disclosure/demo.mjs

// ─── 工具库：3 个常驻(direct) + 一堆不常用(deferred) ─────────────────────
const DIRECT = [
  { name: "run_shell", description: "执行一条 shell 命令" },
  { name: "read_file", description: "读取一个文本文件" },
  { name: "search_tool", description: "按关键词检索未加载的工具" },
];
const DEFERRED = [
  { name: "schedule_wakeup", description: "安排一次未来的模型回合" },
  { name: "convene_panel", description: "召集多个子代理并行评审" },
  { name: "recall_memory_chunk", description: "把压缩掉的历史片段逐字召回" },
  { name: "create_subtask", description: "在任务 DAG 上新建一个子任务" },
  { name: "notify_user", description: "向用户发一条系统通知" },
];

const serialize = (tools) => JSON.stringify(tools); // 服务商看到的 tools 块字节流
const commonPrefix = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};

function reportTurns(label, arraysByTurn) {
  console.log(`━━━ ${label} ━━━`);
  let misses = 0;
  for (let t = 1; t < arraysByTurn.length; t++) {
    const prev = serialize(arraysByTurn[t - 1]);
    const cur = serialize(arraysByTurn[t]);
    const n = commonPrefix(prev, cur);
    const reuse = ((n / prev.length) * 100).toFixed(0);
    const hit = n === prev.length;
    if (!hit) misses++;
    console.log(
      `  第 ${t}↔${t + 1} 轮：tools ${prev.length}→${cur.length} 字节 · 公共前缀复用 ${reuse}% ` +
        (hit ? "✅ 前缀稳定" : "❌ 前缀击穿（tools 块变了 → 本轮全价）"),
    );
  }
  console.log(`  → ${arraysByTurn.length} 轮里发生 ${misses} 次 tools 前缀击穿\n`);
  return misses;
}

// ─── 坏做法：模型每轮搜到一个 deferred 工具，就把它加进 tools 数组 ─────────
// 冷启动确实省了（数组小），但每解蔽一次，下一轮数组就变大 → 撞一次 cache miss。
const badTurns = [DIRECT.slice()];
for (let i = 0; i < 3; i++) {
  const grown = [...badTurns[badTurns.length - 1], DEFERRED[i]]; // 解蔽 → 回灌数组
  badTurns.push(grown);
}
reportTurns("坏做法：解蔽即回灌 tools 数组", badTurns);

// ─── 好做法：加一个稳定的代理工具，deferred 工具永不进数组 ─────────────────
// 模型搜工具，schema 通过【搜索结果文本】（进 messages，不进 tools）给它；
// 真正调用走那个常驻的 run_tool({ name, input })。于是 tools 数组每轮字节恒定。
const DIRECT_WITH_PROXY = [
  ...DIRECT,
  { name: "run_tool", description: "按名字调用任何已检索到的工具：run_tool({name,input})" },
];
const goodTurns = [DIRECT_WITH_PROXY, DIRECT_WITH_PROXY, DIRECT_WITH_PROXY, DIRECT_WITH_PROXY];
reportTurns("好做法：稳定代理，数组恒定", goodTurns);

// ─── ③ 硬校验协议：不用代理工具时，"永不回灌"有一个致命例外 ────────────────
// 上面的好做法靠 run_tool 代理，天然免疫本节的坑。但很多实现（Claude Code、
// Reina）不走代理：模型直接喊出被搜到的工具名，引擎在派发层认名字。这在
// OpenAI 系协议没问题——tool call 的名字是自由文本；Anthropic Messages API
// 却会硬校验 tool_use.name 必须在本次请求的 tools 数组里。同一套"永不回灌 +
// 直调派发"，换个协议就变成：模型搜得到工具，每次调用都被 API 拒绝。
const strictRejects = (tools, callName) => !tools.some((t) => t.name === callName);

// 模型在第 1 轮搜到了 notify_user，第 2~4 轮尝试直调它。
const COLD = DIRECT.slice();

// 3a. 永不回灌 + 直调：数组完美稳定……但工具永远调不通。
const neverTurns = [COLD, COLD, COLD, COLD];
const neverMisses = reportTurns("硬校验协议 × 永不回灌直调", neverTurns);
let rejected = 0;
for (let t = 1; t < neverTurns.length; t++) if (strictRejects(neverTurns[t], "notify_user")) rejected++;
console.log(`  ↑ 数组 ${neverMisses} 次击穿，但 notify_user 直调 ${rejected}/3 次被 API 拒绝 ❌`);
console.log("    ——省下了缓存，废掉了工具。\n");

// 3b. 按协议回灌：把"已解蔽名单"加回数组（排序保确定性）。
// 解蔽落地那一轮付一次 miss，之后名单不再变，前缀重新稳定，调用全部成功。
const BACKFILLED = [...COLD, DEFERRED.find((t) => t.name === "notify_user")];
const backfillTurns = [COLD, BACKFILLED, BACKFILLED, BACKFILLED];
reportTurns("硬校验协议 × 解蔽名单回灌", backfillTurns);
let accepted = 0;
for (let t = 1; t < backfillTurns.length; t++) if (!strictRejects(backfillTurns[t], "notify_user")) accepted++;
console.log(`  ↑ 解蔽落地付 1 次 miss，之后前缀重新稳定；notify_user 直调 ${accepted}/3 次成功 ✅\n`);

// ─── ④ 第三档：条件原生提升（能力即数据）──────────────────────────────────
// direct / deferred 之外还有第三档：某个【会话内稳定】的事实保证工具必然可用
// 时，冷启动直接入列。例：订阅附带的服务端搜索工具——挂着该订阅的会话里工具
// 必然能调通，还让模型多跑一次 search_tool 纯属浪费。
// 两个关键：判据必须会话内稳定（否则数组抖动 = 缓存抖动）；提升是声明式的
// （配置声明 subscriptionTools，引擎做通用提升，厂商名不进引擎核心）。
const modelConfig = { subscriptionTools: ["kimi_web_search"] }; // 能力写在配置里
const PROMOTED = [...DIRECT, { name: "kimi_web_search", description: "订阅附带的服务端搜索" }];
const stableTurns = [PROMOTED, PROMOTED, PROMOTED, PROMOTED];
reportTurns(`条件提升 × 会话内稳定判据（config 声明 ${JSON.stringify(modelConfig.subscriptionTools)}）`, stableTurns);

// 反例：把提升挂在一个会话中途会翻转的判据上（比如"后台任务运行中"），
// 判据每翻转一次，数组就变一次——每次都是一记 cache miss。这不一定是错
// （Reina 的后台生命周期工具就这么做，属于算过账的取舍），但必须知道在付钱。
const volatileTurns = [DIRECT, PROMOTED, PROMOTED, DIRECT]; // 中途提升、末尾撤下
reportTurns("条件提升 × 易变判据（中途翻转两次）", volatileTurns);

console.log("关键：冷启动省 token 只是第一步；真正的账在'解蔽之后数组还稳不稳'。");
console.log("      Anthropic 没有服务端 defer，披露逻辑只能压在客户端——被搜到的工具永不回灌数组。");
console.log("      但若不用代理工具而走直调派发，Anthropic 会硬校验名字——必须按协议分叉：");
console.log("      自由文本协议保持零成本快路径，硬校验协议回灌已解蔽名单（一次性 miss）。");

```

#### ① deferred 目录：冷启动只放入口，不放全部工具

工具分两类：`direct`（每轮都进数组，比如 `run_shell` / `read_file` / `search_tool`）和 `deferred`（冷启动隐藏）。deferred 工具只把"名字 + 一句话摘要"放进一个**目录**，供 `search_tool` 检索。模型看到的冷启动 tools 数组因此小而稳定。

#### ② 解蔽不能把工具加回数组

最直觉的解蔽实现：模型搜到 `notify_user`，就把它的完整定义追加进 tools 数组，下一轮直接调用。问题正在这：每解蔽一次，数组变一次，缓存失效一次（演示的坏做法）。省下的是冷启动的一次性 token，赔进去的是会话中段一次次前缀失效。

正确做法是**数组恒定**：搜到的工具永不加回数组。它的 schema 通过搜索结果文本交给模型——搜索结果是一条消息，位于缓存前缀的尾部，往尾部追加天然安全；实际调用走一个常驻的代理工具 `run_tool({ name, input })`。于是不管解蔽多少工具，发给服务商的 tools 块每轮字节恒定（演示的好做法，0 次失效）。

#### ③ 硬校验协议："永不回灌"的例外

②的代理方案对本节的坑天然免疫——代理本身常驻数组，被调的永远是它。但很多实现（Claude Code、Reina）不走代理：模型直接喊出被搜到的工具名，引擎在**派发层**认名字。这在 OpenAI 系协议没问题——tool call 的名字是自由文本，服务端不管你调的名字在不在数组里；**Anthropic Messages API 却会硬校验 `tool_use.name` 必须在本次请求的 tools 数组里**。同一套"永不回灌 + 直调派发"，换个协议就变成：模型通过 `search_tool` 搜得到工具、目录里看得见，每次直调却被 API 硬拒——工具"看得见摸不着"。这个坑格外隐蔽，因为缓存指标是完美的（数组零击穿），坏掉的是功能本身。

解法是**按协议分叉**：自由文本协议保持"永不回灌"的零成本快路径；硬校验协议把**已解蔽名单**回灌进数组（名单排序保证字节确定性）。代价是每解蔽一个工具付一次 miss——但名单落地后不再变化，前缀立刻重新稳定，这是一次性成本，不是坏做法那种每轮击穿。

这也回扣 s14（Provider 兼容层）的主旨：**同一个客户端优化，能不能成立取决于协议语义**。做披露设计时先回答一个问题——你的 provider 校不校验工具名？

#### ④ 第三档：条件原生提升（能力即数据）

direct / deferred 之外还有第三档：**某个会话级事实保证工具必然可用时，冷启动直接入列**。典型例子：订阅制 provider 附带的服务端工具（如 Kimi 订阅自带的 `kimi_web_search`）。对挂着该订阅的会话，工具百分之百能调通，还让模型跑一次 `search_tool` 往返纯属浪费；对其他会话它又是死重（没有凭证，调了必失败），必须留在 deferred。同一个工具，两档可见性，按会话切。

两个关键，缺一不可：

- **判据必须会话内稳定**。订阅身份整个会话不变，所以提升后的数组每轮字节恒定，缓存零损耗。反过来，把提升挂在一个会话中途会翻转的判据上（比如"后台任务运行中"才提升生命周期工具），判据每翻转一次数组变一次，每次都是一记 miss。
- **提升是声明式的**。厂商知识不进引擎：由订阅解析层在模型配置上声明 `subscriptionTools: ["kimi_web_search", ...]`，引擎只执行一条通用规则"配置声明什么就提升什么"。这和 s14 里"能力写进 models.json 而不是 baked-in 正则"是同一条纪律：**能力是数据，不是代码分支**。

### 运行：

免 key 演示：

```sh
node .\03-工具系统与MCP\s15_tool_disclosure\demo.mjs
```

对比同一件事的两种实现，直接算出 tools 数组的字节稳定性（真实运行输出）：

```
━━━ 坏做法：解蔽即回灌 tools 数组 ━━━
  第 1↔2 轮：tools 150→205 字节 · 公共前缀复用 99%  ❌ 前缀击穿（tools 块变了 → 本轮全价）
  → 4 轮里发生 3 次 tools 前缀击穿

━━━ 好做法：稳定代理，数组恒定 ━━━
  第 1↔2 轮：tools 224→224 字节 · 公共前缀复用 100% ✅ 前缀稳定
  → 4 轮里发生 0 次 tools 前缀击穿

━━━ 硬校验协议 × 解蔽名单回灌 ━━━
  → 4 轮里发生 1 次 tools 前缀击穿
  ↑ 解蔽落地付 1 次 miss，之后前缀重新稳定；notify_user 直调 3/3 次成功 ✅
```

注意坏做法那行"复用 99%"不代表只损失 1%：新工具追加在尾部，前面 99% 的字节确实没变，但 tools 块是一个闭合的整体，末尾一变，服务商就视为整块变更，tools + system + 全部历史一起按全价重算。**差一个字节，等于整块失效。**

### 练习

1. 给演示的"好做法"接一个真实约束：`run_tool` 调用 deferred 工具时，权限要按目标工具裁决（复用 s13）。写一版 `run_tool` 的派发：`run_tool({name:"delete_all"})` 应触发 `delete_all` 的 deny/ask，而不是 `run_tool` 自己的。思考如果漏了这步，会留下多大的漏洞。

2. 阈值门控：工具总数少（比如 < 10）时，全 direct 反而更好——省掉一次 `search_tool` 往返的延迟。给披露加一个 `auto:N`：总数 ≤ N 就不 defer，> N 才进披露模式。N 该按什么标定？（提示：权衡"多一次搜索往返的延迟"和"多几千 token 的冷启动"哪个代价更高。）

3. 按协议分叉（复用③）：给 demo 写一个 `resolveTools(protocol, unmaskedNames)`——`"free-text"` 协议永不回灌，`"strict"` 协议把已解蔽名单排序后回灌。用 demo 里的前缀复用计算验证：strict 路径每解蔽一个工具恰好付一次击穿，此后回到 100% 复用。再想一步：如果模型在同一轮里解蔽了两个工具，回灌应该发生几次？（提示：名单是按轮落地的，不是按工具。）

### 练习 1 的答案：run_tool 按目标工具裁决权限

```js
function runTool({ name, input }) {
  const target = REGISTRY[name]; // 目标工具，不是 run_tool 自己
  if (!target) return `未知工具：${name}`;
  // 关键：权限按【目标工具】裁决，绝不按 run_tool
  const verdict = checkPermission(name, input);
  if (verdict === "deny") return `拒绝执行 ${name}：被权限策略禁止。`;
  if (verdict === "ask") { /* 需要用户确认后才放行 */ }
  return target.handler(input);
}
```

**漏掉这步的漏洞有多大**：`run_tool` 常驻 direct 数组，权限系统很可能给它开白名单（它只是个转发器，看起来人畜无害）。如果权限只查 `run_tool` 本身，那么**任何 deferred 危险工具都能通过 `run_tool({name:"delete_all"})` 绕过 delete_all 的 deny/ask 直接执行**——代理变成了通用权限后门。所以"按目标工具裁决"不是优化，是必须。

### 练习 2 的答案：auto:N 阈值门控

```js
// 工具总数 ≤ N 就全 direct，> N 才进披露模式
const AUTO = 10;
const tools = registry.size <= AUTO ? allDirect() : discloseMode();
```

**N 怎么标定**：看"多一次搜索往返的延迟"和"多几千 token 的冷启动"哪个代价更高。粗算：每个工具定义约 100~300 token，全量 ≈ N × 平均定义长度。全量每轮成本 < 一次搜索往返的代价时，全 direct 更优；反之时披露更优。经验默认 N ≈ 10~15，精确值应实测（量工具定义的总 token 数 × 预计轮数）。注意 N 判断的是**总工具数**，不是 deferred 数。

### 练习 3 的答案：resolveTools 按协议分叉

```js
function resolveTools(protocol, unmaskedNames, { direct, deferred }) {
  if (protocol === "free-text") return direct; // 永不回灌，零成本快路径
  // strict：已解蔽名单排序后回灌（排序保证字节确定性）
  const names = [...unmaskedNames].sort();
  const unmasked = names
    .map((n) => deferred.find((t) => t.name === n))
    .filter(Boolean);
  return [...direct, ...unmasked];
}
```

**回灌发生几次**：名单是**按轮落地**的，不是按工具。同一轮解蔽两个工具 → 两个名字同时进 `unmaskedNames` → `resolveTools` 一次返回新数组 → **恰好 1 次击穿**，然后前缀稳定。如果两个工具分两轮解蔽 → 2 次击穿。所以"回灌次数 = 解蔽发生的轮次数"。

### 与真实产品对照（延伸阅读）

为什么不能照抄 Codex？Codex 能让模型直接调用命名空间工具名、而客户端数组不增长，靠的是 OpenAI Responses API 的服务端工具管理——那是 provider 专有能力，无法迁移到 Anthropic 以及绝大多数兼容后端。由此一条通用经验：参考某个 agent 的机制之前，先确认该机制在你的 provider 上是否存在。照搬一个不可迁移的能力，比不搬更糟。

Reina 的这套骨架在 `packages/tools/src/registry.ts`（`isDeferredByDefault` 默认白名单、`deferredToolDescriptors` / `directToolDescriptors` 分桶、`resolveExposedTools` 每轮按已解蔽集合重建数组）和 `search-tool.ts`（检索）。检索排序用了 TF-IDF cosine + 关键词混合，并加了 CJK 分词（中日韩按字 unigram + bigram），比 Codex 那套"中文拼音化再 BM25"精度高。但边界也很明确：**词法检索跨不了语言**（中文 query 搜不到英文工具），这是本质限制，Codex / Claude Code 至今也没上向量检索；对 agent 而言影响不大，因为它看到的工具目录本就是英文的，自然用英文搜索。

Reina 现已落地"数组恒定"（内部叫 Phase 1.3）：解蔽只记进会话状态（`activeDeferredTools`），tools 数组每轮字节恒定；调用走直调派发（`resolveOrUnmaskDescriptor` 按名字找回描述符，turn 内局部生效），没有代理工具。也正因为走直调，③的坑是在真实接入 Kimi 订阅时踩出来的——OpenAI 系模型一直没事，换到 Anthropic 兼容端点当场"看得见摸不着"，修复就是③说的按协议回灌已解蔽名单；④的声明式 `subscriptionTools` 也是同一次接入落地的。Claude Code 的可观察行为思路一致：核心工具常驻，MCP 等大批量工具标记为 deferred、只露名字；模型先调 `ToolSearch` 按需检索，schema 通过搜索结果进入上下文（缓存前缀的尾部，天然安全）——冷启动数组小而稳定，即①+②的组合。

---

## MCP：动态挂载外部工具

到现在，agent 的工具全写死在注册表里——想加个新工具就得改源码。MCP（Model Context Protocol）是 Anthropic 发布的开放协议，用于连接 AI 助手与外部工具：**声明一个服务器地址，就能把数据库、Slack、GitHub 这些服务的工具接进来，不动一行 agent 代码**。

核心思路：**spawn 子进程 → JSON-RPC 握手 → 发现工具 → 前缀注册 → 透明路由**。对 Agent Loop 来说，MCP 工具和内置工具没有区别——都是名字 + schema + 执行函数。

### 解决方案

做一个最小的 MCP 客户端：通过 JSON-RPC over stdio 跟服务器握手、问它有哪些工具、把模型的调用转发过去、再把结果拿回来。传输用 stdio 的零配置优势：不需要端口管理、不需要发现服务、进程生命周期自动绑定到父进程。

### 实现：

#### 配置格式

用户只需在配置文件中声明 MCP 服务器，Agent 会在首次 chat 时自动连接并注册它们的工具：

```json
// .claude/settings.json（用户级 ~/.claude/settings.json 或项目级 .claude/settings.json）
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/tmp"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "ghp_xxx" }
    }
  }
}
```

也可以使用项目根目录的 `.mcp.json`，格式相同。三处配置的服务器合并后一起连接，同名服务器后读覆盖先读。

#### 最小 MCP 客户端（src/mcp.ts）

```typescript
/**
 * MCP Client — connects to stdio-based MCP servers, discovers and forwards tool calls.
 * Uses raw JSON-RPC over stdio (no SDK dependency for simplicity).
 *
 * Config is read from .claude/settings.json and ~/.claude/settings.json:
 *   { "mcpServers": { "name": { "command": "...", "args": [...], "env": {...} } } }
 *
 * Each MCP tool is exposed with a "mcp__serverName__toolName" prefix to avoid conflicts.
 */

import { spawn, type ChildProcess } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { createInterface, type Interface } from "readline";

// ─── Types ──────────────────────────────────────────────────

interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

interface McpToolInfo {
  name: string;
  description?: string;
  inputSchema?: any;
  serverName: string;
}

// Race a promise against a timeout WITHOUT leaking the timer: a bare
// Promise.race leaves the setTimeout pending after the promise wins,
// which keeps the Node event loop (and thus the process) alive.
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, rej) => {
        timer = setTimeout(() => rej(new Error("timeout")), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Single MCP connection (one per server) ─────────────────

class McpConnection {
  private process: ChildProcess | null = null;
  private nextId = 1;
  private pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }>();
  private rl: Interface | null = null;

  constructor(private serverName: string, private config: McpServerConfig) {}

  /** Spawn the server process and wire up JSON-RPC over stdio. */
  async connect(): Promise<void> {
    const env = { ...process.env, ...(this.config.env || {}) };
    this.process = spawn(this.config.command, this.config.args || [], {
      stdio: ["pipe", "pipe", "pipe"],
      env,
    });

    // Parse newline-delimited JSON-RPC from stdout
    this.rl = createInterface({ input: this.process.stdout! });
    this.rl.on("line", (line: string) => {
      try {
        const msg = JSON.parse(line);
        if (msg.id !== undefined && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id)!;
          this.pending.delete(msg.id);
          if (msg.error) {
            reject(new Error(`MCP error ${msg.error.code}: ${msg.error.message}`));
          } else {
            resolve(msg.result);
          }
        }
      } catch {
        // ignore non-JSON lines (e.g. server logs)
      }
    });

    // Surface stderr as warnings (don't crash)
    this.process.stderr?.on("data", () => {});

    this.process.on("error", (err) => {
      console.error(`[mcp:${this.serverName}] process error: ${err.message}`);
    });

    this.process.on("exit", (code) => {
      // Reject all pending requests
      for (const [, { reject }] of this.pending) {
        reject(new Error(`MCP server '${this.serverName}' exited with code ${code}`));
      }
      this.pending.clear();
    });
  }

  /** Send a JSON-RPC request and wait for the response. */
  private sendRequest(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.process?.stdin?.writable) {
        return reject(new Error(`MCP server '${this.serverName}' is not connected`));
      }
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
      this.process.stdin.write(msg);
    });
  }

  /** Send a JSON-RPC notification (no id, no response expected). */
  private sendNotification(method: string, params: any = {}): void {
    if (!this.process?.stdin?.writable) return;
    const msg = JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n";
    this.process.stdin.write(msg);
  }

  /** Perform MCP initialize handshake. */
  async initialize(): Promise<void> {
    await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "mini-claude", version: "1.0.0" },
    });
    this.sendNotification("notifications/initialized");
  }

  /** Discover available tools from this server. */
  async listTools(): Promise<McpToolInfo[]> {
    const result = await this.sendRequest("tools/list");
    if (!result?.tools || !Array.isArray(result.tools)) return [];
    return result.tools.map((t: any) => ({
      name: t.name,
      description: t.description || "",
      inputSchema: t.inputSchema,
      serverName: this.serverName,
    }));
  }

  /** Call a tool and return the text result. */
  async callTool(name: string, args: any): Promise<string> {
    const result = await this.sendRequest("tools/call", { name, arguments: args });
    // MCP returns { content: [{ type: "text", text: "..." }, ...] }
    if (result?.content && Array.isArray(result.content)) {
      return result.content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n");
    }
    return JSON.stringify(result);
  }

  /** Kill the server process. */
  close(): void {
    this.rl?.close();
    this.process?.kill();
    this.process = null;
  }
}

// ─── MCP Manager (manages all connections) ──────────────────

export class McpManager {
  private connections = new Map<string, McpConnection>();
  private tools: McpToolInfo[] = [];
  private connected = false;

  /** Read settings files, connect to all configured MCP servers, and discover
   *  their tools. Safe to call multiple times (no-op after first). */
  async loadAndConnect(): Promise<void> {
    if (this.connected) return;
    this.connected = true;

    const configs = this.loadConfigs();
    if (Object.keys(configs).length === 0) return;

    const TIMEOUT_MS = 15_000;

    for (const [name, config] of Object.entries(configs)) {
      const conn = new McpConnection(name, config);
      try {
        await conn.connect();
        await withTimeout(conn.initialize(), TIMEOUT_MS);
        const serverTools = await withTimeout(conn.listTools(), TIMEOUT_MS);
        this.connections.set(name, conn);
        this.tools.push(...serverTools);
        console.error(`[mcp] Connected to '${name}' — ${serverTools.length} tools`);
      } catch (err: any) {
        console.error(`[mcp] Failed to connect to '${name}': ${err.message}`);
        conn.close();
      }
    }
  }

  /** Return tool definitions in Anthropic API format, with mcp__server__tool prefix. */
  getToolDefinitions(): Array<{ name: string; description: string; input_schema: any }> {
    return this.tools.map((t) => ({
      name: `mcp__${t.serverName}__${t.name}`,
      description: t.description || `MCP tool ${t.name} from ${t.serverName}`,
      input_schema: t.inputSchema || { type: "object", properties: {} },
    }));
  }

  /** Check if a tool name is an MCP-prefixed tool. */
  isMcpTool(name: string): boolean {
    return name.startsWith("mcp__");
  }

  /** Route a prefixed tool call to the correct server. */
  async callTool(prefixedName: string, args: any): Promise<string> {
    // mcp__serverName__toolName → serverName, toolName
    const parts = prefixedName.split("__");
    if (parts.length < 3) throw new Error(`Invalid MCP tool name: ${prefixedName}`);
    const serverName = parts[1];
    const toolName = parts.slice(2).join("__"); // tool name might contain __
    const conn = this.connections.get(serverName);
    if (!conn) throw new Error(`MCP server '${serverName}' not connected`);
    return conn.callTool(toolName, args);
  }

  /** Disconnect all servers. */
  async disconnectAll(): Promise<void> {
    for (const [, conn] of this.connections) {
      conn.close();
    }
    this.connections.clear();
    this.tools = [];
    this.connected = false;
  }

  // ─── Private: config loading ──────────────────────────────

  private loadConfigs(): Record<string, McpServerConfig> {
    const merged: Record<string, McpServerConfig> = {};

    // 1. Global: ~/.claude/settings.json
    const globalPath = join(homedir(), ".claude", "settings.json");
    this.mergeConfigFile(globalPath, merged);

    // 2. Project: .claude/settings.json (cwd)
    const projectPath = join(process.cwd(), ".claude", "settings.json");
    this.mergeConfigFile(projectPath, merged);

    // 3. Also check .mcp.json (Claude Code convention)
    const mcpJsonPath = join(process.cwd(), ".mcp.json");
    this.mergeConfigFile(mcpJsonPath, merged);

    return merged;
  }

  private mergeConfigFile(filePath: string, target: Record<string, McpServerConfig>): void {
    if (!existsSync(filePath)) return;
    try {
      const raw = JSON.parse(readFileSync(filePath, "utf-8"));
      const servers = raw.mcpServers || raw;
      for (const [name, config] of Object.entries(servers)) {
        if (this.isValidConfig(config)) {
          target[name] = config as McpServerConfig;
        }
      }
    } catch {
      // Silently skip malformed config files
    }
  }

  private isValidConfig(config: any): boolean {
    return config && typeof config === "object" && typeof config.command === "string";
  }
}
```

#### 一个最小的 MCP Server（参考：mcp-demo-server.mjs）

MCP 服务器和客户端一样，也是 stdio 上走换行分隔的 JSON-RPC。给本地文件加一个只读搜索工具的练习，就是从这段骨架长出来的：

```js
// 一个极小的 stdio MCP 服务器：stdin 收请求，stdout 回响应，每行一个 JSON-RPC。
import { createInterface } from "readline";

const rl = createInterface({ input: process.stdin });
const send = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");

rl.on("line", (line) => {
  let req;
  try { req = JSON.parse(line); } catch { return; }
  const { id, method, params } = req;
  if (method === "initialize") {
    send({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: {}, serverInfo: { name: "demo", version: "1.0" } } });
  } else if (method === "notifications/initialized") {
    // notification: no response
  } else if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools: [{
      name: "add",
      description: "Add two numbers and return the sum.",
      inputSchema: { type: "object", properties: { a: { type: "number" }, b: { type: "number" } }, required: ["a", "b"] },
    }] } });
  } else if (method === "tools/call") {
    if (params?.name === "add") {
      const sum = (params.arguments?.a ?? 0) + (params.arguments?.b ?? 0);
      send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: String(sum) }] } });
    } else {
      send({ jsonrpc: "2.0", id, error: { code: -32601, message: `unknown tool ${params?.name}` } });
    }
  }
});
```

#### 连接生命周期

MCP 协议的标准流程：

```
spawn 子进程
  → initialize（版本协商，交换 capabilities）
  → notifications/initialized（告诉服务器客户端就绪）
  → tools/list（发现服务器提供的工具）
  → 就绪 —— 之后随时 tools/call 转发调用
```

客户端侧三个关键状态：`process`（子进程句柄）、`pending`（请求-响应关联表：自增 id → Promise）、`rl`（readline 按行解析 JSON-RPC）。

### 关键设计决策

- **为什么用 JSON-RPC over stdio 而不是 HTTP**：stdio 零配置——不需要端口管理、不需要发现服务、进程生命周期自动绑定到父进程。子进程退出时所有 pending 请求自动 reject，不存在连接泄漏。
- **为什么用三段式前缀名（`mcp__server__tool`）**：一个名字同时解决两个问题——避免冲突（不同服务器可能有同名工具）和嵌入路由信息（从名字直接提取服务器名，无需额外映射表）。Claude Code 用完全相同的命名方案。
- **为什么 15 秒超时**：MCP 服务器常用 `npx` 启动，首次运行需要下载 npm 包，通常需要 3-8 秒。15 秒足够覆盖大多数情况，但不至于让用户等太久。超时后静默跳过该服务器，Agent 继续用其他可用工具工作。
- **为什么懒连接（首次 chat 时而非启动时）**：用户可能启动 Agent 只是想问一句"这个函数是什么意思"，根本用不到 MCP 工具。懒连接让这种场景零开销。代价是第一次需要 MCP 工具时会有几秒延迟，但只发生一次。
- **为什么不用 MCP SDK**：直接用原始 JSON-RPC 有两个好处——零依赖（不增加包体积）和教学价值（读者能看到协议的完整细节）。整个 JSON-RPC 通信只有 ~60 行代码，足够简单。
- **为什么 `callTool` 只取 `type: "text"` 的内容**：MCP 返回 `{ content: [{ type: "text", text: "..." }, ...] }`，图片等其他类型暂不处理。
- **失败不崩溃**：MCP 连接失败只输出日志，Agent 继续用内置工具工作；一个服务器失败不影响其他。

### 运行：

跑通文档自带的演示（无需 API key，本地 mock 模型调一个来自外部 MCP 服务器的 `add` 工具）：

```sh
cd ..\参考源码\claude-code-from-scratch
node steps/run.mjs 12
```

输出：

```
▶ step 12 demo (no API key — local mock model)
  you: Use the add tool to compute 17 + 25.
  → mcp__demo__add({"a":17,"b":25})
17 + 25 = 42.
```

### 练习 / 实践（对应 README 检查点）

1. 跑通 learn-agent s04（工具输出预算——理解大输出为何会爆、怎么截断）。
2. 照着 MCP 文档写一个自定义 MCP Server（比如给本地文件加一个只读搜索工具），放在本目录。
3. 用 Claude Code 或 Codex 成功调用它——检查点：独立写一个 MCP Server，被 Claude Code 成功调用。

### 实践产物：`mcp/file-search-server.mjs`（已写好）

一个只读的文件搜索 MCP Server，提供 `search_files({ query, dir? })`：在根目录下递归按文件名/路径搜索（只读，不返回文件内容）。骨架和 mcp-demo-server.mjs 相同——stdio 上换行分隔的 JSON-RPC，零依赖。

**单独测试（不经过任何 agent）**：

```powershell
cd .\03-工具系统与MCP
# 握手
'{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"t","version":"1"}}}' | node mcp\file-search-server.mjs
# 发现工具
'{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | node mcp\file-search-server.mjs
# 调用
'{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_files","arguments":{"query":"mcp"}}}' | node mcp\file-search-server.mjs
```

上面三步我已经实跑验证过：握手 ✓、tools/list 返回 search_files ✓、search_files("mcp") 找出了 mcp 目录下的文件 ✓。

### 我要做什么（这一章的检查点必须你自己完成）

**第 3 步（被 Claude Code / Codex 调用）必须在你自己的环境做**——需要你的 Claude Code 账号和终端，我做不了。步骤：

1. **注册进 Claude Code**（在 `03-工具系统与MCP` 目录下）：

   ```powershell
   claude mcp add file-search -- node .\mcp\file-search-server.mjs
   claude mcp list   # 确认已注册
   ```

   或者不用命令行，直接写一个 `.mcp.json` 到项目根目录（Claude Code 会自动读）：

   ```json
   { "mcpServers": { "file-search": { "command": "node", "args": ["mcp/file-search-server.mjs"] } } }
   ```

2. **在 Claude Code 里让它调用**，比如：
   ```
   > 用 search_files 找一下这个项目里所有和 mcp 相关的文件
   ```
   看它是否成功调用 `mcp__file-search__search_files`（黄色工具行）并返回路径。

3. **如果没有 Claude Code 订阅**，退而求其次：把 `file-search-server.mjs` 当普通 MCP server 用你自己的 agent（比如 Codex，或你前面的 v0~v2 agent 加一个 MCP 客户端）去连——检查点要求的是"被外部 agent 成功调用"，载体可以换。

4. **验收标准**：你的 agent 能通过协议发现并调用 `search_files`，返回正确的文件路径列表——`03` 这一章就算闭环了。

### 与真实产品对照（延伸阅读）

| 维度 | Claude Code | mini-claude（我们的实现） |
|------|------------|-------------|
| MCP SDK | `@anthropic-ai/sdk` 内置客户端 | 原始 JSON-RPC（无 SDK 依赖） |
| 服务器协议 | stdio + SSE | 仅 stdio |
| 工具发现 | 动态刷新（服务器可通知变更） | 一次性发现 |
| 配置来源 | settings.json + .mcp.json + 企业策略 | settings.json + .mcp.json |
| 错误处理 | 重试 + 降级 | 静默跳过失败服务器 |
| 连接时机 | 首次 chat 时懒加载 | 首次 chat 时懒加载 |
| 子 Agent 支持 | 独立 MCP 连接 | 主 Agent 专属，子 Agent 不连接 |

Claude Code 的 MCP 实现要点：支持 stdio 和 SSE 两种传输、OAuth 认证、动态工具刷新（服务器可以通知客户端工具列表已变更）；所有 MCP 工具以 `mcp__serverName__toolName` 格式注册——和我们的实现同构，只是多了传输、鉴权和热更新。

回到本章开头的问题——**工具调用和 MCP 的区别是什么？什么时候该自己写工具而不是让模型猜？** 答案的骨架是：

- **自己写工具**（注册表）：工具是你的程序的一部分，和 agent 同进程、可复用其他模块、能访问内存状态。适合"agent 的器官"——读文件、跑命令、编辑代码。
- **MCP 工具**（外部服务）：工具属于别人，通过协议远程挂载。适合"agent 的感官/外设"——数据库、Slack、GitHub，以及你不想（或不能）写进 agent 的第三方能力。
- 判断标准：工具和 agent 是否强耦合？强耦合（共享状态、依赖内部逻辑）→ 注册表；弱耦合（独立的领域能力，通过参数交流）→ MCP。MCP 的边界正是 s04 说的——**外部工具不受你控制，聚合预算（输出预算）是它们唯一的兜底**；s15 说的——**工具一多，deferred + 检索披露是缓存的前提**。
