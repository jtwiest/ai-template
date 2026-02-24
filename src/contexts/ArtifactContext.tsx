"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Artifact } from '@/lib/types';

interface ArtifactContextType {
  artifacts: Artifact[];
  currentArtifact: Artifact | null;
  loading: boolean;
  error: string | null;

  loadArtifacts: () => Promise<void>;
  getArtifact: (id: string) => Promise<Artifact | null>;
  createArtifact: (title: string, content: string, tags?: string[]) => Promise<Artifact>;
  updateArtifact: (id: string, updates: Partial<Omit<Artifact, 'id' | 'createdAt'>>) => Promise<Artifact>;
  deleteArtifact: (id: string) => Promise<void>;
  searchArtifacts: (query: string) => Promise<void>;
  setCurrentArtifact: (artifact: Artifact | null) => void;
}

const ArtifactContext = createContext<ArtifactContextType | undefined>(undefined);

export function ArtifactProvider({ children }: { children: React.ReactNode }) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all artifacts
  const loadArtifacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/artifacts');
      if (!response.ok) throw new Error('Failed to load artifacts');
      const data = await response.json();
      setArtifacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artifacts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific artifact
  const getArtifact = useCallback(async (id: string): Promise<Artifact | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/artifacts/${id}`);
      if (!response.ok) throw new Error('Failed to load artifact');
      const artifact = await response.json();
      return artifact;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artifact');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new artifact
  const createArtifact = useCallback(async (
    title: string,
    content: string,
    tags: string[] = []
  ): Promise<Artifact> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags }),
      });
      if (!response.ok) throw new Error('Failed to create artifact');
      const newArtifact = await response.json();
      setArtifacts(prev => [newArtifact, ...prev]);
      return newArtifact;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create artifact';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an artifact
  const updateArtifact = useCallback(async (
    id: string,
    updates: Partial<Omit<Artifact, 'id' | 'createdAt'>>
  ): Promise<Artifact> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/artifacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update artifact');
      const updatedArtifact = await response.json();
      setArtifacts(prev => prev.map(a => a.id === id ? updatedArtifact : a));
      if (currentArtifact?.id === id) {
        setCurrentArtifact(updatedArtifact);
      }
      return updatedArtifact;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update artifact';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentArtifact]);

  // Delete an artifact
  const deleteArtifact = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/artifacts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete artifact');
      setArtifacts(prev => prev.filter(a => a.id !== id));
      if (currentArtifact?.id === id) {
        setCurrentArtifact(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete artifact');
    } finally {
      setLoading(false);
    }
  }, [currentArtifact]);

  // Search artifacts
  const searchArtifacts = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/artifacts?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search artifacts');
      const data = await response.json();
      setArtifacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search artifacts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load artifacts on mount
  useEffect(() => {
    loadArtifacts();
  }, [loadArtifacts]);

  const value: ArtifactContextType = {
    artifacts,
    currentArtifact,
    loading,
    error,
    loadArtifacts,
    getArtifact,
    createArtifact,
    updateArtifact,
    deleteArtifact,
    searchArtifacts,
    setCurrentArtifact,
  };

  return <ArtifactContext.Provider value={value}>{children}</ArtifactContext.Provider>;
}

export function useArtifactContext() {
  const context = useContext(ArtifactContext);
  if (context === undefined) {
    throw new Error('useArtifactContext must be used within an ArtifactProvider');
  }
  return context;
}
