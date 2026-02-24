"use client"

import { ChatSession } from "@/lib/types"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { ThinkingIndicator } from "./ThinkingIndicator"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, MessageSquare } from "lucide-react"
import { useChatContext } from "@/contexts"

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
  const { messages } = useChatContext()
  const currentSession = sessions.find((s) => s.id === currentSessionId)

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
          <>
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center max-w-md px-4">
                <MessageSquare className="h-16 w-16 mx-auto mb-6 opacity-50" />
                <h2 className="text-2xl font-semibold mb-3 text-foreground">Welcome to AI Chat</h2>
                <p className="mb-4">Start a conversation by typing a message below, or select an existing chat from the sidebar.</p>
                <p className="text-sm">Your first message will automatically create a new chat session.</p>
              </div>
            </div>
            <MessageInput onSendMessage={onSendMessage} disabled={isThinking} />
          </>
        )}
      </Card>
    </div>
  )
}
