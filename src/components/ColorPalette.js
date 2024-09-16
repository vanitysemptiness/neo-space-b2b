import React from 'react';

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#808080',
  '#800000', '#808000', '#008000', '#800080', '#008080', '#000080'
];

function ColorPalette({ currentColor, setCurrentColor }) {
  return (
    <div className="color-palette">
      {colors.map((color) => (
        <button
          key={color}
          className={`color-swatch ${currentColor === color ? 'selected' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => setCurrentColor(color)}
        />
      ))}
    </div>
  );
}

export default ColorPalette;