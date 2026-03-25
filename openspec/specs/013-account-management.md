# 013: 多登录账号管理

**Status**: ready
**Priority**: P0
**Scope**: M (3-5 files)
**Depends**: none

## Context

多账号基础设施已在 src/store/admin-config.ts 中实现（accounts 数组、switchAdminAccount、removeAdminAccount、saveAdminConfig）。但缺少完整的账号管理 UI。用户添加服务器后无法切换或管理已保存的账号。

## Requirements

1. 设置页新增"已保存账号"section，显示所有已保存账号列表
2. 每个账号显示：服务器地址（label）、最后使用时间（updatedAt 格式化为相对时间）
3. 当前活跃账号有高亮标识（绿色边框 + "当前" 标签）
4. 点击非活跃账号可切换（调用 switchAdminAccount，切换后刷新所有 query）
5. 长按或左侧删除按钮可删除账号（Alert 确认，调用 removeAdminAccount）
6. "添加新账号" 按钮跳转到登录页（router.push('/login')）
7. 切换账号后自动刷新概览数据

## API Endpoints

无新增 API，使用已有的 store 函数。

## Files to Modify

- `app/(tabs)/settings.tsx` — 新增账号列表 section
- `app/login.tsx` — 确保从设置页跳转来时不会自动 redirect 回概览（当前有 hasAccount 检查需处理）

## UI Behavior

**账号列表**：在设置页顶部（当前服务器信息下方）显示卡片列表。每张卡片：
- 左侧：服务器地址（大字）+ 最后使用时间（小字灰色）
- 右侧：当前账号显示绿色"当前"标签，非当前账号显示"切换"按钮
- 删除：每个非当前账号右侧有删除图标（Trash2），点击后 Alert 确认

**切换流程**：点击"切换" → 调用 switchAdminAccount → queryClient.clear() → refetch overview → 页面数据刷新到新账号

**添加流程**：点击"添加新账号"按钮 → router.push('/login')。登录页需要支持从已登录状态跳转来添加新账号（不能被 hasAccount redirect 拦截）。

**空态**：只有一个账号时仍显示列表（1 个当前账号 + 添加按钮）。

## Acceptance Criteria

- [ ] 设置页显示已保存账号列表
- [ ] 当前账号有高亮标识
- [ ] 点击可切换到其他已保存账号
- [ ] 切换后页面数据自动刷新
- [ ] 可删除非当前账号（有确认）
- [ ] 可添加新账号（跳转登录页）
- [ ] 从设置页跳转到登录页时不被 redirect 拦截

## OTA Verification

1. Push OTA
2. 打开设置页，验证已保存账号列表显示
3. 添加第二个账号，验证列表更新
4. 切换账号，验证数据刷新
5. 删除账号，验证列表更新
