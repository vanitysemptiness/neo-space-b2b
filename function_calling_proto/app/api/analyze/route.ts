import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FileData } from '@/app/types/message';
import { analyzeFileContents } from '@/app/utils/fileAnalysis';

export async function POST(req: Request) {
  try {
    const fileData: FileData = await req.json();
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const analyzedData = await analyzeFileContents(fileData, anthropic);
    return NextResponse.json(analyzedData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze file' },
      { status: 500 }
    );
  }
}