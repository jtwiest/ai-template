"use client";

import { useEffect, useState } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ThinkingIndicator } from "@/components/chat/ThinkingIndicator";
import { useChatContext } from "@/contexts/ChatContext";
import { useArtifactContext } from "@/contexts/ArtifactContext";

export function DashboardChat() {
  const {
    sessions,
    currentSession,
    messages,
    streaming,
    loading,
    loadSessions,
    createSession,
    setCurrentSession,
    sendMessage,
  } = useChatContext();
  const { loadArtifacts } = useArtifactContext();

  // Track that we've kicked off the load so we know when to act on the result
  const [didLoad, setDidLoad] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  // Step 1: explicitly load sessions on mount
  useEffect(() => {
    loadSessions().then(() => setDidLoad(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2: once load completes and we don't have a current session, initialize one
  useEffect(() => {
    if (!didLoad || loading || setupDone || currentSession) return;
    setSetupDone(true);

    if (sessions.length === 0) {
      createSession("Dashboard").then((s) => setCurrentSession(s.id));
    } else {
      setCurrentSession(sessions[0].id);
    }
  }, [didLoad, loading, setupDone, currentSession, sessions, createSession, setCurrentSession]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <div className="flex flex-col flex-1 overflow-hidden min-h-0">
        <MessageList messages={messages} />
      </div>
      {streaming && <ThinkingIndicator />}
      <MessageInput
        onSendMessage={async (content) => {
          await sendMessage(content);
          loadArtifacts();
        }}
        disabled={streaming || !currentSession}
      />
    </div>
  );
}
