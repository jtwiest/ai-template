"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatSession, Message } from '@/lib/types';

interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: Message[];
  loading: boolean;
  streaming: boolean;
  error: string | null;

  // Session operations
  loadSessions: () => Promise<void>;
  createSession: (title: string) => Promise<ChatSession>;
  setCurrentSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;

  // Message operations
  sendMessage: (content: string, sessionId?: string) => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSessionState] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all sessions
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/chat/sessions');
      if (!response.ok) throw new Error('Failed to load sessions');
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new session
  const createSession = useCallback(async (title: string): Promise<ChatSession> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error('Failed to create session');
      const newSession = await response.json();
      setSessions(prev => [newSession, ...prev]);
      return newSession;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set current session and load its messages
  const setCurrentSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/chat/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to load session');
      const session = await response.json();
      setCurrentSessionState(session);
      await loadMessages(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete session');
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSessionState(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error('Failed to update session');
      const updatedSession = await response.json();
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
      if (currentSession?.id === sessionId) {
        setCurrentSessionState(updatedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // Load messages for a session
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string, sessionId?: string) => {
    const targetSessionId = sessionId || currentSession?.id;

    if (!targetSessionId) {
      setError('No session selected');
      return;
    }

    try {
      setLoading(true);
      setStreaming(true);
      setError(null);

      // Create optimistic user message
      const optimisticUserMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, optimisticUserMessage]);

      // Stream the AI response
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: targetSessionId,
          messages: [{ role: 'user', content }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      // Track current assistant message being built
      let currentMessageId: string | null = null;
      let currentContent = '';
      let currentToolCalls: Array<{
        name: string
        args: Record<string, unknown>
        result?: unknown
      }> = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          try {
            const jsonStr = line.substring(6); // Remove 'data: ' prefix
            const event = JSON.parse(jsonStr);

            console.log('Stream event:', event);

            if (event.type === 'text') {
              // Text content from Anthropic SDK
              currentContent += event.content;

              // If we have a current message, update it
              if (currentMessageId) {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === currentMessageId
                      ? {
                          ...msg,
                          content: currentContent,
                        }
                      : msg
                  )
                );
              } else {
                // Create new message for this text
                currentMessageId = `temp-assistant-${Date.now()}-${Math.random()}`;
                const newMessage: Message = {
                  id: currentMessageId,
                  role: 'assistant',
                  content: currentContent,
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, newMessage]);
              }
            } else if (event.type === 'tool_call') {
              // Tool call event - finalize current text message and start tool section
              console.log('Tool call:', event.name, event.args);

              // If we had text content, finalize that message
              if (currentMessageId && currentContent) {
                currentMessageId = null;
                currentContent = '';
              }

              const toolCall = {
                name: event.name,
                args: event.args || {},
                result: undefined,
              };
              currentToolCalls.push(toolCall);

              // Create a new message to show the tool call
              const toolMessageId = `temp-tool-${Date.now()}-${Math.random()}`;
              const toolMessage: Message = {
                id: toolMessageId,
                role: 'assistant',
                content: '', // No text content for tool-only messages
                timestamp: new Date(),
                metadata: { toolCalls: [toolCall] },
              };
              setMessages(prev => [...prev, toolMessage]);

              // Reset for next text response
              currentMessageId = null;
              currentContent = '';
            } else if (event.type === 'tool_result') {
              // Tool result event - update the tool call message
              console.log('Tool result:', event.name, event.result);

              // Find the tool call message and update it with the result
              setMessages(prev =>
                prev.map(msg => {
                  if (msg.metadata?.toolCalls) {
                    const toolCallIndex = msg.metadata.toolCalls.findIndex(
                      tc => tc.name === event.name && !tc.result
                    );
                    if (toolCallIndex >= 0) {
                      const updatedToolCalls = [...msg.metadata.toolCalls];
                      updatedToolCalls[toolCallIndex] = {
                        ...updatedToolCalls[toolCallIndex],
                        result: event.result,
                      };
                      return {
                        ...msg,
                        metadata: { toolCalls: updatedToolCalls },
                      };
                    }
                  }
                  return msg;
                })
              );
            } else if (event.type === 'done') {
              // Stream complete
              console.log('Stream complete');
            } else if (event.type === 'error') {
              // Error occurred
              throw new Error(event.error || 'Unknown streaming error');
            }
          } catch (e) {
            console.error('Error parsing stream event:', e);
          }
        }
      }

      // Reload messages from server to get the saved versions with proper IDs
      await loadMessages(targetSessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove optimistic messages on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }, [currentSession, loadMessages]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const value: ChatContextType = {
    sessions,
    currentSession,
    messages,
    loading,
    streaming,
    error,
    loadSessions,
    createSession,
    setCurrentSession,
    deleteSession,
    updateSessionTitle,
    sendMessage,
    loadMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
