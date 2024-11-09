import React, { useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { useColor } from './ColorContext';

const TextboxTool = ({ fabricCanvas, currentTool, setCurrentTool }) => {
  const { currentColor } = useColor();
  
  const handleMouseUp = useCallback((textbox) => {
    if (!fabricCanvas || !textbox) return;
    
    textbox.set({
      selectable: true,
      evented: true,
    });
    fabricCanvas.setActiveObject(textbox);
    textbox.enterEditing();
    fabricCanvas.renderAll();
    setCurrentTool('select');
  }, [fabricCanvas, setCurrentTool]);

  useEffect(() => {
    if (!fabricCanvas) return;
    
    const handleMouseDown = (e) => {
      if (currentTool !== 'textbox') return;

      const pointer = fabricCanvas.getPointer(e.e);
      const textbox = new fabric.Textbox('Text here...', {
        left: pointer.x,
        top: pointer.y,
        fontSize: 20,
        fill: currentColor,
        width: 150,
        selectable: false,
        evented: false,
      });
      
      fabricCanvas.add(textbox);
      fabricCanvas.renderAll();
      
      // Create one-time mouse up handler
      const mouseUpHandler = () => {
        handleMouseUp(textbox);
        // Immediately remove the handler after first use
        fabricCanvas.off('mouse:up', mouseUpHandler);
      };
      
      fabricCanvas.on('mouse:up', mouseUpHandler);
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    
    // Cleanup all handlers on unmount or tool change
    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      // Remove any lingering mouse:up handlers
      fabricCanvas.off('mouse:up');
    };
  }, [fabricCanvas, currentTool, currentColor, handleMouseUp]);

  return null;
};

export default TextboxTool;