import React, { useState, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';

const Camera = ({ canvas, children, currentTool }) => {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointer, setLastPointer] = useState(null);

  const handleWheel = useCallback((event) => {
    if (event.ctrlKey && canvas && canvas.getContext()) {
      event.preventDefault();
      const delta = event.deltaY;
      let newZoom = zoom * (1 - delta / 500);
      newZoom = Math.min(Math.max(0.1, newZoom), 5);

      const point = new fabric.Point(event.offsetX, event.offsetY);
      canvas.zoomToPoint(point, newZoom);
      setZoom(newZoom);
      canvas.renderAll();
    }
  }, [canvas, zoom]);

  const handleMouseDown = useCallback((event) => {
    if (canvas && canvas.getContext() && currentTool === 'hand') {
      setIsDragging(true);
      setLastPointer(canvas.getPointer(event.e, true));
      canvas.defaultCursor = 'grabbing';
      canvas.setCursor('grabbing');
    }
  }, [canvas, currentTool]);

  const handleMouseMove = useCallback((event) => {
    if (isDragging && canvas && canvas.getContext() && currentTool === 'hand' && lastPointer) {
      const currentPointer = canvas.getPointer(event.e, true);
      const deltaX = currentPointer.x - lastPointer.x;
      const deltaY = currentPointer.y - lastPointer.y;
      
      const vpt = canvas.viewportTransform;
      vpt[4] += deltaX;
      vpt[5] += deltaY;
      canvas.setViewportTransform(vpt);
      canvas.renderAll();

      setLastPointer(currentPointer);
    }
  }, [canvas, isDragging, lastPointer, currentTool]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastPointer(null);
    if (canvas && canvas.getContext() && currentTool === 'hand') {
      canvas.defaultCursor = 'grab';
      canvas.setCursor('grab');
    }
  }, [canvas, currentTool]);

  useEffect(() => {
    if (canvas && canvas.getContext()) {
      canvas.on('mouse:down', handleMouseDown);
      canvas.on('mouse:move', handleMouseMove);
      canvas.on('mouse:up', handleMouseUp);
      window.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        canvas.off('mouse:down', handleMouseDown);
        canvas.off('mouse:move', handleMouseMove);
        canvas.off('mouse:up', handleMouseUp);
        window.removeEventListener('wheel', handleWheel);
      };
    }
  }, [canvas, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  useEffect(() => {
    if (canvas && canvas.getContext()) {
      if (currentTool === 'hand') {
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
      } else {
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'default';
      }
    }
  }, [canvas, currentTool]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {children}
    </div>
  );
};

export default Camera;