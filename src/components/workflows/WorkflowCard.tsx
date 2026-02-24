import { Workflow } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

interface WorkflowCardProps {
  workflow: Workflow
  onRun: (workflow: Workflow) => void
}

export function WorkflowCard({ workflow, onRun }: WorkflowCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{workflow.name}</CardTitle>
        <CardDescription>{workflow.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => onRun(workflow)} className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Run Workflow
        </Button>
      </CardContent>
    </Card>
  )
}
