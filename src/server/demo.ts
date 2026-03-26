/**
 * Sample diagram data for demo/testing mode.
 * A realistic e-commerce architecture with 7 nodes and 8 edges.
 */

interface DemoNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label: string
    nodeType: string
    description?: string
    tags?: string[]
    endpoints?: Array<{ method: string; path: string; description: string }>
    entities?: Array<{ name: string; fields: string }>
  }
}

interface DemoEdge {
  id: string
  source: string
  target: string
  type: string
  data: { label: string; protocol: string; data_flow: string }
}

export const DEMO_GRAPH = {
  nodes: [
    {
      id: "web-app",
      type: "system",
      position: { x: 50, y: 120 },
      data: {
        label: "Web App",
        nodeType: "frontend",
        description: "React SPA with product catalog, cart, and checkout flows",
        tags: ["React", "TypeScript", "Tailwind"],
      },
    },
    {
      id: "mobile-app",
      type: "system",
      position: { x: 50, y: 320 },
      data: {
        label: "Mobile App",
        nodeType: "client",
        description: "iOS and Android native apps",
        tags: ["React Native", "Expo"],
      },
    },
    {
      id: "api-gateway",
      type: "system",
      position: { x: 350, y: 200 },
      data: {
        label: "API Gateway",
        nodeType: "backend",
        description: "Routes and rate-limits incoming requests, handles auth",
        tags: ["Node.js", "Express"],
        endpoints: [
          { method: "POST", path: "/auth/login", description: "Authenticate user" },
          { method: "GET", path: "/products", description: "List products" },
          { method: "POST", path: "/orders", description: "Place order" },
        ],
      },
    },
    {
      id: "order-service",
      type: "system",
      position: { x: 650, y: 100 },
      data: {
        label: "Order Service",
        nodeType: "backend",
        description: "Manages order lifecycle from cart to fulfillment",
        tags: ["Python", "FastAPI"],
        endpoints: [
          { method: "POST", path: "/orders", description: "Create order" },
          { method: "GET", path: "/orders/:id", description: "Get order status" },
          { method: "PUT", path: "/orders/:id/cancel", description: "Cancel order" },
        ],
      },
    },
    {
      id: "product-service",
      type: "system",
      position: { x: 650, y: 300 },
      data: {
        label: "Product Service",
        nodeType: "backend",
        description: "Product catalog, inventory, and pricing",
        tags: ["Go", "gRPC"],
      },
    },
    {
      id: "redis-cache",
      type: "system",
      position: { x: 950, y: 50 },
      data: {
        label: "Redis Cache",
        nodeType: "cache",
        description: "Session store and product catalog cache",
        tags: ["Redis"],
      },
    },
    {
      id: "order-queue",
      type: "system",
      position: { x: 950, y: 200 },
      data: {
        label: "Order Queue",
        nodeType: "queue",
        description: "Async order processing and event distribution",
        tags: ["RabbitMQ"],
      },
    },
    {
      id: "postgres-db",
      type: "system",
      position: { x: 1250, y: 100 },
      data: {
        label: "PostgreSQL",
        nodeType: "database",
        description: "Primary data store for orders, users, and products",
        tags: ["PostgreSQL"],
        entities: [
          { name: "users", fields: "id UUID PK, email VARCHAR UNIQUE, name VARCHAR" },
          { name: "orders", fields: "id UUID PK, user_id UUID FK, status VARCHAR, total DECIMAL" },
          { name: "products", fields: "id UUID PK, name VARCHAR, price DECIMAL, stock INT" },
        ],
      },
    },
    {
      id: "stripe-api",
      type: "system",
      position: { x: 1250, y: 300 },
      data: {
        label: "Stripe",
        nodeType: "external",
        description: "Payment processing and subscription management",
        tags: ["Stripe"],
      },
    },
  ] as DemoNode[],
  edges: [
    { id: "e_1", source: "web-app", target: "api-gateway", type: "labeled", data: { label: "REST", protocol: "REST", data_flow: "API requests" } },
    { id: "e_2", source: "mobile-app", target: "api-gateway", type: "labeled", data: { label: "REST", protocol: "REST", data_flow: "API requests" } },
    { id: "e_3", source: "api-gateway", target: "order-service", type: "labeled", data: { label: "REST: orders", protocol: "REST", data_flow: "Order operations" } },
    { id: "e_4", source: "api-gateway", target: "product-service", type: "labeled", data: { label: "gRPC: catalog", protocol: "gRPC", data_flow: "Product queries" } },
    { id: "e_5", source: "order-service", target: "order-queue", type: "labeled", data: { label: "async: order events", protocol: "async", data_flow: "Order created/updated events" } },
    { id: "e_6", source: "order-service", target: "postgres-db", type: "labeled", data: { label: "TCP: SQL", protocol: "TCP", data_flow: "Order CRUD" } },
    { id: "e_7", source: "product-service", target: "redis-cache", type: "labeled", data: { label: "TCP: cache", protocol: "TCP", data_flow: "Product cache reads" } },
    { id: "e_8", source: "product-service", target: "postgres-db", type: "labeled", data: { label: "TCP: SQL", protocol: "TCP", data_flow: "Product queries" } },
    { id: "e_9", source: "order-service", target: "stripe-api", type: "labeled", data: { label: "REST: payments", protocol: "REST", data_flow: "Payment intents" } },
  ] as DemoEdge[],
}
