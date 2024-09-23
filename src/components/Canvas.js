import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { fabric } from 'fabric';
import PopupToolbar from './PopupToolbar';
import ColorPickerButton from './ColorPickerButton';
import { initializeCanvas, handleDragOver, handleDrop, addFileToCanvas } from './CanvasUtils';
import { useCanvasHandlers } from './CanvasHandlers';

const Canvas = forwardRef(({ currentTool, currentColor, setCurrentColor: parentSetCurrentColor }, ref) => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [brushSize, setBrushSize] = useState(5);
  const [showPopupToolbar, setShowPopupToolbar] = useState(false);
  const [popupToolbarPosition, setPopupToolbarPosition] = useState({ top: 0, left: 0 });
  const [localColor, setLocalColor] = useState(currentColor);

  const setCurrentColor = useCallback((color) => {
    setLocalColor(color);
    if (typeof parentSetCurrentColor === 'function') {
      parentSetCurrentColor(color);
    }
  }, [parentSetCurrentColor]);

  const { handleSelection, handleDelete, handleChangeColor, updatePopupPosition } = useCanvasHandlers(
    fabricCanvas,
    setShowPopupToolbar,
    setPopupToolbarPosition,
    localColor
  );

  const handleColorChange = useCallback((color) => {
    setCurrentColor(color);
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
  }, [fabricCanvas, setCurrentColor]);

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
      fabricCanvas.freeDrawingBrush.color = localColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;

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
  }, [fabricCanvas, currentTool, localColor, brushSize, handleSelection, updatePopupPosition]);

  useImperativeHandle(ref, () => ({
    addFileToCanvas: (file) => fabricCanvas && addFileToCanvas(file, fabricCanvas)
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
            currentColor={localColor}
          />
        </div>
      )}
      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
        <ColorPickerButton 
          currentColor={localColor} 
          setCurrentColor={setCurrentColor}
          onColorChange={handleColorChange}
        />
      </div>
    </div>
  );
});

export default Canvas;