// Chat types
export type MessageRole = "user" | "assistant" | "system"

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  thinking?: ThinkingStep[]
  toolCalls?: ToolCall[]
}

export interface ThinkingStep {
  id: string
  content: string
  timestamp: Date
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  result?: unknown
  timestamp: Date
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
