"use client"

import { useState } from "react"
import { Artifact } from "@/lib/types"
import { ArtifactList } from "@/components/artifacts/ArtifactList"
import { ArtifactEditor } from "@/components/artifacts/ArtifactEditor"
import { ArtifactViewer } from "@/components/artifacts/ArtifactViewer"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useArtifactContext } from "@/contexts"

export default function ArtifactsPage() {
  const { artifacts, createArtifact, updateArtifact, deleteArtifact } = useArtifactContext()
  const [editingArtifact, setEditingArtifact] = useState<Artifact | undefined>()
  const [viewingArtifact, setViewingArtifact] = useState<Artifact | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const handleCreate = () => {
    setEditingArtifact(undefined)
    setIsEditorOpen(true)
  }

  const handleEdit = (artifact: Artifact) => {
    setEditingArtifact(artifact)
    setIsViewerOpen(false)
    setIsEditorOpen(true)
  }

  const handleView = (artifact: Artifact) => {
    setViewingArtifact(artifact)
    setIsViewerOpen(true)
  }

  const handleSave = async (artifactData: Partial<Artifact>) => {
    if (artifactData.id) {
      // Update existing
      const updated = await updateArtifact(artifactData.id, artifactData)
      if (viewingArtifact?.id === artifactData.id) {
        setViewingArtifact(updated)
      }
    } else {
      // Create new
      await createArtifact(
        artifactData.title || "Untitled",
        artifactData.content || "",
        artifactData.tags || []
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this artifact?")) {
      await deleteArtifact(id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Artifacts</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Artifact
        </Button>
      </div>

      <ArtifactList
        artifacts={artifacts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelect={handleView}
      />

      <ArtifactEditor
        artifact={editingArtifact}
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
      />

      <ArtifactViewer
        artifact={viewingArtifact}
        open={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        onEdit={() => viewingArtifact && handleEdit(viewingArtifact)}
      />
    </div>
  )
}
