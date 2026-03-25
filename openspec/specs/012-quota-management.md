# 012: 配额管理

**Status**: ready
**Priority**: P0
**Scope**: M (3-5 files)
**Depends**: none

## Context

服务端 config 中有 quota-exceeded 配置（switch-project / switch-preview-model），以及 max-retry-credentials、request-retry、max-retry-interval 等配额相关设置。需要在设置页增加配额管理区域，让管理员可以查看和修改这些配置。

## Requirements

1. 设置页新增"配额管理"section
2. 显示并可编辑 quota-exceeded 配置：
   - switch-project（开关）：配额超限时自动切换项目
   - switch-preview-model（开关）：配额超限时切换预览模型
3. 显示并可编辑重试相关配置：
   - max-retry-credentials（数字）：最大重试凭据数
   - request-retry（数字）：请求重试次数（已有，确认可用）
   - max-retry-interval（数字）：最大重试间隔（已有，确认可用）
4. 显示 commercial-mode 状态（只读）
5. 显示 disable-cooling 开关
6. 修改后通过 PUT 提交

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /v0/management/config | 获取完整配置（已有） |
| PUT | /v0/management/quota-exceeded | 更新配额超限策略 |
| PUT | /v0/management/max-retry-credentials | 更新最大重试凭据数 |
| PUT | /v0/management/disable-cooling | 更新冷却禁用状态 |

真实 config 中相关字段：
```json
{
  "quota-exceeded": { "switch-project": true, "switch-preview-model": true },
  "max-retry-credentials": 0,
  "request-retry": 3,
  "max-retry-interval": 30,
  "commercial-mode": false,
  "disable-cooling": false
}
```

## Files to Modify

- `app/(tabs)/settings.tsx` — 新增配额管理 section
- `src/services/admin.ts` — 新增 updateQuotaExceeded、updateMaxRetryCredentials、updateDisableCooling 函数
- `src/types/admin.ts` — 如需新增配额相关类型

## UI Behavior

在设置页现有 section 下方新增"配额管理"卡片：
- 标题"配额管理"
- quota-exceeded 两个开关
- max-retry-credentials 数字输入
- disable-cooling 开关
- commercial-mode 只读显示（标签 + 状态）

修改后点保存按钮提交。成功后刷新配置。

## Acceptance Criteria

- [ ] 设置页显示配额管理 section
- [ ] quota-exceeded 开关可切换并提交
- [ ] max-retry-credentials 可编辑并提交
- [ ] disable-cooling 开关可切换
- [ ] commercial-mode 只读展示正确
- [ ] 修改后数据正确保存到服务端

## OTA Verification

1. Push OTA
2. 打开设置页，滚动到配额管理
3. 切换 quota-exceeded 开关，验证提交成功
4. 修改 max-retry-credentials，验证提交成功
