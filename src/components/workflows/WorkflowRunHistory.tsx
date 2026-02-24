import { WorkflowRun } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkflowRunHistoryProps {
  runs: WorkflowRun[]
  onViewDetails: (run: WorkflowRun) => void
  onRerun: (run: WorkflowRun) => void
}

const statusColors = {
  pending: "bg-yellow-500",
  running: "bg-blue-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
}

export function WorkflowRunHistory({ runs, onViewDetails, onRerun }: WorkflowRunHistoryProps) {
  if (runs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg">
        <p>No workflow runs yet</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Workflow ID</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => {
            const duration = run.completedAt
              ? Math.round(
                  (new Date(run.completedAt).getTime() -
                    new Date(run.startedAt).getTime()) /
                    1000
                )
              : null

            return (
              <TableRow key={run.id}>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", statusColors[run.status])}
                  >
                    {run.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {run.workflowId}
                </TableCell>
                <TableCell>
                  {new Date(run.startedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {duration !== null ? `${duration}s` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(run)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRerun(run)}
                      disabled={run.status === "running"}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
