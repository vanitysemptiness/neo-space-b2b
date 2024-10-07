import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { fabric } from 'fabric';
import PopupToolbar from './PopupToolbar';
import Toolbar from './Toolbar';
import { handleDragOver } from './CanvasUtils';
import { useCanvasHandlers } from './CanvasHandlers';
import { handleTextboxMode } from './Textbox';
import Drawing from './Drawing';
import Camera from './Camera';
import Square from './Square';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage, 
  clearCanvas, 
  setupCanvasPersistence, 
  addFileToCanvasWithPersistence 
} from './CanvasPersistence';

const Canvas = forwardRef(({ currentTool, setCurrentTool }, ref) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [brushSize, setBrushSize] = useState(5);
  const [showPopupToolbar, setShowPopupToolbar] = useState(false);
  const [popupToolbarPosition, setPopupToolbarPosition] = useState({ top: 0, left: 0 });
  const [currentColor, setCurrentColor] = useState('#000000');

  const updateObjectColor = useCallback((obj, color) => {
    if (obj.type === 'path') {
      obj.set('stroke', color);
    } else {
      if (obj.stroke) obj.set('stroke', color);
      if (obj.fill) obj.set('fill', color);
    }
  }, []);

  const updateSelectedObjectsColor = useCallback((color) => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        if (activeObject.type === 'activeSelection') {
          activeObject.forEachObject((obj) => {
            updateObjectColor(obj, color);
          });
        } else {
          updateObjectColor(activeObject, color);
        }
        canvas.renderAll();
        saveToLocalStorage(canvas);
      }
    }
    setCurrentColor(color);
  }, [updateObjectColor]);

  const handleColorChange = useCallback((color) => {
    updateSelectedObjectsColor(color);
  }, [updateSelectedObjectsColor]);

  const handleSelection = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        setShowPopupToolbar(true);
        const bounds = activeObject.getBoundingRect();
        setPopupToolbarPosition({
          top: bounds.top + bounds.height + 10,
          left: bounds.left + bounds.width / 2
        });
      } else {
        setShowPopupToolbar(false);
      }
    }
  }, []);

  const handleDelete = useCallback(() => {
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
        setShowPopupToolbar(false);
        saveToLocalStorage(canvas);
      }
    }
  }, []);

  const handleMouseDown = useCallback((event) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || currentTool === 'hand') return;

    const pointer = canvas.getPointer(event.e);

    if (currentTool === 'textbox') {
      handleTextboxMode.mousedown(canvas, pointer, currentColor);
    }
  }, [currentTool, currentColor]);

  const handleMouseMove = useCallback((event) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || currentTool === 'hand') return;

    const pointer = canvas.getPointer(event.e);

    if (currentTool === 'textbox') {
      handleTextboxMode.mousemove(canvas, pointer, pointer);
    }
  }, [currentTool]);

  const handleMouseUp = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || currentTool === 'hand') return;

    if (currentTool === 'textbox') {
      handleTextboxMode.mouseup(canvas);
    }

    canvas.renderAll();
    saveToLocalStorage(canvas);
  }, [currentTool]);

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

      canvas.on('selection:created', handleSelection);
      canvas.on('selection:updated', handleSelection);
      canvas.on('selection:cleared', () => setShowPopupToolbar(false));
      canvas.on('object:moving', handleSelection);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.off('selection:created', handleSelection);
        canvas.off('selection:updated', handleSelection);
        canvas.off('selection:cleared');
        canvas.off('object:moving', handleSelection);
        canvas.dispose();
      };
    }
  }, [handleSelection]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.isDrawingMode = currentTool === 'draw';
      canvas.selection = currentTool !== 'hand';

      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');

      if (currentTool !== 'hand' && currentTool !== 'square') {
        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
      }

      return () => {
        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');
      };
    }
  }, [currentTool, handleMouseDown, handleMouseMove, handleMouseUp]);

  useImperativeHandle(ref, () => ({
    addFileToCanvas: (file) => {
      const canvas = fabricCanvasRef.current;
      if (canvas && file) {
        addFileToCanvasWithPersistence(file, canvas);
      }
    },
    updateColor: handleColorChange,
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
  }));

  return (
    <Camera canvas={fabricCanvasRef.current} currentTool={currentTool}>
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
        {currentTool === 'draw' && (
          <Drawing
            fabricCanvas={fabricCanvasRef.current}
            currentColor={currentColor}
            brushSize={brushSize}
          />
        )}
        {currentTool === 'square' && (
          <Square
            fabricCanvas={fabricCanvasRef.current}
            currentColor={currentColor}
          />
        )}
        {showPopupToolbar && (
          <div style={{
            position: 'absolute',
            top: `${popupToolbarPosition.top}px`,
            left: `${popupToolbarPosition.left}px`,
            zIndex: 1000,
          }}>
            <PopupToolbar
              onDelete={handleDelete}
              onChangeColor={handleColorChange}
              currentColor={currentColor}
            />
          </div>
        )}
      </div>
      <Toolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        currentColor={currentColor}
        setCurrentColor={handleColorChange}
        onFileUpload={(file) => {
          if (fabricCanvasRef.current) {
            addFileToCanvasWithPersistence(file, fabricCanvasRef.current);
          }
        }}
      />
    </Camera>
  );
});

export default Canvas;