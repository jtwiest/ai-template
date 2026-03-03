import { NextRequest, NextResponse } from 'next/server';
import { mapLayerStorage } from '@/lib/storage';

// GET /api/map-layers/[id] - Get a specific map layer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const layer = await mapLayerStorage.getMapLayer(id);

    if (!layer) {
      return NextResponse.json({ error: 'Map layer not found' }, { status: 404 });
    }

    return NextResponse.json(layer);
  } catch (error) {
    console.error('Failed to get map layer:', error);
    return NextResponse.json({ error: 'Failed to get map layer' }, { status: 500 });
  }
}

// PUT /api/map-layers/[id] - Update a map layer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const layer = await mapLayerStorage.updateMapLayer(id, updates);
    return NextResponse.json(layer);
  } catch (error) {
    console.error('Failed to update map layer:', error);
    return NextResponse.json({ error: 'Failed to update map layer' }, { status: 500 });
  }
}

// DELETE /api/map-layers/[id] - Delete a map layer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await mapLayerStorage.deleteMapLayer(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete map layer:', error);
    return NextResponse.json({ error: 'Failed to delete map layer' }, { status: 500 });
  }
}
