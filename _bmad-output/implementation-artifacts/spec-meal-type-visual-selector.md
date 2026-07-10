---
title: '饭桌餐次选择视觉优化'
type: 'feature'
created: '2026-07-10'
status: 'done'
route: 'one-shot'
---

# 饭桌餐次选择视觉优化

## Intent

**Problem:** 早餐、午餐、晚餐、加餐入口只有文字和“点选预填”说明，视觉辅助弱，也不符合年轻用户更偏好图像识别、少读说明的使用习惯。

**Approach:** 将餐次入口改成图片化贴纸卡：每个餐次配置对应食物图像符号和情绪色，删除“点选预填”，只保留必要餐次名称，并通过更圆润可爱的字形和选中反馈提升直觉性。

## Suggested Review Order

**数据入口**

- 餐次从字符串升级为带图像和视觉主题的配置。
  [`index.js:3`](../../pages/index/index.js#L3)

**模板结构**

- 四个入口渲染为食物图像卡，不再展示说明文字。
  [`index.wxml:26`](../../pages/index/index.wxml#L26)

- 点击仍通过餐次 type 写回原有表单字段。
  [`index.wxml:28`](../../pages/index/index.wxml#L28)

**视觉系统**

- 网格尺寸稳定，适合四个图片化入口并排展示。
  [`index.wxss:48`](../../pages/index/index.wxss#L48)

- 不同餐次使用不同主题色，减少纯文字识别负担。
  [`index.wxss:81`](../../pages/index/index.wxss#L81)

- 餐次名称使用更圆润的字体栈，弱化方正表单感。
  [`index.wxss:131`](../../pages/index/index.wxss#L131)
