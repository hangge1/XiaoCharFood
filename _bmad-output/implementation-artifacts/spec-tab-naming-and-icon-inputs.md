---
title: '年轻化板块命名与图标输入槽'
type: 'feature'
created: '2026-07-10'
status: 'done'
route: 'one-shot'
---

# 年轻化板块命名与图标输入槽

## Intent

**Problem:** 当前 `饭桌 / 今晚 / 回味` 不够贴合底层信息架构里的 `打卡 / 菜谱 / 饭店`，同时又不够符合年轻用户偏好的轻量、有记忆点表达；部分输入框仍是纯表单，和“图优先、字辅助”的视觉方向不一致。

**Approach:** 将底部 tab 和首屏文案统一为 `饭卡 / 菜灵感 / 店记 / 小窝`；同步 README 和实现说明；新增全局图标输入槽样式，并把主要输入框改成“图标 + 暗示文案”的形式。

## Suggested Review Order

**信息架构命名**

- 底部 tab 从旧命名切换到饭卡、菜灵感、店记、小窝。
  [`app.json:22`](../../app.json#L22)

- 饭卡页首屏和 CTA 使用新的打卡语义。
  [`index.wxml:4`](../../pages/index/index.wxml#L4)

- 菜谱页改成菜灵感语义，覆盖首屏和收藏区。
  [`cook.wxml:4`](../../pages/cook/cook.wxml#L4)

- 饭店页改成店记语义，覆盖找回、新增和清单。
  [`restaurants.wxml:4`](../../pages/restaurants/restaurants.wxml#L4)

**图标输入槽**

- 全局新增可复用的图标输入槽样式。
  [`app.wxss:123`](../../app.wxss#L123)

- 饭卡页的昵称、吃了什么、感受输入统一图标化。
  [`index.wxml:15`](../../pages/index/index.wxml#L15)

- 店记页搜索和新增输入统一图标化。
  [`restaurants.wxml:31`](../../pages/restaurants/restaurants.wxml#L31)

- 小窝页偏好输入统一图标化。
  [`mine.wxml:33`](../../pages/mine/mine.wxml#L33)

**文档**

- README 同步新的四个入口命名。
  [`README.md:13`](../../README.md#L13)
