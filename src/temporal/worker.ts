/**
 * Temporal Worker
 *
 * The worker connects to the Temporal server and executes workflows and activities.
 * This should be run as a separate process alongside the Next.js application.
 */

import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import path from 'path';

async function run() {
  // Connect to Temporal server
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  });

  const worker = await Worker.create({
    connection,
    namespace: 'default',
    taskQueue: 'ai-template-workflows',
    workflowsPath: path.resolve(__dirname, './workflows'),
    activities,
  });

  console.log('Temporal worker starting...');
  console.log('Task Queue: ai-template-workflows');
  console.log('Temporal Address:', process.env.TEMPORAL_ADDRESS || 'localhost:7233');

  await worker.run();
}

run().catch((err) => {
  console.error('Worker failed:', err);
  process.exit(1);
});
