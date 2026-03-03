"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MapLayer, MapLayerSource, GeoJSONFeatureCollection } from '@/lib/types';

interface MapLayerContextType {
  mapLayers: MapLayer[];
  currentMapLayer: MapLayer | null;
  loading: boolean;
  error: string | null;

  loadMapLayers: () => Promise<void>;
  getMapLayer: (id: string) => Promise<MapLayer | null>;
  createMapLayer: (
    title: string,
    styles: Record<string, unknown>,
    sources: MapLayerSource[],
    featureCollection: GeoJSONFeatureCollection
  ) => Promise<MapLayer>;
  updateMapLayer: (id: string, updates: Partial<Omit<MapLayer, 'id' | 'createdAt'>>) => Promise<MapLayer>;
  deleteMapLayer: (id: string) => Promise<void>;
  searchMapLayers: (query: string) => Promise<void>;
  setCurrentMapLayer: (layer: MapLayer | null) => void;
}

const MapLayerContext = createContext<MapLayerContextType | undefined>(undefined);

export function MapLayerProvider({ children }: { children: React.ReactNode }) {
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([]);
  const [currentMapLayer, setCurrentMapLayer] = useState<MapLayer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all map layers
  const loadMapLayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/map-layers');
      if (!response.ok) throw new Error('Failed to load map layers');
      const data = await response.json();
      setMapLayers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load map layers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific map layer
  const getMapLayer = useCallback(async (id: string): Promise<MapLayer | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/map-layers/${id}`);
      if (!response.ok) throw new Error('Failed to load map layer');
      const layer = await response.json();
      return layer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load map layer');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new map layer
  const createMapLayer = useCallback(async (
    title: string,
    styles: Record<string, unknown>,
    sources: MapLayerSource[],
    featureCollection: GeoJSONFeatureCollection
  ): Promise<MapLayer> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/map-layers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, styles, sources, featureCollection }),
      });
      if (!response.ok) throw new Error('Failed to create map layer');
      const newLayer = await response.json();
      setMapLayers(prev => [newLayer, ...prev]);
      return newLayer;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create map layer';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a map layer
  const updateMapLayer = useCallback(async (
    id: string,
    updates: Partial<Omit<MapLayer, 'id' | 'createdAt'>>
  ): Promise<MapLayer> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/map-layers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update map layer');
      const updatedLayer = await response.json();
      setMapLayers(prev => prev.map(l => l.id === id ? updatedLayer : l));
      if (currentMapLayer?.id === id) {
        setCurrentMapLayer(updatedLayer);
      }
      return updatedLayer;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update map layer';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentMapLayer]);

  // Delete a map layer
  const deleteMapLayer = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/map-layers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete map layer');
      setMapLayers(prev => prev.filter(l => l.id !== id));
      if (currentMapLayer?.id === id) {
        setCurrentMapLayer(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete map layer');
    } finally {
      setLoading(false);
    }
  }, [currentMapLayer]);

  // Search map layers
  const searchMapLayers = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/map-layers?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search map layers');
      const data = await response.json();
      setMapLayers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search map layers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load map layers on mount
  useEffect(() => {
    loadMapLayers();
  }, [loadMapLayers]);

  const value: MapLayerContextType = {
    mapLayers,
    currentMapLayer,
    loading,
    error,
    loadMapLayers,
    getMapLayer,
    createMapLayer,
    updateMapLayer,
    deleteMapLayer,
    searchMapLayers,
    setCurrentMapLayer,
  };

  return <MapLayerContext.Provider value={value}>{children}</MapLayerContext.Provider>;
}

export function useMapLayerContext() {
  const context = useContext(MapLayerContext);
  if (context === undefined) {
    throw new Error('useMapLayerContext must be used within a MapLayerProvider');
  }
  return context;
}
