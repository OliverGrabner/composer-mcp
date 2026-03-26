/**
 * Edge routing logic -ported from frontend/src/utils/edgeRouting.ts
 * Computes handle sides and spread offsets for overlapping edges.
 */

import type { DiagramNode, DiagramEdge } from './types'

const DEFAULT_NODE_WIDTH = 240
const DEFAULT_NODE_HEIGHT = 80

export type Side = 'top' | 'right' | 'bottom' | 'left'

export interface RoutedEdge extends DiagramEdge {
  sourceSide: Side
  targetSide: Side
  sourceOffset: number
  targetOffset: number
}

function getNodeCenter(node: DiagramNode): { x: number; y: number } {
  return {
    x: node.position.x + DEFAULT_NODE_WIDTH / 2,
    y: node.position.y + DEFAULT_NODE_HEIGHT / 2,
  }
}

function computeHandleSides(source: DiagramNode, target: DiagramNode): { sourceSide: Side; targetSide: Side } {
  const sc = getNodeCenter(source)
  const tc = getNodeCenter(target)
  const dx = tc.x - sc.x
  const dy = tc.y - sc.y

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0
      ? { sourceSide: 'right', targetSide: 'left' }
      : { sourceSide: 'left', targetSide: 'right' }
  }
  return dy > 0
    ? { sourceSide: 'bottom', targetSide: 'top' }
    : { sourceSide: 'top', targetSide: 'bottom' }
}

/** Get the anchor point for a handle on a specific side of a node. */
export function getHandlePosition(node: DiagramNode, side: Side, offset = 0): { x: number; y: number } {
  const w = DEFAULT_NODE_WIDTH
  const h = DEFAULT_NODE_HEIGHT
  const SPREAD_GAP = 20

  switch (side) {
    case 'top':    return { x: node.position.x + w / 2 + offset * SPREAD_GAP, y: node.position.y }
    case 'bottom': return { x: node.position.x + w / 2 + offset * SPREAD_GAP, y: node.position.y + h }
    case 'left':   return { x: node.position.x, y: node.position.y + h / 2 + offset * SPREAD_GAP }
    case 'right':  return { x: node.position.x + w, y: node.position.y + h / 2 + offset * SPREAD_GAP }
  }
}

/** Compute a cubic bezier path between two points with appropriate control point offsets. */
export function computeBezierPath(
  sx: number, sy: number, sourceSide: Side,
  tx: number, ty: number, targetSide: Side,
): string {
  const dist = Math.min(150, Math.max(40, Math.hypot(tx - sx, ty - sy) * 0.3))

  const sideOffset = (side: Side, d: number) => {
    switch (side) {
      case 'right':  return { dx: d, dy: 0 }
      case 'left':   return { dx: -d, dy: 0 }
      case 'bottom': return { dx: 0, dy: d }
      case 'top':    return { dx: 0, dy: -d }
    }
  }

  const sc = sideOffset(sourceSide, dist)
  const tc = sideOffset(targetSide, dist)

  return `M ${sx} ${sy} C ${sx + sc.dx} ${sy + sc.dy}, ${tx + tc.dx} ${ty + tc.dy}, ${tx} ${ty}`
}

/**
 * Route all edges with smart handle selection and spread offsets.
 * Mirrors frontend/src/utils/edgeRouting.ts routeAllEdges().
 */
export function routeAllEdges(nodes: DiagramNode[], edges: DiagramEdge[]): RoutedEdge[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  // Step 1: Compute handle sides
  const routed: RoutedEdge[] = edges.map(edge => {
    const sourceNode = nodeMap.get(edge.source)
    const targetNode = nodeMap.get(edge.target)

    if (!sourceNode || !targetNode) {
      return { ...edge, sourceSide: 'bottom' as Side, targetSide: 'top' as Side, sourceOffset: 0, targetOffset: 0 }
    }

    const { sourceSide, targetSide } = computeHandleSides(sourceNode, targetNode)
    return { ...edge, sourceSide, targetSide, sourceOffset: 0, targetOffset: 0 }
  })

  // Step 2: Group edges by (nodeId, side) for spread offsets
  const sideGroups = new Map<string, number[]>()

  for (let i = 0; i < routed.length; i++) {
    const e = routed[i]
    const srcKey = `${e.source}:${e.sourceSide}`
    const tgtKey = `${e.target}:${e.targetSide}`

    if (!sideGroups.has(srcKey)) sideGroups.set(srcKey, [])
    sideGroups.get(srcKey)!.push(i)

    if (!sideGroups.has(tgtKey)) sideGroups.set(tgtKey, [])
    sideGroups.get(tgtKey)!.push(i)
  }

  // Step 3: Assign spread offsets for groups with 2+ edges
  for (const [key, edgeIndices] of sideGroups) {
    if (edgeIndices.length <= 1) continue

    const nodeId = key.split(':')[0]
    const side = key.split(':')[1]
    const isVerticalSide = side === 'left' || side === 'right'

    edgeIndices.sort((a, b) => {
      const eA = routed[a], eB = routed[b]
      const aIsSource = eA.source === nodeId
      const bIsSource = eB.source === nodeId
      const otherA = nodeMap.get(aIsSource ? eA.target : eA.source)
      const otherB = nodeMap.get(bIsSource ? eB.target : eB.source)
      if (!otherA || !otherB) return 0

      const cA = getNodeCenter(otherA), cB = getNodeCenter(otherB)
      return isVerticalSide ? cA.y - cB.y : cA.x - cB.x
    })

    const count = edgeIndices.length
    for (let j = 0; j < count; j++) {
      const idx = edgeIndices[j]
      const offset = j - (count - 1) / 2

      if (routed[idx].source === nodeId) {
        routed[idx].sourceOffset = offset
      } else {
        routed[idx].targetOffset = offset
      }
    }
  }

  return routed
}
