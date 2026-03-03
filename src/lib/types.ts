// Chat types
export type MessageRole = "user" | "assistant" | "system"

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  metadata?: {
    toolCalls?: Array<{
      name: string
      args: Record<string, unknown>
      result?: unknown
    }>
  }
}

export interface ChatSession {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messages: Message[]
}

// Artifact types
export interface Artifact {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Map types (stub — kept for backward compat during migration)
export interface MapLayer {
  id: string
  name: string
  description?: string
}

// ── Map API types (from Aloft /v1/airspace/maps response) ──

export interface MapSource {
  handle: string
  data_format: "geojson" | "vector" | "raster" | "raster-dem" | "raster-array"
  source_url?: string
}

export interface MapLayerStyle {
  type: string
  paint?: Record<string, unknown>
  layout?: Record<string, unknown>
  filter?: unknown[]
  minzoom?: number
  maxzoom?: number
  "source-layer"?: string
  [key: string]: unknown
}

export interface MapLayerConfig {
  id: string
  title: string
  description?: string
  source: string
  thumbnail_url?: string
  allow_toggle: boolean
  styles: Record<string, MapLayerStyle[]>
}

export interface MapSection {
  id: string
  title: string
  layers: string[]
}

export interface MapBasemap {
  id: string
  name: string
  description?: string
  img_url?: string
  mapbox_path: string
  is_default?: boolean
}

export interface MapModifier {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  source?: string
  allow_toggle: boolean
  styles?: Record<string, MapLayerStyle[]>
}

export interface MapRegion {
  region: string
  bounding_box?: [[number, number], [number, number]]
}

// Workflow types
export type WorkflowStatus = "pending" | "running" | "completed" | "failed"

export interface Workflow {
  id: string
  name: string
  description: string
}

export interface WorkflowRun {
  id: string
  workflowId: string
  status: WorkflowStatus
  startedAt: Date
  completedAt?: Date
  parameters: Record<string, unknown>
  result?: unknown
  error?: string
}
