/**
 * Node type color legend — shown in fullscreen mode.
 */

import React from 'react'
import type { ThemePalette } from '../lib/tokens'
import { NODE_ACCENTS } from '../lib/tokens'

const LABELS: Record<string, string> = {
  client: 'Client',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  cache: 'Cache',
  queue: 'Queue',
  storage: 'Storage',
  external: 'External',
}

interface LegendProps {
  theme: ThemePalette
}

export const Legend: React.FC<LegendProps> = ({ theme }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 12,
      right: 12,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      background: theme.surfaceBg,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      padding: '6px 10px',
      fontFamily: "'Poppins', sans-serif",
      fontSize: 10,
      fontWeight: 500,
      zIndex: 10,
    }}
  >
    {Object.entries(NODE_ACCENTS).map(([type, color]) => (
      <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
        <span style={{ color: theme.textSecondary }}>{LABELS[type]}</span>
      </div>
    ))}
  </div>
)
