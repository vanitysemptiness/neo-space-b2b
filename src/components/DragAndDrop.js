import React from 'react';
import { handleDragOver, handleDrop } from './CanvasUtils';

const DragAndDrop = ({ children, fabricCanvas }) => {
  return (
    <div
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, fabricCanvas)}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </div>
  );
};

export default DragAndDrop;