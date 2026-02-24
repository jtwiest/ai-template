"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatSession, Message } from '@/lib/types';

interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: Message[];
  loading: boolean;
  error: string | null;

  // Session operations
  loadSessions: () => Promise<void>;
  createSession: (title: string) => Promise<ChatSession>;
  setCurrentSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;

  // Message operations
  sendMessage: (content: string) => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSessionState] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
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
  const sendMessage = useCallback(async (content: string) => {
    if (!currentSession) {
      setError('No session selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Add user message
      const userResponse = await fetch(`/api/chat/sessions/${currentSession.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content }),
      });
      if (!userResponse.ok) throw new Error('Failed to send message');
      const userMessage = await userResponse.json();
      setMessages(prev => [...prev, userMessage]);

      // TODO: In Phase 3, this will call the AI API and stream the response
      // For now, we'll add a mock assistant response
      setTimeout(async () => {
        const assistantResponse = await fetch(`/api/chat/sessions/${currentSession.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'assistant',
            content: 'This is a mock response. AI integration will be added in Phase 3.',
          }),
        });
        if (assistantResponse.ok) {
          const assistantMessage = await assistantResponse.json();
          setMessages(prev => [...prev, assistantMessage]);
        }
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const value: ChatContextType = {
    sessions,
    currentSession,
    messages,
    loading,
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
