import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const Textbox = ({ fabricCanvas, currentColor, currentTool, setCurrentTool }) => {
  const textboxRef = useRef(null);
  const startPointRef = useRef(null);

  useEffect(() => {
    if (!fabricCanvas || currentTool !== 'textbox') return;

    const handleMouseDown = (e) => {
      const pointer = fabricCanvas.getPointer(e.e);
      startPointRef.current = pointer;
      textboxRef.current = new fabric.Textbox('', {
        left: pointer.x,
        top: pointer.y,
        fontSize: 20,
        fill: currentColor,
        width: 0,
        height: 0,
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(textboxRef.current);
    };

    const handleMouseMove = (e) => {
      if (!textboxRef.current || !startPointRef.current) return;

      const pointer = fabricCanvas.getPointer(e.e);
      const width = Math.abs(startPointRef.current.x - pointer.x);
      const height = Math.abs(startPointRef.current.y - pointer.y);

      textboxRef.current.set({
        width: Math.max(width, 50),  // Minimum width of 50
        height: Math.max(height, 20)  // Minimum height of 20
      });
      fabricCanvas.renderAll();
    };

    const handleMouseUp = () => {
      if (textboxRef.current) {
        textboxRef.current.set({
          selectable: true,
          evented: true,
        });
        fabricCanvas.setActiveObject(textboxRef.current);
        fabricCanvas.renderAll();
      }
      textboxRef.current = null;
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

export default Textbox;