import { NextRequest, NextResponse } from 'next/server';
import { artifactStorage } from '@/lib/storage';

// GET /api/artifacts - Get all artifacts or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let artifacts;
    if (query) {
      artifacts = await artifactStorage.searchArtifacts(query);
    } else {
      artifacts = await artifactStorage.getArtifacts();
    }

    return NextResponse.json(artifacts);
  } catch (error) {
    console.error('Failed to get artifacts:', error);
    return NextResponse.json({ error: 'Failed to get artifacts' }, { status: 500 });
  }
}

// POST /api/artifacts - Create a new artifact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, tags = [] } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const artifact = await artifactStorage.createArtifact({ title, content, tags });
    return NextResponse.json(artifact, { status: 201 });
  } catch (error) {
    console.error('Failed to create artifact:', error);
    return NextResponse.json({ error: 'Failed to create artifact' }, { status: 500 });
  }
}
