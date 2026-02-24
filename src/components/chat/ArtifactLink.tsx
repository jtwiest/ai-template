"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useArtifactContext } from "@/contexts/ArtifactContext"

interface ArtifactLinkProps {
  artifactId: string
  displayText: string
  showPreview?: boolean
}

export function ArtifactLink({ artifactId, displayText, showPreview = true }: ArtifactLinkProps) {
  const [showPreviewContent, setShowPreviewContent] = useState(false)
  const { artifacts } = useArtifactContext()

  const artifact = artifacts.find(a => a.id === artifactId)

  if (!artifact) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <FileText className="h-3 w-3" />
        <span className="text-xs">{displayText} (not found)</span>
      </span>
    )
  }

  return (
    <span className="inline-block">
      <Link
        href={`/artifacts?id=${artifactId}`}
        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
      >
        <FileText className="h-3 w-3" />
        <span className="text-sm font-medium">{displayText}</span>
      </Link>

      {showPreview && (
        <span className="ml-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1 text-xs"
            onClick={() => setShowPreviewContent(!showPreviewContent)}
          >
            {showPreviewContent ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>

          {showPreviewContent && (
            <div className="mt-2 p-3 bg-muted/50 rounded-md border text-xs">
              <p className="font-semibold mb-1">{artifact.title}</p>
              <div className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                {artifact.content.substring(0, 300)}
                {artifact.content.length > 300 && '...'}
              </div>
              {artifact.tags.length > 0 && (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {artifact.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </span>
      )}
    </span>
  )
}
