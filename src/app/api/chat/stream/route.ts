import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { chatStorage } from '@/lib/storage';

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

    // Convert to format expected by AI SDK
    const conversationHistory = existingMessages.map(msg => ({
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
      async onFinish({ text }) {
        // Save the assistant's response to storage after streaming completes
        await chatStorage.addMessage(sessionId, {
          role: 'assistant',
          content: text,
        });

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
