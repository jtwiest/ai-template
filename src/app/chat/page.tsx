"use client"

import { useEffect } from "react"
import { ChatContainer } from "@/components/chat/ChatContainer"
import { useChatContext } from "@/contexts"

export default function ChatPage() {
  const {
    sessions,
    currentSession,
    loading,
    createSession,
    setCurrentSession,
    sendMessage,
  } = useChatContext()

  // Create a default session if none exist
  useEffect(() => {
    if (!loading && sessions.length === 0) {
      createSession("Welcome Chat")
    }
  }, [loading, sessions.length, createSession])

  const handleCreateSession = async () => {
    const newSession = await createSession("New Chat")
    await setCurrentSession(newSession.id)
  }

  const handleSelectSession = async (sessionId: string) => {
    await setCurrentSession(sessionId)
  }

  const handleSendMessage = async (content: string) => {
    await sendMessage(content)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Chat</h1>
      <ChatContainer
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        onCreateSession={handleCreateSession}
        onSelectSession={handleSelectSession}
        onSendMessage={handleSendMessage}
        isThinking={loading}
      />
    </div>
  )
}
