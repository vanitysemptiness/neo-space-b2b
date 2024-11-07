import React, { useState, useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';

const SearchBar = ({ currentTool, setCurrentTool }) => {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = inputRef.current.value.trim();
    if (text) {
      console.log('Submitted text:', text);
      inputRef.current.value = '';
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

// Hide search bar if user switches to any other tool
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
        title="AI"
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
            placeholder="search or manipulate canvas with ai..."
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </form>
      )}
    </div>
  );
};

export default SearchBar;