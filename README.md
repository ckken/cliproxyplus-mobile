# CLIProxyAPI Plus Mobile

移动端管理面板，直连 CLIProxyAPI Plus 的 `/v0/management/*` 接口。

## 当前闭环

- 连接管理地址 + Management Password
- 概览页读取 usage / config / latest version
- Keys 页读取 Claude / Codex / Gemini / API Keys / OpenAI Compatibility
- Auth 页读取授权状态
- 设置页查看当前服务器与配置摘要

## 开发

```bash
npm install
npm run start
```

登录时直接填写 CLIProxyAPI Plus 服务地址，例如：

```text
http://127.0.0.1:8080
```

## Expo

```bash
npx eas-cli@latest build --profile preview
npx eas-cli@latest update --branch preview --message "preview update"
```

## 注意

- 不要提交真实 management password
- 不要提交私有服务地址
- 第一版是小闭环验收版，后续再补日志、配置编辑、OAuth 拉起等能力
