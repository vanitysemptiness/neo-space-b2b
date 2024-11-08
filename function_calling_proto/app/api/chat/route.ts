import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FileData } from '@/app/types/message';

export async function POST(req: Request) {
  try {
    const { prompt, files } = await req.json();
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const isReportRequest = prompt.toLowerCase().includes('generate') || 
                           prompt.toLowerCase().includes('create') ||
                           prompt.toLowerCase().includes('combine');

    if (isReportRequest && files.length > 0) {
      // First, ask Claude to analyze which files are relevant to the request
      const fileAnalysisResponse = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `User request: "${prompt}"

                Available files:
                ${files.map(file => `
                  Filename: ${file.fileName}
                  Topics: ${file.topics?.join(', ')}
                  Summary: ${file.summary}
                `).join('\n\n')}

                Please analyze which files are most relevant to the user's request.
                Return your response in this exact format:
                {
                  "relevantFiles": [
                    {
                      "fileName": "name of file",
                      "relevance": "brief explanation of why this file is relevant",
                      "relevanceScore": number between 0 and 1
                    }
                  ]
                }
                Only include files with relevanceScore > 0.3. Order by relevanceScore descending.`
              }
            ]
          }
        ]
      });

      let relevantFilesAnalysis;
      try {
        // Extract the JSON response from Claude
        const jsonMatch = fileAnalysisResponse.content[0].text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          relevantFilesAnalysis = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Error parsing file analysis response:', error);
        relevantFilesAnalysis = { relevantFiles: [] };
      }

      if (!relevantFilesAnalysis?.relevantFiles?.length) {
        return NextResponse.json({
          content: [{
            type: "text",
            text: "I couldn't find any relevant files in your uploaded data for this request. Please upload files containing this information if you'd like me to generate a report."
          }]
        });
      }

      // Get the full file data for relevant files
      const relevantFiles = files.filter(file => 
        relevantFilesAnalysis.relevantFiles.some(
          relevantFile => relevantFile.fileName === file.fileName
        )
      );

      // Create system message with relevant file data and relevance explanations
      const systemMessage = `You have access to the following relevant files:
        ${relevantFilesAnalysis.relevantFiles.map(relevantFile => {
          const fullFile = files.find(f => f.fileName === relevantFile.fileName);
          return `
            File: ${relevantFile.fileName}
            Relevance: ${relevantFile.relevance}
            Relevance Score: ${(relevantFile.relevanceScore * 100).toFixed(1)}%
            Summary: ${fullFile?.summary}
            Data: ${JSON.stringify(fullFile?.sheets, null, 2)}
          `;
        }).join('\n\n')}
        
        Please analyze these files and generate a response that combines their information as requested.
        If creating a new dataset, format it as a CSV string.
        Consider the relevance explanations and scores when deciding how much weight to give to each file's data.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        temperature: 0,
        system: systemMessage,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      });

      return NextResponse.json(response);
    } else {
      // Regular chat message handling
      const systemMessage = files.length > 0 
        ? `You have access to the following files:
           ${files.map(file => `
             File: ${file.fileName}
             Summary: ${file.summary}
             Data: ${JSON.stringify(file.sheets, null, 2)}
           `).join('\n\n')}` 
        : undefined;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0,
        system: systemMessage,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      });

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch response from Claude' },
      { status: 500 }
    );
  }
}