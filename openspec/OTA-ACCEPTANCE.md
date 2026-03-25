# OTA 验收链路

```
实现 → 本地验证 → Commit → OTA Push → 设备接收 → 验收检查 → 标记 Done
```

## 详细流程

### 1. 实现
按 spec 的 "Files to Modify / Create" 完成开发。

### 2. 本地验证
```bash
npm start
```
在模拟器或 Expo Go 中逐条检查 spec 的 Acceptance Criteria。

### 3. Commit
```bash
git add <files>
git commit -m "feat(openspec-NNN): 简述"
```

### 4. OTA Push
```bash
npm run eas:update:preview "openspec-NNN: 简述"
```
记录输出中的 Update Group ID。

### 5. 设备接收
在安装了 dev-client / preview 壳的设备上：
- 强制关闭 app 后重新打开
- App 自动拉取 preview channel 的 OTA 更新
- 确认 runtimeVersion 匹配（当前 policy 为 `appVersion`，版本 `0.1.0`）

### 6. 验收检查
在真机上逐条执行 spec 的 "OTA Verification" 步骤。每一项必须通过。

### 7. 标记完成
- 更新 spec 文件：`Status: done`
- 更新 `openspec/ROADMAP.md` 对应行的 Status 列

## 失败处理

- **OTA push 失败**: 检查 `runtimeVersion` 是否匹配，可能需要先出新壳
- **设备未收到更新**: 检查 channel 是否为 `preview`，检查壳的 channel 分配
- **验收未通过**: 修复 → 重新 commit → 重新 push OTA，不标记 done

## 何时需要原生构建

OTA（expo-updates）只能推送 JS bundle 变更。以下情况需先 EAS build：
- 新增 native module
- 修改 `app.json` plugins
- 修改原生配置（权限、scheme 等）

```bash
npx eas-cli@latest build --profile preview --platform android
```
安装新 APK 后再推 OTA。
