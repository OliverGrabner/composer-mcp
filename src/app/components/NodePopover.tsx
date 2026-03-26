/**
 * Click-to-inspect popover that shows full node details.
 * Appears when a node is clicked, positioned near the node.
 */

import React from 'react'
import type { DiagramNode } from '../lib/types'
import type { ThemePalette } from '../lib/tokens'
import { NODE_ACCENTS, ACCENT } from '../lib/tokens'

interface NodePopoverProps {
  node: DiagramNode
  theme: ThemePalette
  onClose: () => void
}

export const NodePopover: React.FC<NodePopoverProps> = ({ node, theme, onClose }) => {
  const { data } = node
  const accent = NODE_ACCENTS[data.nodeType] || NODE_ACCENTS.external

  return (
    <div
      style={{
        position: 'absolute',
        left: node.position.x + 250,
        top: node.position.y,
        zIndex: 50,
        minWidth: 260,
        maxWidth: 320,
        background: theme.surfaceBg,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        fontFamily: "'Poppins', sans-serif",
        color: theme.textPrimary,
        fontSize: 12,
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: accent }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>{data.label}</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Type badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 500, color: accent, background: `${accent}20`, padding: '2px 8px', borderRadius: 4 }}>
            {data.nodeType}
          </span>
        </div>

        {/* Description */}
        {data.description && (
          <p style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5, fontFamily: "'Lora', serif", margin: 0 }}>
            {data.description}
          </p>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div>
            <span style={{ fontSize: 10, fontWeight: 500, color: theme.textSecondary, marginBottom: 4, display: 'block' }}>Tags</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {data.tags.map((tag, i) => (
                <span key={i} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: theme.elevatedBg, color: theme.textPrimary }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Endpoints */}
        {data.endpoints && data.endpoints.length > 0 && (
          <div>
            <span style={{ fontSize: 10, fontWeight: 500, color: theme.textSecondary, marginBottom: 4, display: 'block' }}>
              Endpoints ({data.endpoints.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {data.endpoints.slice(0, 5).map((ep, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: 9,
                    padding: '1px 4px',
                    borderRadius: 2,
                    color: '#fff',
                    background: methodColor(ep.method),
                    fontFamily: 'monospace',
                  }}>
                    {ep.method}
                  </span>
                  <span style={{ fontFamily: 'monospace', color: theme.textPrimary }}>{ep.path}</span>
                </div>
              ))}
              {data.endpoints.length > 5 && (
                <span style={{ fontSize: 9, color: theme.textMuted }}>+{data.endpoints.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {/* Entities */}
        {data.entities && data.entities.length > 0 && (
          <div>
            <span style={{ fontSize: 10, fontWeight: 500, color: theme.textSecondary, marginBottom: 4, display: 'block' }}>
              Entities ({data.entities.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {data.entities.slice(0, 4).map((ent, i) => (
                <div key={i} style={{ fontSize: 10 }}>
                  <span style={{ fontWeight: 500, color: theme.textPrimary }}>{ent.name}</span>
                  <span style={{ color: theme.textMuted, fontFamily: 'monospace', marginLeft: 6 }}>{truncate(ent.fields, 30)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA link to Composer */}
        <a
          href="https://usecomposer.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 10, color: ACCENT, textDecoration: 'none', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          Open in Composer →
        </a>
      </div>
    </div>
  )
}

function methodColor(method: string): string {
  switch (method) {
    case 'GET':    return '#22c55e'
    case 'POST':   return '#3b82f6'
    case 'PUT':    return '#f59e0b'
    case 'PATCH':  return '#f59e0b'
    case 'DELETE': return '#ef4444'
    default:       return '#8b5cf6'
  }
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}
