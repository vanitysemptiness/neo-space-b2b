import React, { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { saveToLocalStorage } from './CanvasPersistence';

const Square = ({ fabricCanvas, currentColor, setCurrentTool }) => {
  const squareRef = useRef(null);
  const startPointRef = useRef(null);

  const handleMouseDown = useCallback((event) => {
    const pointer = fabricCanvas.getPointer(event.e);
    startPointRef.current = pointer;

    squareRef.current = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      fill: currentColor,
      strokeWidth: 2,
      stroke: 'rgba(0,0,0,0.3)',
      selectable: false,
      evented: false,
    });
    fabricCanvas.add(squareRef.current);
  }, [fabricCanvas, currentColor]);

  const handleMouseMove = useCallback((event) => {
    if (!startPointRef.current || !squareRef.current) return;

    const pointer = fabricCanvas.getPointer(event.e);
    const startPoint = startPointRef.current;

    const left = Math.min(startPoint.x, pointer.x);
    const top = Math.min(startPoint.y, pointer.y);
    const width = Math.abs(startPoint.x - pointer.x);
    const height = Math.abs(startPoint.y - pointer.y);

    squareRef.current.set({
      left: left,
      top: top,
      width: width,
      height: height
    });
    fabricCanvas.renderAll();
  }, [fabricCanvas]);

  const handleMouseUp = useCallback(() => {
    startPointRef.current = null;

    if (squareRef.current) {
      squareRef.current.set({
        selectable: true,
        evented: true,
      });
      fabricCanvas.setActiveObject(squareRef.current);
      fabricCanvas.renderAll();
      saveToLocalStorage(fabricCanvas);
    }
    setCurrentTool('select');
  }, [fabricCanvas, setCurrentTool]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
    };
  }, [fabricCanvas, handleMouseDown, handleMouseMove, handleMouseUp]);

  return null;
};

export default Square;