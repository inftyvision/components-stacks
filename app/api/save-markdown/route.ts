import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    const filePath = path.join(process.cwd(), 'public', 'sample.md');
    
    // Only normalize line endings, preserve all other formatting
    const normalizedContent = content
      .replace(/\r\n/g, '\n')  // Convert Windows line endings to Unix
      .replace(/\r/g, '\n');   // Convert remaining carriage returns
    
    await writeFile(filePath, normalizedContent);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving markdown:', error);
    return NextResponse.json(
      { error: 'Failed to save markdown file' },
      { status: 500 }
    );
  }
} 