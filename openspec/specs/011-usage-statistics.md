# 011: 使用统计增强

**Status**: ready
**Priority**: P0
**Scope**: M (3-5 files)
**Depends**: none

## Context

概览页已有基础统计卡片和趋势图。需要新增独立的"使用统计"tab 页，提供更详细的数据分析：按模型分组统计、按 API Key 分组统计、按日/小时的请求和 Token 详细图表。

## Requirements

1. 新增 "统计" tab 页，替换当前的 Auth tab（Auth 功能合并到设置页）
2. 显示总览卡片：总请求、成功、失败、成功率、总 Tokens
3. 按模型分组统计：每个模型的请求数和 Token 数（来自 usage.apis.{key}.models）
4. 按 API Key 分组统计：每个 key 的请求数、Token 数、覆盖模型数
5. 按天趋势图：requests_by_day 和 tokens_by_day（使用现有 LineTrendChart）
6. 按小时分布图：requests_by_hour 和 tokens_by_hour（使用现有 BarChartCard）
7. 下拉刷新

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /v0/management/usage | 获取使用统计（已有） |

真实返回结构：
```json
{
  "failed_requests": 17,
  "usage": {
    "total_requests": 762,
    "success_count": 745,
    "failure_count": 17,
    "total_tokens": 66574806,
    "apis": {
      "sk-xxx": {
        "total_requests": 762,
        "total_tokens": 66574806,
        "models": {
          "gpt-5.2": { "total_requests": 352, "total_tokens": 27556361, "details": [...] },
          "gpt-5.4": { "total_requests": 100, ... },
          "gpt-5.4-mini": { "total_requests": 310, ... }
        }
      }
    },
    "requests_by_day": { "2026-03-23": 337, "2026-03-24": 161, "2026-03-25": 267 },
    "tokens_by_day": { "2026-03-23": 26979690, ... },
    "requests_by_hour": { "00": 5, "01": 10, ... },
    "tokens_by_hour": { "00": 500, ... }
  }
}
```

## Files to Modify

- `app/(tabs)/_layout.tsx` — 将 Auth tab 替换为统计 tab（BarChart3 图标，标题"统计"）
- `app/(tabs)/monitor.tsx` — 精简概览页，移除已迁移到统计页的图表，保留核心卡片和运行状态

## Files to Create

- `app/(tabs)/statistics.tsx` — 新统计页面

## UI Behavior

使用 ScreenShell 布局。卡片区域：总请求/成功/失败/总 Tokens 四个 StatCard。
模型统计区域：每个模型一行 DetailRow（模型名 → 请求数 · Token 数）。
API Key 统计区域：每个 key 一张卡片（脱敏 key → 请求数 · Token 数 · 模型数）。
图表区域：LineTrendChart 按天、BarChartCard 按小时。
空态：无数据时显示"暂无统计数据"。

## Acceptance Criteria

- [ ] 新 tab "统计" 可用
- [ ] 总览卡片数据与 API 一致
- [ ] 按模型分组展示正确
- [ ] 按 API Key 分组展示正确
- [ ] 趋势图和分布图正常渲染
- [ ] 下拉刷新工作

## OTA Verification

1. Push OTA
2. 打开 app，检查 tab 栏出现"统计"
3. 验证数据与 https://x.empjs.dev 实际数据一致
