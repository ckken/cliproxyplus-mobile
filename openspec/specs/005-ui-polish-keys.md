# 005: Keys UI 优化

**Status**: ready
**Priority**: P2
**Scope**: S (1-2 files)
**Depends**: 001

## Context

001 完成后 Keys 页面有了编辑能力。本 spec 进一步优化展示：脱敏 key 值、提供商图标、启用/禁用状态标识。

## Requirements

1. Key 值脱敏显示（前 8 位 + `...` + 后 4 位）
2. 每类 key 旁显示对应提供商图标
3. 支持展开/收起 key 完整值

## Files to Modify

- `app/(tabs)/keys.tsx` — 增强 key 展示样式
- `src/components/key-list-card.tsx` — 添加脱敏/展开逻辑和图标

## Acceptance Criteria

- [ ] Key 值默认脱敏展示
- [ ] 可点击展开查看完整值
- [ ] 提供商有对应图标

## OTA Verification

1. Push OTA: `npm run eas:update:preview "openspec-005: keys ui polish"`
2. 导航到 Keys tab
3. 验证：key 值脱敏显示
4. 验证：点击可展开完整值
