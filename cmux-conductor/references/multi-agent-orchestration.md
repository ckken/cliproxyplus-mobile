# 多 Agent 编排指南

通过 cmux 协调多个编码 agent（codex / opencode / claude），配合 git worktree 实现并行开发。

## 架构概览

```
┌──────────────┬──────────────┐
│  协调者       │  Agent 1     │
│  (Claude)    │  codex       │
│              ├──────────────┤
│              │  Agent 2     │
│              │  codex       │
│              ├──────────────┤
│              │  Agent 3     │
│              │  opencode    │
└──────────────┴──────────────┘
```

## 第一步：创建 Git Worktree

每个 agent 需要独立的仓库副本，避免文件冲突。

```bash
git worktree add ../project-agent1 -b feat/feature-a
git worktree add ../project-agent2 -b feat/feature-b
git worktree add ../project-agent3 -b feat/feature-c
```

## 第二步：创建 Pane 布局

```bash
# 查看当前上下文
cmux identify --json

# 在当前 pane 右侧创建 agent pane（垂直堆叠）
cmux new-split right --pane pane:当前
# 记录输出的 surface ID
cmux new-split down --surface surface:新1
cmux new-split down --surface surface:新2
```

## 第三步：在各 Pane 启动 Agent

```bash
# 每个 agent：cd 到 worktree + 启动
cmux send --surface surface:N "cd /path/to/project-agentN && codex --full-auto"
cmux send-key --surface surface:N "Enter"
```

### Agent 类型

| Agent | 启动命令 | 适用场景 |
|-------|---------|---------|
| codex | `codex --full-auto -a never` | 功能开发（**必须加 `-a never`，否则卡权限确认**） |
| codex（指定模型） | `codex --full-auto -a never --model o3` | 使用特定模型 |
| opencode | `opencode` | Bug 调查、代码分析（首次需手动信任目录，之后自动） |
| claude | `claude --dangerously-skip-permissions` | 复杂推理（**必须加权限跳过参数**） |

> **⚠️ 关键：所有 agent 必须给最高权限！** 无人值守模式下，任何权限弹窗都会卡死 agent。

### 权限模式

| 参数 | 行为 |
|------|------|
| （无） | 每条命令需人工审批 |
| `--full-auto` | 自动审批 + 工作区写入沙箱 |
| `--full-auto -a never` | 最高权限：自动审批 + 从不询问（**推荐**） |

## 第四步：发送任务

```bash
cmux send --surface surface:N "任务描述"
cmux send-key --surface surface:N "Enter"
```

### 任务 Prompt 模板

```
实现 [功能]。参考 [/参考项目/路径/文件.swift] 的实现模式。
步骤：
1) 创建 [新文件路径]，要求 [具体需求]
2) 修改 [已有文件]，完成 [具体改动]
3) 运行 swift build 验证编译通过。
```

### 参考项目对齐模板

对齐参考项目功能时使用：

```
实现 [功能]。参考 /path/to/参考项目/Services/Manager.swift 的模式。
步骤：
1) 新建 [文件]，使用 [参考的设计模式]
2) 集成到 [已有文件]
3) 在 [SettingsView.swift] 加入 UI 开关
4) 运行 swift build 验证。
```

## 第五步：监控进度

### 手动检查

```bash
# 读取 agent 当前屏幕输出
cmux read-screen --surface surface:N --lines 20

# 读取包含历史滚动内容
cmux read-screen --surface surface:N --lines 40 --scrollback

# 闪烁 pane 引起注意
cmux trigger-flash --surface surface:N
```

### 完成检测关键词

| Agent | 完成信号 |
|-------|---------|
| codex | "Completed"、"completed in"、"tokens remaining"、回到空闲提示符 |
| opencode | "Done"、回到 "What would you like"、无 Thinking/Building 状态 |
| claude | 输出任务总结，等待下一步输入（显示 ">" 提示符） |

### 自动化监控（推荐）

**方案 A：后台轮询脚本**

创建 `scripts/watch-agents.sh`，后台轮询各 surface 屏幕内容，检测完成信号后 `trigger-flash` 提醒：

```bash
# 启动后台监控（协调者 pane 中运行）
./scripts/watch-agents.sh surface:29 surface:30 surface:31 &

# 自定义轮询间隔（默认 10 秒）
POLL_INTERVAL=5 ./scripts/watch-agents.sh surface:29 surface:30 &
```

脚本逻辑：
1. 每 N 秒 `cmux read-screen` 检查各 surface
2. 匹配完成关键词（Completed / Done / What would you like / tokens remaining）
3. 排除仍在工作的状态（Thinking / Building / reading / writing）
4. 完成时 `cmux trigger-flash` 闪烁该 surface
5. 全部完成时输出 "🎉 所有 agent 已完成！"

**方案 B：协调者 Claude 内置轮询**

在协调者（Claude Code）中用 Bash 后台运行监控：

```bash
# 后台运行，重定向输出到文件
./scripts/watch-agents.sh surface:29 surface:30 > /tmp/agent-watch.log 2>&1 &
WATCH_PID=$!

# 稍后检查进度
cat /tmp/agent-watch.log

# 或者 Claude 直接在对话中轮询（每次用户交互时检查）
cmux read-screen --surface surface:29 --lines 5
cmux read-screen --surface surface:30 --lines 5
```

**方案 C：cmux notify 完成通知（推荐）**

在任务 prompt 末尾附加：

```
完成后运行: cmux notify --title 'Agent Done' --body '简要结果' --surface surface:1
```

agent 执行完任务后主动调用 `cmux notify`，协调者窗口收到桌面通知。经验证 opencode 和 codex (`--full-auto -a never`) 均可执行此命令。

**方案 D：任务发送时要求 agent 自报完成（备选）**

在任务 prompt 末尾附加：

```
完成后请在最后一行输出: TASK_DONE
```

然后监控脚本只需 grep `TASK_DONE`，信号更明确。

### 推荐流程

```
1. 启动 agent + 发送任务（末尾加 cmux notify 指令）
2. 不要用 while 循环/sleep 轮询 — 会阻塞用户输入
3. 任务发完后直接告诉用户"已派发，稍后手动检查或你说一声我来看"
4. 收到 cmux notify 通知 或 用户说"检查下"时 cmux read-screen 检查状态
5. 完成后验收合并
```

**重要：不要用后台轮询阻塞对话**。`run_in_background` 的 while 循环虽然不阻塞工具调用，但会在完成通知时打断用户对话流。最可靠的方式是：用 cmux notify 被动接收通知，或用户问进度时手动 read-screen。

## 第六步：验收合并

```bash
# 验证各 worktree 编译通过
cd /path/to/project-agent1 && swift build
cd /path/to/project-agent2 && swift build
cd /path/to/project-agent3 && swift build

# 按依赖顺序合并（独立的先合）
git checkout main
git merge feat/feature-c  # 独立基建
git merge feat/feature-b  # 组件
git merge feat/feature-a  # 核心改动最后合

# 清理 worktree
git worktree remove ../project-agent1
git worktree remove ../project-agent2
git worktree remove ../project-agent3
```

## 第七步：清理

```bash
# 关闭 agent surface
cmux close-surface --surface surface:N

# 关闭整个工作区（如果是专用的）
cmux close-workspace --workspace workspace:N
```

## 常用配方

### 快速版：2 Agent 左右分屏

```bash
git worktree add ../a-left -b feat/left
git worktree add ../a-right -b feat/right
cmux new-split right --pane pane:当前
cmux send --surface surface:左 "cd ../a-left && codex --full-auto"
cmux send-key --surface surface:左 "Enter"
cmux send --surface surface:右 "cd ../a-right && codex --full-auto"
cmux send-key --surface surface:右 "Enter"
```

### 完整版：3 Agent + 协调者

```bash
# 创建 worktree
git worktree add ../a1 -b feat/task-a
git worktree add ../a2 -b feat/task-b
git worktree add ../a3 -b feat/task-c

# 布局：协调者左侧，3 agent 右侧垂直堆叠
cmux new-split right --pane pane:当前  # → surface:A
cmux new-split down --surface surface:A # → surface:B
cmux new-split down --surface surface:B # → surface:C

# 启动（等待就绪后发任务）
for pair in "surface:A ../a1" "surface:B ../a2" "surface:C ../a3"; do
  surf=$(echo $pair | cut -d' ' -f1)
  dir=$(echo $pair | cut -d' ' -f2)
  cmux send --surface $surf "cd $dir && codex --full-auto"
  cmux send-key --surface $surf "Enter"
done

sleep 5
cmux send --surface surface:A "任务 A 描述" && cmux send-key --surface surface:A "Enter"
cmux send --surface surface:B "任务 B 描述" && cmux send-key --surface surface:B "Enter"
cmux send --surface surface:C "任务 C 描述" && cmux send-key --surface surface:C "Enter"
```

## 关键经验

1. **必须用 git worktree** — 多 agent 共享同一目录会产生文件冲突
2. **用 `--full-auto`** — 避免 agent 卡在权限确认上
3. **设计独立任务** — 最小化 agent 间的文件重叠
4. **合并顺序很重要** — 独立/基建改动先合，核心改动最后合
5. **`send-key "Enter"` 不可少** — `cmux send` 只是输入文字，需要回车提交
6. **`--scrollback` 看完整历史** — 默认 `read-screen` 只看当前屏幕
7. **Surface 必须可见** — `in_window=true` 才能接受 `send` 命令
8. **退出 agent** — `cmux send --surface surface:N "/exit"` 然后回车

## 踩坑与排障

### 1. codex 启动时有确认提示，不会直接进入输入态

**现象**: `codex --full-auto -a never` 启动后显示 "Yes, continue / No, quit / Press enter to continue"，不发 Enter 就卡住。

**解法**: 启动后必须 `read-screen` 检查就绪状态，再 `send-key "Enter"` 通过确认，然后再发任务。

```bash
# 启动
cmux send --surface surface:N "cd /path && codex --full-auto"
cmux send-key --surface surface:N "Enter"

# 等待 + 检查就绪
sleep 8
cmux read-screen --surface surface:N --lines 5
# 看到 "Press enter to continue" → 按回车
cmux send-key --surface surface:N "Enter"

# 再次确认进入输入态（看到模型名 + 百分比）
sleep 3
cmux read-screen --surface surface:N --lines 3
# 确认就绪后再发任务
cmux send --surface surface:N "任务描述" && cmux send-key --surface surface:N "Enter"
```

### 2. opencode 启动较慢，过早发任务会丢失

**现象**: opencode 启动后有初始化阶段（Build/索引），在此期间 `cmux send` 的内容会被吞掉。opencode 显示 "What would you like help with?" 说明任务没收到。

**解法**: 必须等 opencode 完全就绪（出现输入光标、显示模型名和 status bar）后再发任务。建议 sleep 至少 6-8 秒并用 `read-screen` 确认。

```bash
cmux send --surface surface:N "cd /path && opencode"
cmux send-key --surface surface:N "Enter"

# opencode 初始化更慢，等久一点
sleep 8
cmux read-screen --surface surface:N --lines 5
# 确认看到输入区域后再发任务
```

**如果任务已丢失**: 直接重发即可，opencode 不会因重复输入出错。

### 3. codex --full-auto 仍可能卡在权限确认

**现象**: 即使用了 `--full-auto -a never`，首次在新目录运行 codex 时可能弹出安全确认（信任此目录/允许写入）。

**解法**:
- 启动后多检查一次 `read-screen`，看是否有额外确认提示
- 如有，`send-key "Enter"` 通过
- 或提前在目标目录运行过一次 codex 建立信任

### 4. 任务描述过长可能被截断

**现象**: `cmux send` 发送大段文字时，终端行缓冲可能导致 agent 只收到部分内容。

**解法**:
- 任务描述控制在 20 行以内
- 复杂需求用 spec 文件承载，任务描述只写要点 + "参考 openspec/specs/NNN-xxx.md 的完整规范"
- 或将详细 prompt 写入临时文件，让 agent 读文件

### 5. 通用就绪检测模板

```bash
# 适用于所有 agent 类型的启动 + 就绪检测流程
start_agent() {
  local surf=$1 dir=$2 cmd=$3
  cmux send --surface $surf "cd $dir && $cmd"
  cmux send-key --surface $surf "Enter"
  sleep 8
  cmux read-screen --surface $surf --lines 5
  # 人工或脚本判断是否需要额外 Enter
}

# codex: 看到 "Press enter" → send-key Enter → 看到模型名 → 就绪
# opencode: 看到 status bar + 输入区 → 就绪
# claude: 看到 ">" 提示符 → 就绪
```
