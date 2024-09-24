import React, { useEffect, useRef } from 'react';
import '@melloware/coloris/dist/coloris.css';
import Coloris from '@melloware/coloris';

const ColorPickerButton = ({ currentColor, setCurrentColor }) => {
  const colorInputRef = useRef(null);

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
      setCurrentColor(color);
    };

    Coloris.setInstance('#colorPicker', {
      onChange: handleColorChange
    });

    return () => {
      Coloris.removeInstance('#colorPicker');
    };
  }, [setCurrentColor]);

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
        onChange={(e) => setCurrentColor(e.target.value)}
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