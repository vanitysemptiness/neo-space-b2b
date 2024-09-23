import React from 'react';
import { FiTrash2, FiEdit3 } from 'react-icons/fi';

const PopupToolbar = ({ onDelete, onChangeColor, currentColor }) => {
  return (
    <div className="popup-toolbar" style={{
      display: 'flex',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '5px',
    }}>
      <button onClick={onDelete} style={{ marginRight: '5px' }}>
        <FiTrash2 color="red" />
      </button>
      <button onClick={onChangeColor} style={{ 
        backgroundColor: currentColor,
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '1px solid #ccc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <FiEdit3 color={getContrastColor(currentColor)} size={14} />
      </button>
    </div>
  );
};

// Helper function to determine contrasting color for the icon
function getContrastColor(hexColor) {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white depending on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export default PopupToolbar;