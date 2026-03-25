#!/usr/bin/env bash
# watch-agents.sh — 监控 cmux agent pane 完成状态
# 用法: ./scripts/watch-agents.sh surface:29 surface:30 surface:31
#
# 完成信号检测（覆盖 codex / opencode / claude）:
#   - codex: 出现 "Completed" 或回到输入提示符 ">"
#   - opencode: 出现 "Done" 或回到 "What would you like"
#   - claude: 出现 ">" 提示符且无 spinner

POLL_INTERVAL=${POLL_INTERVAL:-10}  # 默认 10 秒轮询
SURFACES=("$@")

if [ ${#SURFACES[@]} -eq 0 ]; then
  echo "用法: $0 surface:N [surface:M ...]"
  exit 1
fi

# 跟踪每个 surface 的完成状态
declare -A DONE

echo "🔍 开始监控 ${#SURFACES[@]} 个 agent..."
echo "   Surfaces: ${SURFACES[*]}"
echo "   轮询间隔: ${POLL_INTERVAL}s"
echo ""

completed_count=0
total=${#SURFACES[@]}

while [ $completed_count -lt $total ]; do
  for surf in "${SURFACES[@]}"; do
    # 跳过已完成的
    [ "${DONE[$surf]}" = "1" ] && continue

    # 读取最近的屏幕内容
    screen=$(cmux read-screen --surface "$surf" --lines 8 2>/dev/null)

    # 检测完成信号
    is_done=0

    # codex 完成信号
    if echo "$screen" | grep -qiE '(Completed|completed in|tokens remaining)'; then
      is_done=1
    fi

    # opencode 完成信号
    if echo "$screen" | grep -qiE '(What would you like|Done|>[[:space:]]*$)'; then
      # 排除正在工作的状态
      if ! echo "$screen" | grep -qiE '(reading|writing|searching|running|building|Thinking)'; then
        is_done=1
      fi
    fi

    if [ $is_done -eq 1 ]; then
      DONE[$surf]="1"
      completed_count=$((completed_count + 1))

      # 闪烁提醒
      cmux trigger-flash --surface "$surf" 2>/dev/null

      timestamp=$(date '+%H:%M:%S')
      echo "✅ [$timestamp] $surf 已完成 ($completed_count/$total)"
    fi
  done

  [ $completed_count -lt $total ] && sleep "$POLL_INTERVAL"
done

echo ""
echo "🎉 所有 agent 已完成！"

# 最终全部闪烁一次
for surf in "${SURFACES[@]}"; do
  cmux trigger-flash --surface "$surf" 2>/dev/null
done
