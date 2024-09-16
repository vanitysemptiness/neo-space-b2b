import React, { useState } from 'react';
import Draggable from 'react-draggable';

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#808080',
  '#800000', '#808000', '#008000', '#800080', '#008080', '#000080'
];

function DraggableColorPalette({ currentColor, setCurrentColor, isVisible }) {
  const [position, setPosition] = useState({ x: 100, y: 100 });

  if (!isVisible) return null;

  return (
    <Draggable
      position={position}
      onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
      handle=".palette-handle"
    >
      <div className="draggable-palette">
        <div className="palette-handle">Color Palette</div>
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
      </div>
    </Draggable>
  );
}

export default DraggableColorPalette;