# Roadmap

| # | Feature | Priority | Status | Scope | Depends | Spec |
|---|---------|----------|--------|-------|---------|------|
| 001 | Keys 编辑 | P0 | done | M | — | [spec](specs/001-keys-editing.md) |
| 002 | Auth 操作入口 | P0 | done | M | — | [spec](specs/002-auth-actions.md) |
| 003 | 登录诊断增强 | P1 | done | S | — | [spec](specs/003-login-diagnostics.md) |
| 004 | 日志详情页 | P1 | done | M | — | [spec](specs/004-log-detail-page.md) |
| 005 | Keys UI 优化 | P2 | done | S | 001 | [spec](specs/005-ui-polish-keys.md) |
| 006 | Auth UI 优化 | P2 | done | S | 002 | [spec](specs/006-ui-polish-auth.md) |
| 007 | 日志 UI 优化 | P2 | ready | S | — | [spec](specs/007-ui-polish-logs.md) |
| 008 | 用量统计图表 | P2 | ready | M | — | [spec](specs/008-usage-statistics.md) |
| 009 | 多账号管理 UX | P3 | ready | M | — | [spec](specs/009-account-management.md) |
| 010 | 暗色模式 | P3 | ready | L | — | [spec](specs/010-dark-mode.md) |

## Status Legend

- `ready` — 可被 agent 拾取开发
- `in-progress` — 正在开发中
- `done` — 已通过 OTA 验收
- `blocked` — 有依赖或服务端阻塞
