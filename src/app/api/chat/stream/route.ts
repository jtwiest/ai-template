import Anthropic from '@anthropic-ai/sdk';
import { chatStorage } from '@/lib/storage';
import { createToolRegistry, artifactTools, workflowTools } from '@/lib/tools';

// Use Node.js runtime since we need filesystem access for storage
export const runtime = 'nodejs';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Create tool registry with all available tool sets
const toolRegistry = createToolRegistry([artifactTools, workflowTools]);

// Get tool definitions for the LLM
const tools = toolRegistry.getDefinitions();

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
                const result = await toolRegistry.execute(toolUse.name, toolUse.input);

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
