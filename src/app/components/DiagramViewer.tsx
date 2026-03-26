/**
 * SVG-based diagram canvas with pan/zoom interaction.
 * Renders all nodes and edges, handles click-to-inspect.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import type { GraphData } from '../lib/types'
import type { ThemePalette } from '../lib/tokens'
import { EDGE_STROKE, ACCENT } from '../lib/tokens'
import { applyFallbackLayout, computeBounds } from '../lib/layout'
import { routeAllEdges } from '../lib/edge-routing'
import { NodeCard } from './NodeCard'
import { EdgePath, ArrowMarker } from './EdgePath'
import { NodePopover } from './NodePopover'
import { Legend } from './Legend'

interface DiagramViewerProps {
  graph: GraphData
  theme: ThemePalette
  focusNode?: string
  fullscreen?: boolean
}

// Dot background pattern for the canvas
const DotPattern: React.FC<{ theme: ThemePalette }> = ({ theme }) => (
  <pattern id="dots" x={0} y={0} width={24} height={24} patternUnits="userSpaceOnUse">
    <circle cx={12} cy={12} r={1.2} fill={theme.dotColor} />
  </pattern>
)

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ graph, theme, focusNode, fullscreen }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(focusNode || null)

  // Apply fallback layout if needed
  const nodes = applyFallbackLayout(graph.nodes)
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  // Route edges
  const routedEdges = routeAllEdges(nodes, graph.edges)

  // Compute initial viewBox from bounds
  const bounds = computeBounds(nodes)

  // Pan/zoom state
  const [viewBox, setViewBox] = useState(bounds)
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, vbx: 0, vby: 0 })

  // Reset viewBox when graph changes
  useEffect(() => {
    const b = computeBounds(applyFallbackLayout(graph.nodes))
    setViewBox(b)
  }, [graph])

  // Pan handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    // Don't start pan if clicking on a node
    const target = e.target as Element
    if (target.closest('[data-node]')) return

    setIsPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY, vbx: viewBox.x, vby: viewBox.y }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }, [viewBox])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return
    const svg = svgRef.current
    if (!svg) return

    const scale = viewBox.width / svg.clientWidth
    const dx = (e.clientX - panStart.current.x) * scale
    const dy = (e.clientY - panStart.current.y) * scale

    setViewBox(vb => ({ ...vb, x: panStart.current.vbx - dx, y: panStart.current.vby - dy }))
  }, [isPanning, viewBox.width])

  const onPointerUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Zoom handler
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const svg = svgRef.current
    if (!svg) return

    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
    const rect = svg.getBoundingClientRect()

    // Cursor position in SVG coordinates
    const cx = viewBox.x + (e.clientX - rect.left) / rect.width * viewBox.width
    const cy = viewBox.y + (e.clientY - rect.top) / rect.height * viewBox.height

    const newWidth = viewBox.width * zoomFactor
    const newHeight = viewBox.height * zoomFactor

    setViewBox({
      x: cx - (cx - viewBox.x) * zoomFactor,
      y: cy - (cy - viewBox.y) * zoomFactor,
      width: newWidth,
      height: newHeight,
    })
  }, [viewBox])

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(prev => prev === nodeId ? null : nodeId)
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: fullscreen ? '100vh' : '100%',
    minHeight: fullscreen ? undefined : 300,
    background: theme.pageBg,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: fullscreen ? 0 : 8,
  }

  return (
    <div style={containerStyle}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        onClick={handleBackgroundClick}
        style={{ cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <defs>
          <DotPattern theme={theme} />
          <ArrowMarker id="arrow-default" color={EDGE_STROKE} />
          <ArrowMarker id="arrow-accent" color={ACCENT} />
        </defs>

        {/* Dot background */}
        <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} fill="url(#dots)" />

        {/* Edges (render below nodes) */}
        {routedEdges.map(edge => (
          <EdgePath
            key={edge.id}
            edge={edge}
            nodes={nodeMap}
            theme={theme}
            highlighted={selectedNode === edge.source || selectedNode === edge.target}
            markerId={selectedNode === edge.source || selectedNode === edge.target ? 'arrow-accent' : 'arrow-default'}
          />
        ))}

        {/* Nodes */}
        {nodes.map(node => (
          <g key={node.id} data-node>
            <NodeCard
              node={node}
              theme={theme}
              selected={selectedNode === node.id}
              onClick={handleNodeClick}
            />
          </g>
        ))}
      </svg>

      {/* Node popover (HTML overlay) */}
      {selectedNode && nodeMap.get(selectedNode) && (
        <NodePopover
          node={nodeMap.get(selectedNode)!}
          theme={theme}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Legend (fullscreen only) */}
      {fullscreen && <Legend theme={theme} />}

      {/* Composer branding */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 12,
          fontSize: 10,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 500,
          color: theme.textMuted,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span>Built with</span>
        <a
          href="https://usecomposer.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#D27754', textDecoration: 'none' }}
        >
          Composer
        </a>
      </div>
    </div>
  )
}
