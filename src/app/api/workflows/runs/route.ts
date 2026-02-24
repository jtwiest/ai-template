import { NextRequest, NextResponse } from 'next/server';
import { workflowStorage } from '@/lib/storage';

// GET /api/workflows/runs - Get all workflow runs (optionally filtered by workflowId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');

    const runs = await workflowStorage.getRuns(workflowId || undefined);
    return NextResponse.json(runs);
  } catch (error) {
    console.error('Failed to get workflow runs:', error);
    return NextResponse.json({ error: 'Failed to get workflow runs' }, { status: 500 });
  }
}
