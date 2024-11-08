import React, { useState, useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';
import { LLMCanvasInterface } from './LLMCanvasInterface';
import { CanvasReferenceError } from './CanvasError';
import { ClaudeAPI } from './ClaudeAPI';

const LLM_INSTRUCTION = `You are a helpful AI assistant that can both engage in normal conversation and manipulate a canvas when asked. You have access to the following canvas manipulation functions:

- drawSquare(x, y, size, color): Draws a square at position (x,y) with given size and color

If the user's request appears to be asking for canvas manipulation (like drawing shapes), respond with ONLY the appropriate JSON command, no other text.

For example:
- "draw a blue square" -> respond with only:
{
  "name": "drawSquare",
  "parameters": {
    "x": 400,
    "y": 300,
    "size": 100,
    "color": "blue"
  }
}

For all other queries that don't seem related to canvas manipulation, respond conversationally as you normally would.`;

const SearchBar = ({ currentTool, setCurrentTool, fabricCanvas }) => {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef(null);
  const llmInterface = useRef(null);
  const claudeAPI = useRef(new ClaudeAPI());

  useEffect(() => {
    if (fabricCanvas && !llmInterface.current) {
      try {
        llmInterface.current = new LLMCanvasInterface(fabricCanvas);
        console.log('LLMCanvasInterface initialized successfully');
      } catch (error) {
        if (error instanceof CanvasReferenceError) {
          console.error('Failed to initialize LLMCanvasInterface: Canvas reference missing');
        } else {
          console.error('Unexpected error initializing LLMCanvasInterface:', error);
        }
      }
    }
  }, [fabricCanvas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    
    if (!text || !fabricCanvas) return;

    if (!llmInterface.current) {
      console.error('LLMInterface not initialized');
      return;
    }

    try {
      console.log('Sending request to Claude:', text);
      
      const response = await claudeAPI.current.streamMessage(text, LLM_INSTRUCTION);
      console.log('Full response:', response);

      // Try to parse as JSON for canvas commands
      try {
        const result = llmInterface.current.executeLLMResponse(response);
        console.log('Command execution result:', result);
      } catch (error) {
        // If it's not valid JSON, treat it as a conversational response
        console.log('Conversational response:', response);
      }

    } catch (error) {
      console.error('Error processing request:', error);
    }

    inputRef.current.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsVisible(false);
      setCurrentTool('select');
    }
  };

  const handleBrainClick = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    setCurrentTool(newState ? 'claude' : 'select');
  };

  useEffect(() => {
    if (currentTool !== 'claude') {
      setIsVisible(false);
    }
  }, [currentTool]);

  return (
    <div className="inline-block">
      <button
        onClick={handleBrainClick}
        className={`tool-button ${currentTool === 'claude' ? 'selected' : ''}`}
        title="Ask Claude"
      >
        <Brain size={20} />
      </button>

      {isVisible && (
        <form 
          onSubmit={handleSubmit}
          style={{ 
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '500px',
            zIndex: 9999,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            style={{
              width: '100%',
              height: '48px',
              padding: '0 16px',
              fontSize: '18px',
              backgroundColor: 'white',
              border: '2px solid #2196F3',
              borderRadius: '6px',
              outline: 'none',
              boxShadow: '0 0 20px rgba(0,0,0,0.2)'
            }}
            placeholder="Try: 'draw a blue square' or ask a question"
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </form>
      )}
    </div>
  );
};

export default SearchBar;