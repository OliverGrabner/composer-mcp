#!/usr/bin/env node
/**
 * Entry point for the Composer MCP server.
 * Supports both stdio (for Claude Desktop) and HTTP (for testing).
 *
 * Usage:
 *   npx @usecomposer/mcp              # HTTP mode (default, port 3001)
 *   npx @usecomposer/mcp --stdio      # stdio mode (for Claude Desktop)
 */

import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Request, Response } from "express";
import { createServer } from "./server.js";

async function startStreamableHTTPServer(createServerFn: () => McpServer): Promise<void> {
  const port = parseInt(process.env.PORT ?? "3001", 10);

  const app = createMcpExpressApp({ host: "127.0.0.1" });

  app.all("/mcp", async (req: Request, res: Response) => {
    const server = createServerFn();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  const httpServer = app.listen(port, () => {
    console.log(`Composer MCP server listening on http://localhost:${port}/mcp`);
  });

  const shutdown = () => {
    console.log("\nShutting down...");
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function startStdioServer(createServerFn: () => McpServer): Promise<void> {
  await createServerFn().connect(new StdioServerTransport());
}

async function main() {
  const isDemo = process.env.DEMO === "true" || process.argv.includes("--demo");

  if (!isDemo && !process.env.COMPOSER_TOKEN) {
    console.error("Error: COMPOSER_TOKEN environment variable is required.");
    console.error("Get a token from your diagram settings at https://usecomposer.com");
    console.error("Or use --demo flag to test with sample data.");
    process.exit(1);
  }

  if (process.argv.includes("--stdio")) {
    await startStdioServer(createServer);
  } else {
    await startStreamableHTTPServer(createServer);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
