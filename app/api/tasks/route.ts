import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // In production, this would be a database or external source
    // For now, read from the local tasks.json
    const tasksPath = join(process.cwd(), 'data', 'tasks.json');
    const data = JSON.parse(readFileSync(tasksPath, 'utf-8'));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return NextResponse.json(
      { error: 'Failed to load tasks' },
      { status: 500 }
    );
  }
}
