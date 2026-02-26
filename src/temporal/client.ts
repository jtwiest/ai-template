/**
 * Temporal Client
 *
 * Provides a singleton client instance for connecting to Temporal server
 * and starting workflows.
 */

import { Client, Connection } from '@temporalio/client';

let client: Client | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (client) {
    return client;
  }

  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  });

  client = new Client({
    connection,
    namespace: 'default',
  });

  return client;
}

export const TASK_QUEUE = 'ai-template-workflows';
