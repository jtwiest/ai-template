/**
 * Temporal Workflows
 *
 * Workflows define the orchestration logic and must be deterministic.
 * They coordinate activities and handle retries, timeouts, and failures.
 */

import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

// Configure activity timeouts and retries
const {
  processData,
  generateReport,
  processLargeDataset,
  fetchExternalData,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
  },
});

export interface DataProcessingWorkflowParams {
  inputData: string;
  operation: 'uppercase' | 'lowercase' | 'reverse' | 'wordcount';
}

export interface DataProcessingWorkflowResult {
  result: string;
  metadata: {
    operation: string;
    inputLength: number;
    outputLength: number;
    processedAt: string;
  };
  workflowId: string;
}

/**
 * Simple data processing workflow
 */
export async function dataProcessingWorkflow(
  params: DataProcessingWorkflowParams
): Promise<DataProcessingWorkflowResult> {
  const result = await processData(params);

  return {
    ...result,
    workflowId: 'data-processing',
  };
}

export interface ReportGenerationWorkflowParams {
  title: string;
  dataSource: string;
  query?: string;
  format: 'markdown' | 'json';
}

export interface ReportGenerationWorkflowResult {
  content: string;
  format: string;
  metadata: {
    title: string;
    dataSource: string;
    generatedAt: string;
    recordCount: number;
  };
  workflowId: string;
}

/**
 * Report generation workflow
 * Fetches data and generates a formatted report
 */
export async function reportGenerationWorkflow(
  params: ReportGenerationWorkflowParams
): Promise<ReportGenerationWorkflowResult> {
  const { title, dataSource, query, format } = params;

  // Step 1: Fetch data from external source
  const fetchedData = await fetchExternalData({
    source: dataSource,
    query,
  });

  // Step 2: Generate report from fetched data
  const report = await generateReport({
    title,
    data: fetchedData.data,
    format,
  });

  return {
    content: report.content,
    format: report.format,
    metadata: {
      title,
      dataSource,
      generatedAt: report.generatedAt,
      recordCount: fetchedData.data.results?.length || 0,
    },
    workflowId: 'report-generation',
  };
}

export interface LongRunningWorkflowParams {
  dataSize: number;
  chunkSize: number;
  generateReport: boolean;
}

export interface LongRunningWorkflowResult {
  processedChunks: number;
  totalTime: number;
  report?: string;
  workflowId: string;
}

/**
 * Long-running data processing workflow
 * Demonstrates how Temporal handles long-running tasks
 */
export async function longRunningWorkflow(
  params: LongRunningWorkflowParams
): Promise<LongRunningWorkflowResult> {
  const { dataSize, chunkSize, generateReport: shouldGenerateReport } = params;

  // Process large dataset
  const processingResult = await processLargeDataset({
    dataSize,
    chunkSize,
  });

  let report: string | undefined;

  // Optionally generate a report
  if (shouldGenerateReport) {
    const reportResult = await generateReport({
      title: 'Data Processing Report',
      data: {
        dataSize,
        chunkSize,
        processedChunks: processingResult.processedChunks,
        totalTime: processingResult.totalTime,
      },
      format: 'markdown',
    });
    report = reportResult.content;
  }

  return {
    processedChunks: processingResult.processedChunks,
    totalTime: processingResult.totalTime,
    report,
    workflowId: 'long-running-processing',
  };
}
