![Banner](https://raw.githubusercontent.com/ktmcp-cli/clickupcom/main/banner.svg)

> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# clickup20 CLI

> **⚠️ Unofficial CLI** - Not officially sponsored or affiliated with clickup20.

A production-ready command-line interface for clickup20 — Polls is a simple API allowing consumers to view polls and vote in them.

## Features

- **Full API Access** — All endpoints accessible via CLI
- **JSON output** — All commands support `--json` for scripting
- **Colorized output** — Clean terminal output with chalk
- **Configuration management** — Store API keys securely

## Installation

```bash
npm install -g @ktmcp-cli/clickupcom
```

## Quick Start

```bash
# Configure API key
clickupcom config set --api-key YOUR_API_KEY

# Make an API call
clickupcom call

# Get help
clickupcom --help
```

## Commands

### Config

```bash
clickupcom config set --api-key <key>
clickupcom config set --base-url <url>
clickupcom config show
```

### API Calls

```bash
clickupcom call            # Make API call
clickupcom call --json     # JSON output
```

## JSON Output

All commands support `--json` for structured output.

## API Documentation

Base URL: `https://polls.apiblueprint.org`

For full API documentation, visit the official docs.

## Why CLI > MCP?

No server to run. No protocol overhead. Just install and go.

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe to `jq`, `grep`, `awk`
- **Scriptable** — Works in cron jobs, CI/CD, shell scripts

## License

MIT — Part of the [Kill The MCP](https://killthemcp.com) project.
