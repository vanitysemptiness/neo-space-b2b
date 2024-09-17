import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';

const Canvas = forwardRef(({ currentTool, currentColor }, ref) => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: false,
      width: window.innerWidth,
      height: window.innerHeight,
      selection: true,
    });
    setFabricCanvas(canvas);

    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((obj) => {
            canvas.remove(obj);
          });
          canvas.discardActiveObject().renderAll();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (fabricCanvas) {
      // Add logo to canvas after it's initialized
      fabric.Image.fromURL(require('../neo-space-logo.png'), (img) => {
        const scaleFactor = 0.5; // Adjust this to control the size
        img.scale(scaleFactor);
        
        img.set({
          left: 20,
          top: fabricCanvas.height - (img.height * scaleFactor) - 20,
          selectable: true,
          evented: true,
        });
        
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
      }, { crossOrigin: 'anonymous' });

      fabricCanvas.isDrawingMode = currentTool === 'draw';
      fabricCanvas.selection = currentTool === 'select';
      fabricCanvas.freeDrawingBrush.color = currentColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }
  }, [fabricCanvas, currentTool, currentColor, brushSize]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      addImageToCanvas(file);
    }
  };

  const addImageToCanvas = (file) => {
    if (file && fabricCanvas) {
      const reader = new FileReader();
      reader.onload = (e) => {
        fabric.Image.fromURL(e.target.result, (img) => {
          img.scaleToWidth(200); // Adjust size as needed
          fabricCanvas.add(img);
          fabricCanvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  useImperativeHandle(ref, () => ({
    addImageToCanvas
  }));

  return (
    <div 
      id="canvas-container" 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas ref={canvasRef} />
    </div>
  );
});

export default Canvas;