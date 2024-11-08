import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FileData } from '@/app/types/message';

export async function POST(req: Request) {
  try {
    const { prompt, files } = await req.json();
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Ask Claude to check if the uploaded files are relevant to the request
    const analysisResponse = await anthropic.messages.create({
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

              First, determine if any of these files contain relevant data for the user's request.
              If not relevant, explain what kind of data would be needed.
              
              Return your response in this exact format:
              {
                "hasRelevantData": boolean,
                "explanation": "Your explanation here"
              }`
            }
          ]
        }
      ]
    });

    try {
      // Extract the JSON response from Claude
      const jsonMatch = analysisResponse.content[0].text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return NextResponse.json(analysis);
      }
    } catch (error) {
      console.error('Error parsing relevance analysis:', error);
    }

    // Fallback response if parsing fails
    return NextResponse.json({
      hasRelevantData: false,
      explanation: "I apologize, but I couldn't properly analyze the relevance of your files. Please try rephrasing your request or upload different data files."
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      hasRelevantData: false,
      explanation: "An error occurred while checking data relevance. Please try again."
    });
  }
}