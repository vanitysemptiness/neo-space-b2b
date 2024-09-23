import React, { useEffect, useRef } from 'react';
import '@melloware/coloris/dist/coloris.css';
import Coloris from '@melloware/coloris';

const ColorPickerButton = ({ currentColor, setCurrentColor, onColorChange }) => {
  const colorInputRef = useRef(null);

  useEffect(() => {
    Coloris.init();
    Coloris({
      el: '#colorPicker',
      theme: 'large',
      themeMode: 'light',
      formatToggle: true,
      closeButton: false,
      clearButton: true,
      swatches: [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#FFFFFF', '#000000'
      ]
    });

    const handleColorChange = (event) => {
      const newColor = event.target.value;
      if (typeof setCurrentColor === 'function') {
        setCurrentColor(newColor);
      } else {
        console.warn('setCurrentColor is not a function');
      }
      if (typeof onColorChange === 'function') {
        onColorChange(newColor);
      }
    };

    const colorInput = colorInputRef.current;
    colorInput.addEventListener('input', handleColorChange);

    return () => {
      colorInput.removeEventListener('input', handleColorChange);
    };
  }, [setCurrentColor, onColorChange]);

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