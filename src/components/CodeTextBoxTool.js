import React, { useEffect, useRef, useCallback } from 'react';
import { useColor } from './ColorContext';
import CodeTextbox from './CodeTextbox';

const CodeTextboxTool = ({ fabricCanvas, currentTool, setCurrentTool }) => {
  const activeBoxRef = useRef(null);
  const startPointRef = useRef(null);
  const isDrawingRef = useRef(false);

  const finishDrawing = useCallback((codeBox) => {
    if (!fabricCanvas || !codeBox) return;
    
    if (codeBox.background.width > 50 && codeBox.background.height > 50) {
      codeBox.set({
        selectable: true,
        evented: true,
      });
      fabricCanvas.setActiveObject(codeBox.textbox);
      codeBox.textbox.enterEditing();
    } else {
      fabricCanvas.remove(codeBox);
    }
    
    fabricCanvas.renderAll();
    setCurrentTool('select');
    isDrawingRef.current = false;
  }, [fabricCanvas, setCurrentTool]);

  useEffect(() => {
    if (!fabricCanvas) return;
    
    const handleMouseDown = (e) => {
      if (currentTool !== 'code') return;
      isDrawingRef.current = true;

      const pointer = fabricCanvas.getPointer(e.e);
      startPointRef.current = pointer;
      
      activeBoxRef.current = new CodeTextbox({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        selectable: false,
        evented: false,
      });
      
      fabricCanvas.add(activeBoxRef.current);
      fabricCanvas.renderAll();
    };

    const handleMouseMove = (e) => {
      if (!isDrawingRef.current || !activeBoxRef.current || !startPointRef.current) return;
      
      const pointer = fabricCanvas.getPointer(e.e);
      
      const width = Math.abs(startPointRef.current.x - pointer.x);
      const height = Math.abs(startPointRef.current.y - pointer.y);
      
      activeBoxRef.current.set({
        left: Math.min(startPointRef.current.x, pointer.x),
        top: Math.min(startPointRef.current.y, pointer.y),
      });
      
      activeBoxRef.current.setDimensions({
        width: Math.max(width, 100),
        height: Math.max(height, 50),
      });
      
      fabricCanvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current || !activeBoxRef.current) return;
      finishDrawing(activeBoxRef.current);
      activeBoxRef.current = null;
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
  }, [fabricCanvas, currentTool, finishDrawing]);

  return null;
};

export default CodeTextboxTool;