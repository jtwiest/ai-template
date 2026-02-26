import { artifactStorage, workflowStorage } from '@/lib/storage';
import { getTemporalClient, TASK_QUEUE } from '@/temporal/client';
import {
  dataProcessingWorkflow,
  reportGenerationWorkflow,
  longRunningWorkflow,
} from '@/temporal/workflows';
import type { AgentTool, ToolSet } from './types';

/**
 * List available workflows
 */
const listWorkflowsTool: AgentTool = {
  definition: {
    name: 'listWorkflows',
    description: 'Get a list of all available workflows that can be executed.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  execute: async () => {
    const workflows = await workflowStorage.getWorkflows();
    console.log(`listWorkflows result: ${workflows.length} workflows available`);
    return {
      workflows: workflows.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
      })),
      count: workflows.length,
    };
  },
};

/**
 * Run a workflow
 */
const runWorkflowTool: AgentTool = {
  definition: {
    name: 'runWorkflow',
    description: 'Start a workflow execution with the specified parameters. Returns a run ID that can be used to check status.',
    input_schema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'The ID of the workflow to run. Available workflows: data-processing, report-generation, long-running-processing',
          enum: ['data-processing', 'report-generation', 'long-running-processing'],
        },
        parameters: {
          type: 'object',
          description: 'Parameters for the workflow. For data-processing: {inputData: string, operation: "uppercase"|"lowercase"|"reverse"|"wordcount"}. For report-generation: {title: string, dataSource: string, query?: string, format: "markdown"|"json"}. For long-running-processing: {dataSize: number, chunkSize: number, generateReport: boolean}',
        },
      },
      required: ['workflowId', 'parameters'],
    },
  },
  execute: async (input) => {
    const { workflowId, parameters } = input;

    // Verify workflow exists
    const workflow = await workflowStorage.getWorkflow(workflowId as string);
    if (!workflow) {
      return { error: `Workflow "${workflowId}" not found` };
    }

    // Create a new run in storage
    const run = await workflowStorage.createRun({
      workflowId: workflowId as string,
      status: 'pending',
      parameters: parameters as Record<string, unknown>,
    });

    // Start the Temporal workflow asynchronously
    (async () => {
      try {
        const client = await getTemporalClient();

        // Update to running status
        await workflowStorage.updateRun(run.id, {
          status: 'running',
        });

        // Select the appropriate workflow function
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
          args: [parameters as any],
        });

        // Wait for workflow completion
        const result = await handle.result();

        // Update run with result
        await workflowStorage.updateRun(run.id, {
          status: 'completed',
          completedAt: new Date(),
          result,
        });

        // If the result contains content, automatically create an artifact
        if (result && typeof result === 'object' && 'content' in result) {
          const artifactTitle = `Workflow Result: ${workflow.name}`;
          await artifactStorage.createArtifact({
            title: artifactTitle,
            content: result.content as string,
            tags: ['workflow-result', workflowId as string],
          });
        }
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

    console.log(`runWorkflow result: Started workflow "${workflow.name}" with run ID: ${run.id}`);
    return {
      runId: run.id,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'pending',
      message: `Started workflow "${workflow.name}". Use getWorkflowRun with runId "${run.id}" to check status.`,
    };
  },
};

/**
 * Get workflow run status
 */
const getWorkflowRunTool: AgentTool = {
  definition: {
    name: 'getWorkflowRun',
    description: 'Get the status and result of a workflow run by its run ID.',
    input_schema: {
      type: 'object',
      properties: {
        runId: {
          type: 'string',
          description: 'The ID of the workflow run to check',
        },
      },
      required: ['runId'],
    },
  },
  execute: async (input) => {
    const { runId } = input;
    const run = await workflowStorage.getRun(runId as string);

    if (!run) {
      return { error: 'Workflow run not found' };
    }

    const workflow = await workflowStorage.getWorkflow(run.workflowId);

    console.log(`getWorkflowRun result: Run ${run.id} status: ${run.status}`);
    return {
      runId: run.id,
      workflowId: run.workflowId,
      workflowName: workflow?.name || run.workflowId,
      status: run.status,
      parameters: run.parameters,
      result: run.result,
      startedAt: typeof run.startedAt === 'string' ? run.startedAt : run.startedAt.toISOString(),
      completedAt: run.completedAt ? (typeof run.completedAt === 'string' ? run.completedAt : run.completedAt.toISOString()) : undefined,
    };
  },
};

/**
 * Workflow tools - Temporal workflow orchestration
 */
export const workflowTools: ToolSet = {
  name: 'workflows',
  description: 'Tools for running and monitoring Temporal workflows',
  tools: [
    listWorkflowsTool,
    runWorkflowTool,
    getWorkflowRunTool,
  ],
};
