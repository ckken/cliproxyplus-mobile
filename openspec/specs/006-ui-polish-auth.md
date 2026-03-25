# 006: Auth UI 优化

**Status**: ready
**Priority**: P2
**Scope**: S (1-2 files)
**Depends**: 002

## Context

002 完成后 Auth 页面有了结构化展示和操作入口。本 spec 进一步优化视觉：提供商图标、状态颜色编码、最后验证时间格式化。

## Requirements

1. 每个提供商显示品牌图标
2. 授权状态用颜色编码（绿/灰）
3. 时间戳格式化为相对时间（如 "3 小时前"）

## Files to Modify

- `app/(tabs)/auth.tsx` — 增强卡片视觉
- `src/components/auth-provider-card.tsx` — 添加图标和颜色逻辑

## Acceptance Criteria

- [ ] 提供商有品牌图标
- [ ] 授权状态颜色编码清晰
- [ ] 时间显示为相对格式

## OTA Verification

1. Push OTA: `npm run eas:update:preview "openspec-006: auth ui polish"`
2. 导航到 Auth tab
3. 验证：视觉效果符合预期
