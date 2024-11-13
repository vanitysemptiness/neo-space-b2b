import React, { useRef } from 'react';
import { FiMousePointer, FiEdit2, FiUpload, FiSquare, FiTrash2, FiType } from 'react-icons/fi';
import { LuHand } from 'react-icons/lu';
import ColorPickerButton from './ColorPickerButton';
import SearchBar from './SearchBar';
import { useColor } from './ColorContext';
import ZoomDisplay from './ZoomDisplay';
import SaveFileButtons from '../components/SaveFileButtons';

function Toolbar({ 
  currentTool, 
  setCurrentTool, 
  onFileUpload, 
  isObjectSelected,
  onDeleteSelected,
  fabricCanvas,
  zoom
}) {
  const fileInputRef = useRef(null);
  const { currentColor, changeColor } = useColor();

  const handleToolChange = (toolName) => {
    console.log('Tool changed:', toolName);
    setCurrentTool(toolName);
  };

  const tools = [
    { name: 'hand', icon: <LuHand size={20} /> },
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
          onClick={tool.onClick || (() => handleToolChange(tool.name))}
          className={`tool-button ${currentTool === tool.name ? 'selected' : ''}`}
          title={tool.name.charAt(0).toUpperCase() + tool.name.slice(1)}
        >
          {tool.icon}
        </button>
      ))}
      <SearchBar 
        currentTool={currentTool} 
        setCurrentTool={handleToolChange}
        fabricCanvas={fabricCanvas}
      />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".png,.jpg,.jpeg,.gif,.csv,.pdf,.mov,.xls,.xlsx"
      />
      <SaveFileButtons fabricCanvas={fabricCanvas} />
      <ColorPickerButton 
        currentColor={currentColor} 
        setCurrentColor={changeColor}
      />
      <ZoomDisplay zoom={zoom} />
    </div>
  );
}

export default Toolbar;