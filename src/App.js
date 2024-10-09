import React, { useState, useRef, useCallback } from 'react';
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

  const handleFileUpload = useCallback((file) => {
    if (canvasRef.current && canvasRef.current.handleFileUpload) {
      canvasRef.current.handleFileUpload(file);
    }
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (canvasRef.current && canvasRef.current.clearCanvas) {
      canvasRef.current.clearCanvas();
    }
  }, []);

  const isObjectSelected = useCallback(() => {
    return canvasRef.current && canvasRef.current.isObjectSelected
      ? canvasRef.current.isObjectSelected()
      : false;
  }, []);

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
        isObjectSelected={isObjectSelected()}
        onDeleteSelected={handleDeleteSelected}
      />
      <DraggableColorPalette
        isVisible={showColorPalette}
        currentColor={currentColor}
        setCurrentColor={changeColor}
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