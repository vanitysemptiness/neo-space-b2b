import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';

const Canvas = forwardRef(({ currentTool, currentColor }, ref) => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: false,
      width: window.innerWidth,
      height: window.innerHeight,
      selection: true,
    });
    setFabricCanvas(canvas);

    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((obj) => {
            canvas.remove(obj);
          });
          canvas.discardActiveObject().renderAll();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = currentTool === 'draw';
      fabricCanvas.selection = currentTool === 'select';
      fabricCanvas.freeDrawingBrush.color = currentColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }
  }, [fabricCanvas, currentTool, currentColor, brushSize]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      addFileToCanvas(file);
    }
  };

  const addFileToCanvas = (file) => {
    if (file && fabricCanvas) {
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension)) {
        renderImage(file);
      } else {
        renderGenericFileIcon(file);
      }
    }
  };

  const renderImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        img.scaleToWidth(100); // Adjust size as needed
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const renderGenericFileIcon = (file) => {
    const iconSvg = getGenericFileIconSvg();
    fabric.loadSVGFromString(iconSvg, (objects, options) => {
      const icon = fabric.util.groupSVGElements(objects, options);
      icon.scaleToWidth(50); // Adjust size as needed

      const text = new fabric.Text(file.name, {
        fontSize: 14,
        originX: 'center',
        originY: 'top',
        top: icon.height + 10, // Position text below the icon
        width: 100,
        textAlign: 'center'
      });

      const group = new fabric.Group([icon, text], {
        left: 100,
        top: 100,
        originX: 'center',
        originY: 'center'
      });

      // Ensure the text is always below the icon
      icon.set({
        originY: 'bottom',
        top: -text.height / 2
      });
      text.set({
        originY: 'top',
        top: icon.height / 2
      });

      fabricCanvas.add(group);
      fabricCanvas.renderAll();
    });
  };

  const getGenericFileIconSvg = () => {
    // This is a simple file icon SVG. You can replace it with any other generic file icon SVG.
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M16,18H8v-2h8V18z M16,14H8v-2h8V14z M13,9V3.5L18.5,9H13z" fill="#000000"/>
      </svg>
    `;
  };

  useImperativeHandle(ref, () => ({
    addFileToCanvas
  }));

  return (
    <div 
      id="canvas-container" 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas ref={canvasRef} />
    </div>
  );
});

export default Canvas;