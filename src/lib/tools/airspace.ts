import type { AgentTool, ToolSet } from './types';

const AIRCONTROL_API_URL = process.env.AIRCONTROL_API_URL;
const AIRCONTROL_API_TOKEN = process.env.AIRCONTROL_API_TOKEN;

/**
 * Get available airspace data sources
 */
const getAirspaceSourcesTool: AgentTool = {
  definition: {
    name: 'getAirspaceSources',
    description: 'Get a list of available airspace data sources.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  execute: async () => {
    if (!AIRCONTROL_API_URL || !AIRCONTROL_API_TOKEN) {
      return { error: 'Airspace API not configured. Missing AIRCONTROL_API_URL or AIRCONTROL_API_TOKEN.' };
    }

    const response = await fetch(`${AIRCONTROL_API_URL}/ai/airspace/sources`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRCONTROL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { error: `Failed to fetch airspace sources: ${response.status} ${response.statusText}` };
    }

    const sources = await response.json();
    console.log(`getAirspaceSources result: ${Array.isArray(sources) ? sources.length : 0} sources found`);
    return sources;
  },
};

/**
 * Get airspace source data within a bounding box
 */
const getAirspaceSourceDataTool: AgentTool = {
  definition: {
    name: 'getAirspaceSourceData',
    description: 'Get feature collection data from a specific airspace source within a bounding box. Returns GeoJSON features. Max 1000 square miles.',
    input_schema: {
      type: 'object',
      properties: {
        source_handle: {
          type: 'string',
          description: 'The handle/identifier of the data source to query',
        },
        bbox: {
          type: 'string',
          description: 'Bounding box as sw_lng,sw_lat,ne_lng,ne_lat (max 100 sq miles). Example: "-75.25,39.90,-75.10,40.00"',
        },
      },
      required: ['source_handle', 'bbox'],
    },
  },
  execute: async (input) => {
    if (!AIRCONTROL_API_URL || !AIRCONTROL_API_TOKEN) {
      return { error: 'Airspace API not configured. Missing AIRCONTROL_API_URL or AIRCONTROL_API_TOKEN.' };
    }

    const sourceHandle = input.source_handle as string;
    const bbox = input.bbox as string;

    const url = `${AIRCONTROL_API_URL}/ai/airspace/sources/${encodeURIComponent(sourceHandle)}?bbox=${encodeURIComponent(bbox)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRCONTROL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { error: `Failed to fetch airspace data: ${response.status} ${response.statusText}` };
    }

    const featureCollection = await response.json();
    const featureCount = featureCollection?.features?.length ?? 0;
    console.log(`getAirspaceSourceData result: ${featureCount} features found for source "${sourceHandle}"`);
    return featureCollection;
  },
};

/**
 * Airspace tools - Query airspace data sources
 */
export const airspaceTools: ToolSet = {
  name: 'airspace',
  description: 'Tools for querying airspace data sources and retrieving geographic feature data',
  tools: [
    getAirspaceSourcesTool,
    getAirspaceSourceDataTool,
  ],
};
