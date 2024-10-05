import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const Drawing = ({ fabricCanvas, currentColor, brushSize }) => {
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = true;
    fabricCanvas.freeDrawingBrush.color = currentColor;
    fabricCanvas.freeDrawingBrush.width = brushSize;

    const handleMouseDown = () => {
      isDrawingRef.current = true;
    };

    const handleMouseUp = () => {
      isDrawingRef.current = false;
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:up', handleMouseUp);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:up', handleMouseUp);
      fabricCanvas.isDrawingMode = false;
    };
  }, [fabricCanvas, currentColor, brushSize]);

  return null;
};

export default Drawing;