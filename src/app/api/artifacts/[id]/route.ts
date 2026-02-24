import { NextRequest, NextResponse } from 'next/server';
import { artifactStorage } from '@/lib/storage';

// GET /api/artifacts/[id] - Get a specific artifact
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const artifact = await artifactStorage.getArtifact(id);

    if (!artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }

    return NextResponse.json(artifact);
  } catch (error) {
    console.error('Failed to get artifact:', error);
    return NextResponse.json({ error: 'Failed to get artifact' }, { status: 500 });
  }
}

// PUT /api/artifacts/[id] - Update an artifact
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const artifact = await artifactStorage.updateArtifact(id, updates);
    return NextResponse.json(artifact);
  } catch (error) {
    console.error('Failed to update artifact:', error);
    return NextResponse.json({ error: 'Failed to update artifact' }, { status: 500 });
  }
}

// DELETE /api/artifacts/[id] - Delete an artifact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await artifactStorage.deleteArtifact(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete artifact:', error);
    return NextResponse.json({ error: 'Failed to delete artifact' }, { status: 500 });
  }
}
