/**
 * Fetches graph data from the Composer API and generates text fallbacks.
 */

// Inline minimal types needed for the server (avoids cross-tsconfig imports)
interface NodeData {
  label: string
  nodeType: string
  description?: string
  tags?: string[]
  endpoints?: Array<{ method: string; path: string; description: string }>
  entities?: Array<{ name: string; fields: string }>
}

interface DiagramNode {
  id: string
  type?: string
  position: { x: number; y: number }
  data: NodeData
}

interface DiagramEdge {
  id: string
  source: string
  target: string
  type?: string
  data?: { label?: string; protocol?: string; data_flow?: string }
}

interface GraphData {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

/**
 * Fetch the full graph data (with positions) from the remote MCP server.
 * Calls the existing get_graph tool via JSON-RPC.
 */
export async function fetchGraphData(apiBase: string, token: string): Promise<GraphData> {
  const response = await fetch(apiBase, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: "get_graph", arguments: {} },
      id: Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch graph: ${response.status} ${response.statusText}`);
  }

  const jsonRpcResult = await response.json() as {
    result?: { content?: Array<{ type: string; text: string }> };
    error?: { message: string };
  };

  if (jsonRpcResult.error) {
    throw new Error(`MCP error: ${jsonRpcResult.error.message}`);
  }

  const textContent = jsonRpcResult.result?.content?.find(c => c.type === "text");
  if (!textContent || !("text" in textContent)) {
    throw new Error("No graph data in response");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphJson = JSON.parse(textContent.text) as { nodes: any[]; edges: any[] };

  // The get_graph tool returns nodes without positions (cleaned format).
  // We need positions for the viewer -fallback layout will arrange them if all (0,0).
  const nodes: DiagramNode[] = graphJson.nodes.map((n) => ({
    id: n.id,
    type: "system",
    position: n.position || { x: 0, y: 0 },
    data: n.data,
  }));

  const edges: DiagramEdge[] = graphJson.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "labeled",
    data: e.data,
  }));

  return { nodes, edges };
}

/**
 * Generate a plain text fallback for non-UI clients.
 * Shows nodes and connections in ASCII format.
 */
export function generateTextFallback(graph: GraphData, focusNode?: string): string {
  const lines: string[] = [];

  lines.push("# Architecture Diagram");
  lines.push("");

  // Nodes table
  lines.push("## Nodes");
  lines.push("");
  for (const node of graph.nodes) {
    const marker = focusNode === node.id ? " ← (focused)" : "";
    const tags = node.data.tags?.length ? ` [${node.data.tags.join(", ")}]` : "";
    lines.push(`- **${node.data.label}** (${node.data.nodeType})${tags}${marker}`);
    if (node.data.description) {
      lines.push(`  ${node.data.description}`);
    }
    if (node.data.endpoints?.length) {
      lines.push(`  Endpoints: ${node.data.endpoints.length}`);
    }
    if (node.data.entities?.length) {
      lines.push(`  Entities: ${node.data.entities.length}`);
    }
  }

  lines.push("");

  // Edges
  if (graph.edges.length > 0) {
    lines.push("## Connections");
    lines.push("");
    for (const edge of graph.edges) {
      const sourceNode = graph.nodes.find(n => n.id === edge.source);
      const targetNode = graph.nodes.find(n => n.id === edge.target);
      const label = edge.data?.label || edge.data?.protocol || "";
      lines.push(`- ${sourceNode?.data.label || edge.source} → ${targetNode?.data.label || edge.target}${label ? ` (${label})` : ""}`);
    }
  }

  lines.push("");
  lines.push("View this diagram interactively at https://usecomposer.com");

  return lines.join("\n");
}
