import React, { useState, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';

const Camera = ({ fabricCanvas, currentTool, onCameraUpdate, onZoomChange }) => {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointer, setLastPointer] = useState(null);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  const handleWheel = useCallback((opt) => {
    if (!fabricCanvas) return;
    
    const event = opt.e;
    event.preventDefault();
    event.stopPropagation();
    
    const delta = event.deltaY;
    let newZoom = fabricCanvas.getZoom() * (1 - delta / 500);
    newZoom = Math.min(Math.max(0.1, newZoom), 20);

    const point = new fabric.Point(opt.pointer.x, opt.pointer.y);
    fabricCanvas.zoomToPoint(point, newZoom);
    setZoom(newZoom);
    
    // Update both camera state and zoom display
    if (onCameraUpdate) {
      const vpt = fabricCanvas.viewportTransform;
      onCameraUpdate({
        zoom: newZoom,
        panX: vpt[4],
        panY: vpt[5]
      });
    }
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  }, [fabricCanvas, onCameraUpdate, onZoomChange]);

  const handleMouseDown = useCallback((opt) => {
    if (!fabricCanvas || currentTool !== 'hand') return;
    
    setIsDragging(true);
    setLastPointer(opt.pointer);
    fabricCanvas.defaultCursor = 'grabbing';
    fabricCanvas.setCursor('grabbing');
  }, [fabricCanvas, currentTool]);

  const handleMouseMove = useCallback((opt) => {
    if (!isDragging || !fabricCanvas || currentTool !== 'hand' || !lastPointer) return;

    const currentPointer = opt.pointer;
    const deltaX = currentPointer.x - lastPointer.x;
    const deltaY = currentPointer.y - lastPointer.y;

    const vpt = fabricCanvas.viewportTransform;
    vpt[4] += deltaX;
    vpt[5] += deltaY;
    
    fabricCanvas.setViewportTransform(vpt);
    fabricCanvas.requestRenderAll();

    setPanPosition({
      x: vpt[4],
      y: vpt[5]
    });

    if (onCameraUpdate) {
      onCameraUpdate({
        zoom: zoom,
        panX: vpt[4],
        panY: vpt[5]
      });
    }
    
    setLastPointer(currentPointer);
  }, [fabricCanvas, isDragging, lastPointer, currentTool, zoom, onCameraUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastPointer(null);
    
    if (fabricCanvas && currentTool === 'hand') {
      fabricCanvas.defaultCursor = 'grab';
      fabricCanvas.setCursor('grab');
    }
  }, [fabricCanvas, currentTool]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on('mouse:wheel', handleWheel);
    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);

    if (currentTool === 'hand') {
      fabricCanvas.defaultCursor = 'grab';
      fabricCanvas.hoverCursor = 'grab';
    }

    return () => {
      fabricCanvas.off('mouse:wheel', handleWheel);
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
    };
  }, [
    fabricCanvas,
    currentTool,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  ]);

  // Methods that could be exposed via ref if needed
  const zoomTo = useCallback((scale) => {
    if (!fabricCanvas) return;
    fabricCanvas.setZoom(scale);
    fabricCanvas.renderAll();
    setZoom(scale);
    if (onZoomChange) {
      onZoomChange(scale);
    }
  }, [fabricCanvas, onZoomChange]);

  const panTo = useCallback((x, y) => {
    if (!fabricCanvas) return;
    fabricCanvas.absolutePan({ x, y });
    fabricCanvas.renderAll();
    setPanPosition({ x, y });
    if (onCameraUpdate) {
      onCameraUpdate({
        zoom: zoom,
        panX: x,
        panY: y
      });
    }
  }, [fabricCanvas, zoom, onCameraUpdate]);

  return null;
};

export default Camera;