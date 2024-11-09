import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { useColor } from './ColorContext';

class SquareDrawer {
  static createSquare(fabricCanvas, params) {
    const square = new fabric.Rect({
      left: params.x,
      top: params.y,
      width: params.size || params.width || 0,
      height: params.size || params.height || 0,
      fill: params.color || '#000000',
      originX: 'left',  // Changed from 'center'
      originY: 'top',   // Changed from 'center'
      selectable: params.selectable !== false,
      evented: params.evented !== false
    });
    
    fabricCanvas.add(square);
    fabricCanvas.renderAll();
    return square;
  }

  static drawSquareLLM(fabricCanvas, params) {
    // For LLM we still want center origin since x,y are meant to be center points
    const square = new fabric.Rect({
      left: params.x,
      top: params.y,
      width: params.size,
      height: params.size,
      fill: params.color || '#000000',
      originX: 'center',
      originY: 'center',
    });
    fabricCanvas.add(square);
    fabricCanvas.renderAll();
    return square;
  }
}

const Square = ({ fabricCanvas, currentTool, setCurrentTool }) => {
  const activeSquareRef = useRef(null);
  const startPointRef = useRef(null);
  const { currentColor } = useColor();

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleMouseDown = (e) => {
      if (currentTool !== 'square') return;
      
      const pointer = fabricCanvas.getPointer(e.e);
      startPointRef.current = pointer;
      
      activeSquareRef.current = SquareDrawer.createSquare(fabricCanvas, {
        x: pointer.x,
        y: pointer.y,
        width: 0,
        height: 0,
        color: currentColor,
        selectable: false,
        evented: false
      });
    };

    const handleMouseMove = (e) => {
      if (currentTool !== 'square' || !activeSquareRef.current || !startPointRef.current) return;
      
      const pointer = fabricCanvas.getPointer(e.e);
      
      // Calculate dimensions from start point
      const width = Math.abs(startPointRef.current.x - pointer.x);
      const height = Math.abs(startPointRef.current.y - pointer.y);
      
      // Set left/top to the minimum x/y coordinates
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
  }, [fabricCanvas, currentTool, currentColor, setCurrentTool]);

  return null;
};

export { Square as default, SquareDrawer };