import { NextResponse } from 'next/server';
import { workflowStorage } from '@/lib/storage';

// GET /api/workflows - Get all available workflows
export async function GET() {
  try {
    const workflows = await workflowStorage.getWorkflows();
    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Failed to get workflows:', error);
    return NextResponse.json({ error: 'Failed to get workflows' }, { status: 500 });
  }
}
