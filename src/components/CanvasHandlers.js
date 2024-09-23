import { useCallback } from 'react';

export const useCanvasHandlers = (fabricCanvas, setShowPopupToolbar, setPopupToolbarPosition, currentColor) => {
  const updatePopupPosition = useCallback(() => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      const boundingRect = activeObject.getBoundingRect(true);
      const zoom = fabricCanvas.getZoom();
      const vpt = fabricCanvas.viewportTransform;
      setPopupToolbarPosition({
        top: (boundingRect.top * zoom + vpt[5]) + boundingRect.height * zoom + 10, // Position below the object
        left: (boundingRect.left * zoom + vpt[4]) + (boundingRect.width * zoom / 2) - 50
      });
    }
  }, [fabricCanvas, setPopupToolbarPosition]);

  const handleSelection = useCallback(() => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      updatePopupPosition();
      setShowPopupToolbar(true);
    } else {
      setShowPopupToolbar(false);
    }
  }, [fabricCanvas, setShowPopupToolbar, updatePopupPosition]);

  const handleDelete = useCallback(() => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === 'activeSelection') {
        activeObject.forEachObject((obj) => fabricCanvas.remove(obj));
      } else {
        fabricCanvas.remove(activeObject);
      }
      fabricCanvas.discardActiveObject().renderAll();
      setShowPopupToolbar(false);
    }
  }, [fabricCanvas, setShowPopupToolbar]);

  const handleChangeColor = useCallback(() => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === 'activeSelection') {
        activeObject.forEachObject((obj) => {
          if (obj.stroke) obj.set('stroke', currentColor);
          if (obj.fill) obj.set('fill', currentColor);
        });
      } else {
        if (activeObject.stroke) activeObject.set('stroke', currentColor);
        if (activeObject.fill) activeObject.set('fill', currentColor);
      }
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas, currentColor]);

  return { handleSelection, handleDelete, handleChangeColor, updatePopupPosition };
};