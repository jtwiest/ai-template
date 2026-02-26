/**
 * Modular tool system for AI agents
 *
 * This module provides a flexible way to define, organize, and use tools
 * that can be called by AI agents. Tools are organized into sets and can
 * be mixed and matched across different routes and LLM instances.
 *
 * @example
 * ```ts
 * import { createToolRegistry, artifactTools, workflowTools } from '@/lib/tools';
 *
 * // Create a registry with specific tool sets
 * const registry = createToolRegistry([artifactTools, workflowTools]);
 *
 * // Get tool definitions for the LLM
 * const tools = registry.getDefinitions();
 *
 * // Execute a tool
 * const result = await registry.execute('createArtifact', {
 *   title: 'My Artifact',
 *   content: 'Hello world'
 * });
 * ```
 */

export * from './types';
export * from './registry';
export * from './artifacts';
export * from './workflows';
