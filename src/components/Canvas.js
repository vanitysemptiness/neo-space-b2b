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
    console.log('Canvas component mounted');
    if (canvasRef.current) {
      console.log('Initializing fabric canvas');
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setFabricCanvas(canvas);

      loadFromLocalStorage(canvas);
      setupCanvasPersistence(canvas);
      setupAnimationLoop(canvas);

      const handleResize = () => {
        console.log('Window resized, updating canvas dimensions');
        canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);

      return () => {
        console.log('Canvas component unmounting');
        window.removeEventListener('resize', handleResize);
        canvas.dispose();
      };
    }
  }, []);

  const updateCursor = useCallback(() => {
    console.log('Updating cursor');
    if (cursorRef.current) {
      cursorRef.current.style.width = `${brushSize}px`;
      cursorRef.current.style.height = `${brushSize}px`;
      cursorRef.current.style.backgroundColor = currentColor;
    }
  }, [brushSize, currentColor]);

  useEffect(() => {
    console.log(`Current tool changed to: ${currentTool}`);
    if (fabricCanvas) {
      console.log(`Updating fabricCanvas mode for ${currentTool}`);
      fabricCanvas.isDrawingMode = currentTool === 'draw';
      fabricCanvas.selection = currentTool === 'select';

      console.log('Removing previous event listeners');
      fabricCanvas.off('mouse:down');
      fabricCanvas.off('mouse:move');
      fabricCanvas.off('mouse:up');

      if (currentTool === 'textbox') {
        console.log('Setting up textbox mode');
        fabricCanvas.on('mouse:down', (e) => handleTextboxMode.mousedown(fabricCanvas, fabricCanvas.getPointer(e.e), currentColor));
        fabricCanvas.on('mouse:move', (e) => handleTextboxMode.mousemove(fabricCanvas, fabricCanvas.getPointer(e.e)));
        fabricCanvas.on('mouse:up', () => handleTextboxMode.mouseup(fabricCanvas, setCurrentTool));
      } else if (currentTool === 'hand') {
        console.log('Setting up hand (pan) mode');
        fabricCanvas.defaultCursor = 'grab';
        fabricCanvas.hoverCursor = 'grab';
        
        fabricCanvas.on('mouse:down', (e) => {
          console.log('Hand tool: mouse down');
          isDraggingRef.current = true;
          fabricCanvas.selection = false;
          fabricCanvas.defaultCursor = 'grabbing';
          fabricCanvas.lastPosX = e.e.clientX;
          fabricCanvas.lastPosY = e.e.clientY;
        });

        fabricCanvas.on('mouse:move', (e) => {
          if (isDraggingRef.current) {
            console.log('Hand tool: dragging');
            fabricCanvas.viewportTransform[4] += e.e.clientX - fabricCanvas.lastPosX;
            fabricCanvas.viewportTransform[5] += e.e.clientY - fabricCanvas.lastPosY;
            fabricCanvas.requestRenderAll();
            fabricCanvas.lastPosX = e.e.clientX;
            fabricCanvas.lastPosY = e.e.clientY;
          }
        });

        fabricCanvas.on('mouse:up', () => {
          console.log('Hand tool: mouse up');
          isDraggingRef.current = false;
          fabricCanvas.defaultCursor = 'grab';
          fabricCanvas.selection = true;
        });
      } else if (currentTool === 'draw') {
        console.log('Setting up draw mode');
        fabricCanvas.defaultCursor = 'none';
        fabricCanvas.hoverCursor = 'none';
        fabricCanvas.freeDrawingCursor = 'none';
        
        if (!cursorRef.current) {
          console.log('Creating custom cursor for draw mode');
          cursorRef.current = document.createElement('div');
          cursorRef.current.className = 'cursor-dot';
          document.body.appendChild(cursorRef.current);
        }

        updateCursor();

        const updateCursorPosition = (e) => {
          cursorRef.current.style.left = `${e.clientX}px`;
          cursorRef.current.style.top = `${e.clientY}px`;
        };

        console.log('Adding mousemove listener for custom cursor');
        fabricCanvas.upperCanvasEl.addEventListener('mousemove', updateCursorPosition);

        return () => {
          console.log('Removing mousemove listener for custom cursor');
          fabricCanvas.upperCanvasEl.removeEventListener('mousemove', updateCursorPosition);
          if (cursorRef.current) {
            document.body.removeChild(cursorRef.current);
            cursorRef.current = null;
          }
        };
      } else if (currentTool === 'square') {
        console.log('Setting up square drawing mode');
        // The Square component will handle its own event listeners
      } else {
        console.log('Setting default cursor');
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
      console.log(`Updating drawing brush: color=${currentColor}, size=${brushSize}`);
      fabricCanvas.freeDrawingBrush.color = currentColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
      updateCursor();
    }
  }, [fabricCanvas, currentColor, brushSize, updateCursor]);

  const handleFileUpload = useCallback((file) => {
    console.log('File upload triggered');
    if (fabricCanvas) {
      addFileToCanvas(file, fabricCanvas, setCurrentTool);
    }
  }, [fabricCanvas, setCurrentTool]);

  useImperativeHandle(ref, () => ({
    handleFileUpload,
    saveCanvas: () => {
      console.log('Saving canvas');
      if (fabricCanvas) {
        saveToLocalStorage(fabricCanvas);
      }
    },
    loadCanvas: () => {
      console.log('Loading canvas');
      if (fabricCanvas) {
        loadFromLocalStorage(fabricCanvas);
        fabricCanvas.requestRenderAll();
      }
    },
    clearCanvas: () => {
      console.log('Clearing canvas');
      if (fabricCanvas) {
        clearCanvas(fabricCanvas);
        fabricCanvas.requestRenderAll();
      }
    },
    isObjectSelected: () => {
      const isSelected = fabricCanvas ? !!fabricCanvas.getActiveObject() : false;
      console.log(`Object selected: ${isSelected}`);
      return isSelected;
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
      <FileUpload onFileUpload={handleFileUpload} setCurrentTool={setCurrentTool} />
    </div>
  );
});

export default Canvas;