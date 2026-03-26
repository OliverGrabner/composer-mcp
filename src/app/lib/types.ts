/** Subset of frontend/src/types.ts -just what the MCP App viewer needs. */

export type NodeType = 'client' | 'frontend' | 'backend' | 'database' | 'cache' | 'queue' | 'storage' | 'external'
export type Protocol = 'REST' | 'gRPC' | 'GraphQL' | 'WebSocket' | 'TCP' | 'UDP' | 'async' | 'event' | 'internal'

export interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'SUB' | 'PUB' | 'RPC'
  path: string
  description: string
  request?: string
  response?: string
  side_effects?: string
}

export interface Entity {
  name: string
  fields: string
}

export interface SystemNodeData {
  label: string
  name?: string
  description?: string
  nodeType: NodeType
  tags?: string[]
  endpoints?: Endpoint[]
  entities?: Entity[]
  githubPath?: string
  linked_path?: string
}

export interface DiagramNode {
  id: string
  type?: string
  position: { x: number; y: number }
  data: SystemNodeData
}

export interface EdgeData {
  label?: string
  protocol?: Protocol
  data_flow?: string
  sourceOffset?: number
  targetOffset?: number
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  type?: string
  data?: EdgeData
}

export interface GraphData {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  viewport?: { x: number; y: number; zoom: number }
}
