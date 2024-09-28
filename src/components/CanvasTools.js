import { useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { saveToLocalStorage } from './CanvasPersistence';

export const useCanvasTools = (fabricCanvasRef, currentTool, currentColor, setCurrentTool) => {
  const isDrawingRef = useRef(false);
  const startPointRef = useRef(null);
  const squareRef = useRef(null);

  const handleMouseDown = useCallback((event) => {
    if (currentTool === 'square') {
      isDrawingRef.current = true;
      const canvas = fabricCanvasRef.current;
      startPointRef.current = canvas.getPointer(event.e);
      squareRef.current = new fabric.Rect({
        left: startPointRef.current.x,
        top: startPointRef.current.y,
        width: 0,
        height: 0,
        fill: currentColor,
        strokeWidth: 2,
        stroke: 'rgba(0,0,0,0.3)',
        rx: 10,
        ry: 10,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.3)',
          blur: 10,
          offsetX: 5,
          offsetY: 5
        }),
        selectable: false,
        evented: false,
      });
      canvas.add(squareRef.current);
    } else if (currentTool === 'textbox') {
      canvas.on('mouse:down', (event) => handleTextboxMode.mousedown(canvas, canvas.getPointer(event.e), currentColor));
      canvas.on('mouse:move', (event) => handleTextboxMode.mousemove(canvas, canvas.getPointer(event.e)));
      canvas.on('mouse:up', () => handleTextboxMode.mouseup(canvas, setCurrentTool));
    }
  }, [currentTool, currentColor, fabricCanvasRef]);

  const handleMouseMove = useCallback((event) => {
    if (currentTool === 'square' && isDrawingRef.current) {
      const canvas = fabricCanvasRef.current;
      const pointer = canvas.getPointer(event.e);
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
      canvas.renderAll();
    } 
  }, [currentTool, fabricCanvasRef]);

  const handleMouseUp = useCallback(() => {
    if (currentTool === 'square' && isDrawingRef.current) {
      isDrawingRef.current = false;
      const canvas = fabricCanvasRef.current;
      squareRef.current.set({
        selectable: true,
        evented: true,
      });
      canvas.setActiveObject(squareRef.current);
      canvas.renderAll();
      saveToLocalStorage(canvas);
      setCurrentTool('select');
    }
  }, [currentTool, setCurrentTool, fabricCanvasRef]);

  return { handleMouseDown, handleMouseMove, handleMouseUp };
};