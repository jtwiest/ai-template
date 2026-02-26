import { artifactStorage } from '@/lib/storage';
import type { AgentTool, ToolSet } from './types';

/**
 * Search for artifacts by query
 */
const searchArtifactsTool: AgentTool = {
  definition: {
    name: 'searchArtifacts',
    description: 'Search for artifacts by query string. Searches in title, content, and tags. If no query is provided, returns all artifacts.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional search query to filter artifacts. If omitted, returns all artifacts.',
        },
      },
    },
  },
  execute: async (input) => {
    const query = input.query as string | undefined;
    let artifacts;

    if (query && query.trim().length > 0) {
      artifacts = await artifactStorage.searchArtifacts(query);
    } else {
      artifacts = await artifactStorage.getArtifacts();
    }

    const result = {
      results: artifacts.map(a => ({
        id: a.id,
        title: a.title,
        tags: a.tags,
        excerpt: a.content.substring(0, 200) + (a.content.length > 200 ? '...' : ''),
        createdAt: typeof a.createdAt === 'string' ? a.createdAt : a.createdAt.toISOString(),
        updatedAt: typeof a.updatedAt === 'string' ? a.updatedAt : a.updatedAt.toISOString(),
      })),
      count: artifacts.length,
    };

    console.log(`searchArtifacts result: ${result.count} artifacts found`);
    return result;
  },
};

/**
 * Get a specific artifact by ID
 */
const getArtifactTool: AgentTool = {
  definition: {
    name: 'getArtifact',
    description: 'Get a specific artifact by ID to read its full content.',
    input_schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the artifact to retrieve',
        },
      },
      required: ['id'],
    },
  },
  execute: async (input) => {
    const id = input.id as string;
    const artifact = await artifactStorage.getArtifact(id);

    if (!artifact) {
      return { error: 'Artifact not found' };
    }

    console.log(`getArtifact result: Found artifact "${artifact.title}"`);
    return {
      id: artifact.id,
      title: artifact.title,
      content: artifact.content,
      tags: artifact.tags,
      createdAt: typeof artifact.createdAt === 'string' ? artifact.createdAt : artifact.createdAt.toISOString(),
      updatedAt: typeof artifact.updatedAt === 'string' ? artifact.updatedAt : artifact.updatedAt.toISOString(),
    };
  },
};

/**
 * Create a new artifact
 */
const createArtifactTool: AgentTool = {
  definition: {
    name: 'createArtifact',
    description: 'Create a new artifact with title, content, and optional tags.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the artifact',
        },
        content: {
          type: 'string',
          description: 'The markdown content of the artifact',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional tags for categorization',
        },
      },
      required: ['title', 'content'],
    },
  },
  execute: async (input) => {
    const { title, content, tags } = input;
    const artifact = await artifactStorage.createArtifact({
      title: title as string,
      content: content as string,
      tags: (tags as string[]) || [],
    });

    console.log(`createArtifact result: Created artifact "${artifact.title}"`);
    return {
      id: artifact.id,
      title: artifact.title,
      message: `Created artifact "${artifact.title}" with ID: ${artifact.id}`,
    };
  },
};

/**
 * Update an existing artifact
 */
const updateArtifactTool: AgentTool = {
  definition: {
    name: 'updateArtifact',
    description: 'Update an existing artifact. You can update title, content, and/or tags.',
    input_schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the artifact to update',
        },
        title: {
          type: 'string',
          description: 'New title for the artifact',
        },
        content: {
          type: 'string',
          description: 'New markdown content',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'New tags (replaces existing tags)',
        },
      },
      required: ['id'],
    },
  },
  execute: async (input) => {
    const { id, title, content, tags } = input;
    const updates: { title?: string; content?: string; tags?: string[] } = {};
    if (title !== undefined) updates.title = title as string;
    if (content !== undefined) updates.content = content as string;
    if (tags !== undefined) updates.tags = tags as string[];

    const artifact = await artifactStorage.updateArtifact(id as string, updates);
    if (!artifact) {
      return { error: 'Artifact not found' };
    }

    console.log(`updateArtifact result: Updated artifact "${artifact.title}"`);
    return {
      id: artifact.id,
      title: artifact.title,
      message: `Updated artifact "${artifact.title}"`,
    };
  },
};

/**
 * Artifact tools - CRUD operations for markdown documents
 */
export const artifactTools: ToolSet = {
  name: 'artifacts',
  description: 'Tools for creating, reading, updating, and searching markdown artifacts',
  tools: [
    searchArtifactsTool,
    getArtifactTool,
    createArtifactTool,
    updateArtifactTool,
  ],
};
