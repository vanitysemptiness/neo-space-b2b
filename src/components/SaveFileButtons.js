import React, { useRef } from 'react';
import { FiSave, FiUpload } from 'react-icons/fi';
import { CanvasSaveFile } from '../utils/CanvasSaveFile';

const SaveFileButtons = ({ fabricCanvas }) => {
  const fileInputRef = useRef(null);

  const handleSave = () => {
    CanvasSaveFile.downloadCanvas(fabricCanvas);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const state = await CanvasSaveFile.uploadCanvas(file);
      await CanvasSaveFile.deserializeCanvas(fabricCanvas, state);
    } catch (err) {
      console.error('Error loading canvas:', err);
      alert('Error loading canvas file');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <button
        onClick={handleSave}
        className="tool-button"
        title="Save Canvas"
      >
        <FiSave size={20} />
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="tool-button"
        title="Load Canvas"
      >
        <FiUpload size={20} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </>
  );
};

export default SaveFileButtons;