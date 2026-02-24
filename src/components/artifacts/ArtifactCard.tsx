import { Artifact } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Edit, Trash2 } from "lucide-react"

interface ArtifactCardProps {
  artifact: Artifact
  onEdit: (artifact: Artifact) => void
  onDelete: (id: string) => void
  onClick: (artifact: Artifact) => void
}

export function ArtifactCard({ artifact, onEdit, onDelete, onClick }: ArtifactCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onClick(artifact)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{artifact.title}</CardTitle>
              <CardDescription className="mt-1">
                Updated {new Date(artifact.updatedAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(artifact)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(artifact.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {artifact.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {artifact.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
