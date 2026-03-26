/**
 * MCP App client entry point.
 * Connects to the host via PostMessageTransport and renders the diagram viewer.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
