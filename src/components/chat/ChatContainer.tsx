"use client"

import { useState } from "react"
import { Message as MessageType, ChatSession } from "@/lib/types"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { ThinkingIndicator } from "./ThinkingIndicator"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, MessageSquare } from "lucide-react"

interface ChatContainerProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onCreateSession: () => void
  onSelectSession: (sessionId: string) => void
  onSendMessage: (content: string) => void
  isThinking?: boolean
}

export function ChatContainer({
  sessions,
  currentSessionId,
  onCreateSession,
  onSelectSession,
  onSendMessage,
  isThinking = false,
}: ChatContainerProps) {
  const currentSession = sessions.find((s) => s.id === currentSessionId)
  const messages = currentSession?.messages || []

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Sessions Sidebar */}
      <Card className="w-64 p-4 flex flex-col">
        <Button onClick={onCreateSession} className="w-full mb-4">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <Separator className="mb-4" />
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No conversations yet
              </p>
            ) : (
              sessions.map((session) => (
                <Button
                  key={session.id}
                  variant={session.id === currentSessionId ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onSelectSession(session.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="truncate">{session.title}</span>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            <div className="border-b p-4">
              <h2 className="font-semibold">{currentSession.title}</h2>
            </div>
            <MessageList messages={messages} />
            {isThinking && <ThinkingIndicator />}
            <MessageInput onSendMessage={onSendMessage} disabled={isThinking} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation or start a new chat</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
