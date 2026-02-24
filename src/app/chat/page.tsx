"use client"

import { useState } from "react"
import { ChatContainer } from "@/components/chat/ChatContainer"
import { ChatSession, Message } from "@/lib/types"

// Mock data for demonstration
const mockSessions: ChatSession[] = [
  {
    id: "1",
    title: "Welcome Chat",
    createdAt: new Date("2024-02-23T10:00:00"),
    updatedAt: new Date("2024-02-23T10:05:00"),
    messages: [
      {
        id: "1",
        role: "user",
        content: "Hello! Can you help me understand what this template does?",
        timestamp: new Date("2024-02-23T10:00:00"),
      },
      {
        id: "2",
        role: "assistant",
        content: "Of course! This AI MVP Template provides three main features:\n\n1. **Chat**: Where we are now - conversational interface with AI agents\n2. **Artifacts**: Document management system for markdown files\n3. **Workflows**: Integration with Temporal for running complex workflows\n\nAll three features work together to create powerful AI applications. Would you like to know more about any specific feature?",
        timestamp: new Date("2024-02-23T10:00:30"),
      },
    ],
  },
]

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(mockSessions)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>("1")
  const [isThinking, setIsThinking] = useState(false)

  const handleCreateSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    }
    setSessions([newSession, ...sessions])
    setCurrentSessionId(newSession.id)
  }

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }

  const handleSendMessage = (content: string) => {
    if (!currentSessionId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, userMessage],
              updatedAt: new Date(),
              title:
                session.messages.length === 0
                  ? content.slice(0, 50)
                  : session.title,
            }
          : session
      )
    )

    // Simulate AI response
    setIsThinking(true)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "This is a mock response. In the next phase, we'll integrate the actual AI SDK here to provide real responses!",
        timestamp: new Date(),
      }

      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: [...session.messages, assistantMessage],
                updatedAt: new Date(),
              }
            : session
        )
      )
      setIsThinking(false)
    }, 1500)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Chat</h1>
      <ChatContainer
        sessions={sessions}
        currentSessionId={currentSessionId}
        onCreateSession={handleCreateSession}
        onSelectSession={handleSelectSession}
        onSendMessage={handleSendMessage}
        isThinking={isThinking}
      />
    </div>
  )
}
