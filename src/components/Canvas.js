import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';
import { useColor } from './ColorContext';
import Camera from './Camera';
import Selection from './Selection';
import Square from './Square';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage, 
  clearCanvas, 
  setupCanvasPersistence, 
  addFileToCanvasWithPersistence 
} from './CanvasPersistence';
import { fabricGif } from './fabricGif';

const Canvas = forwardRef(({ currentTool, setCurrentTool }, ref) => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const { currentColor } = useColor();
  const [showPopupToolbar, setShowPopupToolbar] = useState(false);
  const [popupToolbarPosition, setPopupToolbarPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setFabricCanvas(canvas);

      loadFromLocalStorage(canvas);
      setupCanvasPersistence(canvas);

      const handleResize = () => {
        canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);

      // Set up animation loop
      const render = () => {
        canvas.renderAll();
        fabric.util.requestAnimFrame(render);
      };
      fabric.util.requestAnimFrame(render);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.dispose();
      };
    }
  }, []);

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = currentTool === 'draw';
      fabricCanvas.selection = currentTool === 'select';
    }
  }, [fabricCanvas, currentTool]);

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.freeDrawingBrush.color = currentColor;
    }
  }, [fabricCanvas, currentColor]);

  useImperativeHandle(ref, () => ({
    addFileToCanvas: async (file) => {
      if (fabricCanvas && file) {
        if (file.type === 'image/gif') {
          const gif = await fabricGif(file, 200, 200); // Adjust max width and height as needed
          if (!gif.error) {
            gif.set({ left: 100, top: 100 }); // Adjust position as needed
            fabricCanvas.add(gif);
            fabricCanvas.renderAll();
          } else {
            console.error('Error loading GIF:', gif.error);
          }
        } else {
          addFileToCanvasWithPersistence(file, fabricCanvas);
        }
      }
    },
    saveCanvas: () => {
      if (fabricCanvas) {
        saveToLocalStorage(fabricCanvas);
      }
    },
    loadCanvas: () => {
      if (fabricCanvas) {
        loadFromLocalStorage(fabricCanvas);
        fabricCanvas.requestRenderAll();
      }
    },
    clearCanvas: () => {
      if (fabricCanvas) {
        clearCanvas(fabricCanvas);
        fabricCanvas.requestRenderAll();
      }
    },
    isObjectSelected: () => {
      return fabricCanvas ? !!fabricCanvas.getActiveObject() : false;
    },
  }));

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas ref={canvasRef} />
      <Camera 
        fabricCanvas={fabricCanvas}
        currentTool={currentTool}
      />
      <Selection
        fabricCanvas={fabricCanvas}
        showPopupToolbar={showPopupToolbar}
        setShowPopupToolbar={setShowPopupToolbar}
        popupToolbarPosition={popupToolbarPosition}
        setPopupToolbarPosition={setPopupToolbarPosition}
      />
      {currentTool === 'square' && (
        <Square
          fabricCanvas={fabricCanvas}
          currentColor={currentColor}
          setCurrentTool={setCurrentTool}
        />
      )}
    </div>
  );
});

export default Canvas;