import React, { useRef } from 'react';
import { FiMousePointer, FiEdit2, FiImage } from 'react-icons/fi';

function Toolbar({ currentTool, setCurrentTool, onImageUpload, children }) {
  const fileInputRef = useRef(null);

  const tools = [
    { name: 'select', icon: <FiMousePointer size={20} /> },
    { name: 'draw', icon: <FiEdit2 size={20} /> },
    { 
      name: 'upload', 
      icon: <FiImage size={20} />,
      onClick: () => fileInputRef.current.click()
    }
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div id="toolbar">
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={tool.onClick || (() => setCurrentTool(tool.name))}
          className={`tool-button ${currentTool === tool.name ? 'selected' : ''}`}
          title={tool.name.charAt(0).toUpperCase() + tool.name.slice(1)}
        >
          {tool.icon}
        </button>
      ))}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*"
      />
      {children}
    </div>
  );
}

export default Toolbar;