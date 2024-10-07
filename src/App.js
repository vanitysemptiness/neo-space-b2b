import React, { useState, useRef } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import DraggableColorPalette from './components/DraggableColorPalette';
import { ColorProvider, useColor } from './components/ColorContext';

function AppContent() {
  const [currentTool, setCurrentTool] = useState('select');
  const [showColorPalette, setShowColorPalette] = useState(false);
  const canvasRef = useRef(null);
  const { currentColor, changeColor } = useColor();

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
        setCurrentTool={setCurrentTool}
      />
      <Toolbar 
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        onFileUpload={handleFileUpload}
        isObjectSelected={canvasRef.current?.isObjectSelected || false}
        onDeleteSelected={handleDeleteSelected}
      />
      <DraggableColorPalette
        isVisible={showColorPalette}
      />
    </div>
  );
}

function App() {
  return (
    <ColorProvider>
      <AppContent />
    </ColorProvider>
  );
}

export default App;