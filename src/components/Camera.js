import React, { useState, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';

const Camera = ({ fabricCanvas, currentTool }) => {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointer, setLastPointer] = useState(null);

  const handleWheel = useCallback((opt) => {
    const event = opt.e;
    if (fabricCanvas) {
      event.preventDefault();
      event.stopPropagation();
      const delta = event.deltaY;
      let newZoom = fabricCanvas.getZoom() * (1 - delta / 500);
      newZoom = Math.min(Math.max(0.1, newZoom), 20);

      const point = new fabric.Point(opt.pointer.x, opt.pointer.y);
      fabricCanvas.zoomToPoint(point, newZoom);
      setZoom(newZoom);
    }
  }, [fabricCanvas]);

  const handleMouseDown = useCallback((opt) => {
    if (fabricCanvas && currentTool === 'hand') {
      setIsDragging(true);
      setLastPointer(opt.pointer);
      fabricCanvas.defaultCursor = 'grabbing';
      fabricCanvas.setCursor('grabbing');
    }
  }, [fabricCanvas, currentTool]);

  const handleMouseMove = useCallback((opt) => {
    if (isDragging && fabricCanvas && currentTool === 'hand' && lastPointer) {
      const currentPointer = opt.pointer;
      const deltaX = currentPointer.x - lastPointer.x;
      const deltaY = currentPointer.y - lastPointer.y;
      
      const vpt = fabricCanvas.viewportTransform;
      vpt[4] += deltaX;
      vpt[5] += deltaY;
      fabricCanvas.setViewportTransform(vpt);
      fabricCanvas.requestRenderAll();

      setLastPointer(currentPointer);
    }
  }, [fabricCanvas, isDragging, lastPointer, currentTool]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastPointer(null);
    if (fabricCanvas && currentTool === 'hand') {
      fabricCanvas.defaultCursor = 'grab';
      fabricCanvas.setCursor('grab');
    }
  }, [fabricCanvas, currentTool]);

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.on('mouse:wheel', handleWheel);
      fabricCanvas.on('mouse:down', handleMouseDown);
      fabricCanvas.on('mouse:move', handleMouseMove);
      fabricCanvas.on('mouse:up', handleMouseUp);

      return () => {
        fabricCanvas.off('mouse:wheel', handleWheel);
        fabricCanvas.off('mouse:down', handleMouseDown);
        fabricCanvas.off('mouse:move', handleMouseMove);
        fabricCanvas.off('mouse:up', handleMouseUp);
      };
    }
  }, [fabricCanvas, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (fabricCanvas) {
      if (currentTool === 'hand') {
        fabricCanvas.defaultCursor = 'grab';
        fabricCanvas.hoverCursor = 'grab';
      } else {
        fabricCanvas.defaultCursor = 'default';
        fabricCanvas.hoverCursor = 'default';
      }
    }
  }, [fabricCanvas, currentTool]);

  return null;
};

export default Camera;