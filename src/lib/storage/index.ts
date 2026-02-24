import { FileSystemChatStorage, FileSystemArtifactStorage, FileSystemWorkflowStorage } from './filesystem';

// Singleton instances
export const chatStorage = new FileSystemChatStorage();
export const artifactStorage = new FileSystemArtifactStorage();
export const workflowStorage = new FileSystemWorkflowStorage();

// Export interfaces for type checking
export type { ChatStorage, ArtifactStorage, WorkflowStorage } from './interfaces';
