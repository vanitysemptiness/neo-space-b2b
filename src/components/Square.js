import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const Square = ({ fabricCanvas, currentTool, currentColor }) => {
  const activeSquareRef = useRef(null);
  const startPointRef = useRef(null);

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleMouseDown = (e) => {
      if (currentTool !== 'square') return;
      
      // pointer as in mouse curser, I think these guys were foreign
      const pointer = fabricCanvas.getPointer(e.e);
      startPointRef.current = pointer;
      
      activeSquareRef.current = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: currentColor,
        selectable: false,
        evented: false,
      });
      
      fabricCanvas.add(activeSquareRef.current);
    };

    const handleMouseMove = (e) => {
      if (currentTool !== 'square' || !activeSquareRef.current || !startPointRef.current) return;
      
      const pointer = fabricCanvas.getPointer(e.e);
      const width = Math.abs(startPointRef.current.x - pointer.x);
      const height = Math.abs(startPointRef.current.y - pointer.y);
      
      activeSquareRef.current.set({
        left: Math.min(startPointRef.current.x, pointer.x),
        top: Math.min(startPointRef.current.y, pointer.y),
        width: width,
        height: height
      });
      
      fabricCanvas.renderAll();
    };

    const handleMouseUp = () => {
      if (currentTool !== 'square' || !activeSquareRef.current) return;
      
      activeSquareRef.current.set({
        selectable: true,
        evented: true,
      });
      
      fabricCanvas.setActiveObject(activeSquareRef.current);
      fabricCanvas.renderAll();
      
      activeSquareRef.current = null;
      startPointRef.current = null;
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
    };
  }, [fabricCanvas, currentTool, currentColor]);

  return null;
};

export default Square;