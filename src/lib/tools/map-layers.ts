import { mapLayerStorage } from '@/lib/storage';
import type { AgentTool, ToolSet } from './types';
import type { MapLayerSource, GeoJSONFeatureCollection } from '@/lib/types';

/**
 * Search for map layers by query
 */
const searchMapLayersTool: AgentTool = {
  definition: {
    name: 'searchMapLayers',
    description: 'Search for map layers by query string. Searches in title, styles, and feature collections. If no query is provided, returns all map layers.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional search query to filter map layers. If omitted, returns all map layers.',
        },
      },
    },
  },
  execute: async (input) => {
    const query = input.query as string | undefined;
    let layers;

    if (query && query.trim().length > 0) {
      layers = await mapLayerStorage.searchMapLayers(query);
    } else {
      layers = await mapLayerStorage.getMapLayers();
    }

    const result = {
      results: layers.map(l => ({
        id: l.id,
        title: l.title,
        sourceCount: l.sources.length,
        featureCount: l.featureCollection.features.length,
        createdAt: typeof l.createdAt === 'string' ? l.createdAt : l.createdAt.toISOString(),
        updatedAt: typeof l.updatedAt === 'string' ? l.updatedAt : l.updatedAt.toISOString(),
      })),
      count: layers.length,
    };

    console.log(`searchMapLayers result: ${result.count} map layers found`);
    return result;
  },
};

/**
 * Get a specific map layer by ID
 */
const getMapLayerTool: AgentTool = {
  definition: {
    name: 'getMapLayer',
    description: 'Get a specific map layer by ID to read its full content including styles, sources, and feature collection.',
    input_schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the map layer to retrieve',
        },
      },
      required: ['id'],
    },
  },
  execute: async (input) => {
    const id = input.id as string;
    const layer = await mapLayerStorage.getMapLayer(id);

    if (!layer) {
      return { error: 'Map layer not found' };
    }

    console.log(`getMapLayer result: Found map layer "${layer.title}"`);
    return {
      id: layer.id,
      title: layer.title,
      styles: layer.styles,
      sources: layer.sources,
      featureCollection: layer.featureCollection,
      createdAt: typeof layer.createdAt === 'string' ? layer.createdAt : layer.createdAt.toISOString(),
      updatedAt: typeof layer.updatedAt === 'string' ? layer.updatedAt : layer.updatedAt.toISOString(),
    };
  },
};

/**
 * Create a new map layer
 */
const createMapLayerTool: AgentTool = {
  definition: {
    name: 'createMapLayer',
    description: 'Create a new map layer with title, styles (JSON object), sources (array of source objects), and a GeoJSON feature collection.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the map layer',
        },
        styles: {
          type: 'object',
          description: 'JSON object containing style configuration for the layer (e.g., colors, line widths, fill patterns)',
        },
        sources: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique identifier for the source' },
              type: { type: 'string', description: 'Type of source (e.g., "geojson", "vector", "raster")' },
              url: { type: 'string', description: 'Optional URL for the source data' },
              data: { type: 'object', description: 'Optional inline data for the source' },
            },
            required: ['id', 'type'],
          },
          description: 'Array of map data sources',
        },
        featureCollection: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['FeatureCollection'] },
            features: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['Feature'] },
                  geometry: { type: 'object' },
                  properties: { type: 'object' },
                },
              },
            },
          },
          description: 'GeoJSON FeatureCollection containing geographic features',
        },
      },
      required: ['title', 'styles', 'sources', 'featureCollection'],
    },
  },
  execute: async (input) => {
    const { title, styles, sources, featureCollection } = input;
    const layer = await mapLayerStorage.createMapLayer({
      title: title as string,
      styles: styles as Record<string, unknown>,
      sources: sources as MapLayerSource[],
      featureCollection: featureCollection as GeoJSONFeatureCollection,
    });

    console.log(`createMapLayer result: Created map layer "${layer.title}"`);
    return {
      id: layer.id,
      title: layer.title,
      message: `Created map layer "${layer.title}" with ID: ${layer.id}`,
    };
  },
};

/**
 * Update an existing map layer
 */
const updateMapLayerTool: AgentTool = {
  definition: {
    name: 'updateMapLayer',
    description: 'Update an existing map layer. You can update title, styles, sources, and/or featureCollection.',
    input_schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the map layer to update',
        },
        title: {
          type: 'string',
          description: 'New title for the map layer',
        },
        styles: {
          type: 'object',
          description: 'New styles JSON object (replaces existing styles)',
        },
        sources: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              url: { type: 'string' },
              data: { type: 'object' },
            },
            required: ['id', 'type'],
          },
          description: 'New sources array (replaces existing sources)',
        },
        featureCollection: {
          type: 'object',
          description: 'New GeoJSON FeatureCollection (replaces existing features)',
        },
      },
      required: ['id'],
    },
  },
  execute: async (input) => {
    const { id, title, styles, sources, featureCollection } = input;
    const updates: {
      title?: string;
      styles?: Record<string, unknown>;
      sources?: MapLayerSource[];
      featureCollection?: GeoJSONFeatureCollection;
    } = {};
    if (title !== undefined) updates.title = title as string;
    if (styles !== undefined) updates.styles = styles as Record<string, unknown>;
    if (sources !== undefined) updates.sources = sources as MapLayerSource[];
    if (featureCollection !== undefined) updates.featureCollection = featureCollection as GeoJSONFeatureCollection;

    const layer = await mapLayerStorage.updateMapLayer(id as string, updates);
    if (!layer) {
      return { error: 'Map layer not found' };
    }

    console.log(`updateMapLayer result: Updated map layer "${layer.title}"`);
    return {
      id: layer.id,
      title: layer.title,
      message: `Updated map layer "${layer.title}"`,
    };
  },
};

/**
 * Delete a map layer
 */
const deleteMapLayerTool: AgentTool = {
  definition: {
    name: 'deleteMapLayer',
    description: 'Delete a map layer by ID.',
    input_schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the map layer to delete',
        },
      },
      required: ['id'],
    },
  },
  execute: async (input) => {
    const id = input.id as string;

    const layer = await mapLayerStorage.getMapLayer(id);
    if (!layer) {
      return { error: 'Map layer not found' };
    }

    await mapLayerStorage.deleteMapLayer(id);
    console.log(`deleteMapLayer result: Deleted map layer "${layer.title}"`);
    return {
      id: layer.id,
      message: `Deleted map layer "${layer.title}"`,
    };
  },
};

/**
 * MapLayer tools - CRUD operations for map layers with GeoJSON data
 */
export const mapLayerTools: ToolSet = {
  name: 'mapLayers',
  description: 'Tools for creating, reading, updating, deleting, and searching map layers with GeoJSON data',
  tools: [
    searchMapLayersTool,
    getMapLayerTool,
    createMapLayerTool,
    updateMapLayerTool,
    deleteMapLayerTool,
  ],
};
