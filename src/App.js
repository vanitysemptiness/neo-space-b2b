import React, { useState, useRef, useCallback } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import './App.css';

function App() {
  const [currentTool, setCurrentTool] = useState('select');
  const [currentColor, setCurrentColor] = useState('#000000');
  const canvasRef = useRef(null);

  const handleFileUpload = useCallback((file) => {
    if (canvasRef.current && canvasRef.current.addFileToCanvas) {
      canvasRef.current.addFileToCanvas(file);
    }
  }, []);

  const handleColorChange = useCallback((color) => {
    setCurrentColor(color);
    if (canvasRef.current && canvasRef.current.updateColor) {
      canvasRef.current.updateColor(color);
    }
  }, []);

  return (
    <div className="App">
      <Canvas 
        ref={canvasRef}
        currentTool={currentTool} 
        currentColor={currentColor}
      />
      <Toolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        onFileUpload={handleFileUpload}
        currentColor={currentColor}
        setCurrentColor={handleColorChange}
      />
    </div>
  );
}

export default App;