import React, { useEffect, useRef } from 'react';

const HandTool = ({ fabricCanvas, currentTool }) => {
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!fabricCanvas || currentTool !== 'hand') return;

    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = 'grabbing';
      fabricCanvas.lastPosX = e.e.clientX;
      fabricCanvas.lastPosY = e.e.clientY;
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;

      const vpt = fabricCanvas.viewportTransform;
      vpt[4] += e.e.clientX - fabricCanvas.lastPosX;
      vpt[5] += e.e.clientY - fabricCanvas.lastPosY;
      fabricCanvas.requestRenderAll();
      fabricCanvas.lastPosX = e.e.clientX;
      fabricCanvas.lastPosY = e.e.clientY;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      fabricCanvas.defaultCursor = 'grab';
      fabricCanvas.selection = true;
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);

    fabricCanvas.defaultCursor = 'grab';
    fabricCanvas.hoverCursor = 'grab';

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.hoverCursor = 'default';
    };
  }, [fabricCanvas, currentTool]);

  return null;
};

export default HandTool;