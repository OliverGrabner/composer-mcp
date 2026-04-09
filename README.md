<p align="center">
  <img src="https://github.com/OliverGrabner/composer-mcp/raw/main/demo.gif" alt="Composer demo" />
</p>

<p align="center">
  <img src="https://usecomposer.com/logo_warm_trio_no_bg.svg" width="28" alt="Composer logo" />
  <strong>Composer MCP Server</strong>
</p>

<p align="center">
  Give your AI coding agent an architecture canvas.<br/>
  Design, visualize, and evolve software architecture diagrams - right from your IDE.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@usecomposer/mcp"><img src="https://img.shields.io/npm/v/@usecomposer/mcp?color=D27754&label=npm" alt="npm version" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-green.svg" alt="MCP Compatible" /></a>
</p>

---

**Composer** is a visual system design tool that lets AI coding agents create and modify interactive architecture diagrams through [MCP (Model Context Protocol)](https://modelcontextprotocol.io). Your agent gets tools to add services, databases, queues, and connections, and you get a live canvas at [usecomposer.com](https://usecomposer.com) that updates in real-time.

```
Your IDE  <-->  MCP Server (this package)  <-->  Composer API  <-->  Your Diagram
```

> **Try it now** - no account needed:
> ```bash
> npx @usecomposer/mcp --demo
> ```
> Starts the server with sample architecture data so you can explore all the tools.

## Getting Started

1. Sign up at [usecomposer.com](https://usecomposer.com)
2. Add the server to your IDE (see below)
3. Authorize in your browser when prompted
4. Start building diagrams

### Connect your IDE

**Claude Code:**

```bash
claude mcp add --transport http composer https://mcp.usecomposer.com
```

**Cursor** — create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "composer": {
      "type": "http",
      "url": "https://mcp.usecomposer.com"
    }
  }
}
```

Your browser will open for authorization on first use.

<details>
<summary><strong>Claude Code</strong></summary>

```bash
claude mcp add --transport http composer https://mcp.usecomposer.com
```

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
      "url": "https://mcp.usecomposer.com"
    }
  }
}
```

</details>

<details>
<summary><strong>Cursor</strong></summary>

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "composer": {
      "type": "http",
      "url": "https://mcp.usecomposer.com"
    }
  }
}
```

</details>

<details>
<summary><strong>Codex</strong></summary>

```bash
codex mcp add composer -- npx -y @usecomposer/mcp --stdio
```

</details>

<details>
<summary><strong>VS Code (Copilot Chat)</strong></summary>

Create `.vscode/mcp.json` in your project root:

```json
{
  "servers": {
    "composer": {
      "type": "http",
      "url": "https://mcp.usecomposer.com"
    }
  }
}
```

</details>

<details>
<summary><strong>VS Code (Cline)</strong></summary>

Open Cline sidebar > Settings (gear icon) > MCP Servers > Add Remote Server:

```json
{
  "mcpServers": {
    "composer": {
      "type": "http",
      "url": "https://mcp.usecomposer.com"
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
```

</details>

<details>
<summary><strong>Windsurf</strong></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "composer": {
      "serverUrl": "https://mcp.usecomposer.com"
    }
  }
}
```

> **Note:** Windsurf uses `"serverUrl"` instead of `"url"`.

</details>

<details>
<summary><strong>OpenCode</strong></summary>

Create `opencode.json` in your project root:

```json
{
  "mcp": {
    "composer": {
      "type": "remote",
      "url": "https://mcp.usecomposer.com"
    }
  }
}
```

</details>

## Tools

### Diagram Management

| Tool | Description |
|------|-------------|
| `list_diagrams` | List all your diagrams. Call this first to find which diagram to work on |
| `create_diagram` | Create a new diagram and auto-select it for this session |
| `select_diagram` | Select which diagram to work on for this session |
| `rename_diagram` | Rename the currently selected diagram |

> **Note:** Call `list_diagrams` then `select_diagram` (or `create_diagram`) before using other tools.

### Read

| Tool | Description |
|------|-------------|
| `get_graph` | Get the full architecture diagram - all nodes and edges |
| `get_node` | Get details for a single node including connected edges |
| `search_graph` | Search nodes and edges by keyword |
| `get_screenshot` | Get a PNG thumbnail of the diagram from the last auto-save |

### Write

| Tool | Description |
|------|-------------|
| `upsert_node` | Create or update a node (service, database, queue, etc.) |
| `upsert_edge` | Create or update a connection between two nodes |
| `define_api` | Define API endpoints on a backend service node |
| `delete_element` | Delete a node or edge from the diagram |
| `link_path` | Link a node to a file or folder in your codebase |

### Plan & Verify

| Tool | Description |
|------|-------------|
| `verify_diagram` | Check for issues like missing endpoints or orphaned nodes |
| `plan_import` | Step-by-step workflow for importing an existing codebase |
| `get_guide` | Reference guide for node types, protocols, and best practices |

### Node Types

`client` · `frontend` · `backend` · `database` · `cache` · `queue` · `storage` · `external`

### Edge Protocols

`REST` · `gRPC` · `GraphQL` · `WebSocket` · `TCP` · `UDP` · `async` · `event` · `internal`

## Example Prompts

Once connected, try asking your AI agent:

| Prompt | What it does |
|--------|-------------|
| *"Import this codebase into Composer"* | Scans your repo and builds the architecture diagram |
| *"Create a new Composer diagram called Backend Architecture"* | Creates and auto-selects a new diagram |
| *"Add a Redis cache between the API and the database in Composer"* | Adds a new node and edges to the diagram |
| *"Add analytics monitoring to the Composer diagram"* | Adds observability nodes and connections |
| *"Update the APIs I defined in Composer"* | Refreshes endpoint definitions on backend nodes |
| *"Verify my Composer diagram"* | Checks for missing endpoints, orphaned nodes, etc. |
| *"Link each Composer node to its source code"* | Associates diagram nodes with file paths |

## How It Works

Authentication is handled via OAuth 2.1 — your browser opens for a one-time consent flow, and you're connected. Tool calls are proxied to the Composer API at `mcp.usecomposer.com`. Your diagram data lives on Composer's servers. The MCP server itself is stateless.

Changes made through MCP are immediately visible on the [Composer canvas](https://usecomposer.com) via real-time WebSocket sync.

## Development

```bash
git clone https://github.com/olivergrabner/composer-mcp
cd composer-mcp
npm install
npm run dev        # Watch mode (rebuilds on change)
npm run build      # Production build
```

## Links

- [Composer](https://usecomposer.com) - the visual architecture canvas
- [MCP Protocol](https://modelcontextprotocol.io) - Model Context Protocol spec
- [Issues](https://github.com/olivergrabner/composer-mcp/issues) - bug reports and feature requests

## License

MIT
