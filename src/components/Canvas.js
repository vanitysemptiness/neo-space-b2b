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

  const updateCursor = useCallback(() => {
    if (cursorRef.current) {
      cursorRef.current.style.width = `${brushSize}px`;
      cursorRef.current.style.height = `${brushSize}px`;
      cursorRef.current.style.backgroundColor = currentColor;
    }
  }, [brushSize, currentColor]);

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = currentTool === 'draw';
      fabricCanvas.selection = currentTool === 'select';

      fabricCanvas.off('mouse:down');
      fabricCanvas.off('mouse:move');
      fabricCanvas.off('mouse:up');

      if (currentTool === 'textbox') {
        let activeTextbox = null;
        let startPoint = null;

        fabricCanvas.on('mouse:down', (e) => {
          startPoint = fabricCanvas.getPointer(e.e);
          activeTextbox = handleTextboxMode.mousedown(fabricCanvas, startPoint, currentColor);
        });

        fabricCanvas.on('mouse:move', (e) => {
          if (activeTextbox) {
            const pointer = fabricCanvas.getPointer(e.e);
            handleTextboxMode.mousemove(fabricCanvas, pointer, startPoint, activeTextbox);
          }
        });

        fabricCanvas.on('mouse:up', () => {
          handleTextboxMode.mouseup(fabricCanvas, activeTextbox, setCurrentTool);
          activeTextbox = null;
          startPoint = null;
        });
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
      } else if (currentTool === 'draw') {
        fabricCanvas.defaultCursor = 'none';
        fabricCanvas.hoverCursor = 'none';
        fabricCanvas.freeDrawingCursor = 'none';
        
        if (!cursorRef.current) {
          cursorRef.current = document.createElement('div');
          cursorRef.current.className = 'cursor-dot';
          document.body.appendChild(cursorRef.current);
        }

        updateCursor();

        const updateCursorPosition = (e) => {
          cursorRef.current.style.left = `${e.clientX}px`;
          cursorRef.current.style.top = `${e.clientY}px`;
        };

        fabricCanvas.upperCanvasEl.addEventListener('mousemove', updateCursorPosition);

        return () => {
          fabricCanvas.upperCanvasEl.removeEventListener('mousemove', updateCursorPosition);
          if (cursorRef.current) {
            document.body.removeChild(cursorRef.current);
            cursorRef.current = null;
          }
        };
      } else {
        fabricCanvas.defaultCursor = 'default';
        fabricCanvas.hoverCursor = 'default';
        if (cursorRef.current) {
          document.body.removeChild(cursorRef.current);
          cursorRef.current = null;
        }
      }
    }
  }, [fabricCanvas, currentTool, currentColor, setCurrentTool, updateCursor]);

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.freeDrawingBrush.color = currentColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
      updateCursor();
    }
  }, [fabricCanvas, currentColor, brushSize, updateCursor]);

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