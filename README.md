> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# ClickUp CLI

A production-ready command-line interface for the [ClickUp](https://clickup.com) API. Manage teams, spaces, folders, lists, tasks, and time tracking directly from your terminal.

> **Disclaimer**: This is an unofficial CLI tool and is not affiliated with, endorsed by, or supported by ClickUp.

## Features

- **Teams** — List and manage your ClickUp teams
- **Spaces** — Create and manage workspaces
- **Folders** — Organize your projects with folders
- **Lists** — Manage task lists within folders
- **Tasks** — Create, update, delete, and view tasks
- **Time Tracking** — Start/stop timers and view time entries
- **JSON output** — All commands support `--json` for scripting
- **Colorized output** — Clean, readable terminal output

## Why CLI > MCP

MCP servers are complex, stateful, and require a running server process. A CLI is:

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe output to `jq`, `grep`, `awk`, and other tools
- **Scriptable** — Use in shell scripts, CI/CD pipelines, cron jobs
- **Debuggable** — See exactly what's happening with `--json` flag
- **AI-friendly** — AI agents can call CLIs just as easily as MCPs, with less overhead

## Installation

```bash
npm install -g @ktmcp-cli/clickupcom
```

## Authentication Setup

ClickUp uses API key authentication.

### 1. Get Your API Key

1. Go to your ClickUp settings
2. Navigate to **Apps**
3. Generate an API token
4. Copy your API key

### 2. Configure the CLI

```bash
clickupcom config set --api-key YOUR_API_KEY
```

### 3. Verify

```bash
clickupcom teams list
```

## Commands

### Configuration

```bash
# Set API key
clickupcom config set --api-key <key>

# Show current config
clickupcom config show
```

### Teams

```bash
# List all teams
clickupcom teams list
```

### Spaces

```bash
# List spaces
clickupcom spaces list --team-id <team-id>

# Get a specific space
clickupcom spaces get <space-id>

# Create a space
clickupcom spaces create --team-id <team-id> --name "Marketing"
```

### Folders

```bash
# List folders
clickupcom folders list --space-id <space-id>

# Create a folder
clickupcom folders create --space-id <space-id> --name "Q1 2024"
```

### Lists

```bash
# List all lists in a folder
clickupcom lists list --folder-id <folder-id>

# Create a list
clickupcom lists create --folder-id <folder-id> --name "Sprint 1"
```

### Tasks

```bash
# List tasks
clickupcom tasks list --list-id <list-id>

# Get a specific task
clickupcom tasks get <task-id>

# Create a task
clickupcom tasks create --list-id <list-id> --name "Fix bug" --description "Description here"

# Update a task
clickupcom tasks update <task-id> --name "New name" --status "in progress"

# Delete a task
clickupcom tasks delete <task-id>
```

### Time Tracking

```bash
# List time entries
clickupcom time list --team-id <team-id>

# Start a timer
clickupcom time start --team-id <team-id> --task-id <task-id> --description "Working on feature"

# Stop the timer
clickupcom time stop --team-id <team-id>
```

## JSON Output

All commands support `--json` for machine-readable output:

```bash
# Get all tasks as JSON
clickupcom tasks list --list-id <list-id> --json

# Pipe to jq for filtering
clickupcom tasks list --list-id <list-id> --json | jq '.[] | select(.status.status == "in progress")'
```

## Examples

### Create a complete project structure

```bash
# First, get your team ID
clickupcom teams list

# Create a space
clickupcom spaces create --team-id <team-id> --name "Product Development"

# Create a folder
clickupcom folders create --space-id <space-id> --name "Q1 2024"

# Create a list
clickupcom lists create --folder-id <folder-id> --name "Sprint 1"

# Create tasks
clickupcom tasks create --list-id <list-id> --name "Setup CI/CD pipeline"
clickupcom tasks create --list-id <list-id> --name "Design database schema"
```

### Track time on a task

```bash
# Start timer
clickupcom time start --team-id <team-id> --task-id <task-id> --description "Implementing feature"

# Work on the task...

# Stop timer
clickupcom time stop --team-id <team-id>
```

## Contributing

Issues and pull requests are welcome at [github.com/ktmcp-cli/clickupcom](https://github.com/ktmcp-cli/clickupcom).

## License

MIT — see [LICENSE](LICENSE) for details.

---

Part of the [KTMCP CLI](https://killthemcp.com) project — replacing MCPs with simple, composable CLIs.
