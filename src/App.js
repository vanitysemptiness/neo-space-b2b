import React, { useState, useRef } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import ColorPickerButton from './components/ColorPickerButton';
import './App.css';

function App() {
  const [currentTool, setCurrentTool] = useState('select');
  const [currentColor, setCurrentColor] = useState('#000000');
  const canvasRef = useRef(null);

  const handleImageUpload = (file) => {
    if (canvasRef.current && canvasRef.current.addImageToCanvas) {
      canvasRef.current.addImageToCanvas(file);
    }
  };

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
        onImageUpload={handleImageUpload}
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