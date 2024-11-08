import React, { useState, useEffect, useRef } from 'react';
import { useColor } from './ColorContext';

const Drawing = ({ fabricCanvas, currentTool }) => {
  const [brushSize, setBrushSize] = useState(5);
  const cursorRef = useRef(null);
  const { currentColor } = useColor();

  const updateCursor = () => {
    if (!cursorRef.current) return;
    cursorRef.current.style.width = `${brushSize}px`;
    cursorRef.current.style.height = `${brushSize}px`;
    cursorRef.current.style.backgroundColor = currentColor;
  };

  const handleMouseMove = (e) => {
    if (!cursorRef.current || currentTool !== 'draw') return;
    cursorRef.current.style.left = `${e.clientX - brushSize/2}px`;
    cursorRef.current.style.top = `${e.clientY - brushSize/2}px`;
  };

  // Set up drawing mode and cursor
  useEffect(() => {
    if (!fabricCanvas) return;

    if (currentTool === 'draw') {
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.freeDrawingBrush.width = brushSize;
      fabricCanvas.freeDrawingBrush.color = currentColor;
      fabricCanvas.defaultCursor = 'none';
      fabricCanvas.hoverCursor = 'none';
      
      // Create custom cursor
      if (!cursorRef.current) {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-dot';
        cursor.style.position = 'fixed';
        cursor.style.pointerEvents = 'none';
        cursor.style.borderRadius = '50%';
        cursor.style.zIndex = '9999';
        document.body.appendChild(cursor);
        cursorRef.current = cursor;
      }
      
      updateCursor();
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.hoverCursor = 'default';
      
      // Remove custom cursor
      if (cursorRef.current) {
        document.body.removeChild(cursorRef.current);
        cursorRef.current = null;
      }
      window.removeEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (cursorRef.current) {
        document.body.removeChild(cursorRef.current);
        cursorRef.current = null;
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [fabricCanvas, currentTool, brushSize, currentColor]);

  // No visible UI elements needed
  return null;
};

export default Drawing;