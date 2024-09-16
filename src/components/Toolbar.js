import React from 'react';
import { FiMousePointer, FiEdit2 } from 'react-icons/fi'; // Importing cursor and pen icons

function Toolbar({ currentTool, setCurrentTool, children }) {
  const tools = [
    { name: 'select', icon: <FiMousePointer size={20} /> },
    { name: 'draw', icon: <FiEdit2 size={20} /> }
  ];

  return (
    <div id="toolbar">
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => setCurrentTool(tool.name)}
          className={`tool-button ${currentTool === tool.name ? 'selected' : ''}`}
          title={tool.name.charAt(0).toUpperCase() + tool.name.slice(1)}
        >
          {tool.icon}
        </button>
      ))}
      {children}
    </div>
  );
}

export default Toolbar;