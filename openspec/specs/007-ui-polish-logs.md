# 007: 日志 UI 优化

**Status**: ready
**Priority**: P2
**Scope**: S (1-2 files)
**Depends**: none

## Context

当前日志页面将所有 log 行拼接为单个文本块。需要解析为结构化条目，支持颜色编码和搜索过滤。

## Requirements

1. 解析日志行为结构化条目（时间戳、级别、消息）
2. 按日志级别颜色编码（error=红、warn=橙、info=蓝、debug=灰）
3. 支持关键词搜索过滤
4. 使用 FlatList 虚拟化渲染

## Files to Modify

- `app/(tabs)/logs.tsx` — 重写日志展示区域
- `src/lib/formatters.ts` — 添加日志行解析函数

## Acceptance Criteria

- [ ] 日志以结构化条目展示
- [ ] 不同级别有颜色区分
- [ ] 可搜索过滤日志
- [ ] 大量日志时滚动流畅

## OTA Verification

1. Push OTA: `npm run eas:update:preview "openspec-007: logs ui polish"`
2. 导航到日志 tab
3. 验证：日志以结构化条目展示
4. 验证：搜索过滤正常工作
