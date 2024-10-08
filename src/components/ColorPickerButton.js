import React, { useEffect, useRef } from 'react';
import '@melloware/coloris/dist/coloris.css';
import Coloris from '@melloware/coloris';
import { useColor } from './ColorContext';

const ColorPickerButton = () => {
  const colorInputRef = useRef(null);
  const { currentColor, changeColor } = useColor();

  useEffect(() => {
    Coloris.init();
    Coloris({
      el: '#colorPicker',
      theme: 'large',
      themeMode: 'light',
      formatToggle: true,
      closeButton: true,
      clearButton: false,
      swatches: [
        '#FF0000', // Red
        '#FF4500', // Orange
        '#FFFF00', // Yellow
        '#00FF00', // Lime
        '#00BFFF', // Sky Blue
        '#0000FF', // Blue
        '#8B00FF', // Purple
        '#FF00FF', // Magenta
        '#FFFFFF', // White
        '#F5F5F5', // Soft White
        '#FFFAF0', // Ivory
        '#FAF0E6', // Linen
        '#FDF5E6', // Old Lace
        '#FFFACD', // Lemon Chiffon
        '#E0FFFF', // Light Cyan
        '#B0E0E6', // Powder Blue
        '#ADD8E6', // Light Blue
        '#87CEEB', // Sky Blue
        '#87CEFA', // Light Sky Blue
        '#00CED1', // Dark Turquoise
        '#40E0D0', // Turquoise
        '#48D1CC', // Medium Turquoise
        '#00FA9A', // Medium Spring Green
        '#00FF7F', // Spring Green
        '#7CFC00', // Lawn Green
        '#ADFF2F', // Green-Yellow
        '#FFD700', // Gold
        '#DAA520', // Goldenrod
        '#CD853F', // Peru
        '#D2691E', // Chocolate
        '#8B4513', // Saddle Brown
        '#A0522D', // Sienna
        '#800080', // Purple
        '#663399', // Rebecca Purple
        '#4B0082', // Indigo
        '#9370DB', // Medium Purple
        '#BA55D3', // Medium Orchid
        '#DA70D6', // Orchid
        '#EE82EE',  // Violet
        '#000000'
      ],
      inline: false,
      margin: 10,
    });

    const handleColorChange = (color) => {
      changeColor(color);
    };

    Coloris.setInstance('#colorPicker', {
      onChange: handleColorChange
    });

    return () => {
      Coloris.removeInstance('#colorPicker');
    };
  }, [changeColor]);

  const handleButtonClick = () => {
    colorInputRef.current.click();
  };

  return (
    <div>
      <input
        type="text"
        id="colorPicker"
        ref={colorInputRef}
        value={currentColor}
        data-coloris
        style={{ display: 'none' }}
        onChange={(e) => changeColor(e.target.value)}
      />
      <button
        onClick={handleButtonClick}
        style={{
          backgroundColor: currentColor,
          width: '30px',
          height: '30px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: 0,
          cursor: 'pointer'
        }}
        aria-label={`Current color: ${currentColor}`}
      />
    </div>
  );
};

export default ColorPickerButton;