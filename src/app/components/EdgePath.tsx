/**
 * SVG edge renderer -bezier curves with labels and arrowheads.
 * Mirrors frontend/src/components/edges/LabeledEdge.tsx visual style.
 */

import React from 'react'
import type { DiagramNode } from '../lib/types'
import type { ThemePalette } from '../lib/tokens'
import { ACCENT, EDGE_STROKE } from '../lib/tokens'
import { type RoutedEdge, getHandlePosition, computeBezierPath } from '../lib/edge-routing'

interface EdgePathProps {
  edge: RoutedEdge
  nodes: Map<string, DiagramNode>
  theme: ThemePalette
  highlighted?: boolean
  markerId: string
}

export const EdgePath: React.FC<EdgePathProps> = ({ edge, nodes, theme, highlighted, markerId }) => {
  const sourceNode = nodes.get(edge.source)
  const targetNode = nodes.get(edge.target)
  if (!sourceNode || !targetNode) return null

  const sp = getHandlePosition(sourceNode, edge.sourceSide, edge.sourceOffset)
  const tp = getHandlePosition(targetNode, edge.targetSide, edge.targetOffset)

  const pathD = computeBezierPath(sp.x, sp.y, edge.sourceSide, tp.x, tp.y, edge.targetSide)
  const strokeColor = highlighted ? ACCENT : EDGE_STROKE

  // Label position at midpoint of the bezier curve (approximate)
  const mx = (sp.x + tp.x) / 2
  const my = (sp.y + tp.y) / 2
  const label = edge.data?.label || edge.data?.protocol || ''

  return (
    <g>
      {/* Edge path */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={highlighted ? 2 : 1.5}
        markerEnd={`url(#${markerId})`}
        strokeDasharray={highlighted ? '5 5' : undefined}
      >
        {highlighted && (
          <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.5s" repeatCount="indefinite" />
        )}
      </path>

      {/* Label */}
      {label && (
        <g transform={`translate(${mx}, ${my})`}>
          <rect
            x={-measureTextWidth(label, 10) / 2 - 6}
            y={-8}
            width={measureTextWidth(label, 10) + 12}
            height={16}
            rx={4}
            fill={theme.surfaceBg}
            stroke={theme.border}
            strokeWidth={0.5}
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill={highlighted ? ACCENT : theme.textSecondary}
            fontSize={10}
            fontWeight={500}
            fontFamily="Poppins, system-ui, sans-serif"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  )
}

/** Simple text width estimation (SVG doesn't have measureText in our context). */
function measureTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.55
}

/** SVG arrow marker definition. Include this once in the SVG <defs>. */
export const ArrowMarker: React.FC<{ id: string; color: string }> = ({ id, color }) => (
  <marker
    id={id}
    viewBox="0 0 16 16"
    refX="14"
    refY="8"
    markerWidth={16}
    markerHeight={16}
    orient="auto-start-reverse"
  >
    <path d="M 2 4 L 14 8 L 2 12 Z" fill={color} />
  </marker>
)
