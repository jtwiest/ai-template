import { WorkflowRun } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface WorkflowRunDetailProps {
  run: WorkflowRun | null
  open: boolean
  onClose: () => void
}

const statusColors = {
  pending: "bg-yellow-500",
  running: "bg-blue-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
}

export function WorkflowRunDetail({ run, open, onClose }: WorkflowRunDetailProps) {
  if (!run) return null

  const duration = run.completedAt
    ? Math.round(
        (new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) /
          1000
      )
    : null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>Workflow Run Details</DialogTitle>
            <Badge
              variant="secondary"
              className={cn("capitalize", statusColors[run.status])}
            >
              {run.status}
            </Badge>
          </div>
          <DialogDescription>Run ID: {run.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="font-semibold mb-2">Workflow ID</h3>
            <p className="text-sm font-mono bg-muted p-2 rounded break-all">
              {run.workflowId}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Started At</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(run.startedAt).toLocaleString()}
              </p>
            </div>
            {run.completedAt && (
              <div>
                <h3 className="font-semibold mb-2">Completed At</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(run.completedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {duration !== null && (
            <div>
              <h3 className="font-semibold mb-2">Duration</h3>
              <p className="text-sm text-muted-foreground">{duration} seconds</p>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Parameters</h3>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto overflow-y-auto max-h-32 whitespace-pre-wrap break-words">
              {JSON.stringify(run.parameters, null, 2)}
            </pre>
          </div>

          {run.result !== undefined && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Result</h3>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto overflow-y-auto max-h-48 whitespace-pre-wrap break-words">
                  {JSON.stringify(run.result, null, 2)}
                </pre>
              </div>
            </>
          )}

          {run.error && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 text-destructive">Error</h3>
                <p className="text-sm text-destructive bg-destructive/10 p-3 rounded break-words">
                  {run.error}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
