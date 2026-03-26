/**
 * MCP server for Composer -registers show_diagram tool + proxied write tools.
 * Links the diagram viewer HTML resource to the show_diagram tool.
 */

import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { DEMO_GRAPH } from "./demo.js";
import { fetchGraphData, generateTextFallback } from "./proxy.js";

const IS_DEMO = process.env.DEMO === "true" || process.argv.includes("--demo");

// Works both from source (server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "..", "..", "dist")
  : import.meta.dirname;

const COMPOSER_TOKEN = process.env.COMPOSER_TOKEN || "";
const API_BASE = process.env.COMPOSER_API_URL || "https://mcp.usecomposer.com";

if (!IS_DEMO && API_BASE && !API_BASE.startsWith("https://")) {
  throw new Error("COMPOSER_API_URL must use HTTPS to protect your token.");
}

/**
 * Creates a new MCP server instance with all tools and the diagram viewer resource.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Composer",
    version: "0.1.0",
    title: "Composer -Architecture Diagrams",
    description: "Design and visualize software architecture diagrams with AI",
    websiteUrl: "https://usecomposer.com",
    icons: [{
      src: "https://usecomposer.com/logo_warm_trio_no_bg.svg",
      mimeType: "image/svg+xml",
    }],
  });

  const resourceUri = "ui://composer/mcp-app.html";

  // ── show_diagram -the MCP App tool ──────────────────────────────
  registerAppTool(server,
    "show_diagram",
    {
      title: "Show Architecture Diagram",
      description: "Display an interactive architecture diagram inline. Shows all nodes (services, databases, queues, etc.) and their connections with protocols and data flows. The diagram renders with Composer's visual style -click nodes to inspect details.",
      inputSchema: {
        focus_node: z.string().max(128).regex(/^[a-z0-9-]+$/).optional().describe("Optional node ID to highlight and center on (e.g. 'auth-service')"),
      },
      _meta: { ui: { resourceUri } },
    },
    async (args: { focus_node?: string }): Promise<CallToolResult> => {
      const graph = IS_DEMO ? DEMO_GRAPH : await fetchGraphData(API_BASE, COMPOSER_TOKEN);
      const textFallback = generateTextFallback(graph, args.focus_node);

      return {
        content: [{ type: "text", text: textFallback }],
        structuredContent: {
          graph,
          focus_node: args.focus_node || null,
        },
      } as CallToolResult;
    },
  );

  // ── Proxied write tools ──────────────────────────────────────────
  // These forward tool calls to the existing Python MCP server at mcp.usecomposer.com

  server.tool(
    "get_graph",
    "Get the full architecture diagram -all nodes and edges.",
    {},
    async () => proxyTool("get_graph", {})
  );

  server.tool(
    "get_node",
    "Get full details for a single node including connected edges.",
    { node_id: z.string().max(128).regex(/^[a-z0-9-]+$/).describe("The node ID (kebab-case, e.g. 'auth-service')") },
    async (args) => proxyTool("get_node", args)
  );

  server.tool(
    "upsert_node",
    "Create or update an architecture node on the diagram.",
    {
      node_id: z.string().max(128).regex(/^[a-z0-9-]+$/).describe("Unique kebab-case ID (e.g. 'auth-service')"),
      name: z.string().max(512).describe("Display name (e.g. 'Auth Service')"),
      type: z.enum(["client", "frontend", "backend", "database", "cache", "queue", "storage", "external"]).describe("Node type"),
      description: z.string().max(512).default("").describe("What this component does"),
      tags: z.string().max(512).default("").describe("Comma-separated tech stack (e.g. 'Node.js, Express')"),
      entities: z.string().max(10000).default("").describe("JSON array of {name, fields} objects"),
    },
    async (args) => proxyTool("upsert_node", args)
  );

  server.tool(
    "upsert_edge",
    "Create or update a connection between two nodes.",
    {
      source: z.string().max(128).regex(/^[a-z0-9-]+$/).describe("Source node ID"),
      target: z.string().max(128).regex(/^[a-z0-9-]+$/).describe("Target node ID"),
      protocol: z.enum(["REST", "gRPC", "GraphQL", "WebSocket", "TCP", "UDP", "async", "event", "internal"]).describe("Connection protocol"),
      edge_id: z.string().max(128).default("").describe("Optional edge ID to update"),
      data_flow: z.string().max(512).default("").describe("Description of data flowing through this connection"),
    },
    async (args) => proxyTool("upsert_edge", args)
  );

  server.tool(
    "define_api",
    "Define API endpoints on a service node (full replacement).",
    {
      node_id: z.string().max(128).regex(/^[a-z0-9-]+$/).describe("The node to set endpoints on"),
      endpoints: z.string().max(10000).describe("JSON array of endpoint objects"),
    },
    async (args) => proxyTool("define_api", args)
  );

  server.tool(
    "delete_element",
    "Delete a node or edge from the diagram.",
    {
      target_type: z.enum(["node", "edge"]).describe("Either 'node' or 'edge'"),
      id: z.string().max(128).describe("The ID of the node or edge to delete"),
    },
    async (args) => proxyTool("delete_element", args)
  );

  server.tool(
    "link_path",
    "Link a node to a file or folder path in the codebase.",
    {
      node_id: z.string().max(128).regex(/^[a-z0-9-]+$/).describe("The node to link"),
      path: z.string().max(512).refine((p) => !p.includes(".."), { message: "Path must not contain '..' segments" }).describe("Relative path from repo root"),
    },
    async (args) => proxyTool("link_path", args)
  );

  // ── Guide & onboarding tools ────────────────────────────────────

  server.tool(
    "get_guide",
    "Get the Composer reference guide -node types, edge protocols, completeness criteria, and available tools. Call this BEFORE creating or modifying any nodes/edges.",
    {},
    async () => proxyTool("get_guide", {})
  );

  server.tool(
    "plan_import",
    "Get the step-by-step workflow for importing a codebase into Composer. Call this when about to scan a repository and recreate its architecture as a diagram.",
    {},
    async () => proxyTool("plan_import", {})
  );

  // ── Search & verification ─────────────────────────────────────

  server.tool(
    "search_graph",
    "Search the diagram for nodes and edges matching a keyword. Searches names, descriptions, tags, paths, endpoints, entities, edge labels, and data flows.",
    {
      query: z.string().max(256).describe("Search term (case-insensitive)"),
      type: z.string().max(64).default("").describe("Optional node type filter (e.g. 'backend', 'database'). Leave empty to search all."),
    },
    async (args) => proxyTool("search_graph", args)
  );

  server.tool(
    "verify_diagram",
    "Check the diagram for completeness issues -orphaned nodes, missing endpoints/entities/descriptions, edges without data_flow. Call after building to catch gaps.",
    {},
    async () => proxyTool("verify_diagram", {})
  );

  // ── Screenshot ─────────────────────────────────────────────────

  server.tool(
    "get_screenshot",
    "Get a base64-encoded PNG thumbnail of the diagram captured during the last auto-save in the Composer UI.",
    {},
    async () => proxyTool("get_screenshot", {})
  );

  // ── HTML Resource ────────────────────────────────────────────────
  registerAppResource(server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(path.join(DIST_DIR, "mcp-app.html"), "utf-8");
      return {
        contents: [{
          uri: resourceUri,
          mimeType: RESOURCE_MIME_TYPE,
          text: html,
          // CSP: allow fetching from Composer API for live updates
          _meta: {
            ui: {
              csp: {
                connectDomains: ["api.usecomposer.com", "mcp.usecomposer.com"],
                styleDomains: ["fonts.googleapis.com"],
                resourceDomains: ["fonts.googleapis.com", "fonts.gstatic.com", "github.com", "raw.githubusercontent.com"],
              },
            },
          },
        }],
      };
    },
  );

  return server;
}

/** Proxy a tool call to the remote Python MCP server via HTTP. */
async function proxyTool(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${COMPOSER_TOKEN}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: { name: toolName, arguments: args },
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      console.error(`Proxy request failed: ${response.status} ${response.statusText}`);
      throw new Error("Request to Composer API failed. Check your token and try again.");
    }

    const result = await response.json() as { result?: CallToolResult; error?: { message: string } };

    if (result.error) {
      return { content: [{ type: "text", text: `Error: ${result.error.message}` }], isError: true };
    }

    return result.result || { content: [{ type: "text", text: JSON.stringify(result) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Proxy error:", message);
    return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
  }
}
