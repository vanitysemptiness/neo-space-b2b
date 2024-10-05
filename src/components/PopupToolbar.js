import React from 'react';
import { FiTrash2 } from 'react-icons/fi';
import ColorPickerButton from './ColorPickerButton';

const PopupToolbar = ({ onDelete, onChangeColor, currentColor }) => {
  return (
    <div className="popup-toolbar">
      <button onClick={onDelete}>
        <FiTrash2 color="red" />
      </button>
      <ColorPickerButton
        currentColor={currentColor}
        setCurrentColor={onChangeColor}
      />
    </div>
  );
};

export default PopupToolbar;