import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { fabric } from 'fabric';
import { useColor } from './ColorContext';
import Camera from './Camera';
import Selection from './Selection';
import Square from './Square';
import FileUpload from './FileUpload';
import Drawing from './Drawing';
import { handleTextboxMode } from './Textbox';
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
  const isDraggingRef = useRef(false);

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

      fabricCanvas.off('mouse:down');
      fabricCanvas.off('mouse:move');
      fabricCanvas.off('mouse:up');

      if (currentTool === 'textbox') {
        fabricCanvas.on('mouse:down', (e) => handleTextboxMode.mousedown(fabricCanvas, fabricCanvas.getPointer(e.e), currentColor));
        fabricCanvas.on('mouse:move', (e) => handleTextboxMode.mousemove(fabricCanvas, fabricCanvas.getPointer(e.e)));
        fabricCanvas.on('mouse:up', () => handleTextboxMode.mouseup(fabricCanvas, setCurrentTool));
      } else if (currentTool === 'hand') {
        fabricCanvas.defaultCursor = 'grab';
        fabricCanvas.hoverCursor = 'grab';
        
        fabricCanvas.on('mouse:down', (e) => {
          isDraggingRef.current = true;
          fabricCanvas.selection = false;
          fabricCanvas.defaultCursor = 'grabbing';
          fabricCanvas.lastPosX = e.e.clientX;
          fabricCanvas.lastPosY = e.e.clientY;
        });

        fabricCanvas.on('mouse:move', (e) => {
          if (isDraggingRef.current) {
            fabricCanvas.viewportTransform[4] += e.e.clientX - fabricCanvas.lastPosX;
            fabricCanvas.viewportTransform[5] += e.e.clientY - fabricCanvas.lastPosY;
            fabricCanvas.requestRenderAll();
            fabricCanvas.lastPosX = e.e.clientX;
            fabricCanvas.lastPosY = e.e.clientY;
          }
        });

        fabricCanvas.on('mouse:up', () => {
          isDraggingRef.current = false;
          fabricCanvas.defaultCursor = 'grab';
          fabricCanvas.selection = true;
        });
      } else {
        fabricCanvas.defaultCursor = 'default';
        fabricCanvas.hoverCursor = 'default';
      }
    }
  }, [fabricCanvas, currentTool, currentColor, setCurrentTool]);

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.freeDrawingBrush.color = currentColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }
  }, [fabricCanvas, currentColor, brushSize]);

  const handleFileUpload = useCallback((file) => {
    if (fabricCanvas) {
      addFileToCanvas(file, fabricCanvas);
    }
  }, [fabricCanvas]);

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
      {currentTool === 'square' && (
        <Square
          fabricCanvas={fabricCanvas}
          currentColor={currentColor}
          setCurrentTool={setCurrentTool}
        />
      )}
      {currentTool === 'draw' && (
        <Drawing
          fabricCanvas={fabricCanvas}
          currentColor={currentColor}
          brushSize={brushSize}
        />
      )}
      <FileUpload onFileUpload={handleFileUpload} />
    </div>
  );
});

export default Canvas;