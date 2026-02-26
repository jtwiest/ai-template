import Anthropic from '@anthropic-ai/sdk';
import { chatStorage, artifactStorage, workflowStorage } from '@/lib/storage';
import { getTemporalClient, TASK_QUEUE } from '@/temporal/client';
import {
  dataProcessingWorkflow,
  reportGenerationWorkflow,
  longRunningWorkflow,
} from '@/temporal/workflows';

// Use Node.js runtime since we need filesystem access for storage
export const runtime = 'nodejs';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Tool definitions
const tools: Anthropic.Tool[] = [
  {
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
  {
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
  {
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
  {
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
  {
    name: 'listWorkflows',
    description: 'Get a list of all available workflows that can be executed.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'runWorkflow',
    description: 'Start a workflow execution with the specified parameters. Returns a run ID that can be used to check status.',
    input_schema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'The ID of the workflow to run. Available workflows: data-processing, report-generation, long-running-processing',
          enum: ['data-processing', 'report-generation', 'long-running-processing'],
        },
        parameters: {
          type: 'object',
          description: 'Parameters for the workflow. For data-processing: {inputData: string, operation: "uppercase"|"lowercase"|"reverse"|"wordcount"}. For report-generation: {title: string, dataSource: string, query?: string, format: "markdown"|"json"}. For long-running-processing: {dataSize: number, chunkSize: number, generateReport: boolean}',
        },
      },
      required: ['workflowId', 'parameters'],
    },
  },
  {
    name: 'getWorkflowRun',
    description: 'Get the status and result of a workflow run by its run ID.',
    input_schema: {
      type: 'object',
      properties: {
        runId: {
          type: 'string',
          description: 'The ID of the workflow run to check',
        },
      },
      required: ['runId'],
    },
  },
];

// Tool execution handler
async function executeTool(toolName: string, toolInput: Record<string, unknown>): Promise<unknown> {
  console.log(`Executing tool: ${toolName}`, toolInput);

  switch (toolName) {
    case 'searchArtifacts': {
      const query = toolInput.query as string | undefined;
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
    }

    case 'getArtifact': {
      const id = toolInput.id as string;
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
    }

    case 'createArtifact': {
      const { title, content, tags } = toolInput;
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
    }

    case 'updateArtifact': {
      const { id, title, content, tags } = toolInput;
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
    }

    case 'listWorkflows': {
      const workflows = await workflowStorage.getWorkflows();
      console.log(`listWorkflows result: ${workflows.length} workflows available`);
      return {
        workflows: workflows.map(w => ({
          id: w.id,
          name: w.name,
          description: w.description,
        })),
        count: workflows.length,
      };
    }

    case 'runWorkflow': {
      const { workflowId, parameters } = toolInput;

      // Verify workflow exists
      const workflow = await workflowStorage.getWorkflow(workflowId as string);
      if (!workflow) {
        return { error: `Workflow "${workflowId}" not found` };
      }

      // Create a new run in storage
      const run = await workflowStorage.createRun({
        workflowId: workflowId as string,
        status: 'pending',
        parameters: parameters as Record<string, unknown>,
      });

      // Start the Temporal workflow asynchronously
      (async () => {
        try {
          const client = await getTemporalClient();

          // Update to running status
          await workflowStorage.updateRun(run.id, {
            status: 'running',
          });

          // Select the appropriate workflow function
          let workflowFunction;
          switch (workflowId) {
            case 'data-processing':
              workflowFunction = dataProcessingWorkflow;
              break;
            case 'report-generation':
              workflowFunction = reportGenerationWorkflow;
              break;
            case 'long-running-processing':
              workflowFunction = longRunningWorkflow;
              break;
            default:
              throw new Error(`Unknown workflow: ${workflowId}`);
          }

          // Start the workflow
          const handle = await client.workflow.start(workflowFunction, {
            taskQueue: TASK_QUEUE,
            workflowId: `${workflowId}-${run.id}`,
            args: [parameters as any],
          });

          // Wait for workflow completion
          const result = await handle.result();

          // Update run with result
          await workflowStorage.updateRun(run.id, {
            status: 'completed',
            completedAt: new Date(),
            result,
          });

          // If the result contains content, automatically create an artifact
          if (result && typeof result === 'object' && 'content' in result) {
            const artifactTitle = `Workflow Result: ${workflow.name}`;
            await artifactStorage.createArtifact({
              title: artifactTitle,
              content: result.content as string,
              tags: ['workflow-result', workflowId as string],
            });
          }
        } catch (error) {
          console.error('Workflow execution failed:', error);
          await workflowStorage.updateRun(run.id, {
            status: 'failed',
            completedAt: new Date(),
            result: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }
      })();

      console.log(`runWorkflow result: Started workflow "${workflow.name}" with run ID: ${run.id}`);
      return {
        runId: run.id,
        workflowId: workflow.id,
        workflowName: workflow.name,
        status: 'pending',
        message: `Started workflow "${workflow.name}". Use getWorkflowRun with runId "${run.id}" to check status.`,
      };
    }

    case 'getWorkflowRun': {
      const { runId } = toolInput;
      const run = await workflowStorage.getRun(runId as string);

      if (!run) {
        return { error: 'Workflow run not found' };
      }

      const workflow = await workflowStorage.getWorkflow(run.workflowId);

      console.log(`getWorkflowRun result: Run ${run.id} status: ${run.status}`);
      return {
        runId: run.id,
        workflowId: run.workflowId,
        workflowName: workflow?.name || run.workflowId,
        status: run.status,
        parameters: run.parameters,
        result: run.result,
        startedAt: typeof run.startedAt === 'string' ? run.startedAt : run.startedAt.toISOString(),
        completedAt: run.completedAt ? (typeof run.completedAt === 'string' ? run.completedAt : run.completedAt.toISOString()) : undefined,
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// POST /api/chat/stream - Stream AI responses using Anthropic SDK
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, messages } = body;

    if (!sessionId || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Session ID and messages array are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get existing messages for context
    const existingMessages = await chatStorage.getMessages(sessionId);

    // Convert to Anthropic message format
    const anthropicMessages: Anthropic.MessageParam[] = [];

    for (const msg of existingMessages) {
      if (msg.role === 'user') {
        anthropicMessages.push({
          role: 'user',
          content: msg.content,
        });
      } else if (msg.role === 'assistant') {
        // Build content blocks for assistant message
        const contentBlocks: Array<Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam> = [];

        // Add text content if present
        if (msg.content) {
          contentBlocks.push({
            type: 'text',
            text: msg.content,
          });
        }

        // Add tool use blocks if present
        if (msg.metadata?.toolCalls && msg.metadata.toolCalls.length > 0) {
          for (const toolCall of msg.metadata.toolCalls) {
            const result = toolCall.result as any;
            contentBlocks.push({
              type: 'tool_use',
              id: result?.toolCallId || `tool-${Date.now()}-${Math.random()}`,
              name: toolCall.name,
              input: toolCall.args,
            });
          }
        }

        if (contentBlocks.length > 0) {
          anthropicMessages.push({
            role: 'assistant',
            content: contentBlocks,
          });
        }

        // Add tool results as a separate user message
        if (msg.metadata?.toolCalls && msg.metadata.toolCalls.length > 0) {
          const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];
          for (const toolCall of msg.metadata.toolCalls) {
            if (toolCall.result) {
              const result = toolCall.result as any;
              toolResultBlocks.push({
                type: 'tool_result',
                tool_use_id: result?.toolCallId || `tool-${Date.now()}-${Math.random()}`,
                content: JSON.stringify(result?.result || toolCall.result),
              });
            }
          }

          if (toolResultBlocks.length > 0) {
            anthropicMessages.push({
              role: 'user',
              content: toolResultBlocks,
            });
          }
        }
      }
    }

    // Add the new user message
    const latestUserMessage = messages[messages.length - 1];
    anthropicMessages.push({
      role: 'user',
      content: latestUserMessage.content,
    });

    // Save the user message
    await chatStorage.addMessage(sessionId, {
      role: 'user',
      content: latestUserMessage.content,
    });

    console.log('=== ANTHROPIC MESSAGES ===');
    console.log(JSON.stringify(anthropicMessages, null, 2));
    console.log('=== END MESSAGES ===');

    // Create a TransformStream for streaming the response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Handle the streaming in the background
    (async () => {
      try {
        let currentMessages = [...anthropicMessages];

        // Agentic loop - continue until we get a text response without tool use
        let continueLoop = true;
        let iterationCount = 0;
        const maxIterations = 2;

        while (continueLoop && iterationCount < maxIterations) {
          iterationCount++;
          console.log(`\n=== Iteration ${iterationCount} ===`);

          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 4096,
            temperature: 0.7,
            messages: currentMessages,
            tools: tools,
            stream: true,
          });

          let currentText = '';
          let currentToolUses: Array<{ id: string; name: string; input: Record<string, unknown>; partialInput: string }> = [];

          // Process the stream
          for await (const event of response) {
            if (event.type === 'content_block_start') {
              if (event.content_block.type === 'text') {
                // Text block started
              } else if (event.content_block.type === 'tool_use') {
                // Tool use block started
                currentToolUses.push({
                  id: event.content_block.id,
                  name: event.content_block.name,
                  input: {},
                  partialInput: '',
                });
              }
            } else if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                // Stream text delta to client
                currentText += event.delta.text;
                await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: event.delta.text })}\n\n`));
              } else if (event.delta.type === 'input_json_delta') {
                // Accumulate tool input as string
                const lastTool = currentToolUses[currentToolUses.length - 1];
                if (lastTool) {
                  lastTool.partialInput += event.delta.partial_json;
                  // Try to parse the accumulated JSON
                  try {
                    lastTool.input = JSON.parse(lastTool.partialInput);
                  } catch {
                    // Partial JSON, will be complete later
                  }
                }
              }
            } else if (event.type === 'content_block_stop') {
              // Content block finished - ensure we have the final input parsed
              const lastTool = currentToolUses[currentToolUses.length - 1];
              if (lastTool && lastTool.partialInput) {
                try {
                  lastTool.input = JSON.parse(lastTool.partialInput);
                } catch (error) {
                  console.error('Failed to parse final tool input:', error);
                }
              }
            } else if (event.type === 'message_delta') {
              if (event.delta.stop_reason) {
                console.log('Stop reason:', event.delta.stop_reason);
              }
            }
          }

          // Save the text message if we got any text
          if (currentText) {
            console.log('Saving text message:', currentText);
            await chatStorage.addMessage(sessionId, {
              role: 'assistant',
              content: currentText,
            });
          }

          // If we have tool uses, execute them and continue the loop
          if (currentToolUses.length > 0) {
            console.log(`Executing ${currentToolUses.length} tool(s)`);

            // Send tool call notifications to client
            for (const toolUse of currentToolUses) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({
                type: 'tool_call',
                name: toolUse.name,
                args: toolUse.input
              })}\n\n`));
            }

            // Build assistant message with text and tool uses
            const assistantContent: Array<Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam> = [];

            if (currentText) {
              assistantContent.push({
                type: 'text',
                text: currentText,
              });
            }

            for (const toolUse of currentToolUses) {
              assistantContent.push({
                type: 'tool_use',
                id: toolUse.id,
                name: toolUse.name,
                input: toolUse.input,
              });
            }

            currentMessages.push({
              role: 'assistant',
              content: assistantContent,
            });

            // Execute tools and build tool result message
            const toolResults: Anthropic.ToolResultBlockParam[] = [];
            const toolCallsForStorage: Array<{
              name: string;
              args: Record<string, unknown>;
              result?: unknown;
            }> = [];

            for (const toolUse of currentToolUses) {
              try {
                const result = await executeTool(toolUse.name, toolUse.input);

                // Send tool result to client
                await writer.write(encoder.encode(`data: ${JSON.stringify({
                  type: 'tool_result',
                  name: toolUse.name,
                  result: result
                })}\n\n`));

                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: toolUse.id,
                  content: JSON.stringify(result),
                });

                // Track for saving
                toolCallsForStorage.push({
                  name: toolUse.name,
                  args: toolUse.input,
                  result: {
                    toolCallId: toolUse.id,
                    result: result,
                  },
                });
              } catch (error) {
                console.error(`Error executing tool ${toolUse.name}:`, error);
                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: toolUse.id,
                  content: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
                  is_error: true,
                });
              }
            }

            // Save tool call message
            console.log('Saving tool call message with', toolCallsForStorage.length, 'tools');
            await chatStorage.addMessage(sessionId, {
              role: 'assistant',
              content: '', // No text content for tool-only messages
              metadata: {
                toolCalls: toolCallsForStorage,
              },
            });

            // Add tool results as user message
            currentMessages.push({
              role: 'user',
              content: toolResults,
            });

            // Continue the loop to let Claude respond to the tool results
          } else {
            // No tool uses, we're done
            continueLoop = false;
          }
        }

        // Update session timestamp
        const session = await chatStorage.getSession(sessionId);
        if (session) {
          await chatStorage.updateSession(sessionId, {
            updatedAt: new Date(),
          });
        }

        // Send done signal
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        await writer.close();
      } catch (error) {
        console.error('Streaming error:', error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })}\n\n`));
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat stream error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
