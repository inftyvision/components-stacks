import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const filePath = path.join(process.cwd(), 'public', 'sample.json');
    
    await writeFile(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving JSON:', error);
    return NextResponse.json(
      { error: 'Failed to save JSON file' },
      { status: 500 }
    );
  }
} 