import { NextRequest, NextResponse } from 'next/server';
import { chatStorage } from '@/lib/storage';

// GET /api/chat/sessions/[sessionId] - Get a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await chatStorage.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Failed to get session:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}

// DELETE /api/chat/sessions/[sessionId] - Delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    await chatStorage.deleteSession(sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}

// PATCH /api/chat/sessions/[sessionId] - Update a session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const updates = await request.json();

    const session = await chatStorage.updateSession(sessionId, updates);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Failed to update session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
