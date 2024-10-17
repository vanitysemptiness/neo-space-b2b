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
        '#FF0000', '#FF4500', '#FFFF00', '#00FF00', '#00BFFF', '#0000FF', '#8B00FF', '#FF00FF',
        '#FFFFFF', '#F5F5F5', '#FFFAF0', '#FAF0E6', '#FDF5E6', '#FFFACD', '#E0FFFF', '#B0E0E6',
        '#ADD8E6', '#87CEEB', '#87CEFA', '#00CED1', '#40E0D0', '#48D1CC', '#00FA9A', '#00FF7F',
        '#7CFC00', '#ADFF2F', '#FFD700', '#DAA520', '#CD853F', '#D2691E', '#8B4513', '#A0522D',
        '#800080', '#663399', '#4B0082', '#9370DB', '#BA55D3', '#DA70D6', '#EE82EE', '#000000'
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