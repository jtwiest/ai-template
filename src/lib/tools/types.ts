import Anthropic from '@anthropic-ai/sdk';

/**
 * A tool that can be used by the AI
 */
export interface AgentTool {
  /** The tool definition for the LLM */
  definition: Anthropic.Tool;
  /** Execute the tool with the given input */
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

/**
 * A collection of related tools
 */
export interface ToolSet {
  /** Name of the tool set */
  name: string;
  /** Description of what these tools do */
  description: string;
  /** The tools in this set */
  tools: AgentTool[];
}
