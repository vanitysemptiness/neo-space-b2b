import React, { useState, useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true  // WARNING: Only for local development
});

const SearchBar = ({ currentTool, setCurrentTool }) => {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputRef.current.value.trim();
    if (text) {
      try {
        const stream = await client.messages.stream({
          messages: [{ role: 'user', content: text }],
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
        });

        stream.on('text', text => {
          console.log('Received text:', text);
        });

        stream.on('error', error => {
          console.error('Stream error:', error);
        });

        stream.on('end', () => {
          console.log('Stream ended');
        });

        inputRef.current.value = '';
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
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
            placeholder="Ask Claude..."
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </form>
      )}
    </div>
  );
};

export default SearchBar;