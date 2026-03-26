# cmux Conductor

**Deterministic topology control and multi-agent orchestration for terminal layouts.**

cmux Conductor is a skill that turns a multi-pane terminal into a programmable stage where AI agents can be placed, routed, monitored, and coordinated — all through a single CLI.

---

## Why Conductor?

Modern AI-assisted development often involves running multiple agents in parallel — each in its own pane, each on its own git worktree, each doing independent work. Conductor provides the orchestration layer that makes this possible:

| Capability | What it does |
|---|---|
| **Topology control** | Create, focus, move, reorder, and close windows, workspaces, panes, and surfaces with short handle refs (`surface:7`, `pane:2`) |
| **Agent placement** | Split layouts deterministically, then send commands and keystrokes to any surface |
| **Screen reading** | Read visible screen or scrollback from any pane to monitor agent progress |
| **Visual feedback** | Flash surfaces or workspaces to draw attention; health-check surfaces for stale state |
| **Stable identity** | Surface handles survive moves and reorders — routing never breaks mid-workflow |

---

## Topology Model

```
Window
 └── Workspace          (tab-like group)
      └── Pane           (split container)
           └── Surface   (terminal or browser panel)
```

Every element is addressable by a short ref (`window:1`, `workspace:3`, `pane:2`, `surface:8`) or UUID.

---

## Quick Start

```bash
# Who am I? Where am I?
cmux identify --json

# Inspect topology
cmux list-windows
cmux list-workspaces
cmux list-panes
cmux list-pane-surfaces --pane pane:1

# Build a layout
cmux new-split right --panel pane:1       # split current pane
cmux new-surface --type terminal --pane pane:2

# Route input to a surface
cmux send --surface surface:3 "echo hello"
cmux send-key --surface surface:3 "Enter"

# Read agent output
cmux read-screen --surface surface:3 --lines 20

# Visual cue
cmux trigger-flash --surface surface:3
```

---

## Orchestration in Action

Conductor's core strength is **multi-agent orchestration** — spinning up parallel coding agents, each isolated in its own worktree and pane, coordinated from a single conductor surface.

### Layout: 1 Coordinator + 3 Agents

```
┌──────────────┬──────────────┐
│              │  Agent A     │
│  Conductor   ├──────────────┤
│  (you)       │  Agent B     │
│              ├──────────────┤
│              │  Agent C     │
└──────────────┴──────────────┘
```

### Workflow

```bash
# 1. Isolate work with git worktrees
git worktree add ../agent-a -b feat/auth
git worktree add ../agent-b -b feat/api
git worktree add ../agent-c -b feat/ui

# 2. Build the pane layout
cmux new-split right --pane pane:1          # → surface:A
cmux new-split down  --surface surface:A    # → surface:B
cmux new-split down  --surface surface:B    # → surface:C

# 3. Launch agents in each pane
cmux send --surface surface:A "cd ../agent-a && codex --full-auto -a never"
cmux send-key --surface surface:A "Enter"

cmux send --surface surface:B "cd ../agent-b && claude --dangerously-skip-permissions"
cmux send-key --surface surface:B "Enter"

cmux send --surface surface:C "cd ../agent-c && opencode"
cmux send-key --surface surface:C "Enter"

# 4. Dispatch tasks (wait ~8s for agent init)
cmux send --surface surface:A "Implement JWT auth middleware"
cmux send-key --surface surface:A "Enter"

# 5. Monitor progress
cmux read-screen --surface surface:A --lines 40 --scrollback

# 6. Merge results in dependency order
git merge feat/auth && git merge feat/api && git merge feat/ui
```

---

## Orchestration Tips

- **Always use git worktrees** — file-level isolation prevents conflicts between agents.
- **`send` types, `send-key` submits** — never forget the Enter keystroke.
- **Surface must be visible** (`in_window=true`) to accept `send`.
- **Wait 6-8 seconds** after launching an agent before sending tasks.
- **Use `--scrollback`** to see full terminal history, not just the current viewport.
- **Merge order matters** — independent changes first, then infrastructure, then core.
- **Health-check before routing** — `cmux surface-health` detects hidden or detached surfaces.

---

## Ecosystem

| Skill | Purpose |
|---|---|
| **cmux** (this) | Topology control, agent orchestration |
| **cmux-browser** | Browser automation on surface-backed webviews |
| **cmux-markdown** | Markdown viewer panel with live file watching |

---

## Reference

| Document | Covers |
|---|---|
| [handles-and-identify](references/handles-and-identify.md) | Handle syntax, self-identification, caller targeting |
| [windows-workspaces](references/windows-workspaces.md) | Window/workspace lifecycle, reorder, move |
| [panes-surfaces](references/panes-surfaces.md) | Splits, surfaces, move/reorder, focus routing |
| [trigger-flash-and-health](references/trigger-flash-and-health.md) | Flash visual cues, surface health checks |
| [multi-agent-orchestration](references/multi-agent-orchestration.md) | Full orchestration playbook: worktrees, layout, dispatch, monitoring, merge |
