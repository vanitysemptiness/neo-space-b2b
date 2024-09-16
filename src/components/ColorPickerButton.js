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
      alpha: true,
      swatches: [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#FFFFFF', '#000000'
      ]
    });

    // Set up event listener for color changes
    const colorInput = colorInputRef.current;
    const handleColorChange = (event) => {
      setCurrentColor(event.target.value);
    };

    colorInput.addEventListener('change', handleColorChange);

    return () => {
      colorInput.removeEventListener('change', handleColorChange);
    };
  }, [setCurrentColor]);

  return (
    <div>
      <input
        type="text"
        id="colorPicker"
        ref={colorInputRef}
        defaultValue={currentColor}
        data-coloris
        style={{ display: 'none' }}
      />
      <button 
        onClick={() => colorInputRef.current.click()}
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