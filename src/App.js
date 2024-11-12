import React, { useState, useRef, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import './App.css';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import DraggableColorPalette from './components/DraggableColorPalette';
import { ColorProvider, useColor } from './components/ColorContext';

function AppContent() {
  const [currentTool, setCurrentTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const canvasRef = useRef(null);
  const { currentColor, changeColor } = useColor();

  // Initialize fabric canvas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const canvas = new fabric.Canvas(null, {
        width: window.innerWidth,
        height: window.innerHeight,
        preserveObjectStacking: true
      });
      setFabricCanvas(canvas);
      
      return () => {
        canvas.dispose();
      };
    }
  }, []);

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
        fabricCanvas={fabricCanvas}
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        onZoomChange={setZoom}
      />
      <Toolbar
        fabricCanvas={fabricCanvas}
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        onFileUpload={handleFileUpload}
        isObjectSelected={isObjectSelected()}
        onDeleteSelected={handleDeleteSelected}
        zoom={zoom}
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