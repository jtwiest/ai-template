import { NextRequest, NextResponse } from 'next/server';
import { chatStorage } from '@/lib/storage';

// GET /api/chat/sessions/[sessionId]/messages - Get all messages for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const messages = await chatStorage.getMessages(sessionId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to get messages:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}

// POST /api/chat/sessions/[sessionId]/messages - Add a message to a session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { role, content } = body;

    if (!role || !content) {
      return NextResponse.json({ error: 'Role and content are required' }, { status: 400 });
    }

    const message = await chatStorage.addMessage(sessionId, { role, content });
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Failed to add message:', error);
    return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
  }
}
