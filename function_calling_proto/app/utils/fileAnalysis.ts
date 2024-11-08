import { FileData } from '../types/message';
import { Anthropic } from '@anthropic-ai/sdk';

export const analyzeFileContents = async (fileData: FileData, anthropic: Anthropic): Promise<FileData> => {
  try {
    // Extract filename without extension and convert to readable format
    const fileNameWithoutExtension = fileData.fileName.split('.')[0]
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `I have a file named "${fileNameWithoutExtension}" containing the following data. 
              The filename itself may provide context about the data's content.
              
              Please:
              1. Provide a brief summary (2-3 sentences) of what this data contains, considering both the filename and the actual data content
              2. List 3-5 key topics or themes present in this data, including any relevant topics suggested by the filename
              3. Format your response exactly like this:
                 Summary: [your summary here]
                 Topics: [comma-separated list of topics]

              Here's the data:
              ${Object.entries(fileData.sheets).map(([sheetName, data]) => `
                Sheet: ${sheetName}
                ${data.map(row => row.join(', ')).join('\n')}
              `).join('\n\n')}`
            }
          ]
        }
      ]
    });

    const analysisText = response.content[0].text;

    // Extract summary and topics using regex
    const summaryMatch = analysisText.match(/Summary:(.*?)(?=Topics:|$)/s);
    const topicsMatch = analysisText.match(/Topics:(.*?)(?=$)/s);

    const summary = summaryMatch ? summaryMatch[1].trim() : "No summary available";
    const topics = topicsMatch 
      ? topicsMatch[1]
          .trim()
          .split(',')
          .map(topic => topic.trim())
          .filter(topic => topic.length > 0)
      : [];

    // If no topics were found, make a second attempt focusing on filename
    if (topics.length === 0 && fileNameWithoutExtension) {
      const fallbackResponse = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Based on the filename "${fileNameWithoutExtension}", please suggest 3-5 likely topics or themes that might be present in this data. Format your response as a comma-separated list only.`
              }
            ]
          }
        ]
      });

      const fallbackTopics = fallbackResponse.content[0].text
        .split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);

      return {
        ...fileData,
        summary: summary || `Data file related to ${fileNameWithoutExtension}`,
        topics: fallbackTopics
      };
    }

    return {
      ...fileData,
      summary,
      topics
    };
  } catch (error) {
    console.error('Error analyzing file:', error);
    
    // Extract filename without extension as fallback
    const fileNameWithoutExtension = fileData.fileName.split('.')[0]
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      ...fileData,
      summary: `Data file related to ${fileNameWithoutExtension}`,
      topics: [fileNameWithoutExtension]
    };
  }
};