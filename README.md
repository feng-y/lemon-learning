# Lemon Learning

这是一个面向 Lemon 的**长期学习改进工程**。

它不是教材仓库，也不是文件收集仓库。核心目标只有一个：

> **持续发现真正影响 Lemon 学习的问题，用最小有效方法改善，并用长期证据判断是否真的变好了。**

当前时间点：**2026 年暑假，三年级结束、即将进入四年级。**

当前通过“三年级复习 + 四年级适量预习”暴露和修复问题，但不以提前学完多少四年级内容为目标。

---

## 只看四个目录

```text
lemon-learning/
├── core/       长期稳定的方法与原则
├── active/     Lemon 现在的状态、问题、进度和临时信息
├── templates/  Lemon 直接执行的轻量模板
└── history/    已结束阶段的快照、Review 和关键结论
```

日常使用时，不需要理解整个仓库。

### 想知道 Lemon 现在怎么样

读：[`active/CURRENT.md`](active/CURRENT.md)

### 想知道现在长期在解决什么问题

读：[`active/problems.md`](active/problems.md)

### 想知道最近学到哪里、有没有真的改善

读：[`active/progress.md`](active/progress.md)

### 有一个临时想法、一次观察、一次作业现象，不知道放哪里

直接写进：[`active/notes/`](active/notes/README.md)

先记录，不急着分类，不直接修改长期系统。

### 想知道家长应该怎么教、怎么介入

读：[`core/teaching.md`](core/teaching.md)

### 想知道长期不变的教育原则

读：[`core/learning-os.md`](core/learning-os.md)

### Lemon 需要一张具体执行卡

读：[`templates/`](templates/README.md)

### 想回顾过去某个阶段发生了什么

读：[`history/`](history/README.md)

---

## 整个工程怎么运行

```text
临时观察 / 想法 / 事件
        ↓
active/notes/
先大量记录，不急着升级
        ↓
阶段性观察
        ↓
active/CURRENT.md      现在是什么状态
active/problems.md     当前长期解决什么
active/progress.md     学到哪里、是否改善
        ↓
使用 core/teaching.md 的方法
调用 templates/ 的执行动作
        ↓
真实学习
        ↓
阶段 Review
        ↓
history/
保存阶段结论
        ↓
只更新真正需要更新的 Active / Core
```

核心原则：

> **临时信息可以很多，正式结构必须很少。**

不是每一个新想法都要变成新目录、长期规则或新的教学方法。

---

# 1. Core：长期稳定层

[`core/`](core/README.md)

这里保存跨学期、跨年级仍然有价值的内容。

主要包括：

- `learning-os.md`：长期教育原则、家庭边界、统一学习闭环；
- `teaching.md`：语文、数学、英语、家长介入和辅助学习方法。

Core 更新频率应该很低。

一个方法只有经过多次真实使用，确认具有长期复用价值，才应该进入 Core。

---

# 2. Active：当前工作面

这是平时最重要的目录。

## CURRENT

[`active/CURRENT.md`](active/CURRENT.md)

只回答：

> **Lemon 现在在哪里？**

包括当前学段、当前阶段、重点问题、三科学习重点、当前 Gate 和下一次 Review。

覆盖式维护，不保留历史。

## Problems

[`active/problems.md`](active/problems.md)

只维护当前仍在专项解决的长期问题，例如：

- 自主执行；
- 困难任务中的停留能力；
- 数学信息处理；
- 提交质量；
- 语言信息提取与表达；
- 延迟保留。

问题稳定改善后应退出，而不是永久成为对 Lemon 的定义。

## Progress

[`active/progress.md`](active/progress.md)

同时看两类进度：

1. **内容进度**：复习确认了什么、预习到哪里、暴露了什么；
2. **能力进度**：是否更独立、更稳定、更能处理困难、更会检查、更能延迟保留。

长期上，能力进度比单纯课程进度更重要。

## Notes

[`active/notes/`](active/notes/README.md)

这是大量阶段性信息的默认入口。

适合保存：

- 临时教育想法；
- 一次作业观察；
- 一次冲突后的初步判断；
- 新出现但尚未确认的问题；
- 一次考试、网课、听写后的即时记录；
- 还不知道应该放哪里的内容。

默认按日期创建文件即可。

只有在 Review 时，才决定这些信息是否值得晋升到 CURRENT、Problems、Progress 或 Core。

---

# 3. Templates：Lemon 执行层

[`templates/`](templates/README.md)

这里保存 Lemon 可以直接执行的轻量 SOP，例如：

- 每日任务卡；
- 错误字学习卡；
- 阅读定位卡；
- 三句话表达卡；
- 数学读题卡；
- 数学检查卡；
- 英语单词轻量卡。

Template 不是新的教材或任务册。

真正学习痕迹仍留在 A/B 听写本、任务手册、阅读本、作文本、错题本、学校作业和练习册中。

模板被内化后应该逐步退出。

---

# 4. History：历史与总结

[`history/`](history/README.md)

这里只保存已经结束阶段的：

- Baseline / Snapshot；
- 阶段 Review；
- 关键决策与结论。

例如：

```text
history/
  snapshots/
    2026-summer-baseline.md
  reviews/
    2026-summer-mid-review.md
    2026-summer-final-review.md
```

History 不参与日常执行，只在需要比较过去时读取。

---

# 当前阶段：三升四暑假

当前不是单纯“暑假计划”，而是一个过渡期学习改进阶段。

核心策略：

> **复习旧内容确认基础是否真实稳定 + 预习少量新内容提前暴露下一阶段问题。**

当前优先看：

1. Lemon 是否逐步减少对父母实时调度的依赖；
2. 遇到稍难任务时是否还能留在任务中；
3. 数学是否形成读题—关系—计算—检查闭环；
4. 语文是否形成定位—证据—回答；
5. 提交质量和自检是否稳定；
6. 语文 / 英语是否从“当时会”走向“隔一段时间仍能提取”。

仓库的长期价值不在文件越来越多，而在于：

> **大量真实信息进入 Notes，少量稳定结论进入 Active，更少的成熟方法进入 Core，阶段变化沉淀到 History。**
