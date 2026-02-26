"use client"

import { useState, useEffect } from "react"
import { Workflow } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface WorkflowRunnerProps {
  workflow: Workflow | null
  open: boolean
  onClose: () => void
  onRun: (workflowId: string, parameters: Record<string, unknown>) => void
}

// Default parameters for each workflow type
const getDefaultParameters = (workflowId: string): string => {
  switch (workflowId) {
    case 'data-processing':
      return JSON.stringify({
        inputData: "Hello World",
        operation: "uppercase"
      }, null, 2)
    case 'report-generation':
      return JSON.stringify({
        title: "Sample Report",
        dataSource: "api.example.com",
        query: "SELECT * FROM users",
        format: "markdown"
      }, null, 2)
    case 'long-running-processing':
      return JSON.stringify({
        dataSize: 1000,
        chunkSize: 100,
        generateReport: true
      }, null, 2)
    default:
      return "{}"
  }
}

export function WorkflowRunner({ workflow, open, onClose, onRun }: WorkflowRunnerProps) {
  const [parameters, setParameters] = useState("{}")

  // Update parameters when workflow changes
  useEffect(() => {
    if (workflow) {
      setParameters(getDefaultParameters(workflow.id))
    }
  }, [workflow])

  const handleRun = () => {
    try {
      const params = JSON.parse(parameters)
      if (workflow) {
        onRun(workflow.id, params)
      }
      onClose()
    } catch (error) {
      alert("Invalid JSON parameters")
    }
  }

  if (!workflow) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run Workflow: {workflow.name}</DialogTitle>
          <DialogDescription>{workflow.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="parameters">Parameters (JSON)</Label>
            <Textarea
              id="parameters"
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              placeholder='{"key": "value"}'
              className="font-mono min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Enter workflow parameters as a JSON object
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRun}>Run Workflow</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
