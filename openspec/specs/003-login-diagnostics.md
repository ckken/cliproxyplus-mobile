# 003: 登录诊断增强

**Status**: ready
**Priority**: P1
**Scope**: S (1-2 files)
**Depends**: none

## Context

当前 `app/login.tsx` 捕获错误后显示 `error.message`，通常是 `REQUEST_FAILED` 或 `INVALID_SERVER_RESPONSE` 等不友好的技术性信息。用户无法判断是网络问题、密码错误还是服务器不可达。需要分类错误并提供中文可操作提示。

## Requirements

1. 区分以下错误类型：网络不可达、DNS 解析失败、密码错误（code != 0）、SSL 错误、请求超时、服务器响应格式错误
2. 每种错误类型显示中文友好提示 + 建议操作
3. 密码错误时明确提示 "管理密码错误"
4. 网络错误时提示检查网络连接和服务器地址
5. 超时时提示检查服务器是否在运行

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /v0/management/config | 登录验证（已有） |

## Files to Modify

- `src/lib/admin-fetch.ts` — 增强错误分类逻辑，将原生 fetch 错误映射为分类错误
- `app/login.tsx` — 根据错误分类显示对应的中文提示和建议

## UI Behavior

**密码错误**: "管理密码错误，请检查后重试"
**网络不可达**: "无法连接到服务器，请检查网络连接和服务器地址"
**DNS 失败**: "域名解析失败，请检查服务器地址是否正确"
**超时**: "连接超时，请确认服务器正在运行"
**SSL 错误**: "SSL 证书验证失败，请检查服务器配置"
**格式错误**: "服务器响应格式异常，请确认是 CLIProxyAPI Plus 服务"

## Acceptance Criteria

- [ ] 输入错误密码时显示 "管理密码错误"
- [ ] 输入不可达地址时显示网络相关提示
- [ ] 输入无效域名时显示 DNS 相关提示
- [ ] 错误提示为中文且包含建议操作
- [ ] 正确密码仍能正常登录

## OTA Verification

1. Push OTA: `npm run eas:update:preview "openspec-003: login diagnostics"`
2. 设备打开 app 登录页
3. 验证：输入错误密码，显示 "管理密码错误"
4. 验证：输入不存在的域名，显示 DNS/网络提示
5. 验证：输入正确凭据可正常登录

## Notes

- fetch 错误在不同平台（iOS/Android/Web）的 error message 格式不同，需要用正则或关键词匹配
- 注意 `adminFetch` 中已有 `INVALID_SERVER_RESPONSE` 和 `REQUEST_FAILED` 错误，需在此基础上细化
