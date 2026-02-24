"use client"

import { useState } from "react"
import { Artifact } from "@/lib/types"
import { ArtifactList } from "@/components/artifacts/ArtifactList"
import { ArtifactEditor } from "@/components/artifacts/ArtifactEditor"
import { ArtifactViewer } from "@/components/artifacts/ArtifactViewer"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Mock data for demonstration
const mockArtifacts: Artifact[] = [
  {
    id: "1",
    title: "API Documentation",
    content: "# API Documentation\n\nThis is a sample API documentation artifact.\n\n## Endpoints\n\n- GET /api/users\n- POST /api/users\n- PUT /api/users/:id",
    tags: ["documentation", "api"],
    createdAt: new Date("2024-02-20T10:00:00"),
    updatedAt: new Date("2024-02-22T15:30:00"),
  },
  {
    id: "2",
    title: "Project Requirements",
    content: "# Project Requirements\n\n## Overview\n\nKey requirements for the MVP:\n\n1. User authentication\n2. Dashboard with analytics\n3. Real-time notifications",
    tags: ["requirements", "planning"],
    createdAt: new Date("2024-02-18T09:00:00"),
    updatedAt: new Date("2024-02-23T11:00:00"),
  },
  {
    id: "3",
    title: "Meeting Notes - 2024-02-23",
    content: "# Team Meeting Notes\n\n**Date:** February 23, 2024\n\n## Discussion Points\n\n- Progress on AI integration\n- Timeline for Phase 2\n- Resource allocation",
    tags: ["meeting", "notes"],
    createdAt: new Date("2024-02-23T14:00:00"),
    updatedAt: new Date("2024-02-23T14:30:00"),
  },
]

export default function ArtifactsPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>(mockArtifacts)
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

  const handleSave = (artifactData: Partial<Artifact>) => {
    if (artifactData.id) {
      // Update existing
      setArtifacts((prev) =>
        prev.map((a) =>
          a.id === artifactData.id
            ? { ...a, ...artifactData, updatedAt: new Date() }
            : a
        )
      )
      if (viewingArtifact?.id === artifactData.id) {
        setViewingArtifact({ ...viewingArtifact, ...artifactData, updatedAt: new Date() } as Artifact)
      }
    } else {
      // Create new
      const newArtifact: Artifact = {
        id: Date.now().toString(),
        title: artifactData.title || "Untitled",
        content: artifactData.content || "",
        tags: artifactData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setArtifacts((prev) => [newArtifact, ...prev])
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this artifact?")) {
      setArtifacts((prev) => prev.filter((a) => a.id !== id))
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
