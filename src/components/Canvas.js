import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { fabric } from 'fabric';
import PopupToolbar from './PopupToolbar';
import { initializeCanvas, handleDragOver, handleDrop, addFileToCanvas } from './CanvasUtils';
import { useCanvasHandlers } from './CanvasHandlers';

const Canvas = forwardRef(({ currentTool, currentColor }, ref) => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [brushSize, setBrushSize] = useState(5);
  const [showPopupToolbar, setShowPopupToolbar] = useState(false);
  const [popupToolbarPosition, setPopupToolbarPosition] = useState({ top: 0, left: 0 });

  const updateSelectedObjectsColor = useCallback((color) => {
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
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
        fabricCanvas.renderAll();
      }
    }
  }, [fabricCanvas]);

  const { handleSelection, handleDelete, updatePopupPosition } = useCanvasHandlers(
    fabricCanvas,
    setShowPopupToolbar,
    setPopupToolbarPosition,
    currentColor
  );

  useEffect(() => {
    const canvas = initializeCanvas(canvasRef.current);
    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = currentTool === 'draw';
      fabricCanvas.selection = currentTool === 'select';
      fabricCanvas.freeDrawingBrush.color = currentColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;

      updateSelectedObjectsColor(currentColor);

      fabricCanvas.on('selection:created', handleSelection);
      fabricCanvas.on('selection:updated', handleSelection);
      fabricCanvas.on('selection:cleared', () => setShowPopupToolbar(false));
      fabricCanvas.on('object:moving', updatePopupPosition);

      return () => {
        fabricCanvas.off('selection:created', handleSelection);
        fabricCanvas.off('selection:updated', handleSelection);
        fabricCanvas.off('selection:cleared');
        fabricCanvas.off('object:moving', updatePopupPosition);
      };
    }
  }, [fabricCanvas, currentTool, currentColor, brushSize, handleSelection, updatePopupPosition, updateSelectedObjectsColor]);

  useImperativeHandle(ref, () => ({
    addFileToCanvas: (file) => fabricCanvas && addFileToCanvas(file, fabricCanvas),
    updateColor: (color) => {
      updateSelectedObjectsColor(color);
    }
  }));

  return (
    <div 
      id="canvas-container" 
      onDragOver={handleDragOver}
      onDrop={(e) => fabricCanvas && handleDrop(e, fabricCanvas)}
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
            onDelete={handleDelete}
            onChangeColor={() => document.getElementById('colorPicker').click()}
            currentColor={currentColor}
          />
        </div>
      )}
    </div>
  );
});

export default Canvas;