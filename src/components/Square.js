import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const Square = ({ fabricCanvas, currentColor, currentTool, setCurrentTool }) => {
  const squareRef = useRef(null);
  const startPointRef = useRef(null);

  useEffect(() => {
    if (!fabricCanvas || currentTool !== 'square') return;

    const handleMouseDown = (e) => {
      const pointer = fabricCanvas.getPointer(e.e);
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
      startPointRef.current = pointer;
    };

    const handleMouseMove = (e) => {
      if (!squareRef.current || !startPointRef.current) return;

      const pointer = fabricCanvas.getPointer(e.e);
      const left = Math.min(startPointRef.current.x, pointer.x);
      const top = Math.min(startPointRef.current.y, pointer.y);
      const width = Math.abs(startPointRef.current.x - pointer.x);
      const height = Math.abs(startPointRef.current.y - pointer.y);

      squareRef.current.set({ left, top, width, height });
      fabricCanvas.renderAll();
    };

    const handleMouseUp = () => {
      if (squareRef.current) {
        squareRef.current.set({
          selectable: true,
          evented: true,
        });
        fabricCanvas.setActiveObject(squareRef.current);
        fabricCanvas.renderAll();
      }
      squareRef.current = null;
      startPointRef.current = null;
      setCurrentTool('select');
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
    };
  }, [fabricCanvas, currentColor, currentTool, setCurrentTool]);

  return null;
};

export default Square;