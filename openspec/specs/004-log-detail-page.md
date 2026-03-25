# 004: 日志详情页

**Status**: ready
**Priority**: P1
**Scope**: M (3-5 files)
**Depends**: none

## Context

当前 `app/(tabs)/logs.tsx` 将所有日志行连接在一个文本块中展示，错误日志列表以 JSON 显示文件列表。缺少单条日志详情查看和错误日志文件内容查看能力。

## Requirements

1. 错误日志文件列表以结构化方式展示（文件名、大小、修改时间）
2. 点击错误日志文件可导航到详情页，查看该文件内容
3. 详情页显示完整日志内容，支持滚动和文本选择
4. 详情页有返回按钮

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /v0/management/logs?limit=N | 获取最近日志行（已有） |
| GET | /v0/management/request-error-logs | 获取错误日志文件列表（已有） |
| GET | /v0/management/request-error-logs/{filename} | 获取单个错误日志文件内容（新增） |

## Files to Modify

- `src/services/admin.ts` — 添加 `getRequestErrorLogDetail(filename: string)` 函数
- `src/types/admin.ts` — 添加错误日志详情 response type
- `app/(tabs)/logs.tsx` — 错误日志文件列表改为可点击的 `ListCard`，点击导航到详情页

## Files to Create

- `app/log-detail.tsx` — 错误日志详情页（非 tab 页面，Stack 路由）

## UI Behavior

**日志列表页**: 错误日志文件以 `ListCard` 展示（文件名、大小格式化为 KB/MB、修改时间格式化为相对时间）。点击后 `router.push('/log-detail?file=xxx')` 导航。

**详情页**: 顶部显示文件名，下方为可滚动的日志内容（等宽字体）。支持文本选择复制。

**空态**: 无错误日志文件时显示 "暂无错误日志"。

**Loading**: 详情页加载时显示 loading indicator。

**错误态**: 获取文件内容失败时显示错误信息。

## Acceptance Criteria

- [ ] 错误日志文件以结构化列表展示（文件名、大小、时间）
- [ ] 点击文件可导航到详情页
- [ ] 详情页显示完整文件内容
- [ ] 详情页支持滚动和文本选择
- [ ] 返回按钮正常工作

## OTA Verification

1. Push OTA: `npm run eas:update:preview "openspec-004: log detail page"`
2. 设备打开 app，导航到日志 tab
3. 验证：错误日志文件以结构化列表展示
4. 验证：点击文件可跳转到详情页
5. 验证：详情页显示日志内容，可滚动
6. 验证：可返回日志列表页

## Notes

- 错误日志详情接口 `GET /v0/management/request-error-logs/{filename}` 需确认是否存在，可能返回纯文本或 JSON
- 日志文件可能较大，详情页需考虑性能（使用 `FlatList` 或分页加载）
- `app/log-detail.tsx` 作为非 tab 页面，会以 Stack 形式 push 在 tabs 之上
