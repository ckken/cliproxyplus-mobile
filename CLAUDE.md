# CLIProxyAPI Plus Mobile

Expo 54 + React Native 0.81 移动管理面板，直连 CLIProxyAPI Plus `/v0/management/*` 接口。

## Tech Stack

expo-router 6 · TanStack React Query 5 · Valtio 2 · react-hook-form 7 + zod 4 · uniwind (Tailwind) · lucide-react-native · expo-secure-store

## Architecture

```
Screen (app/)  →  Service (src/services/)  →  State (src/store/)
```

- **Screens**: `app/(tabs)/*.tsx` + `app/login.tsx`，expo-router file-based routing，5 tabs (monitor/keys/auth/logs/settings)
- **Services**: `src/services/admin.ts`，所有 API 调用通过 `adminFetch` 封装，自动注入 `Authorization: Bearer <password>`，解析 `{ code: 0, data: T }` 信封
- **State**: `src/store/admin-config.ts`，Valtio proxy + 多账号 + expo-secure-store 持久化
- **Components**: `src/components/`，`ScreenShell` 标准布局（下拉刷新/SafeArea/Header），`StatCard` / `DetailRow` / `ListCard` 数据展示

## API Auth

所有管理接口使用 `Authorization: Bearer <management_password>`。响应信封 `{ code: 0, data: T }`，非 0 为错误，取 `reason` 或 `message`。

## Conventions

- 中文 UI 文案
- 新代码优先用 Tailwind className（通过 uniwind），已有 inline style 的页面保持一致
- `ScreenShell` 是标准布局组件，新页面应使用
- 色板：`page: '#f4efe4'`, `card: '#fbf8f2'`, `text: '#16181a'`, `subtext: '#6f665c'`, `primary: '#1d5f55'`
- Query key 命名：`['overview']`, `['management-config']`, `['claude-keys']` 等
- Mutations 使用 `useMutation` + `onSuccess` 刷新相关 query

## Commands

```bash
npm start                                    # Expo dev server
npm run eas:update:preview "message"         # OTA push to preview
npm run eas:build:preview                    # Build preview APK
npx eas-cli@latest build --profile preview   # Build with latest CLI
```

## OpenSpec Workflow

功能规范在 `openspec/specs/`，优先级排序见 `openspec/ROADMAP.md`。开发流程见 `AGENTS.md`。
