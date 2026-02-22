# AGENT.md — clickup20 CLI for AI Agents

This document explains how to use the clickup20 CLI as an AI agent.

## Overview

The `clickupcom` CLI provides access to the clickup20 API.

## Prerequisites

```bash
clickupcom config set --api-key <key>
```

## All Commands

### Config

```bash
clickupcom config set --api-key <key>
clickupcom config set --base-url <url>
clickupcom config show
```

### API Calls

```bash
clickupcom call            # Make API call
clickupcom call --json     # JSON output for parsing
```

## Tips for Agents

1. Always use `--json` when parsing results programmatically
2. Check `clickupcom --help` for all available commands
3. Configure API key before making calls
