"use client"

import { ChatContainer } from "@/components/chat/ChatContainer"
import { useChatContext } from "@/contexts"

export default function ChatPage() {
  const {
    sessions,
    currentSession,
    streaming,
    createSession,
    setCurrentSession,
    sendMessage,
    deleteSession,
    updateSessionTitle,
  } = useChatContext()

  const handleCreateSession = async () => {
    const newSession = await createSession("New Chat")
    await setCurrentSession(newSession.id)
  }

  const handleSelectSession = async (sessionId: string) => {
    await setCurrentSession(sessionId)
  }

  const handleSendMessage = async (content: string) => {
    try {
      // Create a session if none exists
      if (!currentSession) {
        const newSession = await createSession("New Chat")
        await setCurrentSession(newSession.id)
        // Send message with the new session ID
        await sendMessage(content, newSession.id)
      } else {
        // Send message to current session
        await sendMessage(content)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId)
    } catch (error) {
      console.error("Failed to delete session:", error)
    }
  }

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      await updateSessionTitle(sessionId, newTitle)
    } catch (error) {
      console.error("Failed to rename session:", error)
    }
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
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        isThinking={streaming}
      />
    </div>
  )
}
