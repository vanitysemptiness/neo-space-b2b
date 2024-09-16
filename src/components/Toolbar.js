import React from 'react';

function Toolbar({ currentTool, setCurrentTool }) {
  const tools = ['select', 'draw', 'rectangle'];

  return (
    <div id="toolbar">
      {tools.map((tool) => (
        <button
          key={tool}
          onClick={() => setCurrentTool(tool)}
          className={`tool-button ${currentTool === tool ? 'selected' : ''}`}
        >
          {tool === 'select' ? (
            <img src="/cursor-icon.png" alt="Select" width="20" height="20" />
          ) : (
            tool.charAt(0).toUpperCase() + tool.slice(1)
          )}
        </button>
      ))}
    </div>
  );
}

export default Toolbar;