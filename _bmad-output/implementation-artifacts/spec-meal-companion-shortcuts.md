---
title: '饭桌同行人快捷记录'
type: 'feature'
created: '2026-07-10'
status: 'done'
route: 'one-shot'
---

# 饭桌同行人快捷记录

## Intent

**Problem:** 饭桌记录只能记录吃了什么和感受，缺少“和谁一起吃”的生活记忆；用户第一次输入同行人后，下次还要重复手输，交互成本偏高。

**Approach:** 饮食记录新增 `companion` 字段；饭桌表单增加同行人输入和历史常用同行人快捷项；常用项从已保存饮食记录自动提取，点击后追加到当前同行人输入中，并在记录卡片中展示。

## Suggested Review Order

**数据层**

- 保存饮食记录时持久化同行人字段。
  [`store.js:75`](../../utils/store.js#L75)

- 从历史记录拆分和排序常用同行人。
  [`store.js:95`](../../utils/store.js#L95)

**饭桌交互**

- 饭桌页加载历史常用同行人选项。
  [`index.js:52`](../../pages/index/index.js#L52)

- 点击常用同行人追加到输入框并去重。
  [`index.js:107`](../../pages/index/index.js#L107)

- 新增同行人输入和快捷选项区域。
  [`index.wxml:50`](../../pages/index/index.wxml#L50)

- 记录卡片展示同行人，方便回看。
  [`index.wxml:114`](../../pages/index/index.wxml#L114)

**视觉**

- 同行人输入采用轻量图标化贴纸样式。
  [`index.wxss:168`](../../pages/index/index.wxss#L168)
