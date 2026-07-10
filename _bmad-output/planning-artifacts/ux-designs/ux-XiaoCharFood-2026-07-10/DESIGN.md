---
name: XiaoCharFood
description: 私人饮食生活助手的微信小程序视觉系统，低压力、生活化、清晰可扫读。
status: final
sources:
  - ../prds/prd-XiaoCharFood-2026-07-10/prd.md
updated: 2026-07-10
colors:
  surface-base: '#F7F8F3'
  surface-raised: '#FFFFFF'
  surface-muted: '#EEF3EA'
  ink-primary: '#20251F'
  ink-secondary: '#5D675B'
  ink-tertiary: '#87907F'
  border-subtle: '#DDE4D7'
  accent-primary: '#2F7D68'
  accent-primary-soft: '#DDEFE8'
  accent-secondary: '#D86F45'
  accent-secondary-soft: '#F8E5DC'
  signal-calm: '#6F8F5F'
  signal-caution: '#B76E2D'
  signal-danger: '#C84F4F'
typography:
  display:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
    letterSpacing: 0
  title:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 20px
    fontWeight: 650
    lineHeight: 28px
    letterSpacing: 0
  section:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 17px
    fontWeight: 650
    lineHeight: 24px
    letterSpacing: 0
  body:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 15px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0
  meta:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 12px
    fontWeight: 500
    lineHeight: 17px
    letterSpacing: 0
rounded:
  sm: 4px
  md: 8px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  page-x: 16px
  page-bottom: 88px
components:
  primary-action:
    background: '{colors.accent-primary}'
    foreground: '#FFFFFF'
    radius: '{rounded.md}'
    minHeight: 44px
  secondary-action:
    background: '{colors.accent-primary-soft}'
    foreground: '{colors.accent-primary}'
    radius: '{rounded.md}'
    minHeight: 40px
  card:
    background: '{colors.surface-raised}'
    border: '1px solid {colors.border-subtle}'
    radius: '{rounded.md}'
  chip:
    background: '{colors.surface-muted}'
    foreground: '{colors.ink-secondary}'
    selectedBackground: '{colors.accent-primary-soft}'
    selectedForeground: '{colors.accent-primary}'
    radius: '{rounded.full}'
---

## Brand & Style

XiaoCharFood 的视觉气质是“生活记录本 + 家庭吃饭助手”，不是健身仪表盘，也不是探店社区。界面应让用户愿意随手记一餐，而不是感到被审判。

[ASSUMPTION: 第一版采用清新的蔬菜绿作为主色，搭配少量番茄橘作为强调色。] 绿色负责“平衡、记录、可信”，橘色只用于少量食欲和提醒场景，不做大面积背景。

## Colors

- **`surface-base`** 是默认页面底色，用于减轻纯白屏幕的生硬感。
- **`surface-raised`** 用于记录卡片、建议卡片、表单面板。
- **`accent-primary`** 是主操作色，用于“记一餐”“生成建议”“保存”等明确动作。
- **`accent-secondary`** 只用于轻微强调，如放纵餐标签、重点推荐理由，不用于错误或警告。
- **`signal-danger`** 仅用于删除确认，不用于饮食评价，避免让用户把食物选择理解为错误。

避免使用大面积红色、体重秤式蓝色、健身 App 式强对比黑底，以及会制造压力的告警色块。

## Typography

使用系统字体。标题保持克制，首页也不使用营销式大标题。正文以 `{typography.body}` 为主，数据和标签说明用 `{typography.meta}`。所有字号固定，不随视口宽度缩放。

## Layout & Spacing

移动端单列布局。页面左右边距使用 `{spacing.page-x}`。底部需要为微信小程序 tab bar 和浮动主操作留出 `{spacing.page-bottom}`。列表密度适中：饮食记录和餐厅记忆用于回看，必须可快速扫读。

首页不做传统 landing hero。第一屏直接呈现今日饮食状态、快速记录入口和今晚吃什么建议。

## Elevation & Depth

深度主要依靠背景层级和边框，不依赖重阴影。卡片使用 `{components.card}`。浮层可以使用轻微阴影，但不应让界面呈现营销卡片堆叠感。

## Shapes

卡片、按钮、输入框使用 `{rounded.md}`，小标签使用 `{rounded.full}`。不要把所有内容都做成圆角胶囊；胶囊只用于可选标签和状态标签。

## Components

- **主按钮**：使用 `{components.primary-action}`，用于保存、生成建议、确认加入计划。
- **次按钮**：使用 `{components.secondary-action}`，用于查看回顾、清除筛选、继续补充。
- **记录卡片**：展示餐别、图片缩略图、标签和一句备注。卡片不能因为图片缺失而高度跳变过大。
- **场景标签**：用于“省事”“清淡一点”“别重复”等选择。选中态使用 `{components.chip.selectedBackground}`。
- **建议卡片**：必须展示菜名、耗时、推荐理由、主要食材。推荐理由是视觉上靠前的元信息，不藏在详情页。
- **餐厅行**：以店名、人均、复购意愿和最近体验日期为主；图片可选，不作为识别唯一依据。

## Do's and Don'ts

| Do | Don't |
|---|---|
| 用“回顾、平衡、建议”表达饮食反馈 | 用“超标、失败、惩罚、必须控制”评价用户 |
| 让首页第一屏可直接记一餐 | 做品牌口号式大 hero |
| 推荐卡片展示推荐理由 | 只给随机菜名 |
| 空状态告诉用户下一步能做什么 | 用空泛插画和大段解释 |
| 删除、公开分享等敏感动作二次确认 | 默认把私人记录推向公开场景 |
