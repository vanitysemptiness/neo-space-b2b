import Anthropic from '@anthropic-ai/sdk';

// Event types enum
const EventType = {
  MESSAGE_START: 'message_start',
  CONTENT_BLOCK_START: 'content_block_start',
  CONTENT_BLOCK_DELTA: 'content_block_delta',
  CONTENT_BLOCK_STOP: 'content_block_stop',
  MESSAGE_DELTA: 'message_delta',
  MESSAGE_STOP: 'message_stop',
  PING: 'ping'
};

// Response types
class MessageResponse {
  constructor(data) {
    this.type = data.type;
    this.message = {
      id: data.message.id,
      type: data.message.type,
      role: data.message.role,
      content: data.message.content,
      model: data.message.model,
      stop_reason: data.message.stop_reason,
      stop_sequence: data.message.stop_sequence,
      usage: data.message.usage
    };
  }
}

class ContentBlockResponse {
  constructor(data) {
    this.type = data.type;
    this.index = data.index;
    this.content_block = data.content_block;
  }
}

class ContentDeltaResponse {
  constructor(data) {
    this.type = data.type;
    this.index = data.index;
    this.delta = data.delta;
  }
}

export class ClaudeAPI {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  async streamMessage(userMessage, systemPrompt = '') {
    try {
      console.log('Initiating Claude request');
      
      const messageConfig = {
        messages: [{ role: 'user', content: userMessage }],
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
      };

      // Add system prompt if provided
      if (systemPrompt) {
        messageConfig.system = systemPrompt;
      }

      const stream = await this.client.messages.stream(messageConfig);
      
      let fullResponse = '';
      let currentBlock = '';

      for await (const chunk of stream) {
        switch (chunk.type) {
          case 'message_start':
            console.log('Message started:', new MessageResponse(chunk));
            break;
            
          case 'content_block_delta':
            if (chunk.delta.type === 'text_delta') {
              currentBlock += chunk.delta.text;
              console.log('Received text chunk:', chunk.delta.text);
            }
            break;
            
          case 'content_block_stop':
            fullResponse += currentBlock;
            currentBlock = '';
            break;
            
          case 'message_stop':
            console.log('Message complete');
            break;
        }
      }

      return fullResponse.trim();
    } catch (error) {
      console.error('Error in Claude API:', error);
      throw error;
    }
  }
}