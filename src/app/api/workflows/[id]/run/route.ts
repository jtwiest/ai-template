import { NextRequest, NextResponse } from 'next/server';
import { workflowStorage } from '@/lib/storage';

// POST /api/workflows/[id]/run - Start a workflow run
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params;
    const body = await request.json();
    const { parameters = {} } = body;

    // Verify workflow exists
    const workflow = await workflowStorage.getWorkflow(workflowId);
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Create a new run
    const run = await workflowStorage.createRun({
      workflowId,
      status: 'pending',
      parameters,
    });

    // TODO: In Phase 5, this will trigger the actual Temporal workflow
    // For now, we'll simulate async execution by updating status after a delay
    setTimeout(async () => {
      try {
        await workflowStorage.updateRun(run.id, {
          status: 'running',
        });

        // Simulate completion after 2 seconds
        setTimeout(async () => {
          await workflowStorage.updateRun(run.id, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            result: {
              message: 'Workflow completed successfully (simulated)',
              parameters,
            },
          });
        }, 2000);
      } catch (error) {
        console.error('Failed to update run status:', error);
      }
    }, 1000);

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error('Failed to start workflow run:', error);
    return NextResponse.json({ error: 'Failed to start workflow run' }, { status: 500 });
  }
}
