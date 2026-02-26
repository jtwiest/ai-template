# Temporal Workflows Guide

This guide explains how to develop, use, and extend Temporal workflows in the AI MVP template.

## Overview

Temporal workflows provide reliable, durable execution for long-running processes. The AI agent can trigger workflows during conversations, and workflow results are automatically saved as artifacts.

## Prerequisites

- Node.js 20+ installed
- Temporal CLI installed (`brew install temporal`)
- Project dependencies installed (`npm install`)

## Quick Start

See [TEMPORAL-SETUP.md](./TEMPORAL-SETUP.md) for detailed setup instructions.

You'll run 3 services in separate terminals:

1. **Temporal Server**: `temporal server start-dev`
2. **Temporal Worker**: `npm run worker`
3. **Next.js App**: `npm run dev`

## Available Workflows

### 1. Data Processing (`data-processing`)

Process text data with various operations.

**Parameters:**
```json
{
  "inputData": "Hello World",
  "operation": "uppercase"  // Options: uppercase, lowercase, reverse, wordcount
}
```

**Example Result:**
```json
{
  "result": "HELLO WORLD",
  "metadata": {
    "operation": "uppercase",
    "inputLength": 11,
    "outputLength": 11,
    "processedAt": "2024-01-15T10:30:00.000Z"
  },
  "workflowId": "data-processing"
}
```

### 2. Report Generation (`report-generation`)

Fetch data from a source and generate a formatted report.

**Parameters:**
```json
{
  "title": "Monthly Report",
  "dataSource": "sales-api",
  "query": "last-month",
  "format": "markdown"  // Options: markdown, json
}
```

**Example Result:**
```json
{
  "content": "# Monthly Report\n\n*Generated at: 2024-01-15T10:30:00.000Z*\n\n...",
  "format": "markdown",
  "metadata": {
    "title": "Monthly Report",
    "dataSource": "sales-api",
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "recordCount": 3
  },
  "workflowId": "report-generation"
}
```

### 3. Long Running Processing (`long-running-processing`)

Process large datasets in chunks with optional report generation.

**Parameters:**
```json
{
  "dataSize": 10000,
  "chunkSize": 100,
  "generateReport": true
}
```

**Example Result:**
```json
{
  "processedChunks": 100,
  "totalTime": 10234,
  "report": "# Data Processing Report\n\n...",
  "workflowId": "long-running-processing"
}
```

## Using Workflows with the AI Agent

The AI agent has access to workflow tools and can trigger workflows during conversations:

**Example Chat Prompts:**

1. "What workflows are available?"
   - Agent will use `listWorkflows` tool to show all available workflows

2. "Run the data processing workflow to convert 'hello world' to uppercase"
   - Agent will use `runWorkflow` with appropriate parameters

3. "Generate a report from the sales-api data source"
   - Agent will trigger the report generation workflow

4. "Check the status of workflow run run-123456"
   - Agent will use `getWorkflowRun` to check status

## Automatic Artifact Creation

When a workflow completes and its result contains a `content` field, the system automatically creates an artifact with:
- **Title**: "Workflow Result: [Workflow Name]"
- **Content**: The content from the workflow result
- **Tags**: `workflow-result`, `[workflowId]`

This makes workflow results easily accessible and searchable.

## Architecture

### Components

1. **Workflows** ([src/temporal/workflows/index.ts](../src/temporal/workflows/index.ts))
   - Define the orchestration logic
   - Must be deterministic
   - Coordinate activities

2. **Activities** ([src/temporal/activities/index.ts](../src/temporal/activities/index.ts))
   - Perform actual work (I/O, API calls, etc.)
   - Can be non-deterministic
   - Automatically retried on failure

3. **Worker** ([src/temporal/worker.ts](../src/temporal/worker.ts))
   - Executes workflows and activities
   - Runs as a separate Node.js process
   - Connects to Temporal server

4. **Client** ([src/temporal/client.ts](../src/temporal/client.ts))
   - Used by API routes to start workflows
   - Manages connection to Temporal server

### Data Flow

```
User/Agent → Chat API → Temporal Client → Temporal Server
                                              ↓
                                         Task Queue
                                              ↓
                                          Worker
                                              ↓
                                    Execute Workflow
                                              ↓
                                    Execute Activities
                                              ↓
                                      Return Result
                                              ↓
                                    Update Run Status
                                              ↓
                               Create Artifact (if applicable)
```

## Development

### Adding a New Workflow

1. **Define Activities** in [src/temporal/activities/index.ts](../src/temporal/activities/index.ts):
```typescript
export async function myActivity(params: MyParams): Promise<MyResult> {
  // Perform work (API calls, file I/O, database queries)
  return result;
}
```

2. **Create Workflow** in [src/temporal/workflows/index.ts](../src/temporal/workflows/index.ts):
```typescript
import { myActivity } from '../activities';

export async function myWorkflow(params: MyParams): Promise<MyResult> {
  const result = await myActivity(params);
  return { ...result, workflowId: 'my-workflow' };
}
```

3. **Register in Storage** ([src/lib/storage/filesystem.ts](../src/lib/storage/filesystem.ts)):
```typescript
{
  id: 'my-workflow',
  name: 'My Workflow',
  description: 'Description of what it does',
}
```

4. **Add to API Route** ([src/app/api/workflows/[id]/run/route.ts](../src/app/api/workflows/[id]/run/route.ts)):
```typescript
import { myWorkflow } from '@/temporal/workflows';

// In the POST handler:
case 'my-workflow':
  workflowFunction = myWorkflow;
  break;
```

5. **Restart Worker**: Stop and restart `npm run worker` to load new workflows

### Best Practices

**Workflows:**
- Keep workflows deterministic (no random numbers, Date.now(), etc.)
- Use activities for all I/O operations
- Use Temporal's built-in retry and timeout features
- Version workflows when making breaking changes

**Activities:**
- Make activities idempotent when possible
- Set appropriate timeouts
- Use structured logging
- Handle errors gracefully

**Testing:**
- Test activities as pure functions
- Use Temporal's testing framework for workflow tests
- Monitor workflows in the Web UI during development

### Testing Workflows

1. **Use Temporal Web UI** at http://localhost:8233
   - See workflow execution history
   - View activity results
   - Check timing and retry behavior

2. **Trigger via Chat UI**
   - Natural language interface for testing
   - See real-world agent interaction

3. **Or use the Workflows page** in the app
   - Direct workflow triggering
   - View run history

## Troubleshooting

### Worker Won't Start

```bash
# Check if Temporal is running
temporal workflow list

# Restart Temporal server
temporal server start-dev
```

### Workflows Stuck in "Running"

- Check worker logs for errors
- Verify worker is running (`npm run worker`)
- Check Temporal Web UI for workflow details
- Look for activity timeouts or failures

### "Cannot connect to Temporal server"

- Ensure Temporal server is running
- Verify `TEMPORAL_ADDRESS` in `.env.local` (should be `localhost:7233`)
- Check if port 7233 is available:
  ```bash
  lsof -ti:7233
  ```

### Activities Failing

- Check activity logs in worker console
- Verify external services are accessible
- Check for timeout issues
- Review retry policies

### Database Issues

```bash
# Reset Temporal data (WARNING: deletes all workflow history)
rm -rf ~/.temporal/
temporal server start-dev
```

## Production Deployment

For production:

1. **Use a managed Temporal service** (e.g., Temporal Cloud)
2. **Update `TEMPORAL_ADDRESS`** to point to production server
3. **Deploy worker as a separate service** (Docker, K8s, etc.)
4. **Configure proper retry policies** and timeouts
5. **Set up monitoring** and alerting (Prometheus, Grafana)
6. **Use namespace isolation** for multi-tenancy
7. **Enable TLS** for secure communication
8. **Implement workflow versioning** strategy

## Advanced Topics

### Workflow Signals

Send data to running workflows:

```typescript
// In workflow
export async function myWorkflow() {
  const signal = defineSignal<string>('mySignal');
  setHandler(signal, (data) => {
    // Handle signal
  });
}

// From client
await handle.signal('mySignal', 'data');
```

### Workflow Queries

Query running workflow state:

```typescript
// In workflow
export async function myWorkflow() {
  const query = defineQuery<string>('getStatus');
  setHandler(query, () => currentStatus);
}

// From client
const status = await handle.query('getStatus');
```

### Child Workflows

Orchestrate complex processes:

```typescript
import { startChild } from '@temporalio/workflow';

export async function parentWorkflow() {
  const child = await startChild(childWorkflow, { args: [params] });
  const result = await child.result();
  return result;
}
```

### Timers and Delays

```typescript
import { sleep } from '@temporalio/workflow';

export async function myWorkflow() {
  await sleep('1 hour');
  // Continue after delay
}
```

## Resources

- [Temporal Documentation](https://docs.temporal.io/)
- [TypeScript SDK](https://typescript.temporal.io/)
- [Temporal Cloud](https://temporal.io/cloud)
- [Workflow Patterns](https://docs.temporal.io/dev-guide/typescript/foundations)
- [Best Practices](https://docs.temporal.io/kb/temporal-platform)
