"use client"

import { useState } from "react"
import { ChatSession } from "@/lib/types"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { ThinkingIndicator } from "./ThinkingIndicator"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, MessageSquare, MoreVertical, Trash2, Edit2 } from "lucide-react"
import { useChatContext } from "@/contexts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ChatContainerProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onCreateSession: () => void
  onSelectSession: (sessionId: string) => void
  onSendMessage: (content: string) => void
  onDeleteSession: (sessionId: string) => void
  onRenameSession: (sessionId: string, newTitle: string) => void
  isThinking?: boolean
}

export function ChatContainer({
  sessions,
  currentSessionId,
  onCreateSession,
  onSelectSession,
  onSendMessage,
  onDeleteSession,
  onRenameSession,
  isThinking = false,
}: ChatContainerProps) {
  const { messages } = useChatContext()
  const currentSession = sessions.find((s) => s.id === currentSessionId)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [sessionToRename, setSessionToRename] = useState<ChatSession | null>(null)
  const [newTitle, setNewTitle] = useState("")

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete)
      setSessionToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const handleRenameClick = (session: ChatSession) => {
    setSessionToRename(session)
    setNewTitle(session.title)
    setRenameDialogOpen(true)
  }

  const handleConfirmRename = () => {
    if (sessionToRename && newTitle.trim()) {
      onRenameSession(sessionToRename.id, newTitle.trim())
      setSessionToRename(null)
      setNewTitle("")
    }
    setRenameDialogOpen(false)
  }

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
                <div key={session.id} className="flex items-center gap-1 group">
                  <Button
                    variant={session.id === currentSessionId ? "secondary" : "ghost"}
                    className="flex-1 justify-start"
                    onClick={() => onSelectSession(session.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">{session.title}</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRenameClick(session)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(session.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone and all messages will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat session.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="chat-title" className="sr-only">
              Chat Title
            </Label>
            <Input
              id="chat-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter chat title"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTitle.trim()) {
                  handleConfirmRename()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRename} disabled={!newTitle.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
