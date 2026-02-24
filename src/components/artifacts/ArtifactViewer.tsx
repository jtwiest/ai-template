import { Artifact } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ArtifactViewerProps {
  artifact: Artifact | null
  open: boolean
  onClose: () => void
  onEdit: () => void
}

export function ArtifactViewer({ artifact, open, onClose, onEdit }: ArtifactViewerProps) {
  if (!artifact) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{artifact.title}</DialogTitle>
              <DialogDescription className="mt-2">
                Created {new Date(artifact.createdAt).toLocaleDateString()} ·
                Updated {new Date(artifact.updatedAt).toLocaleDateString()}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          {artifact.tags.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {artifact.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto py-4">
          {artifact.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{artifact.content}</ReactMarkdown>
          ) : (
            <span className="text-muted-foreground">No content</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
