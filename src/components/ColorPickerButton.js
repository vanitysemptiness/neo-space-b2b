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
      clearButton: true,
      swatches: [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#FFFFFF', '#000000'
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