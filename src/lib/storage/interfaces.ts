import { Artifact, ChatSession, Message, WorkflowRun, Workflow } from '../types';

// Storage interface for chat operations
export interface ChatStorage {
  getSessions(): Promise<ChatSession[]>;
  getSession(sessionId: string): Promise<ChatSession | null>;
  createSession(session: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatSession>;
  updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession>;
  deleteSession(sessionId: string): Promise<void>;

  getMessages(sessionId: string): Promise<Message[]>;
  addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message>;
  deleteMessage(sessionId: string, messageId: string): Promise<void>;
}

// Storage interface for artifact operations
export interface ArtifactStorage {
  getArtifacts(): Promise<Artifact[]>;
  getArtifact(artifactId: string): Promise<Artifact | null>;
  createArtifact(artifact: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Artifact>;
  updateArtifact(artifactId: string, updates: Partial<Omit<Artifact, 'id' | 'createdAt'>>): Promise<Artifact>;
  deleteArtifact(artifactId: string): Promise<void>;
  searchArtifacts(query: string): Promise<Artifact[]>;
}

// Storage interface for workflow operations
export interface WorkflowStorage {
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(workflowId: string): Promise<Workflow | null>;

  getRuns(workflowId?: string): Promise<WorkflowRun[]>;
  getRun(runId: string): Promise<WorkflowRun | null>;
  createRun(run: Omit<WorkflowRun, 'id' | 'startedAt'>): Promise<WorkflowRun>;
  updateRun(runId: string, updates: Partial<WorkflowRun>): Promise<WorkflowRun>;
}
