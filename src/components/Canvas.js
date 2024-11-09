import React, { forwardRef, useRef, useEffect } from 'react';
import Square from './Square';
import Drawing from './Drawing';
import Selection from './Selection';

const Canvas = forwardRef(({ currentTool, setCurrentTool, fabricCanvas }, ref) => {
  const canvasRef = useRef(null);

  // Connect canvas to DOM
  useEffect(() => {
    if (fabricCanvas && canvasRef.current) {
      fabricCanvas.initialize(canvasRef.current);
      
      const handleResize = () => {
        fabricCanvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [fabricCanvas]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas ref={canvasRef} />
      {fabricCanvas && (
        <>
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
        </>
      )}
    </div>
  );
});

// Add display name for debugging
Canvas.displayName = 'Canvas';

export default Canvas;