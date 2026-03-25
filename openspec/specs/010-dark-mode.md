# 010: 暗色模式

**Status**: ready
**Priority**: P3
**Scope**: L (6+ files)
**Depends**: none

## Context

当前所有页面硬编码浅色色板（`#f4efe4` page / `#fbf8f2` card / `#16181a` text）。需要抽取主题系统，支持跟随系统偏好和手动切换。

## Requirements

1. 抽取颜色到统一主题 provider
2. 定义 light / dark 两套色板
3. 默认跟随系统偏好（`useColorScheme`）
4. 设置页添加主题切换开关（系统/浅色/深色）
5. 所有页面适配暗色模式

## Files to Modify

- 所有 `app/(tabs)/*.tsx` — 替换硬编码颜色为主题变量
- `app/login.tsx` — 适配
- `src/components/*.tsx` — 适配
- `app/(tabs)/settings.tsx` — 添加主题切换 UI

## Files to Create

- `src/lib/theme.tsx` — Theme provider + useTheme hook + light/dark 色板

## Acceptance Criteria

- [ ] 浅色模式视觉与当前一致
- [ ] 暗色模式可用且美观
- [ ] 跟随系统偏好切换
- [ ] 设置页可手动选择主题
- [ ] 所有页面无硬编码颜色遗漏

## OTA Verification

1. Push OTA: `npm run eas:update:preview "openspec-010: dark mode"`
2. 系统切换为暗色模式
3. 验证：app 跟随切换
4. 验证：所有页面暗色模式可用
5. 设置页手动切换主题正常
