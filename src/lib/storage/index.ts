import { FileSystemChatStorage, FileSystemArtifactStorage, FileSystemWorkflowStorage, FileSystemMapLayerStorage } from './filesystem';

// Singleton instances
export const chatStorage = new FileSystemChatStorage();
export const artifactStorage = new FileSystemArtifactStorage();
export const workflowStorage = new FileSystemWorkflowStorage();
export const mapLayerStorage = new FileSystemMapLayerStorage();

// Export interfaces for type checking
export type { ChatStorage, ArtifactStorage, WorkflowStorage, MapLayerStorage } from './interfaces';
