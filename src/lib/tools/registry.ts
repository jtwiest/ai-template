import Anthropic from '@anthropic-ai/sdk';
import type { AgentTool, ToolSet } from './types';

/**
 * Tool registry for managing and executing agent tools
 */
export class ToolRegistry {
  private tools: Map<string, AgentTool> = new Map();

  /**
   * Register a single tool
   */
  registerTool(tool: AgentTool): void {
    this.tools.set(tool.definition.name, tool);
  }

  /**
   * Register a tool set
   */
  registerToolSet(toolSet: ToolSet): void {
    for (const tool of toolSet.tools) {
      this.registerTool(tool);
    }
  }

  /**
   * Register multiple tool sets at once
   */
  registerToolSets(toolSets: ToolSet[]): void {
    for (const toolSet of toolSets) {
      this.registerToolSet(toolSet);
    }
  }

  /**
   * Get all tool definitions for the LLM
   */
  getDefinitions(): Anthropic.Tool[] {
    return Array.from(this.tools.values()).map(tool => tool.definition);
  }

  /**
   * Execute a tool by name
   */
  async execute(name: string, input: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    console.log(`Executing tool: ${name}`, input);
    return await tool.execute(input);
  }

  /**
   * Check if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all registered tool names
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.tools.clear();
  }
}

/**
 * Create a tool registry with the specified tool sets
 */
export function createToolRegistry(toolSets: ToolSet[]): ToolRegistry {
  const registry = new ToolRegistry();
  registry.registerToolSets(toolSets);
  return registry;
}
