import { NextRequest, NextResponse } from 'next/server';
import { chatStorage } from '@/lib/storage';

// GET /api/chat/sessions - Get all chat sessions
export async function GET() {
  try {
    const sessions = await chatStorage.getSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return NextResponse.json({ error: 'Failed to get sessions' }, { status: 500 });
  }
}

// POST /api/chat/sessions - Create a new chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const session = await chatStorage.createSession({ title, messages: [] });
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
