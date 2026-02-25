"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Message as MessageType } from "@/lib/types"
import { cn, segmentTextWithArtifacts } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Copy, ChevronDown, ChevronUp, Wrench } from "lucide-react"
import { ArtifactLink } from "./ArtifactLink"

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user"
  const [showTools, setShowTools] = useState(true)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
  }

  // Parse message content for artifact references
  const contentSegments = segmentTextWithArtifacts(message.content)

  // Get tool calls from metadata
  const toolCalls = message.metadata?.toolCalls || []

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg group",
        isUser ? "bg-muted/50" : "bg-background"
      )}
    >
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-secondary"}>
          {isUser ? "U" : "A"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">
              {isUser ? "You" : "Assistant"}
            </p>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {contentSegments.map((segment, index) => {
                if (segment.type === 'artifact' && segment.artifactId && segment.displayText) {
                  return (
                    <ArtifactLink
                      key={index}
                      artifactId={segment.artifactId}
                      displayText={segment.displayText}
                    />
                  )
                }
                return (
                  <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
                    {segment.content}
                  </ReactMarkdown>
                )
              })}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {toolCalls.length > 0 && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={() => setShowTools(!showTools)}
            >
              <Wrench className="h-3 w-3 mr-1" />
              Tools ({toolCalls.length})
              {showTools ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              )}
            </Button>
            {showTools && (
              <div className="text-xs border-l-2 border-blue-500/30 pl-3 mt-2 space-y-3">
                {toolCalls.map((tool, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3 w-3 text-blue-500" />
                      <p className="font-medium text-foreground">{tool.name}</p>
                    </div>

                    {tool.args && Object.keys(tool.args).length > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1 font-medium">Input:</p>
                        <pre className="text-muted-foreground bg-muted/50 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(tool.args, null, 2)}
                        </pre>
                      </div>
                    )}

                    {tool.result ? (
                      <div>
                        <p className="text-muted-foreground mb-1 font-medium">Output:</p>
                        <pre className="text-muted-foreground bg-green-500/10 p-2 rounded text-xs overflow-x-auto border border-green-500/20">
                          {JSON.stringify(
                            // Extract the actual output from the nested structure
                            typeof tool.result === 'object' && tool.result !== null && 'result' in tool.result
                              ? (tool.result as any).result
                              : tool.result,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
