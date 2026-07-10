---
title: '图优先界面与饭桌常用描述修复'
type: 'feature'
created: '2026-07-10'
status: 'done'
route: 'one-shot'
---

# 图优先界面与饭桌常用描述修复

## Intent

**Problem:** 饭桌页点击餐次时会因输入框/键盘自动调整产生白框闪动；常用描述只切换标签，不会追加到一句话感受；多个 tab 页面仍有较多纯文字入口。

**Approach:** 餐次和常用描述点击时主动收起键盘，并关闭主要输入框的自动顶起页面；常用描述点击后追加到一句话感受；在饭桌、今晚、回味、小家四个 tab 中增加食物、地图、清单等主题图像入口，形成“图优先、字辅助”的一致规则。

## Suggested Review Order

**饭桌交互修复**

- 非输入类点击先收起键盘，减少白框闪动。
  [`index.js:73`](../../pages/index/index.js#L73)

- 常用描述点击后写入一句话感受，并避免重复追加。
  [`index.js:98`](../../pages/index/index.js#L98)

- 主要输入框关闭自动顶起页面，降低原生输入层跳动。
  [`index.wxml:49`](../../pages/index/index.wxml#L49)

**图优先入口**

- 做饭关键词和餐次推荐都带主题图像。
  [`cook.js:4`](../../pages/cook/cook.js#L4)

- 回味模式切换改成图标优先的短标签。
  [`restaurants.wxml:13`](../../pages/restaurants/restaurants.wxml#L13)

- 小家统计卡增加图像符号，减少纯数字表格感。
  [`mine.wxml:14`](../../pages/mine/mine.wxml#L14)

**全局规则**

- 全局字体栈偏向圆润可爱，配合图像化界面。
  [`app.wxss:1`](../../app.wxss#L1)

- README 记录“图优先、字辅助”的产品视觉规则。
  [`README.md:62`](../../README.md#L62)
