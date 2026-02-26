import fs from 'fs/promises';
import path from 'path';
import { ChatStorage, ArtifactStorage, WorkflowStorage } from './interfaces';
import { Artifact, ChatSession, Message, WorkflowRun, Workflow } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic file operations
async function readJSONFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}

async function writeJSONFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Filesystem implementation for Chat
export class FileSystemChatStorage implements ChatStorage {
  private sessionsFile = path.join(DATA_DIR, 'chat-sessions.json');
  private messagesDir = path.join(DATA_DIR, 'messages');

  async getSessions(): Promise<ChatSession[]> {
    return readJSONFile<ChatSession[]>(this.sessionsFile, []);
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const sessions = await this.getSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  async createSession(session: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatSession> {
    const sessions = await this.getSessions();
    const newSession: ChatSession = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    sessions.push(newSession);
    await writeJSONFile(this.sessionsFile, sessions);

    // Create empty messages file
    await this.ensureMessagesDir();
    await writeJSONFile(path.join(this.messagesDir, `${newSession.id}.json`), []);

    return newSession;
  }

  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    const sessions = await this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index === -1) throw new Error(`Session ${sessionId} not found`);

    sessions[index] = {
      ...sessions[index],
      ...updates,
      id: sessionId, // Prevent ID override
      updatedAt: new Date(),
    };

    await writeJSONFile(this.sessionsFile, sessions);
    return sessions[index];
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessions = await this.getSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    await writeJSONFile(this.sessionsFile, filtered);

    // Delete messages file
    const messagesFile = path.join(this.messagesDir, `${sessionId}.json`);
    try {
      await fs.unlink(messagesFile);
    } catch {
      // File doesn't exist, ignore
    }
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    await this.ensureMessagesDir();
    const messagesFile = path.join(this.messagesDir, `${sessionId}.json`);
    return readJSONFile<Message[]>(messagesFile, []);
  }

  async addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    await this.ensureMessagesDir();
    const messages = await this.getMessages(sessionId);
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    messages.push(newMessage);

    const messagesFile = path.join(this.messagesDir, `${sessionId}.json`);
    await writeJSONFile(messagesFile, messages);

    // Update session's updatedAt
    await this.updateSession(sessionId, {});

    return newMessage;
  }

  async deleteMessage(sessionId: string, messageId: string): Promise<void> {
    const messages = await this.getMessages(sessionId);
    const filtered = messages.filter(m => m.id !== messageId);
    const messagesFile = path.join(this.messagesDir, `${sessionId}.json`);
    await writeJSONFile(messagesFile, filtered);
  }

  private async ensureMessagesDir() {
    try {
      await fs.access(this.messagesDir);
    } catch {
      await fs.mkdir(this.messagesDir, { recursive: true });
    }
  }
}

// Filesystem implementation for Artifacts
export class FileSystemArtifactStorage implements ArtifactStorage {
  private artifactsFile = path.join(DATA_DIR, 'artifacts.json');

  async getArtifacts(): Promise<Artifact[]> {
    return readJSONFile<Artifact[]>(this.artifactsFile, []);
  }

  async getArtifact(artifactId: string): Promise<Artifact | null> {
    const artifacts = await this.getArtifacts();
    return artifacts.find(a => a.id === artifactId) || null;
  }

  async createArtifact(artifact: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Artifact> {
    const artifacts = await this.getArtifacts();
    const newArtifact: Artifact = {
      ...artifact,
      id: `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    artifacts.push(newArtifact);
    await writeJSONFile(this.artifactsFile, artifacts);
    return newArtifact;
  }

  async updateArtifact(artifactId: string, updates: Partial<Omit<Artifact, 'id' | 'createdAt'>>): Promise<Artifact> {
    const artifacts = await this.getArtifacts();
    const index = artifacts.findIndex(a => a.id === artifactId);
    if (index === -1) throw new Error(`Artifact ${artifactId} not found`);

    artifacts[index] = {
      ...artifacts[index],
      ...updates,
      id: artifactId, // Prevent ID override
      updatedAt: new Date(),
    };

    await writeJSONFile(this.artifactsFile, artifacts);
    return artifacts[index];
  }

  async deleteArtifact(artifactId: string): Promise<void> {
    const artifacts = await this.getArtifacts();
    const filtered = artifacts.filter(a => a.id !== artifactId);
    await writeJSONFile(this.artifactsFile, filtered);
  }

  async searchArtifacts(query: string): Promise<Artifact[]> {
    const artifacts = await this.getArtifacts();
    const lowerQuery = query.toLowerCase();
    return artifacts.filter(
      a =>
        a.title.toLowerCase().includes(lowerQuery) ||
        a.content.toLowerCase().includes(lowerQuery) ||
        a.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

// Filesystem implementation for Workflows
export class FileSystemWorkflowStorage implements WorkflowStorage {
  private workflowsFile = path.join(DATA_DIR, 'workflows.json');
  private runsFile = path.join(DATA_DIR, 'workflow-runs.json');

  async getWorkflows(): Promise<Workflow[]> {
    // For now, return hardcoded workflows (in future, these could be dynamic)
    return readJSONFile<Workflow[]>(this.workflowsFile, this.getDefaultWorkflows());
  }

  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    const workflows = await this.getWorkflows();
    return workflows.find(w => w.id === workflowId) || null;
  }

  async getRuns(workflowId?: string): Promise<WorkflowRun[]> {
    const runs = await readJSONFile<WorkflowRun[]>(this.runsFile, []);
    if (workflowId) {
      return runs.filter(r => r.workflowId === workflowId);
    }
    return runs;
  }

  async getRun(runId: string): Promise<WorkflowRun | null> {
    const runs = await this.getRuns();
    return runs.find(r => r.id === runId) || null;
  }

  async createRun(run: Omit<WorkflowRun, 'id' | 'startedAt'>): Promise<WorkflowRun> {
    const runs = await this.getRuns();
    const newRun: WorkflowRun = {
      ...run,
      id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startedAt: new Date(),
    };
    runs.push(newRun);
    await writeJSONFile(this.runsFile, runs);
    return newRun;
  }

  async updateRun(runId: string, updates: Partial<WorkflowRun>): Promise<WorkflowRun> {
    const runs = await this.getRuns();
    const index = runs.findIndex(r => r.id === runId);
    if (index === -1) throw new Error(`Run ${runId} not found`);

    runs[index] = {
      ...runs[index],
      ...updates,
      id: runId, // Prevent ID override
    };

    await writeJSONFile(this.runsFile, runs);
    return runs[index];
  }

  private getDefaultWorkflows(): Workflow[] {
    return [
      {
        id: 'data-processing',
        name: 'Data Processing',
        description: 'Process text data with operations like uppercase, lowercase, reverse, or word count',
      },
      {
        id: 'report-generation',
        name: 'Report Generation',
        description: 'Fetch data from a source and generate a formatted report in markdown or JSON',
      },
      {
        id: 'long-running-processing',
        name: 'Long Running Processing',
        description: 'Process large datasets in chunks with optional report generation',
      },
    ];
  }
}
