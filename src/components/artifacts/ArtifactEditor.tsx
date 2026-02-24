"use client"

import { useState, useEffect } from "react"
import { Artifact } from "@/lib/types"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ArtifactEditorProps {
  artifact?: Artifact
  open: boolean
  onClose: () => void
  onSave: (artifact: Partial<Artifact>) => void
}

export function ArtifactEditor({ artifact, open, onClose, onSave }: ArtifactEditorProps) {
  const [title, setTitle] = useState(artifact?.title || "")
  const [content, setContent] = useState(artifact?.content || "")
  const [tags, setTags] = useState(artifact?.tags.join(", ") || "")

  // Update state when artifact prop changes
  useEffect(() => {
    setTitle(artifact?.title || "")
    setContent(artifact?.content || "")
    setTags(artifact?.tags.join(", ") || "")
  }, [artifact])

  const handleSave = () => {
    onSave({
      id: artifact?.id,
      title,
      content,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    })
    handleClose()
  }

  const handleClose = () => {
    setTitle(artifact?.title || "")
    setContent(artifact?.content || "")
    setTags(artifact?.tags.join(", ") || "")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{artifact ? "Edit Artifact" : "Create Artifact"}</DialogTitle>
          <DialogDescription>
            {artifact
              ? "Make changes to your artifact"
              : "Create a new markdown artifact"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter artifact title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., documentation, api, tutorial"
            />
          </div>

          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="space-y-2">
              <Label htmlFor="content">Content (Markdown)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Your markdown content here..."
                className="min-h-[300px] font-mono"
              />
            </TabsContent>
            <TabsContent value="preview" className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-md p-4 min-h-[300px] prose prose-sm dark:prose-invert max-w-none overflow-auto">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <span className="text-muted-foreground">Nothing to preview</span>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {artifact ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
