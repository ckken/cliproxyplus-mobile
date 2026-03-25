# 008: 用量统计图表

**Status**: ready
**Priority**: P2
**Scope**: M (3-5 files)
**Depends**: none

## Context

概览页当前以数字卡片展示 usage 数据。项目中已有 `BarChartCard`、`DonutChartCard`、`LineTrendChart` 三个图表组件，但未在任何页面使用。需要将这些图表集成到概览页，展示 token 分布和成本信息。

## Requirements

1. 添加 Token 分布 Donut Chart（input / output / cache tokens）
2. 添加成本展示卡片（total_cost_usd）
3. 使用现有图表组件，不引入新依赖
4. 数据来源于已有的 `getOverview()` 返回的 `UsagePayload`

## API Endpoints

无新增接口，使用现有 `/v0/management/usage`。

## Files to Modify

- `app/(tabs)/monitor.tsx` — 集成图表组件
- `src/components/donut-chart-card.tsx` — 可能需微调 props 适配
- `src/components/bar-chart-card.tsx` — 可能需微调 props 适配

## Acceptance Criteria

- [ ] 概览页显示 Token 分布图（input/output/cache）
- [ ] 显示成本信息
- [ ] 图表数据与 API 返回一致
- [ ] 无数据时图表优雅降级

## OTA Verification

1. Push OTA: `npm run eas:update:preview "openspec-008: usage statistics"`
2. 导航到概览 tab
3. 验证：图表正确展示 token 分布
4. 验证：成本信息显示正确
