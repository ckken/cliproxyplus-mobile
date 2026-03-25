# Handoff - cliproxyplus-mobile

## 项目定位

`cliproxyplus-mobile` 是面向 `CLIProxyAPIPlus` 管理接口 (`/v0/management/*`) 的移动端管理面板。

- GitHub: https://github.com/ckken/cliproxyplus-mobile
- Expo Project: `@ckken/cliproxyplus-mobile`
- EAS projectId: `e5dd9be5-e27b-4720-b4d2-6bff12643abc`

## 当前可用能力

### 1. 登录
- 输入 `baseUrl`
- 输入 `Management Password`
- 当前已验证线上可用：
  - Base URL: `https://x.empjs.dev`
  - Management Password: `ck666666`

### 2. 概览页
- 总请求
- 失败请求
- 总 Tokens
- 最新版本
- Routing Strategy
- Request Log / Debug / WS Auth / Force Model Prefix / Usage Statistics
- Proxy URL / Retry 配置

### 3. 设置页
已支持修改：
- `proxy-url`
- `routing.strategy`
- `request-retry`
- `max-retry-interval`
- `request-log`
- `debug`
- `ws-auth`
- `force-model-prefix`

### 4. 日志页
已支持读取：
- `/v0/management/logs`
- `/v0/management/request-error-logs`

### 5. Keys 页
当前仍是只读展示：
- `claude-api-key`
- `codex-api-key`
- `gemini-api-key`
- `api-keys`
- `openai-compatibility`

### 6. Auth 页
当前仍是只读展示：
- `/v0/management/get-auth-status`

## 发布信息

### Android APK
- 最新 APK: `https://expo.dev/artifacts/eas/miDXJoSaDsFpxW9CNtPFi6.apk`

### OTA
- Branch: `preview`
- Update Group ID: `67746444-221c-402f-b634-2ed83f06c171`
- Dashboard: https://expo.dev/accounts/ckken/projects/cliproxyplus-mobile/updates/67746444-221c-402f-b634-2ed83f06c171

## 当前代码状态

已完成：
- 全新项目壳改造完成
- 直连 `CLIProxyAPIPlus /v0/management/*`
- 通过 Expo 编译验证
- Expo/EAS build 与 OTA 流程已打通

未完成：
- Keys 编辑能力
- Auth 操作入口（auth url 拉起）
- 更强的登录诊断反馈
- 更精细的日志详情页

## 关键实现文件

- `app/login.tsx` 登录页
- `app/(tabs)/monitor.tsx` 概览页
- `app/(tabs)/settings.tsx` 设置页
- `app/(tabs)/logs.tsx` 日志页
- `app/(tabs)/keys.tsx` Keys 页
- `app/(tabs)/auth.tsx` Auth 页
- `src/services/admin.ts` 管理 API 封装
- `src/lib/admin-fetch.ts` 管理接口请求封装
- `src/store/admin-config.ts` 本地配置与多账号存储

## 后续优先级建议

1. 完成 Keys 编辑
2. 完成 Auth 操作入口
3. 增强登录失败诊断
4. 补 request log by id 详情页
5. 优化 UI，减少 JSON 直出

## 注意事项

- 当前项目不再使用 sub2api 的 BFF 方案
- 当前项目是全新直连 `CLIProxyAPIPlus` 的管理面板
- 当前已验证：`Authorization: Bearer <management_password>` 可用于管理接口认证
- 线上已验证 `ck666666` 正确，`ck6666666` 错误
