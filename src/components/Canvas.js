import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

function Canvas({ currentTool, currentColor }) {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const cursorCanvasRef = useRef(null);
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: false,
        width: window.innerWidth,
        height: window.innerHeight,
        selection: true,
      });
      setFabricCanvas(canvas);

      canvas.on('object:added', (e) => {
        if (e.target) {
          e.target.set('deletable', true);
        }
      });

      const handleKeyDown = (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          const activeObjects = canvas.getActiveObjects();
          if (activeObjects.length > 0) {
            activeObjects.forEach((obj) => {
              if (obj.deletable) {
                canvas.remove(obj);
              }
            });
            canvas.discardActiveObject().renderAll();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        canvas.dispose();
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = currentTool === 'draw';
      fabricCanvas.selection = currentTool === 'select';
      fabricCanvas.freeDrawingBrush.color = currentColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;

      if (currentTool === 'draw') {
        fabricCanvas.defaultCursor = 'none';
        document.body.style.cursor = 'none';
      } else if (currentTool === 'select') {
        fabricCanvas.defaultCursor = 'default';
        document.body.style.cursor = 'default';
      } else {
        fabricCanvas.defaultCursor = 'crosshair';
        document.body.style.cursor = 'crosshair';
      }
    }
  }, [fabricCanvas, currentTool, currentColor, brushSize]);

  useEffect(() => {
    const cursorCanvas = cursorCanvasRef.current;
    const ctx = cursorCanvas.getContext('2d');

    const updateCursor = (e) => {
      ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      if (currentTool === 'draw') {
        ctx.beginPath();
        ctx.arc(e.clientX, e.clientY, brushSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = currentColor;
        ctx.stroke();
      }
    };

    window.addEventListener('mousemove', updateCursor);
    return () => window.removeEventListener('mousemove', updateCursor);
  }, [currentTool, currentColor, brushSize]);

  return (
    <div id="canvas-container">
      <canvas ref={canvasRef} />
      <canvas
        ref={cursorCanvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9999,
        }}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
}

export default Canvas;