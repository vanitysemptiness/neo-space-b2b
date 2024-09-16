import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import DraggableColorPalette from './components/DraggableColorPalette';
import './App.css';

function App() {
  const [currentTool, setCurrentTool] = useState('select');
  const [currentColor, setCurrentColor] = useState('#000000');

  return (
    <div className="App">
      <Canvas 
        currentTool={currentTool} 
        currentColor={currentColor} 
      />
      <Toolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
      />
      <DraggableColorPalette
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        isVisible={currentTool === 'draw'}
      />
    </div>
  );
}

export default App;