import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { fabric } from 'fabric';
import PopupToolbar from './PopupToolbar';
import { handleDragOver } from './CanvasUtils';
import { useCanvasHandlers } from './CanvasHandlers';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage, 
  clearCanvas, 
  setupCanvasPersistence, 
  addFileToCanvasWithPersistence 
} from './CanvasPersistence';

const Canvas = forwardRef(({ currentTool, currentColor }, ref) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [brushSize, setBrushSize] = useState(5);
  const [showPopupToolbar, setShowPopupToolbar] = useState(false);
  const [popupToolbarPosition, setPopupToolbarPosition] = useState({ top: 0, left: 0 });

  const updateSelectedObjectsColor = useCallback((color) => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        if (activeObject.type === 'activeSelection') {
          activeObject.forEachObject((obj) => {
            if (obj.stroke) obj.set('stroke', color);
            if (obj.fill) obj.set('fill', color);
          });
        } else {
          if (activeObject.stroke) activeObject.set('stroke', color);
          if (activeObject.fill) activeObject.set('fill', color);
        }
        canvas.renderAll();
        saveToLocalStorage(canvas);
      }
    }
  }, []);

  const { handleSelection, handleDelete, updatePopupPosition } = useCanvasHandlers(
    fabricCanvasRef.current,
    setShowPopupToolbar,
    setPopupToolbarPosition,
    currentColor
  );

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: false,
      width: window.innerWidth,
      height: window.innerHeight,
      selection: true,
    });
    fabricCanvasRef.current = canvas;

    loadFromLocalStorage(canvas);
    setupCanvasPersistence(canvas);

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
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.isDrawingMode = currentTool === 'draw';
      canvas.selection = currentTool === 'select';
      canvas.freeDrawingBrush.color = currentColor;
      canvas.freeDrawingBrush.width = brushSize;
      updateSelectedObjectsColor(currentColor);

      canvas.on('selection:created', handleSelection);
      canvas.on('selection:updated', handleSelection);
      canvas.on('selection:cleared', handleSelection);
      canvas.on('object:moving', updatePopupPosition);

      return () => {
        canvas.off('selection:created', handleSelection);
        canvas.off('selection:updated', handleSelection);
        canvas.off('selection:cleared', handleSelection);
        canvas.off('object:moving', updatePopupPosition);
      };
    }
  }, [currentTool, currentColor, brushSize, handleSelection, updatePopupPosition, updateSelectedObjectsColor]);

  useImperativeHandle(ref, () => ({
    addFileToCanvas: (file) => {
      const canvas = fabricCanvasRef.current;
      if (canvas && file) {
        addFileToCanvasWithPersistence(file, canvas);
      }
    },
    updateColor: (color) => {
      updateSelectedObjectsColor(color);
    },
    saveCanvas: () => {
      const canvas = fabricCanvasRef.current;
      if (canvas) {
        saveToLocalStorage(canvas);
      }
    },
    loadCanvas: () => {
      const canvas = fabricCanvasRef.current;
      if (canvas) {
        loadFromLocalStorage(canvas);
        canvas.renderAll();
      }
    },
    clearCanvas: () => {
      const canvas = fabricCanvasRef.current;
      if (canvas) {
        clearCanvas(canvas);
        canvas.renderAll();
      }
    }
  }));

  return (
    <div
      id="canvas-container"
      onDragOver={handleDragOver}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && fabricCanvasRef.current) {
          addFileToCanvasWithPersistence(file, fabricCanvasRef.current);
        }
      }}
    >
      <canvas ref={canvasRef} />
      {showPopupToolbar && (
        <div style={{
          position: 'absolute',
          top: `${popupToolbarPosition.top}px`,
          left: `${popupToolbarPosition.left}px`,
          zIndex: 1000,
        }}>
          <PopupToolbar
            onDelete={() => {
              handleDelete();
              if (fabricCanvasRef.current) saveToLocalStorage(fabricCanvasRef.current);
            }}
            onChangeColor={() => document.getElementById('colorPicker').click()}
            currentColor={currentColor}
          />
        </div>
      )}
    </div>
  );
});

export default Canvas;