import { NextRequest, NextResponse } from 'next/server';
import { mapLayerStorage } from '@/lib/storage';

// GET /api/map-layers - Get all map layers or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let layers;
    if (query) {
      layers = await mapLayerStorage.searchMapLayers(query);
    } else {
      layers = await mapLayerStorage.getMapLayers();
    }

    return NextResponse.json(layers);
  } catch (error) {
    console.error('Failed to get map layers:', error);
    return NextResponse.json({ error: 'Failed to get map layers' }, { status: 500 });
  }
}

// POST /api/map-layers - Create a new map layer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, styles, sources = [], featureCollection } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!styles || typeof styles !== 'object') {
      return NextResponse.json({ error: 'Styles object is required' }, { status: 400 });
    }

    if (!featureCollection || featureCollection.type !== 'FeatureCollection') {
      return NextResponse.json({ error: 'Valid GeoJSON FeatureCollection is required' }, { status: 400 });
    }

    const layer = await mapLayerStorage.createMapLayer({
      title,
      styles,
      sources,
      featureCollection,
    });
    return NextResponse.json(layer, { status: 201 });
  } catch (error) {
    console.error('Failed to create map layer:', error);
    return NextResponse.json({ error: 'Failed to create map layer' }, { status: 500 });
  }
}
