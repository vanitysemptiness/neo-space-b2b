import React from 'react';
import { handleDragOver } from './CanvasUtils';
import { addFileToCanvasWithPersistence } from './CanvasPersistence';

const DragAndDrop = ({ children, fabricCanvas }) => {
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && fabricCanvas) {
      addFileToCanvasWithPersistence(file, fabricCanvas);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </div>
  );
};

export default DragAndDrop;