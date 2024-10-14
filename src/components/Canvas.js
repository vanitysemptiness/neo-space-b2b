import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { fabric } from 'fabric';
import { useColor } from './ColorContext';
import Camera from './Camera';
import Selection from './Selection';
import Square from './Square';
import Textbox from './Textbox';
import HandTool from './HandTool';
import FileUpload from './FileUpload';
import Drawing from './Drawing';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage, 
  clearCanvas, 
  setupCanvasPersistence
} from './CanvasPersistence';
import { setupAnimationLoop, addFileToCanvas } from './CanvasUtils';

const Canvas = forwardRef(({ currentTool, setCurrentTool }, ref) => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const { currentColor } = useColor();
  const [showPopupToolbar, setShowPopupToolbar] = useState(false);
  const [popupToolbarPosition, setPopupToolbarPosition] = useState({ top: 0, left: 0 });
  const [brushSize, setBrushSize] = useState(5);
  const cursorRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setFabricCanvas(canvas);

      loadFromLocalStorage(canvas);
      setupCanvasPersistence(canvas);
      setupAnimationLoop(canvas);

      const handleResize = () => {
        canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.dispose();
      };
    }
  }, []);

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = currentTool === 'draw';
      fabricCanvas.selection = currentTool === 'select';

      if (currentTool === 'draw') {
        fabricCanvas.freeDrawingBrush.color = currentColor;
        fabricCanvas.freeDrawingBrush.width = brushSize;
        fabricCanvas.defaultCursor = 'none';
        fabricCanvas.hoverCursor = 'none';
        fabricCanvas.freeDrawingCursor = 'none';
        
        if (!cursorRef.current) {
          cursorRef.current = document.createElement('div');
          cursorRef.current.className = 'cursor-dot';
          document.body.appendChild(cursorRef.current);
        }
        updateCursor();
      } else {
        if (cursorRef.current) {
          document.body.removeChild(cursorRef.current);
          cursorRef.current = null;
        }
        fabricCanvas.defaultCursor = 'default';
        fabricCanvas.hoverCursor = 'default';
      }
    }
  }, [fabricCanvas, currentTool, currentColor, brushSize]);

  const updateCursor = useCallback(() => {
    if (cursorRef.current) {
      cursorRef.current.style.width = `${brushSize}px`;
      cursorRef.current.style.height = `${brushSize}px`;
      cursorRef.current.style.backgroundColor = currentColor;
    }
  }, [brushSize, currentColor]);

  useEffect(() => {
    if (fabricCanvas && currentTool === 'draw') {
      const handleMouseMove = (e) => {
        if (cursorRef.current) {
          cursorRef.current.style.left = `${e.e.clientX}px`;
          cursorRef.current.style.top = `${e.e.clientY}px`;
        }
      };

      fabricCanvas.on('mouse:move', handleMouseMove);

      return () => {
        fabricCanvas.off('mouse:move', handleMouseMove);
      };
    }
  }, [fabricCanvas, currentTool]);

  const handleFileUpload = useCallback((file) => {
    if (fabricCanvas) {
      addFileToCanvas(file, fabricCanvas);
      setCurrentTool('select');
    }
  }, [fabricCanvas, setCurrentTool]);

  useImperativeHandle(ref, () => ({
    handleFileUpload,
    saveCanvas: () => {
      if (fabricCanvas) {
        saveToLocalStorage(fabricCanvas);
      }
    },
    loadCanvas: () => {
      if (fabricCanvas) {
        loadFromLocalStorage(fabricCanvas);
        fabricCanvas.requestRenderAll();
      }
    },
    clearCanvas: () => {
      if (fabricCanvas) {
        clearCanvas(fabricCanvas);
        fabricCanvas.requestRenderAll();
      }
    },
    isObjectSelected: () => {
      return fabricCanvas ? !!fabricCanvas.getActiveObject() : false;
    },
  }));

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas ref={canvasRef} />
      <Camera 
        fabricCanvas={fabricCanvas}
        currentTool={currentTool}
      />
      <Selection
        fabricCanvas={fabricCanvas}
        showPopupToolbar={showPopupToolbar}
        setShowPopupToolbar={setShowPopupToolbar}
        popupToolbarPosition={popupToolbarPosition}
        setPopupToolbarPosition={setPopupToolbarPosition}
      />
      {currentTool === 'draw' && (
        <Drawing
          fabricCanvas={fabricCanvas}
          currentColor={currentColor}
          brushSize={brushSize}
        />
      )}
      <Square 
        fabricCanvas={fabricCanvas}
        currentColor={currentColor}
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
      />
      <Textbox 
        fabricCanvas={fabricCanvas}
        currentColor={currentColor}
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
      />
      <HandTool 
        fabricCanvas={fabricCanvas}
        currentTool={currentTool}
      />
      <FileUpload onFileUpload={handleFileUpload} />
    </div>
  );
});

export default Canvas;