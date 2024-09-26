import React, { useState, useRef } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import DraggableColorPalette from './components/DraggableColorPalette';

function App() {
  const [currentTool, setCurrentTool] = useState('select');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [showColorPalette, setShowColorPalette] = useState(false);
  const canvasRef = useRef(null);

  const handleFileUpload = (file) => {
    if (canvasRef.current) {
      canvasRef.current.addFileToCanvas(file);
    }
  };

  const handleDeleteSelected = () => {
    if (canvasRef.current) {
      canvasRef.current.deleteSelected();
    }
  };

  return (
    <div className="App">
      <Canvas 
        ref={canvasRef}
        currentTool={currentTool}
        currentColor={currentColor}
        setCurrentTool={setCurrentTool}
      />
      <Toolbar 
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        onFileUpload={handleFileUpload}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        isObjectSelected={canvasRef.current?.isObjectSelected || false}
        onDeleteSelected={handleDeleteSelected}
      />
      <DraggableColorPalette
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        isVisible={showColorPalette}
      />
    </div>
  );
}

export default App;