"use client"

import { useState } from "react"
import { Workflow, WorkflowRun, WorkflowStatus } from "@/lib/types"
import { WorkflowList } from "@/components/workflows/WorkflowList"
import { WorkflowRunner } from "@/components/workflows/WorkflowRunner"
import { WorkflowRunHistory } from "@/components/workflows/WorkflowRunHistory"
import { WorkflowRunDetail } from "@/components/workflows/WorkflowRunDetail"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock workflows
const mockWorkflows: Workflow[] = [
  {
    id: "data-processing",
    name: "Data Processing Pipeline",
    description: "Process and transform large datasets with multiple stages",
  },
  {
    id: "report-generation",
    name: "Report Generation",
    description: "Generate comprehensive reports from analytics data",
  },
  {
    id: "email-campaign",
    name: "Email Campaign Sender",
    description: "Send personalized email campaigns to user segments",
  },
]

// Mock workflow runs
const mockRuns: WorkflowRun[] = [
  {
    id: "run-1",
    workflowId: "data-processing",
    status: "completed",
    startedAt: new Date("2024-02-23T10:00:00"),
    completedAt: new Date("2024-02-23T10:05:30"),
    parameters: { dataset: "users-2024-02", batchSize: 1000 },
    result: { processed: 15000, errors: 2, duration: 330 },
  },
  {
    id: "run-2",
    workflowId: "report-generation",
    status: "completed",
    startedAt: new Date("2024-02-23T09:30:00"),
    completedAt: new Date("2024-02-23T09:32:15"),
    parameters: { reportType: "monthly", month: "2024-02" },
    result: { reportUrl: "/reports/monthly-2024-02.pdf", pages: 45 },
  },
  {
    id: "run-3",
    workflowId: "data-processing",
    status: "running",
    startedAt: new Date("2024-02-23T14:20:00"),
    parameters: { dataset: "transactions-2024-02", batchSize: 500 },
  },
  {
    id: "run-4",
    workflowId: "email-campaign",
    status: "failed",
    startedAt: new Date("2024-02-22T16:00:00"),
    completedAt: new Date("2024-02-22T16:01:30"),
    parameters: { campaignId: "spring-sale", segment: "active-users" },
    error: "SMTP connection timeout after 30s",
  },
]

export default function WorkflowsPage() {
  const [runs, setRuns] = useState<WorkflowRun[]>(mockRuns)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null)
  const [isRunnerOpen, setIsRunnerOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleRunWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow)
    setIsRunnerOpen(true)
  }

  const handleExecuteWorkflow = (workflowId: string, parameters: Record<string, unknown>) => {
    const newRun: WorkflowRun = {
      id: `run-${Date.now()}`,
      workflowId,
      status: "running",
      startedAt: new Date(),
      parameters,
    }
    setRuns([newRun, ...runs])

    // Simulate workflow completion
    setTimeout(() => {
      setRuns((prev) =>
        prev.map((run) =>
          run.id === newRun.id
            ? {
                ...run,
                status: "completed" as WorkflowStatus,
                completedAt: new Date(),
                result: { success: true, message: "Workflow completed successfully" },
              }
            : run
        )
      )
    }, 5000)
  }

  const handleViewDetails = (run: WorkflowRun) => {
    setSelectedRun(run)
    setIsDetailOpen(true)
  }

  const handleRerun = (run: WorkflowRun) => {
    handleExecuteWorkflow(run.workflowId, run.parameters)
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
          <WorkflowList workflows={mockWorkflows} onRun={handleRunWorkflow} />
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
