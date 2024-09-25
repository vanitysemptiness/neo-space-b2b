import React, { useState, useRef } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import ColorPickerButton from './components/ColorPickerButton';
import './App.css';

function App() {
  const [currentTool, setCurrentTool] = useState('select');
  const [currentColor, setCurrentColor] = useState('#000000');
  const canvasRef = useRef(null);

  const handleFileUpload = (file) => {
    if (canvasRef.current && canvasRef.current.addFileToCanvas) {
      canvasRef.current.addFileToCanvas(file);
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
      >
        <ColorPickerButton 
          currentColor={currentColor} 
          setCurrentColor={setCurrentColor} 
        />
      </Toolbar>
    </div>
  );
}

export default App;