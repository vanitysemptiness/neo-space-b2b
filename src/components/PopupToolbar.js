import React from 'react';
import { FiTrash2 } from 'react-icons/fi';
import ColorPickerButton from './ColorPickerButton';
import { useColor } from './ColorContext';

const PopupToolbar = ({ onDelete }) => {
  const { currentColor, changeColor } = useColor();

  return (
    <div className="popup-toolbar">
      <button onClick={onDelete}>
        <FiTrash2 color="red" />
      </button>
      <ColorPickerButton
        currentColor={currentColor}
        setCurrentColor={changeColor}
      />
    </div>
  );
};

export default PopupToolbar;