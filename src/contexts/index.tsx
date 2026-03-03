"use client";

import React from 'react';
import { ChatProvider } from './ChatContext';
import { ArtifactProvider } from './ArtifactContext';
import { WorkflowProvider } from './WorkflowContext';
import { MapLayerProvider } from './MapLayerContext';
import { MapProvider } from './MapContext';

// Combined provider component
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <ArtifactProvider>
        <WorkflowProvider>
          <MapLayerProvider>
            <MapProvider>
                {children}
            </MapProvider>
          </MapLayerProvider>
        </WorkflowProvider>
      </ArtifactProvider>
    </ChatProvider>
  );
}

// Export individual providers and hooks
export { ChatProvider, useChatContext } from './ChatContext';
export { ArtifactProvider, useArtifactContext } from './ArtifactContext';
export { WorkflowProvider, useWorkflowContext } from './WorkflowContext';
