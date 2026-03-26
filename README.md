<p align="center">
  <img src="https://usecomposer.com/logo_warm_trio_no_bg.svg" width="60" alt="Composer logo" />
</p>

<h1 align="center">Composer MCP Server</h1>

<p align="center">
  Give your AI coding agent an architecture canvas.<br/>
  Design, visualize, and evolve software architecture diagrams — right from your IDE.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@usecomposer/mcp"><img src="https://img.shields.io/npm/v/@usecomposer/mcp?color=D27754&label=npm" alt="npm version" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-green.svg" alt="MCP Compatible" /></a>
</p>

---

**Composer** is a visual system design tool that lets AI coding agents create and modify interactive architecture diagrams through [MCP (Model Context Protocol)](https://modelcontextprotocol.io). Your agent gets tools to add services, databases, queues, and connections — and you get a live canvas at [usecomposer.com](https://usecomposer.com) that updates in real-time.

https://github.com/OliverGrabner/composer-mcp/raw/main/demo.mp4

## Quick Start

### 1. Get a token

1. Sign up at [usecomposer.com](https://usecomposer.com)
2. Create a diagram
3. Open **Diagram Settings** (gear icon) → **MCP Tokens** → **Generate Token**
4. Copy the token (starts with `fl_`)

### 2. Connect your IDE

<details>
<summary><strong>Claude Code</strong></summary>

**One-liner:**

```bash
claude mcp add --transport http composer https://mcp.usecomposer.com --header "Authorization: Bearer fl_your_token_here"
```

**Or add to `.mcp.json` in your project root:**

```json
{
  "mcpServers": {
    "composer": {
      "type": "http",
      "url": "https://mcp.usecomposer.com",
      "headers": {
        "Authorization": "Bearer fl_your_token_here"
      }
    }
  }
}
```

Verify: run `/mcp` in your Claude Code session — Composer should appear with its tools.

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to `claude_desktop_config.json`:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "composer": {
      "type": "http",
      "url": "https://mcp.usecomposer.com",
      "headers": {
        "Authorization": "Bearer fl_your_token_here"
      }
    }
  }
}
```

Restart Claude Desktop. Look for the MCP tools icon in the chat input.

</details>

<details>
<summary><strong>Cursor</strong></summary>

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "composer": {
      "type": "http",
      "url": "https://mcp.usecomposer.com",
      "headers": {
        "Authorization": "Bearer fl_your_token_here"
      }
    }
  }
}
```

Open Cursor Settings → MCP section to verify "Composer" appears.

</details>

<details>
<summary><strong>VS Code (Copilot Chat)</strong></summary>

Create `.vscode/mcp.json` in your project root:

```json
{
  "servers": {
    "composer": {
      "type": "http",
      "url": "https://mcp.usecomposer.com",
      "headers": {
        "Authorization": "Bearer fl_your_token_here"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>VS Code (Cline)</strong></summary>

Open Cline sidebar → Settings (gear icon) → MCP Servers → Add Remote Server:

```json
{
  "mcpServers": {
    "composer": {
      "type": "http",
      "url": "https://mcp.usecomposer.com",
      "headers": {
        "Authorization": "Bearer fl_your_token_here"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>VS Code (Continue)</strong></summary>

Add to `.continue/config.yaml`:

```yaml
mcpServers:
  - name: composer
    url: https://mcp.usecomposer.com
    headers:
      Authorization: "Bearer fl_your_token_here"
```

</details>

<details>
<summary><strong>Windsurf</strong></summary>

Add to `~/.codeium/windsurf/mcp_config.json` (global config):

```json
{
  "mcpServers": {
    "composer": {
      "serverUrl": "https://mcp.usecomposer.com",
      "headers": {
        "Authorization": "Bearer fl_your_token_here"
      }
    }
  }
}
```

> **Note:** Windsurf uses `"serverUrl"` instead of `"url"`.

Restart Windsurf after saving.

</details>

<details>
<summary><strong>OpenCode</strong></summary>

Create `opencode.json` in your project root:

```json
{
  "mcp": {
    "composer": {
      "type": "remote",
      "url": "https://mcp.usecomposer.com",
      "headers": {
        "Authorization": "Bearer fl_your_token_here"
      }
    }
  }
}
```

Run `/mcp` to verify Composer appears.

</details>

## Available Tools

| Tool | Description |
|------|-------------|
| `get_graph` | Get the full architecture diagram — all nodes and edges |
| `get_node` | Get details for a single node including connected edges |
| `upsert_node` | Create or update a node (service, database, queue, etc.) |
| `upsert_edge` | Create or update a connection between two nodes |
| `define_api` | Define API endpoints on a backend service node |
| `delete_element` | Delete a node or edge from the diagram |
| `link_path` | Link a node to a file or folder in your codebase |
| `search_graph` | Search nodes and edges by keyword |
| `verify_diagram` | Check for completeness issues (missing endpoints, orphaned nodes, etc.) |
| `get_guide` | Reference guide for node types, protocols, and best practices |
| `plan_import` | Step-by-step workflow for importing an existing codebase |
| `show_diagram` | Display an interactive diagram viewer inline (MCP Apps) |

### Node Types

`client` · `frontend` · `backend` · `database` · `cache` · `queue` · `storage` · `external`

### Edge Protocols

`REST` · `gRPC` · `GraphQL` · `WebSocket` · `TCP` · `UDP` · `async` · `event` · `internal`

## Example Prompts

Once connected, try asking your AI agent:

- *"Import this codebase into Composer"* — scans your repo and builds the architecture diagram
- *"Add a Redis cache between the API and the database"* — modifies the diagram
- *"Verify my architecture diagram"* — checks for missing endpoints, orphaned nodes, etc.
- *"Link each node to its source code"* — associates diagram nodes with file paths

## Demo Mode

Try it without an account:

```bash
npx @usecomposer/mcp --demo
```

This starts the server with sample architecture data so you can see how the tools work.

## How it Works

This MCP server is a thin client. It authenticates with your token and proxies tool calls to the Composer API at `mcp.usecomposer.com`. Your diagram data lives on Composer's servers — the MCP server itself is stateless.

```
Your IDE ←→ MCP Server (this package) ←→ Composer API ←→ Your Diagram
```

Changes made through the MCP are immediately visible on the [Composer canvas](https://usecomposer.com) via real-time WebSocket sync.

## MCP App Viewer

When used with clients that support [MCP Apps](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/apps) (like Claude), the `show_diagram` tool renders an **interactive diagram viewer** directly in the conversation — no browser tab needed. You can click nodes, inspect endpoints, and see the full architecture inline.

## Development

```bash
git clone https://github.com/olivergrabner/composer-mcp
cd composer-mcp
npm install
npm run dev        # Watch mode (rebuilds on change)
npm run build      # Production build
```

## Links

- [Composer](https://usecomposer.com) — the visual architecture canvas
- [MCP Protocol](https://modelcontextprotocol.io) — Model Context Protocol spec
- [Issues](https://github.com/olivergrabner/composer-mcp/issues) — bug reports and feature requests

## License

MIT
