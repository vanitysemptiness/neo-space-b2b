import React, { useRef } from 'react';
import { FiMousePointer, FiEdit2, FiUpload, FiSquare, FiTrash2, FiType } from 'react-icons/fi';
import ColorPickerButton from './ColorPickerButton';

function Toolbar({ 
  currentTool, 
  setCurrentTool, 
  onFileUpload, 
  currentColor, 
  setCurrentColor, 
  isObjectSelected,
  onDeleteSelected
}) {
  const fileInputRef = useRef(null);

  const tools = [
    { name: 'select', icon: <FiMousePointer size={20} /> },
    { name: 'draw', icon: <FiEdit2 size={20} /> },
    { name: 'square', icon: <FiSquare size={20} /> },
    { name: 'textbox', icon: <FiType size={20} /> },
    { 
      name: 'upload', 
      icon: <FiUpload size={20} />,
      onClick: () => fileInputRef.current.click()
    }
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
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
      {currentTool === 'select' && isObjectSelected && (
        <button
          onClick={onDeleteSelected}
          className="tool-button"
          title="Delete selected"
        >
          <FiTrash2 size={20} color="red" />
        </button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".png,.jpg,.jpeg,.gif,.csv,.pdf,.mov,.xls,.xlsx"
      />
      <ColorPickerButton 
        currentColor={currentColor} 
        setCurrentColor={setCurrentColor}
      />
    </div>
  );
}

export default Toolbar;