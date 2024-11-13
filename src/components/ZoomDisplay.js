import React from 'react';

const ZoomDisplay = ({ zoom }) => {
  const displayZoom = `${(zoom * 100).toFixed(0)}%`;
  
  return (
    <div className="tool-button ml-8" style={{ cursor: 'default' }}>
      <span className="text-sm font-mono">{displayZoom}</span>
    </div>
  );
};

export default ZoomDisplay;