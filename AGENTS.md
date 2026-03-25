# Agents Guide

面向 Codex / OpenCode / Claude Code 的开发入口。

## Quick Start

```bash
npm ci
npm start
```

测试服务器：`https://x.empjs.dev`，Management Password：`ck666666`

## 如何接活

1. 读 `openspec/ROADMAP.md`，选 status=`ready` 的最高优先级 spec
2. 读对应的 `openspec/specs/NNN-slug.md`
3. 按 spec 的 "Files to Modify / Create" 实现
4. 本地验证 Acceptance Criteria
5. Commit：`feat(openspec-NNN): 简述`
6. OTA 验收：`npm run eas:update:preview "openspec-NNN: 简述"`
7. 更新 spec status → `done`，更新 `openspec/ROADMAP.md`

## File Map

```
app/(tabs)/monitor.tsx    概览仪表盘
app/(tabs)/keys.tsx       API Keys 展示（当前只读 JSON）
app/(tabs)/auth.tsx       OAuth 状态（当前只读 JSON）
app/(tabs)/logs.tsx       日志查看器
app/(tabs)/settings.tsx   配置编辑（开关 + 文本输入）
app/login.tsx             登录表单（zod 校验）
src/services/admin.ts     所有管理 API 调用
src/lib/admin-fetch.ts    Fetch 封装（认证 + 信封解析）
src/store/admin-config.ts Valtio 状态 + SecureStore 持久化
src/types/admin.ts        TypeScript 类型定义
src/components/           共享 UI：ScreenShell, StatCard, DetailRow, ListCard, 图表组件
```

## 添加 API 调用

1. `src/types/admin.ts` — 添加 response type
2. `src/services/admin.ts` — 添加函数，用 `adminFetch<T>(path)` 或 `adminFetch<T>(path, { method: 'PUT', body: JSON.stringify({ value }) })`
3. Screen 中用 `useQuery` / `useMutation`

## 添加新页面

1. 创建 `app/(tabs)/name.tsx` 或 `app/name.tsx`（非 tab 页面）
2. Tab 页面需在 `app/(tabs)/_layout.tsx` 添加 `<Tabs.Screen>`
3. 使用 `ScreenShell` 组件作为布局

## Style Rules

- Tailwind className via uniwind（推荐）
- 色板：`page: '#f4efe4'`, `card: '#fbf8f2'`, `text: '#16181a'`, `subtext: '#6f665c'`, `primary: '#1d5f55'`
- 中文 UI 文案
- 图标：`lucide-react-native`

## Do NOT

- 修改 `app.json` 中的 projectId / owner / scheme
- 替换 Valtio 为其他状态管理库
- 替换 TanStack React Query 为 SWR 或其他
- 删除 expo-secure-store 或 expo-updates
- 提交真实 management password 到代码中
