/**
 * Root MCP App component.
 * Uses useApp hook to connect to the host and receive diagram data.
 */

import { useState, useEffect } from 'react'
import type { McpUiHostContext } from '@modelcontextprotocol/ext-apps'
import { useApp } from '@modelcontextprotocol/ext-apps/react'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { GraphData } from './lib/types.ts'
import { DARK, LIGHT } from './lib/tokens.ts'
import { DiagramViewer } from './components/DiagramViewer.tsx'

export function App() {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [focusNode, setFocusNode] = useState<string | undefined>()
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>()

  const { app, error } = useApp({
    appInfo: { name: 'Composer Diagram Viewer', version: '0.1.0' },
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolinput = async (input) => {
        // Receive graph data from the tool call arguments (structuredContent)
        console.info('[Composer] Received tool input:', input)
      }

      app.ontoolresult = async (result) => {
        console.info('[Composer] Received tool result:', result)
        const graph = extractGraphData(result)
        if (graph) {
          setGraphData(graph)
          // Check for focus_node in the result
          const textContent = result.content?.find(c => c.type === 'text')
          if (textContent && 'text' in textContent) {
            try {
              const meta = JSON.parse(textContent.text)
              if (meta.focus_node) setFocusNode(meta.focus_node)
            } catch {
              // Text content is the fallback description, not JSON
            }
          }
        }
      }

      app.ontoolcancelled = () => {
        console.info('[Composer] Tool cancelled')
      }

      app.onerror = console.error

      app.onhostcontextchanged = (params) => {
        setHostContext(prev => ({ ...prev, ...params }))
      }

      app.onteardown = async () => {
        return {}
      }
    },
  })

  useEffect(() => {
    if (app) {
      setHostContext(app.getHostContext())
    }
  }, [app])

  if (error) {
    return (
      <div style={{ padding: 20, color: '#ef4444', fontFamily: "'Poppins', sans-serif", fontSize: 13 }}>
        Connection error: {error.message}
      </div>
    )
  }

  if (!app) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8a8d8f', fontFamily: "'Poppins', sans-serif", fontSize: 13 }}>
        Connecting to host...
      </div>
    )
  }

  // Determine theme from host context
  const isDark = hostContext?.theme !== 'light'
  const theme = isDark ? DARK : LIGHT

  // Determine display mode
  const isFullscreen = hostContext?.displayMode === 'fullscreen'

  if (!graphData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 16,
        color: theme.textSecondary,
        fontFamily: "'Poppins', sans-serif",
        background: theme.pageBg,
        padding: hostContext?.safeAreaInsets
          ? `${hostContext.safeAreaInsets.top}px ${hostContext.safeAreaInsets.right}px ${hostContext.safeAreaInsets.bottom}px ${hostContext.safeAreaInsets.left}px`
          : undefined,
      }}>
        <video
          src="https://github.com/OliverGrabner/composer-mcp/raw/main/demo.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            maxWidth: 520,
            borderRadius: 10,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}
        />
        <span style={{ fontSize: 13, opacity: 0.7 }}>Ask your agent to <strong style={{ color: theme.textPrimary }}>show_diagram</strong> to get started</span>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        paddingTop: hostContext?.safeAreaInsets?.top,
        paddingRight: hostContext?.safeAreaInsets?.right,
        paddingBottom: hostContext?.safeAreaInsets?.bottom,
        paddingLeft: hostContext?.safeAreaInsets?.left,
      }}
    >
      <DiagramViewer
        graph={graphData}
        theme={theme}
        focusNode={focusNode}
        fullscreen={isFullscreen}
      />
    </div>
  )
}

/** Extract graph data from the tool result's structuredContent or text content. */
function extractGraphData(result: CallToolResult): GraphData | null {
  // Try structuredContent first (preferred)
  const structured = (result as Record<string, unknown>).structuredContent as Record<string, unknown> | undefined
  if (structured?.graph) {
    return structured.graph as GraphData
  }

  // Fall back to parsing text content as JSON
  const textContent = result.content?.find(c => c.type === 'text')
  if (textContent && 'text' in textContent) {
    try {
      const parsed = JSON.parse(textContent.text)
      if (parsed.nodes && parsed.edges) return parsed as GraphData
      if (parsed.graph) return parsed.graph as GraphData
    } catch {
      // Not JSON — plain text fallback
    }
  }

  return null
}
