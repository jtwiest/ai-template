import { NextRequest, NextResponse } from 'next/server';
import { workflowStorage } from '@/lib/storage';

// GET /api/workflows/[id] - Get a specific workflow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workflow = await workflowStorage.getWorkflow(id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Failed to get workflow:', error);
    return NextResponse.json({ error: 'Failed to get workflow' }, { status: 500 });
  }
}
