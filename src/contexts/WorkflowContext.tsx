"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Workflow, WorkflowRun } from '@/lib/types';

interface WorkflowContextType {
  workflows: Workflow[];
  runs: WorkflowRun[];
  currentRun: WorkflowRun | null;
  loading: boolean;
  error: string | null;

  loadWorkflows: () => Promise<void>;
  getWorkflow: (id: string) => Promise<Workflow | null>;
  loadRuns: (workflowId?: string) => Promise<void>;
  getRun: (runId: string) => Promise<WorkflowRun | null>;
  runWorkflow: (workflowId: string, parameters: Record<string, unknown>) => Promise<WorkflowRun>;
  setCurrentRun: (run: WorkflowRun | null) => void;
  refreshRun: (runId: string) => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [currentRun, setCurrentRun] = useState<WorkflowRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all workflows
  const loadWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/workflows');
      if (!response.ok) throw new Error('Failed to load workflows');
      const data = await response.json();
      setWorkflows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific workflow
  const getWorkflow = useCallback(async (id: string): Promise<Workflow | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/workflows/${id}`);
      if (!response.ok) throw new Error('Failed to load workflow');
      const workflow = await response.json();
      return workflow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load workflow runs
  const loadRuns = useCallback(async (workflowId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = workflowId
        ? `/api/workflows/runs?workflowId=${workflowId}`
        : '/api/workflows/runs';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load runs');
      const data = await response.json();
      setRuns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load runs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific run
  const getRun = useCallback(async (runId: string): Promise<WorkflowRun | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/workflows/runs/${runId}`);
      if (!response.ok) throw new Error('Failed to load run');
      const run = await response.json();
      return run;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load run');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Run a workflow
  const runWorkflow = useCallback(async (
    workflowId: string,
    parameters: Record<string, unknown>
  ): Promise<WorkflowRun> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/workflows/${workflowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters }),
      });
      if (!response.ok) throw new Error('Failed to start workflow');
      const newRun = await response.json();
      setRuns(prev => [newRun, ...prev]);
      return newRun;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start workflow';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh a specific run (for polling)
  const refreshRun = useCallback(async (runId: string) => {
    try {
      const response = await fetch(`/api/workflows/runs/${runId}`);
      if (!response.ok) throw new Error('Failed to refresh run');
      const updatedRun = await response.json();
      setRuns(prev => prev.map(r => r.id === runId ? updatedRun : r));
      if (currentRun?.id === runId) {
        setCurrentRun(updatedRun);
      }
    } catch (err) {
      console.error('Failed to refresh run:', err);
    }
  }, [currentRun]);

  // Load workflows on mount
  useEffect(() => {
    loadWorkflows();
    loadRuns();
  }, [loadWorkflows, loadRuns]);

  const value: WorkflowContextType = {
    workflows,
    runs,
    currentRun,
    loading,
    error,
    loadWorkflows,
    getWorkflow,
    loadRuns,
    getRun,
    runWorkflow,
    setCurrentRun,
    refreshRun,
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflowContext() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflowContext must be used within a WorkflowProvider');
  }
  return context;
}
