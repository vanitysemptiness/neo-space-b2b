import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import Square from './Square';
import Drawing from './Drawing';
import Selection from './Selection';
import TextboxTool from './Textbox';
import Camera from './Camera';
import DragAndDrop from './DragAndDrop';
import { setupCanvasPersistence, loadFromLocalStorage, saveToLocalStorage } from './CanvasPersistence';
import { setupAnimationLoop } from './CanvasUtils';

const Canvas = forwardRef(({ currentTool, setCurrentTool, fabricCanvas, onZoomChange }, ref) => {
  const canvasRef = useRef(null);
  const [cameraState, setCameraState] = useState({ zoom: 1, panX: 0, panY: 0 });

  // Configure selection controls and styles
  useEffect(() => {
    if (fabricCanvas) {
      // Disable rotation control and middle controls
      fabric.Object.prototype.setControlsVisibility({
        mtr: false,  // middle top rotation
        ml: false,   // middle left
        mt: false,   // middle top
        mr: false,   // middle right
        mb: false    // middle bottom
      });

      // Set up corner controls with default handlers
      fabric.Object.prototype.controls = {
        tl: new fabric.Control({
          x: -0.5,
          y: -0.5,
          actionHandler: fabric.controlsUtils.scalingEqually,
          cursorStyle: 'nw-resize'
        }),
        tr: new fabric.Control({
          x: 0.5,
          y: -0.5,
          actionHandler: fabric.controlsUtils.scalingEqually,
          cursorStyle: 'ne-resize'
        }),
        bl: new fabric.Control({
          x: -0.5,
          y: 0.5,
          actionHandler: fabric.controlsUtils.scalingEqually,
          cursorStyle: 'sw-resize'
        }),
        br: new fabric.Control({
          x: 0.5,
          y: 0.5,
          actionHandler: fabric.controlsUtils.scalingEqually,
          cursorStyle: 'se-resize'
        })
      };

      // Set default styles directly
      fabric.Object.prototype.borderColor = '#2196F3';
      fabric.Object.prototype.borderScaleFactor = 2;
      fabric.Object.prototype.cornerColor = 'white';
      fabric.Object.prototype.cornerStrokeColor = '#2196F3';
      fabric.Object.prototype.cornerSize = 14;
      fabric.Object.prototype.cornerStyle = 'circle';
      fabric.Object.prototype.cornerStrokeWidth = 2;
      fabric.Object.prototype.transparentCorners = false;
      fabric.Object.prototype.padding = 8;

      // Configure group selection
      fabric.Group.prototype.subTargetCheck = false;
      fabric.Group.prototype.borderColor = '#2196F3';
      fabric.Group.prototype.borderScaleFactor = 2;
      fabric.Group.prototype.cornerColor = 'white';
      fabric.Group.prototype.cornerStrokeColor = '#2196F3';
      fabric.Group.prototype.cornerSize = 14;
      fabric.Group.prototype.cornerStyle = 'circle';
      fabric.Group.prototype.cornerStrokeWidth = 2;
      fabric.Group.prototype.transparentCorners = false;
      fabric.Group.prototype.padding = 8;

      // Re-render any existing objects
      fabricCanvas.getObjects().forEach(obj => {
        obj.setCoords();
      });
      fabricCanvas.requestRenderAll();
    }
  }, [fabricCanvas]);

  useEffect(() => {
    if (fabricCanvas && canvasRef.current) {
      fabricCanvas.initialize(canvasRef.current);

      const handleResize = () => {
        fabricCanvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
        fabricCanvas.renderAll();
      };

      const handleCameraChange = () => {
        const zoom = fabricCanvas.getZoom();
        const vpt = fabricCanvas.viewportTransform;
        setCameraState({
          zoom,
          panX: vpt[4],
          panY: vpt[5]
        });
        if (onZoomChange) {
          onZoomChange(zoom);
        }
      };

      setupAnimationLoop(fabricCanvas);
      setupCanvasPersistence(fabricCanvas);
      loadFromLocalStorage(fabricCanvas);

      fabricCanvas.on('mouse:wheel', handleCameraChange);
      fabricCanvas.on('object:moving', handleCameraChange);
      fabricCanvas.on('object:modified', () => saveToLocalStorage(fabricCanvas));
      fabricCanvas.on('object:added', () => saveToLocalStorage(fabricCanvas));
      fabricCanvas.on('object:removed', () => saveToLocalStorage(fabricCanvas));
      window.addEventListener('resize', handleResize);

      handleResize();

      return () => {
        fabricCanvas.off('mouse:wheel', handleCameraChange);
        fabricCanvas.off('object:moving', handleCameraChange);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [fabricCanvas, onZoomChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!fabricCanvas) return;

      if ((e.keyCode === 46 || e.keyCode === 8) && fabricCanvas.getActiveObjects().length > 0) {
        e.preventDefault();
        fabricCanvas.getActiveObjects().forEach(obj => fabricCanvas.remove(obj));
        fabricCanvas.discardActiveObject().renderAll();
      }

      if (e.ctrlKey && e.keyCode === 90) {
        e.preventDefault();
      }

      if (e.ctrlKey && e.keyCode === 89) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas]);

  const gridStyle = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    backgroundSize: `${20 * cameraState.zoom}px ${20 * cameraState.zoom}px`,
    backgroundPosition: `${cameraState.panX}px ${cameraState.panY}px`,
    backgroundImage: `radial-gradient(rgba(173, 216, 230, 0.8) ${cameraState.zoom * 1.5}px, transparent 0)`,
  };

  return (
    <DragAndDrop fabricCanvas={fabricCanvas}>
      <div style={gridStyle}>
        <canvas ref={canvasRef} />
        {fabricCanvas && (
          <>
            <Camera 
              fabricCanvas={fabricCanvas}
              currentTool={currentTool}
              onCameraUpdate={setCameraState}
              onZoomChange={onZoomChange}
            />
            <Square 
              fabricCanvas={fabricCanvas}
              currentTool={currentTool}
              setCurrentTool={setCurrentTool}
            />
            <Drawing 
              fabricCanvas={fabricCanvas}
              currentTool={currentTool}
            />
            <Selection 
              fabricCanvas={fabricCanvas}
              currentTool={currentTool}
            />
            <TextboxTool
              fabricCanvas={fabricCanvas}
              currentTool={currentTool}
              setCurrentTool={setCurrentTool}
            />
          </>
        )}
      </div>
    </DragAndDrop>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;