# AGENT.md — ClickUp CLI for AI Agents

This document explains how to use the ClickUp CLI as an AI agent.

## Overview

The `clickupcom` CLI provides access to the ClickUp API. Use it to manage teams, spaces, folders, lists, tasks, and time tracking.

## Prerequisites

The CLI must be configured before use. Check status with:

```bash
clickupcom config show
```

If not configured, the user must run:
```bash
clickupcom config set --api-key <key>
```

## All Commands

### Config

```bash
clickupcom config set --api-key <key>
clickupcom config show
```

### Teams

```bash
clickupcom teams list
clickupcom teams list --json
```

### Spaces

```bash
clickupcom spaces list --team-id <team-id>
clickupcom spaces get <space-id>
clickupcom spaces create --team-id <team-id> --name "Space Name"
```

### Folders

```bash
clickupcom folders list --space-id <space-id>
clickupcom folders create --space-id <space-id> --name "Folder Name"
```

### Lists

```bash
clickupcom lists list --folder-id <folder-id>
clickupcom lists create --folder-id <folder-id> --name "List Name"
```

### Tasks

```bash
# List tasks
clickupcom tasks list --list-id <list-id>

# Get single task
clickupcom tasks get <task-id>

# Create task
clickupcom tasks create --list-id <list-id> --name "Task name" --description "Description"

# Update task
clickupcom tasks update <task-id> --name "New name" --status "in progress"

# Delete task
clickupcom tasks delete <task-id>
```

### Time Tracking

```bash
clickupcom time list --team-id <team-id>
clickupcom time start --team-id <team-id> --task-id <task-id> --description "Working on feature"
clickupcom time stop --team-id <team-id>
```

## JSON Output

All list and get commands support `--json` for structured output. Always use `--json` when parsing results programmatically:

```bash
clickupcom teams list --json
clickupcom spaces list --team-id <id> --json
clickupcom tasks list --list-id <id> --json
```

## Example Workflows

### Find all tasks in a project

```bash
# Step 1: Get team ID
clickupcom teams list --json

# Step 2: List spaces
clickupcom spaces list --team-id <team-id> --json

# Step 3: List folders
clickupcom folders list --space-id <space-id> --json

# Step 4: List lists
clickupcom lists list --folder-id <folder-id> --json

# Step 5: List tasks
clickupcom tasks list --list-id <list-id> --json
```

### Create a task and track time

```bash
# Create task
clickupcom tasks create --list-id <list-id> --name "Fix authentication bug" --json

# Start timer (use task ID from previous output)
clickupcom time start --team-id <team-id> --task-id <task-id> --description "Debugging auth flow"

# Stop timer when done
clickupcom time stop --team-id <team-id>
```

## Error Handling

The CLI exits with code 1 on error and prints an error message to stderr. Common errors:

- `No API key configured` — Run `clickupcom config set --api-key <key>`
- `Authentication failed` — Check your API key is valid
- `Resource not found` — Check the ID is correct
- `Rate limit exceeded` — Wait before retrying

## Tips for Agents

1. Always use `--json` when you need to extract specific fields
2. ClickUp has a hierarchical structure: Team → Space → Folder → List → Task
3. Some lists can exist directly in a space without a folder
4. Task IDs are strings, not numbers
5. Time tracking requires team ID and task ID
6. The API key never expires unless manually revoked
