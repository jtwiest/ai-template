"use client"

import { useState, useEffect } from "react"
import { Workflow, WorkflowRun } from "@/lib/types"
import { WorkflowList } from "@/components/workflows/WorkflowList"
import { WorkflowRunner } from "@/components/workflows/WorkflowRunner"
import { WorkflowRunHistory } from "@/components/workflows/WorkflowRunHistory"
import { WorkflowRunDetail } from "@/components/workflows/WorkflowRunDetail"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkflowContext } from "@/contexts"

export default function WorkflowsPage() {
  const { workflows, runs, runWorkflow, refreshRun } = useWorkflowContext()
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null)
  const [isRunnerOpen, setIsRunnerOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Poll for running workflows
  useEffect(() => {
    const interval = setInterval(() => {
      runs.forEach((run) => {
        if (run.status === 'running' || run.status === 'pending') {
          refreshRun(run.id)
        }
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [runs, refreshRun])

  const handleRunWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow)
    setIsRunnerOpen(true)
  }

  const handleExecuteWorkflow = async (workflowId: string, parameters: Record<string, unknown>) => {
    await runWorkflow(workflowId, parameters)
  }

  const handleViewDetails = (run: WorkflowRun) => {
    setSelectedRun(run)
    setIsDetailOpen(true)
  }

  const handleRerun = async (run: WorkflowRun) => {
    await runWorkflow(run.workflowId, run.parameters)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Workflows</h1>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Available Workflows</TabsTrigger>
          <TabsTrigger value="history">Run History</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <p className="text-muted-foreground">
            Select a workflow to run with custom parameters
          </p>
          <WorkflowList workflows={workflows} onRun={handleRunWorkflow} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <p className="text-muted-foreground">
            View and manage your workflow execution history
          </p>
          <WorkflowRunHistory
            runs={runs}
            onViewDetails={handleViewDetails}
            onRerun={handleRerun}
          />
        </TabsContent>
      </Tabs>

      <WorkflowRunner
        workflow={selectedWorkflow}
        open={isRunnerOpen}
        onClose={() => setIsRunnerOpen(false)}
        onRun={handleExecuteWorkflow}
      />

      <WorkflowRunDetail
        run={selectedRun}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  )
}
