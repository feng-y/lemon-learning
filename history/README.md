# History

这里保存已经结束阶段的**快照、Review 和关键决策**。

它回答：

> Lemon 过去处于什么状态？我们当时怎么判断？哪些问题后来改善、调整或退出？

建议结构：

```text
history/
  reviews/
    2026-summer-mid-review.md
    2026-summer-final-review.md
  snapshots/
    2026-summer-baseline.md
```

## Reviews

阶段 Review 保存判断和决策，不保存每天流水账。

核心问题：

1. 哪些长期问题真正改善？
2. 哪些只是父母监督增强后的暂时改善？
3. 哪些干预有效或无效？
4. 哪些工作假设被证伪？
5. 哪些模板和外部控制可以退出？
6. 下一阶段最重要的 1–3 个问题是什么？

## Snapshots

Snapshot 保存某个关键时间点的基线，用于和未来比较。

例如：三升四暑假基线、四上期中状态、四上期末状态。

## 与 Active 的关系

`active/` 只代表现在；`history/` 只保存过去。

阶段切换时：

> Active Progress + Notes → Review → History → 更新新的 Active

不要让历史材料重新回流到 `active/`，除非它再次成为当前问题。
