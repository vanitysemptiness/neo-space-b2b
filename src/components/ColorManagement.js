

import { useState, useCallback } from 'react';

export const useColorManagement = (saveToLocalStorage) => {
  const [currentColor, setCurrentColor] = useState('#000000');

  const updateObjectColor = useCallback((obj, color) => {
    if (obj.type === 'path') {
      obj.set('stroke', color);
    } else {
      if (obj.stroke) obj.set('stroke', color);
      if (obj.fill) obj.set('fill', color);
    }
  }, []);

  const updateSelectedObjectsColor = useCallback((canvas, color) => {
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
  }, [updateObjectColor, saveToLocalStorage]);

  const handleColorChange = useCallback((canvas, color) => {
    updateSelectedObjectsColor(canvas, color);
  }, [updateSelectedObjectsColor]);

  return { currentColor, setCurrentColor, handleColorChange };
};