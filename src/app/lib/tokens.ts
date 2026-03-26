/** Composer design tokens for the MCP App viewer. Mirrors frontend/src/lib/tokens.ts */

import type { NodeType } from './types'

// ── Node type accents (warm gradient palette) ──
export const NODE_ACCENTS: Record<NodeType, string> = {
  client:   '#EDAB88',
  frontend: '#E89B6C',
  backend:  '#D27754',
  database: '#C26848',
  cache:    '#E0A458',
  queue:    '#9A8B7A',
  storage:  '#B8956C',
  external: '#7EA88E',
}

// ── Theme palettes ──
export const DARK = {
  pageBg:      '#353532',
  surfaceBg:   '#3d3d3a',
  elevatedBg:  '#48473f',
  textPrimary: '#FAF9F6',
  textSecondary: '#8a8d8f',
  textMuted:   '#6b7280',
  border:      '#4f4e47',
  borderHover: '#5a5953',
  dotColor:    '#4b4b47',
} as const

export const LIGHT = {
  pageBg:      '#FAF9F6',
  surfaceBg:   '#FFFFFF',
  elevatedBg:  '#F0EEE6',
  textPrimary: '#141413',
  textSecondary: '#64748b',
  textMuted:   '#94a3b8',
  border:      '#E8E6DE',
  borderHover: '#D8D6CE',
  dotColor:    '#D8D6CE',
} as const

export type ThemePalette = typeof DARK | typeof LIGHT

// ── Accent (constant across themes) ──
export const ACCENT = '#D27754'
export const ACCENT_HOVER = '#C26848'

// ── Edge colors ──
export const EDGE_STROKE = '#5a5953'
export const EDGE_STROKE_LIGHT = '#D8D6CE'
