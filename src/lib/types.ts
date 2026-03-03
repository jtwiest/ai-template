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

// GeoJSON types
export interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: string
    coordinates: unknown
  }
  properties: Record<string, unknown>
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

// MapLayer types
export interface MapLayerSource {
  id: string
  type: string
  url?: string
  data?: unknown
}

export interface MapLayer {
  id: string
  title: string
  styles: Record<string, unknown>
  sources: MapLayerSource[]
  featureCollection: GeoJSONFeatureCollection
  createdAt: Date
  updatedAt: Date
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
