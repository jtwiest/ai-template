import { NextRequest, NextResponse } from 'next/server';
import { workflowStorage } from '@/lib/storage';

// GET /api/workflows/runs/[runId] - Get a specific workflow run
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const run = await workflowStorage.getRun(runId);

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    return NextResponse.json(run);
  } catch (error) {
    console.error('Failed to get workflow run:', error);
    return NextResponse.json({ error: 'Failed to get workflow run' }, { status: 500 });
  }
}
