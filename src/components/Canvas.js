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

const Canvas = forwardRef(({ currentTool, currentColor, setCurrentTool }, ref) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [brushSize, setBrushSize] = useState(5);
  const [showPopupToolbar, setShowPopupToolbar] = useState(false);
  const [popupToolbarPosition, setPopupToolbarPosition] = useState({ top: 0, left: 0 });
  const squareRef = useRef(null);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef(null);
  const [isObjectSelected, setIsObjectSelected] = useState(false);

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
    if (canvasRef.current) {
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
    }
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.isDrawingMode = currentTool === 'draw';
      canvas.selection = currentTool === 'select';
      canvas.freeDrawingBrush.color = currentColor;
      canvas.freeDrawingBrush.width = brushSize;
      updateSelectedObjectsColor(currentColor);

      const handleSelectionEvent = () => {
        handleSelection();
        setIsObjectSelected(!!canvas.getActiveObject());
      };

      canvas.on('selection:created', handleSelectionEvent);
      canvas.on('selection:updated', handleSelectionEvent);
      canvas.on('selection:cleared', handleSelectionEvent);
      canvas.on('object:moving', updatePopupPosition);

      canvas.on('mouse:down', handleMouseDown);
      canvas.on('mouse:move', handleMouseMove);
      canvas.on('mouse:up', handleMouseUp);

      return () => {
        canvas.off('selection:created', handleSelectionEvent);
        canvas.off('selection:updated', handleSelectionEvent);
        canvas.off('selection:cleared', handleSelectionEvent);
        canvas.off('object:moving', updatePopupPosition);
        canvas.off('mouse:down', handleMouseDown);
        canvas.off('mouse:move', handleMouseMove);
        canvas.off('mouse:up', handleMouseUp);
      };
    }
  }, [currentTool, currentColor, brushSize, handleSelection, updatePopupPosition, updateSelectedObjectsColor]);

  const handleMouseDown = (event) => {
    if (currentTool === 'square') {
      isDrawingRef.current = true;
      startPointRef.current = fabricCanvasRef.current.getPointer(event.e);
      squareRef.current = new fabric.Rect({
        left: startPointRef.current.x,
        top: startPointRef.current.y,
        width: 0,
        height: 0,
        fill: currentColor,
        strokeWidth: 2,
        stroke: 'rgba(0,0,0,0.3)',
        rx: 10,
        ry: 10,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.3)',
          blur: 10,
          offsetX: 5,
          offsetY: 5
        }),
        selectable: false,
        evented: false,
      });
      fabricCanvasRef.current.add(squareRef.current);
    }
  };

  const handleMouseMove = (event) => {
    if (currentTool === 'square' && isDrawingRef.current) {
      const pointer = fabricCanvasRef.current.getPointer(event.e);
      const startPoint = startPointRef.current;

      const left = Math.min(startPoint.x, pointer.x);
      const top = Math.min(startPoint.y, pointer.y);
      const width = Math.abs(startPoint.x - pointer.x);
      const height = Math.abs(startPoint.y - pointer.y);

      squareRef.current.set({
        left: left,
        top: top,
        width: width,
        height: height
      });
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleMouseUp = () => {
    if (currentTool === 'square' && isDrawingRef.current) {
      isDrawingRef.current = false;
      squareRef.current.set({
        selectable: true,
        evented: true,
      });
      fabricCanvasRef.current.setActiveObject(squareRef.current);
      fabricCanvasRef.current.renderAll();
      saveToLocalStorage(fabricCanvasRef.current);
      setCurrentTool('select');
    }
  };

  const handleDeleteSelected = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        if (activeObject.type === 'activeSelection') {
          activeObject.forEachObject((obj) => canvas.remove(obj));
        } else {
          canvas.remove(activeObject);
        }
        canvas.discardActiveObject().renderAll();
        setIsObjectSelected(false);
        saveToLocalStorage(canvas);
      }
    }
  }, []);

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
    },
    deleteSelected: handleDeleteSelected,
    isObjectSelected: isObjectSelected
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