import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { fabric } from 'fabric';
import { useColor } from './ColorContext';
import Camera from './Camera';
import Selection from './Selection';
import Square from './Square';
import Textbox from './Textbox';
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

  const resetCanvasListeners = useCallback(() => {
    if (fabricCanvas) {
      fabricCanvas.off('mouse:down');
      fabricCanvas.off('mouse:move');
      fabricCanvas.off('mouse:up');
      fabricCanvas.selection = false;
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.hoverCursor = 'default';
    }
  }, [fabricCanvas]);

  const handleMouseDown = useCallback((e) => {
    if (!fabricCanvas) return;
    const pointer = fabricCanvas.getPointer(e.e);
    switch (currentTool) {
      case 'square':
        Square.handleMouseDown(fabricCanvas, pointer, currentColor);
        break;
      case 'textbox':
        Textbox.handleMouseDown(fabricCanvas, pointer, currentColor);
        break;
      case 'hand':
        isDraggingRef.current = true;
        fabricCanvas.selection = false;
        fabricCanvas.lastPosX = e.e.clientX;
        fabricCanvas.lastPosY = e.e.clientY;
        break;
    }
  }, [fabricCanvas, currentTool, currentColor]);

  const handleMouseMove = useCallback((e) => {
    if (!fabricCanvas) return;
    const pointer = fabricCanvas.getPointer(e.e);
    switch (currentTool) {
      case 'square':
        Square.handleMouseMove(fabricCanvas, pointer);
        break;
      case 'hand':
        if (isDraggingRef.current) {
          fabricCanvas.viewportTransform[4] += e.e.clientX - fabricCanvas.lastPosX;
          fabricCanvas.viewportTransform[5] += e.e.clientY - fabricCanvas.lastPosY;
          fabricCanvas.requestRenderAll();
          fabricCanvas.lastPosX = e.e.clientX;
          fabricCanvas.lastPosY = e.e.clientY;
        }
        break;
    }
  }, [fabricCanvas, currentTool]);

  const handleMouseUp = useCallback(() => {
    if (!fabricCanvas) return;
    switch (currentTool) {
      case 'square':
        Square.handleMouseUp(fabricCanvas);
        break;
      case 'textbox':
        Textbox.handleMouseUp(fabricCanvas);
        break;
      case 'hand':
        isDraggingRef.current = false;
        fabricCanvas.selection = true;
        break;
    }
    saveToLocalStorage(fabricCanvas);
    setCurrentTool('select');
  }, [fabricCanvas, currentTool, setCurrentTool]);

  useEffect(() => {
    if (!fabricCanvas) return;

    resetCanvasListeners();

    switch (currentTool) {
      case 'select':
        fabricCanvas.selection = true;
        break;
      case 'draw':
        fabricCanvas.isDrawingMode = true;
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
        break;
      case 'square':
      case 'textbox':
      case 'hand':
        fabricCanvas.on('mouse:down', handleMouseDown);
        fabricCanvas.on('mouse:move', handleMouseMove);
        fabricCanvas.on('mouse:up', handleMouseUp);
        fabricCanvas.defaultCursor = currentTool === 'hand' ? 'grab' : 'crosshair';
        fabricCanvas.hoverCursor = currentTool === 'hand' ? 'grab' : 'crosshair';
        break;
    }

    return () => {
      if (cursorRef.current) {
        document.body.removeChild(cursorRef.current);
        cursorRef.current = null;
      }
    };
  }, [fabricCanvas, currentTool, currentColor, brushSize, resetCanvasListeners, updateCursor, handleMouseDown, handleMouseMove, handleMouseUp]);

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
      <Drawing
        fabricCanvas={fabricCanvas}
        currentColor={currentColor}
        brushSize={brushSize}
      />
      <FileUpload onFileUpload={handleFileUpload} />
    </div>
  );
});

export default Canvas;