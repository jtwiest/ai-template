import { Workflow } from "@/lib/types"
import { WorkflowCard } from "./WorkflowCard"

interface WorkflowListProps {
  workflows: Workflow[]
  onRun: (workflow: Workflow) => void
}

export function WorkflowList({ workflows, onRun }: WorkflowListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {workflows.map((workflow) => (
        <WorkflowCard key={workflow.id} workflow={workflow} onRun={onRun} />
      ))}
    </div>
  )
}
