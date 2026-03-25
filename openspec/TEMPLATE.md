# NNN: Feature Title

**Status**: ready | in-progress | done | blocked
**Priority**: P0 | P1 | P2 | P3
**Scope**: S (1-2 files) | M (3-5 files) | L (6+ files)
**Depends**: none | NNN

## Context

当前状态 + 为什么要做。

## Requirements

1. Requirement 1（可测试）
2. Requirement 2
3. ...

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /v0/management/xxx | 读取 |
| PUT | /v0/management/xxx | 更新 |

## Files to Modify

- `path/to/file.tsx` — 改动内容
- `path/to/file.ts` — 改动内容

## Files to Create

- `path/to/new-file.tsx` — 用途

## UI Behavior

用户可见行为描述。包含：正常态、空态、错误态、loading 态。

## Acceptance Criteria

- [ ] Criterion 1（对应 Requirement 1）
- [ ] Criterion 2
- [ ] ...

## OTA Verification

1. Push OTA: `npm run eas:update:preview "openspec-NNN: slug"`
2. 设备打开 app（dev-client / preview channel）
3. 导航到 [tab]
4. 验证: [具体检查项]
5. 验证: [具体检查项]

## Notes

边界情况、已知 API 特性、设计决策。
