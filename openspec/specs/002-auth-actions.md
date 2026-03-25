# 002: Auth 操作入口

**Status**: ready
**Priority**: P0
**Scope**: M (3-5 files)
**Depends**: none

## Context

当前 `app/(tabs)/auth.tsx` 仅以 JSON dump 展示 `/v0/management/get-auth-status` 的返回值。用户无法直观看到各 OAuth 提供商的授权状态，也无法从移动端发起授权操作。需要将 JSON 解析为结构化的提供商列表，并提供 "授权" 操作按钮。

## Requirements

1. 解析 auth status response 为结构化的提供商列表展示
2. 每个提供商显示：名称、授权状态（已授权/未授权）、最后验证时间（如有）
3. 未授权的提供商显示 "授权" 按钮
4. 点击 "授权" 按钮通过 `Linking.openURL` 打开授权 URL
5. 已授权的提供商显示绿色状态标识
6. 下拉刷新后更新授权状态
7. 空态处理：无提供商配置时显示提示

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /v0/management/get-auth-status | 获取所有提供商授权状态 |

注意：授权 URL 的获取方式需确认。可能的方案：
- 方案 A：auth status response 中直接包含 `auth_url` 字段
- 方案 B：存在独立的 `GET /v0/management/get-auth-url?provider=xxx` 接口
- 方案 C：授权 URL 由固定规则拼接（如 `{baseUrl}/v0/auth/{provider}`）

实现时先调 GET auth-status 观察返回结构，根据实际数据选择方案。

## Files to Modify

- `src/types/admin.ts` — 将 `AuthStatus` 从 `Record<string, unknown>` 细化为具体类型（含提供商列表、状态、URL 等）
- `src/services/admin.ts` — 如需新接口则添加（如 `getAuthUrl`）
- `app/(tabs)/auth.tsx` — 重写页面：替换 JSON dump 为结构化提供商卡片列表

## Files to Create

- `src/components/auth-provider-card.tsx` — 单个提供商授权状态卡片（名称、状态徽标、操作按钮）

## UI Behavior

**正常态**: 页面标题 "Auth"，副标题 "查看与管理 OAuth 授权状态"。下方为提供商卡片列表，每张卡片显示：
- 提供商名称（如 "GitHub"、"Google"）
- 状态徽标：已授权 = 绿色 ✓，未授权 = 灰色
- 已授权：显示 "已授权" + 最后验证时间
- 未授权：显示 "授权" 按钮（primary 色）

**授权流程**: 点击 "授权" → `Linking.openURL(authUrl)` → 跳转外部浏览器完成 OAuth → 用户手动返回 app → 下拉刷新查看状态变化。

**空态**: 无提供商数据时显示 "暂无 OAuth 提供商配置"。

**错误态**: 获取状态失败时显示错误信息 + 重试按钮。

**Loading 态**: 首次加载显示 skeleton 或 loading indicator。

## Acceptance Criteria

- [ ] Auth 页面展示结构化的提供商列表，不再是 JSON dump
- [ ] 每个提供商显示名称和授权状态
- [ ] 未授权的提供商有 "授权" 按钮
- [ ] 点击授权按钮可打开外部浏览器的授权页面
- [ ] 已授权提供商显示绿色状态标识
- [ ] 下拉刷新正常工作
- [ ] 空态有提示信息

## OTA Verification

1. Push OTA: `npm run eas:update:preview "openspec-002: auth actions"`
2. 设备打开 app，导航到 Auth tab
3. 验证：页面显示结构化提供商列表而非 JSON
4. 验证：已授权/未授权状态正确显示
5. 验证：点击授权按钮可跳转浏览器（如有可用的 auth URL）
6. 验证：下拉刷新更新状态

## Notes

- `expo-linking` 已在 Expo SDK 中，可直接 `import { Linking } from 'react-native'` 使用
- auth status 的实际返回结构需在开发时先 GET 确认（类型当前为 `Record<string, unknown>`）
- 如果服务端未提供 auth URL 接口，可先实现状态展示部分，授权按钮灰置并标注 "服务端暂不支持"
- 授权完成后无自动回调（不是 deep link 回调），需要用户手动返回 app 并下拉刷新
