import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { z } from 'zod';
import { chatStorage, artifactStorage } from '@/lib/storage';

// Use Node.js runtime since we need filesystem access for storage
export const runtime = 'nodejs';

// POST /api/chat/stream - Stream AI responses
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

    // Convert to format expected by AI SDK, filtering out empty messages
    const conversationHistory = existingMessages
      .filter(msg => msg.content && msg.content.trim().length > 0)
      .map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

    // Add the new user message to history
    const latestUserMessage = messages[messages.length - 1];
    conversationHistory.push({
      role: 'user' as const,
      content: latestUserMessage.content,
    });

    // Save the user message
    await chatStorage.addMessage(sessionId, {
      role: 'user',
      content: latestUserMessage.content,
    });

    // Create streaming response
    const result = streamText({
      model: anthropic('claude-opus-4-6'),
      messages: conversationHistory,
      temperature: 0.7,
      tools: {
        searchArtifacts: {
          description: 'Search for artifacts by query string. Searches in title, content, and tags. If no query is provided, returns all artifacts.',
          inputSchema: z.object({
            query: z.string().optional().describe('Optional search query to filter artifacts. If omitted, returns all artifacts.'),
          }),
          execute: async ({ query }) => {
            try {
              console.log('SEARCH ARTIFACTS RAN');
              console.log('Query:', query);

              let artifacts;
              if (query && query.trim().length > 0) {
                artifacts = await artifactStorage.searchArtifacts(query);
              } else {
                console.log('No query provided, returning all artifacts');
                artifacts = await artifactStorage.getArtifacts();
              }

              console.log('Artifacts found:', artifacts.length);

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

              console.log('Returning result with count:', result.count);
              console.log('Result object:', JSON.stringify(result, null, 2));
              return result;
            } catch (error) {
              console.error('Error in searchArtifacts execute:', error);
              throw error;
            }
          },
        },
        getArtifact: {
          description: 'Get a specific artifact by ID to read its full content.',
          inputSchema: z.object({
            id: z.string().describe('The ID of the artifact to retrieve'),
          }),
          execute: async ({ id }) => {
            const artifact = await artifactStorage.getArtifact(id);

                        console.log('GET ARTIFACTS RAN');
            console.log('Artifact found:', artifact);

            if (!artifact) {
              return { error: 'Artifact not found' };
            }
            return {
              id: artifact.id,
              title: artifact.title,
              content: artifact.content,
              tags: artifact.tags,
              createdAt: typeof artifact.createdAt === 'string' ? artifact.createdAt : artifact.createdAt.toISOString(),
              updatedAt: typeof artifact.updatedAt === 'string' ? artifact.updatedAt : artifact.updatedAt.toISOString(),
            };
          },
        },
        createArtifact: {
          description: 'Create a new artifact with title, content, and optional tags.',
          inputSchema: z.object({
            title: z.string().describe('The title of the artifact'),
            content: z.string().describe('The markdown content of the artifact'),
            tags: z.array(z.string()).optional().describe('Optional tags for categorization'),
          }),
          execute: async ({ title, content, tags }) => {

            console.log('CREATE ARTIFACTS RAN');

            const artifact = await artifactStorage.createArtifact({
              title,
              content,
              tags: tags || [],
            });
            return {
              id: artifact.id,
              title: artifact.title,
              message: `Created artifact "${title}" with ID: ${artifact.id}`,
            };
          },
        },
        updateArtifact: {
          description: 'Update an existing artifact. You can update title, content, and/or tags.',
          inputSchema: z.object({
            id: z.string().describe('The ID of the artifact to update'),
            title: z.string().optional().describe('New title for the artifact'),
            content: z.string().optional().describe('New markdown content'),
            tags: z.array(z.string()).optional().describe('New tags (replaces existing tags)'),
          }),
          execute: async ({ id, title, content, tags }) => {

          console.log('UPDATE ARTIFACTS RAN');


            const updates: { title?: string; content?: string; tags?: string[] } = {};
            if (title !== undefined) updates.title = title;
            if (content !== undefined) updates.content = content;
            if (tags !== undefined) updates.tags = tags;

            const artifact = await artifactStorage.updateArtifact(id, updates);
            if (!artifact) {
              return { error: 'Artifact not found' };
            }
            return {
              id: artifact.id,
              title: artifact.title,
              message: `Updated artifact "${artifact.title}"`,
            };
          },
        },
      },
      async onFinish({ text, toolCalls, toolResults }) {
        console.log('ON FINISH RAN');
        console.log('Text:', text);
        console.log('Tool calls:', toolCalls?.length || 0);
        console.log('Tool results:', toolResults);

        // Prepare assistant message with tool information
        const assistantMessage: {
          role: 'assistant';
          content: string;
          metadata?: {
            toolCalls?: Array<{
              name: string;
              args: Record<string, unknown>;
              result?: unknown;
            }>;
          };
        } = {
          role: 'assistant',
          content: text || '', // Ensure content is never undefined
        };

        // Add tool call metadata if present
        if (toolCalls && toolCalls.length > 0) {
          assistantMessage.metadata = {
            toolCalls: toolCalls.map((call, index) => {
              const toolResult = toolResults?.[index];
              return {
                name: call.toolName,
                args: 'args' in call ? (call.args as Record<string, unknown>) : {},
                result: toolResult || undefined,
              };
            }),
          };
        }

        // Only save if there's actual content or tool calls
        if (text || (toolCalls && toolCalls.length > 0)) {
          // Save the assistant's response to storage after streaming completes
          await chatStorage.addMessage(sessionId, assistantMessage);
        }

        // Update session's updatedAt timestamp
        const session = await chatStorage.getSession(sessionId);
        if (session) {
          await chatStorage.updateSession(sessionId, {
            updatedAt: new Date(),
          });
        }
      },
    });

    return result.toTextStreamResponse();
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
