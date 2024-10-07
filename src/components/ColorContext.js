import React, { createContext, useState, useContext, useCallback } from 'react';

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [currentColor, setCurrentColor] = useState('#000000');

  const changeColor = useCallback((newColor) => {
    setCurrentColor(newColor);
  }, []);

  return (
    <ColorContext.Provider value={{ currentColor, changeColor }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColor = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColor must be used within a ColorProvider');
  }
  return context;
};