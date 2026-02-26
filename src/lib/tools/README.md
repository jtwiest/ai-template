# Modular Tool System

This directory contains a modular, reusable tool system for AI agents. Tools are organized into sets that can be mixed and matched across different routes and LLM instances.

## Architecture

```
src/lib/tools/
├── types.ts         # Core types for tools and tool sets
├── registry.ts      # Tool registry for managing and executing tools
├── artifacts.ts     # Artifact CRUD tools
├── workflows.ts     # Temporal workflow tools
├── index.ts         # Main exports
└── README.md        # This file
```

## Quick Start

### Using Tools in a Route

```typescript
import { createToolRegistry, artifactTools, workflowTools } from '@/lib/tools';

// Create a registry with specific tool sets
const toolRegistry = createToolRegistry([artifactTools, workflowTools]);

// Get tool definitions for the LLM
const tools = toolRegistry.getDefinitions();

// Execute a tool
const result = await toolRegistry.execute('createArtifact', {
  title: 'My Artifact',
  content: 'Hello world'
});
```

### Using Only Specific Tools

```typescript
import { createToolRegistry, artifactTools } from '@/lib/tools';

// Create a registry with only artifact tools
const toolRegistry = createToolRegistry([artifactTools]);
```

### Manually Managing Tools

```typescript
import { ToolRegistry, artifactTools, workflowTools } from '@/lib/tools';

// Create an empty registry
const registry = new ToolRegistry();

// Add tool sets individually
registry.registerToolSet(artifactTools);
registry.registerToolSet(workflowTools);

// Or add individual tools
registry.registerTool(artifactTools.tools[0]); // Just search
```

## Available Tool Sets

### `artifactTools`

CRUD operations for markdown artifacts:
- `searchArtifacts` - Search or list all artifacts
- `getArtifact` - Get a specific artifact by ID
- `createArtifact` - Create a new artifact
- `updateArtifact` - Update an existing artifact

### `workflowTools`

Temporal workflow orchestration:
- `listWorkflows` - List available workflows
- `runWorkflow` - Start a workflow execution
- `getWorkflowRun` - Check workflow run status

## Creating Custom Tools

### 1. Define the Tool

```typescript
import type { AgentTool } from './types';
import { myService } from '@/lib/my-service';

const myTool: AgentTool = {
  definition: {
    name: 'myTool',
    description: 'What this tool does',
    input_schema: {
      type: 'object',
      properties: {
        param: {
          type: 'string',
          description: 'Parameter description',
        },
      },
      required: ['param'],
    },
  },
  execute: async (input) => {
    const result = await myService.doSomething(input.param as string);
    console.log(`myTool result:`, result);
    return result;
  },
};
```

### 2. Create a Tool Set

```typescript
import type { ToolSet } from './types';

export const myTools: ToolSet = {
  name: 'myTools',
  description: 'What these tools do',
  tools: [myTool, anotherTool],
};
```

### 3. Export from index.ts

```typescript
export * from './my-tools';
```

### 4. Use Your Tools

```typescript
import { createToolRegistry, myTools } from '@/lib/tools';

const registry = createToolRegistry([myTools]);
```

## API Reference

### `ToolRegistry`

Main class for managing tools:

- `registerTool(tool: AgentTool)` - Register a single tool
- `registerToolSet(toolSet: ToolSet)` - Register a tool set
- `registerToolSets(toolSets: ToolSet[])` - Register multiple tool sets
- `getDefinitions()` - Get all tool definitions for the LLM
- `execute(name: string, input: Record<string, unknown>)` - Execute a tool
- `hasTool(name: string)` - Check if a tool exists
- `getToolNames()` - Get all registered tool names
- `clear()` - Clear all registered tools

### `createToolRegistry(toolSets: ToolSet[])`

Helper function to create a registry with tool sets:

```typescript
const registry = createToolRegistry([artifactTools, workflowTools]);
```

## Benefits

1. **Modularity**: Tools are organized into logical sets that can be mixed and matched
2. **Reusability**: Use the same tools across different routes and LLM instances
3. **Type Safety**: Full TypeScript support with proper typing
4. **Easy Testing**: Each tool can be tested independently
5. **Discoverability**: Tools are self-documenting with clear definitions
6. **Maintainability**: Changes to tools are isolated and easy to track

## Example: Different Tool Combinations

```typescript
// Chat route - needs all tools
const chatTools = createToolRegistry([artifactTools, workflowTools]);

// Artifact-only route - just artifact tools
const artifactOnlyTools = createToolRegistry([artifactTools]);

// Custom combination
const customTools = new ToolRegistry();
customTools.registerTool(artifactTools.tools[0]); // Just search
customTools.registerTool(workflowTools.tools[0]); // Just list workflows
```
