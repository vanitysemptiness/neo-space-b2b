import React, { useState, useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';

const SearchBar = () => {
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
    }
  };

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  return (
    <div>
      {isVisible && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg">
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="w-96 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="Ask Claude..."
              onKeyDown={handleKeyDown}
            />
          </form>
        </div>
      )}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`tool-button ${isVisible ? 'selected' : ''}`}
        title="Ask Claude"
      >
        <Brain size={20} />
      </button>
    </div>
  );
};

export default SearchBar;