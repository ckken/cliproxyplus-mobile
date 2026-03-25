# 009: 多账号管理 UX

**Status**: ready
**Priority**: P3
**Scope**: M (3-5 files)
**Depends**: none

## Context

多账号基础设施已在 `admin-config.ts` 中实现（accounts 数组、switch、remove），但设置页仅显示当前服务器信息，缺少账号列表管理 UI。

## Requirements

1. 设置页添加 "已保存账号" section，列出所有账号
2. 每个账号显示：label（域名）、最后使用时间
3. 当前活跃账号高亮标识
4. 点击账号可切换（调用 `switchAdminAccount`）
5. 左滑删除账号（调用 `removeAdminAccount`，带确认）
6. "添加新账号" 按钮跳转到登录页

## Files to Modify

- `app/(tabs)/settings.tsx` — 添加账号列表 section

## Acceptance Criteria

- [ ] 设置页显示已保存账号列表
- [ ] 可点击切换账号
- [ ] 可滑动删除账号
- [ ] 当前账号有标识
- [ ] 可添加新账号

## OTA Verification

1. Push OTA: `npm run eas:update:preview "openspec-009: account management"`
2. 导航到设置 tab
3. 验证：显示已保存账号列表
4. 验证：可切换和删除账号
