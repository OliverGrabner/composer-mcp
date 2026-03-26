/**
 * SVG node card — mirrors frontend/src/components/nodes/SystemNode.tsx visual design.
 * Renders as an SVG <g> group with:
 * - Rounded rect background
 * - 4px left accent bar
 * - Node type icon
 * - Title + description
 * - Endpoint/entity count badges
 */

import React from 'react'
import type { DiagramNode } from '../lib/types'
import type { ThemePalette } from '../lib/tokens'
import { NODE_ACCENTS } from '../lib/tokens'
import { NODE_ICONS, RouteIcon, LayersIcon } from '../lib/icons'

const NODE_WIDTH = 240
const NODE_HEIGHT = 80
const BORDER_RADIUS = 8
const ACCENT_WIDTH = 4

interface NodeCardProps {
  node: DiagramNode
  theme: ThemePalette
  selected?: boolean
  onClick?: (nodeId: string) => void
}

export const NodeCard: React.FC<NodeCardProps> = ({ node, theme, selected, onClick }) => {
  const { data, position } = node
  const accent = NODE_ACCENTS[data.nodeType] || NODE_ACCENTS.external
  const endpointCount = data.endpoints?.length ?? 0
  const entityCount = data.entities?.length ?? 0

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={() => onClick?.(node.id)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Background */}
      <rect
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={BORDER_RADIUS}
        ry={BORDER_RADIUS}
        fill={theme.surfaceBg}
        stroke={selected ? '#D27754' : theme.border}
        strokeWidth={selected ? 2 : 1}
      />

      {/* Accent bar */}
      <rect
        x={0}
        y={0}
        width={ACCENT_WIDTH}
        height={NODE_HEIGHT}
        rx={BORDER_RADIUS}
        fill={accent}
        clipPath={`inset(0 0 0 0 round ${BORDER_RADIUS}px 0 0 ${BORDER_RADIUS}px)`}
      />
      {/* Re-draw accent bar with proper clipping using a mask approach */}
      <rect
        x={0}
        y={1}
        width={ACCENT_WIDTH}
        height={NODE_HEIGHT - 2}
        fill={accent}
        style={{ borderRadius: `${BORDER_RADIUS}px 0 0 ${BORDER_RADIUS}px` }}
      />

      {/* Icon */}
      <g transform="translate(16, 20)">
        {React.createElement(NODE_ICONS[data.nodeType] || NODE_ICONS.external, {
          width: 24,
          height: 24,
          stroke: accent,
        })}
      </g>

      {/* Title */}
      <text
        x={76}
        y={28}
        fill={theme.textPrimary}
        fontSize={14}
        fontWeight={500}
        fontFamily="Poppins, system-ui, sans-serif"
      >
        {truncate(data.label, 20)}
      </text>

      {/* Description */}
      {data.description && (
        <text
          x={76}
          y={44}
          fill={theme.textSecondary}
          fontSize={10}
          fontFamily="Lora, Georgia, serif"
        >
          {truncate(data.description, 28)}
        </text>
      )}

      {/* Endpoint + Entity counts */}
      {(endpointCount > 0 || entityCount > 0) && (
        <g transform={`translate(76, 54)`}>
          {endpointCount > 0 && (
            <g>
              <g transform="translate(0, 0)">
                <RouteIcon width={10} height={10} stroke={theme.textSecondary} />
              </g>
              <text x={14} y={9} fill={theme.textSecondary} fontSize={9} fontWeight={500} fontFamily="Poppins, system-ui, sans-serif">
                {endpointCount}
              </text>
            </g>
          )}
          {entityCount > 0 && (
            <g transform={`translate(${endpointCount > 0 ? 32 : 0}, 0)`}>
              <g>
                <LayersIcon width={10} height={10} stroke={theme.textSecondary} />
              </g>
              <text x={14} y={9} fill={theme.textSecondary} fontSize={9} fontWeight={500} fontFamily="Poppins, system-ui, sans-serif">
                {entityCount}
              </text>
            </g>
          )}
        </g>
      )}
    </g>
  )
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text
}
