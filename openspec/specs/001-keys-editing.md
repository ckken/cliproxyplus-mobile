# 001: Keys 编辑

**Status**: ready
**Priority**: P0
**Scope**: M (3-5 files)
**Depends**: none

## Context

当前 `app/(tabs)/keys.tsx` 对 5 类 key（Claude / Codex / Gemini / API Keys / OpenAI Compatibility）仅做 JSON 原文展示（`JsonCard` 组件）。用户无法在移动端编辑 key 配置，必须回到服务端或 web 管理面板操作。需要添加编辑能力，让管理员可以直接在手机上增删改 key。

## Requirements

1. 每类 key 卡片显示结构化列表，而非 JSON dump
2. 每条 key 显示：key 值（脱敏，仅显示前 8 位 + `...`）、复制按钮
3. 每条 key 可删除（带确认弹窗）
4. 每类 key 支持新增（底部 "添加" 按钮，弹出输入框）
5. 编辑/新增后通过 PUT 接口提交，成功后刷新列表
6. 空态展示：无 key 时显示提示文案 + 添加按钮
7. 网络错误时显示错误提示

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /v0/management/claude-api-key | 读取 Claude keys |
| GET | /v0/management/codex-api-key | 读取 Codex keys |
| GET | /v0/management/gemini-api-key | 读取 Gemini keys |
| GET | /v0/management/api-keys | 读取通用 API keys |
| GET | /v0/management/openai-compatibility | 读取 OpenAI 兼容配置 |
| PUT | /v0/management/claude-api-key | 更新 Claude keys |
| PUT | /v0/management/codex-api-key | 更新 Codex keys |
| PUT | /v0/management/gemini-api-key | 更新 Gemini keys |
| PUT | /v0/management/api-keys | 更新通用 API keys |
| PUT | /v0/management/openai-compatibility | 更新 OpenAI 兼容配置 |

注意：PUT 接口的 body 格式需根据实际服务端 API 确认。预期格式为 `{ value: <new_config> }`，与现有 settings 的 PUT 接口风格一致。如果服务端返回的 GET 数据结构中 key 是数组（如 `["sk-xxx", "sk-yyy"]`），则 PUT 应提交整个数组。

## Files to Modify

- `src/types/admin.ts` — 将 `ApiKeyCollection` 从 `Record<string, unknown>` 细化为具体类型
- `src/services/admin.ts` — 添加 5 个 `updateXxxKeys` mutation 函数
- `app/(tabs)/keys.tsx` — 重写页面：替换 `JsonCard` 为可编辑 key 列表

## Files to Create

- `src/components/key-list-card.tsx` — 可复用的 key 列表卡片组件（显示 key 列表 + 添加/删除操作）

## UI Behavior

**正常态**: 每类 key 显示为一张卡片，卡片标题为类型名（Claude / Codex 等），下方为 key 列表。每条 key 显示脱敏值 + 复制图标 + 删除图标。卡片底部有 "添加" 按钮。

**添加流程**: 点击 "添加" → 展开输入框（在卡片底部 inline 展开）→ 输入 key → 点击确认 → PUT 提交 → 成功后刷新列表。

**删除流程**: 点击删除图标 → Alert 确认 → PUT 提交（移除该 key 后的完整数组）→ 成功后刷新列表。

**复制**: 点击复制图标 → `expo-clipboard` 复制完整 key 值 → 短暂 Toast 提示"已复制"。

**空态**: 卡片内显示 "暂无配置" + 添加按钮。

**错误态**: mutation 失败时 Alert 提示错误信息。

**Loading 态**: 提交时按钮显示 loading spinner，禁用重复提交。

## Acceptance Criteria

- [ ] 每类 key 以结构化列表展示，不再是 JSON dump
- [ ] key 值脱敏显示，可复制完整值
- [ ] 可删除单条 key（有确认弹窗）
- [ ] 可新增 key（inline 输入框）
- [ ] 编辑操作通过 PUT 提交后自动刷新
- [ ] 无 key 时显示空态
- [ ] 网络错误有提示

## OTA Verification

1. Push OTA: `npm run eas:update:preview "openspec-001: keys editing"`
2. 设备打开 app，导航到 Keys tab
3. 验证：每类 key 显示为结构化列表而非 JSON
4. 验证：点击复制图标可复制 key
5. 验证：点击添加按钮可输入新 key 并提交
6. 验证：点击删除可移除 key（需确认）
7. 验证：无 key 时显示空态提示

## Notes

- GET 返回的数据结构可能因 key 类型不同而不同（有的是字符串数组，有的是对象数组），需先调用 GET 观察实际返回格式再决定 UI 和 PUT body 结构
- `expo-clipboard` 已在 package.json 中，可直接使用
- OpenAI Compatibility 的数据结构可能比其他 key 复杂（可能包含 base_url 等配置），需要特殊处理
