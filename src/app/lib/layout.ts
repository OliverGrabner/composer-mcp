/**
 * Fallback layered layout for when node positions are all (0,0).
 * Groups nodes by type into architectural layers (left-to-right).
 * Matches the layer ordering described in CLAUDE.md.
 */

import type { DiagramNode, NodeType } from './types'

const LAYER_ORDER: NodeType[][] = [
  ['client'],
  ['frontend'],
  ['backend'],
  ['cache', 'queue', 'storage'],
  ['database', 'external'],
]

const HORIZONTAL_GAP = 300
const VERTICAL_GAP = 150
const START_X = 50
const START_Y = 50

/** Check if all nodes are at (0,0) — meaning no layout has been applied yet. */
function needsLayout(nodes: DiagramNode[]): boolean {
  if (nodes.length === 0) return false
  return nodes.every(n => n.position.x === 0 && n.position.y === 0)
}

/** Apply a simple left-to-right layered layout based on node types. */
export function applyFallbackLayout(nodes: DiagramNode[]): DiagramNode[] {
  if (!needsLayout(nodes)) return nodes

  // Group nodes by their layer
  const layerMap = new Map<number, DiagramNode[]>()

  for (const node of nodes) {
    const layerIndex = LAYER_ORDER.findIndex(layer => layer.includes(node.data.nodeType))
    const idx = layerIndex >= 0 ? layerIndex : LAYER_ORDER.length - 1
    if (!layerMap.has(idx)) layerMap.set(idx, [])
    layerMap.get(idx)!.push(node)
  }

  // Position each layer
  const positioned = [...nodes]
  const sortedLayers = [...layerMap.entries()].sort(([a], [b]) => a - b)
  let currentX = START_X

  for (const [, layerNodes] of sortedLayers) {
    let currentY = START_Y
    for (const node of layerNodes) {
      const idx = positioned.findIndex(n => n.id === node.id)
      positioned[idx] = {
        ...node,
        position: { x: currentX, y: currentY },
      }
      currentY += VERTICAL_GAP
    }
    currentX += HORIZONTAL_GAP
  }

  return positioned
}

/** Compute the bounding box of all nodes (for SVG viewBox). */
export function computeBounds(nodes: DiagramNode[], padding = 60): { x: number; y: number; width: number; height: number } {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 }
  }

  const NODE_WIDTH = 240
  const NODE_HEIGHT = 80

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  for (const node of nodes) {
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + NODE_WIDTH)
    maxY = Math.max(maxY, node.position.y + NODE_HEIGHT)
  }

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  }
}
