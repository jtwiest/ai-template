/**
 * Temporal Activities
 *
 * Activities are operations that interact with external systems (APIs, databases, file systems)
 * They can fail and be retried automatically by Temporal
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface ProcessDataParams {
  inputData: string;
  operation: 'uppercase' | 'lowercase' | 'reverse' | 'wordcount';
}

export interface ProcessDataResult {
  result: string;
  metadata: {
    operation: string;
    inputLength: number;
    outputLength: number;
    processedAt: string;
  };
}

export interface GenerateReportParams {
  title: string;
  data: Record<string, any>;
  format: 'markdown' | 'json';
}

export interface GenerateReportResult {
  content: string;
  format: string;
  generatedAt: string;
}

/**
 * Process data based on operation type
 */
export async function processData(params: ProcessDataParams): Promise<ProcessDataResult> {
  const { inputData, operation } = params;

  let result: string;

  switch (operation) {
    case 'uppercase':
      result = inputData.toUpperCase();
      break;
    case 'lowercase':
      result = inputData.toLowerCase();
      break;
    case 'reverse':
      result = inputData.split('').reverse().join('');
      break;
    case 'wordcount':
      const wordCount = inputData.trim().split(/\s+/).length;
      result = `Word count: ${wordCount}`;
      break;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return {
    result,
    metadata: {
      operation,
      inputLength: inputData.length,
      outputLength: result.length,
      processedAt: new Date().toISOString(),
    },
  };
}

/**
 * Generate a report from data
 */
export async function generateReport(params: GenerateReportParams): Promise<GenerateReportResult> {
  const { title, data, format } = params;
  const generatedAt = new Date().toISOString();

  let content: string;

  if (format === 'markdown') {
    content = `# ${title}\n\n`;
    content += `*Generated at: ${generatedAt}*\n\n`;
    content += '## Data\n\n';

    for (const [key, value] of Object.entries(data)) {
      content += `- **${key}**: ${JSON.stringify(value, null, 2)}\n`;
    }
  } else {
    // JSON format
    content = JSON.stringify({
      title,
      generatedAt,
      data,
    }, null, 2);
  }

  return {
    content,
    format,
    generatedAt,
  };
}

/**
 * Simulate a long-running data processing task
 */
export async function processLargeDataset(params: {
  dataSize: number;
  chunkSize: number;
}): Promise<{ processedChunks: number; totalTime: number }> {
  const { dataSize, chunkSize } = params;
  const chunks = Math.ceil(dataSize / chunkSize);
  const startTime = Date.now();

  // Simulate processing with delays
  for (let i = 0; i < chunks; i++) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
  }

  const totalTime = Date.now() - startTime;

  return {
    processedChunks: chunks,
    totalTime,
  };
}

/**
 * Fetch external data (simulated)
 */
export async function fetchExternalData(params: {
  source: string;
  query?: string;
}): Promise<{ data: any; fetchedAt: string }> {
  const { source, query } = params;

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return mock data
  return {
    data: {
      source,
      query,
      results: [
        { id: 1, value: 'Sample data 1' },
        { id: 2, value: 'Sample data 2' },
        { id: 3, value: 'Sample data 3' },
      ],
    },
    fetchedAt: new Date().toISOString(),
  };
}
