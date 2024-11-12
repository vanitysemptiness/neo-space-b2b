import React, { forwardRef, useRef, useEffect, useState } from 'react';
import Square from './Square';
import Drawing from './Drawing';
import Selection from './Selection';
import TextboxTool from './Textbox';
import Camera from './Camera';

const Canvas = forwardRef(({ currentTool, setCurrentTool, fabricCanvas }, ref) => {
  const canvasRef = useRef(null);
  const [cameraState, setCameraState] = useState({ zoom: 1, panX: 0, panY: 0 });

  useEffect(() => {
    if (fabricCanvas && canvasRef.current) {
      fabricCanvas.initialize(canvasRef.current);
      
      const handleResize = () => {
        fabricCanvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      const handleCameraChange = () => {
        const zoom = fabricCanvas.getZoom();
        const vpt = fabricCanvas.viewportTransform;
        setCameraState({
          zoom,
          panX: vpt[4],
          panY: vpt[5]
        });
      };

      fabricCanvas.on('mouse:wheel', handleCameraChange);
      fabricCanvas.on('object:moving', handleCameraChange);
      window.addEventListener('resize', handleResize);

      return () => {
        fabricCanvas.off('mouse:wheel', handleCameraChange);
        fabricCanvas.off('object:moving', handleCameraChange);
        window.removeEventListener('resize', handleResize);
      };
    }
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
    <div style={gridStyle}>
      <canvas ref={canvasRef} />
      {fabricCanvas && (
        <>
          <Camera 
            fabricCanvas={fabricCanvas} 
            currentTool={currentTool}
            onCameraUpdate={setCameraState}
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
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;