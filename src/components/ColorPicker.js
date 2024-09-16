import React from 'react';

function ColorPicker({ currentColor, setCurrentColor }) {
  return (
    <input
      type="color"
      value={currentColor}
      onChange={(e) => setCurrentColor(e.target.value)}
    />
  );
}

export default ColorPicker;