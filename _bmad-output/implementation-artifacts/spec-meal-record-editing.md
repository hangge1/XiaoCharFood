---
title: '饭桌记录编辑体验优化'
type: 'feature'
created: '2026-07-10'
status: 'done'
route: 'one-shot'
---

# 饭桌记录编辑体验优化

## Intent

**Problem:** 饭桌记录保存后只能删除，无法修改；删除文字按钮破坏当前温暖视觉；一句话感受下方的常用描述 chip 在小程序里触控不直观。

**Approach:** 在同一个记一餐表单中加入编辑态，点记录卡片图标可回填并覆盖原记录；删除入口改为图标按钮；将一句话感受从 `textarea` 改为单行 `input`，避免原生 textarea 触控覆盖常用描述。

## Suggested Review Order

**编辑数据流**

- 编辑态保留原记录时间，保存时按 id 覆盖。
  [`index.js:116`](../../pages/index/index.js#L116)

- 点记录图标回填表单，取消或删除时清理编辑态。
  [`index.js:146`](../../pages/index/index.js#L146)

**表单交互**

- 表单标题和按钮随编辑态切换，用户知道正在修改。
  [`index.wxml:41`](../../pages/index/index.wxml#L41)

- 一句话感受改为 input，常用描述区域不再被 textarea 覆盖。
  [`index.wxml:47`](../../pages/index/index.wxml#L47)

**视觉收口**

- 记录卡操作区改为编辑和删除图标按钮。
  [`index.wxml:100`](../../pages/index/index.wxml#L100)

- 图标按钮和编辑状态使用当前饭桌视觉语言。
  [`index.wxss:99`](../../pages/index/index.wxss#L99)
