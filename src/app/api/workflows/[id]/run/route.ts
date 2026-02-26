import { NextRequest, NextResponse } from 'next/server';
import { workflowStorage } from '@/lib/storage';
import { getTemporalClient, TASK_QUEUE } from '@/temporal/client';
import {
  dataProcessingWorkflow,
  reportGenerationWorkflow,
  longRunningWorkflow,
} from '@/temporal/workflows';

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

    // Start the Temporal workflow asynchronously
    (async () => {
      try {
        const client = await getTemporalClient();

        // Update to running status
        await workflowStorage.updateRun(run.id, {
          status: 'running',
        });

        // Select the appropriate workflow function based on workflowId
        let workflowFunction;
        switch (workflowId) {
          case 'data-processing':
            workflowFunction = dataProcessingWorkflow;
            break;
          case 'report-generation':
            workflowFunction = reportGenerationWorkflow;
            break;
          case 'long-running-processing':
            workflowFunction = longRunningWorkflow;
            break;
          default:
            throw new Error(`Unknown workflow: ${workflowId}`);
        }

        // Start the workflow
        const handle = await client.workflow.start(workflowFunction, {
          taskQueue: TASK_QUEUE,
          workflowId: `${workflowId}-${run.id}`,
          args: [parameters],
        });

        // Wait for workflow completion
        const result = await handle.result();

        // Update run with result
        await workflowStorage.updateRun(run.id, {
          status: 'completed',
          completedAt: new Date(),
          result,
        });
      } catch (error) {
        console.error('Workflow execution failed:', error);
        await workflowStorage.updateRun(run.id, {
          status: 'failed',
          completedAt: new Date(),
          result: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    })();

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error('Failed to start workflow run:', error);
    return NextResponse.json({ error: 'Failed to start workflow run' }, { status: 500 });
  }
}
