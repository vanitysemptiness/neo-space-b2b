import React, { useRef } from 'react';
import { FiUpload } from 'react-icons/fi';
import { addFileToCanvas } from './CanvasUtils';

const FileUpload = ({ fabricCanvas }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && fabricCanvas) {
      await addFileToCanvas(file, fabricCanvas);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <button
        onClick={handleUploadClick}
        className="tool-button"
        title="Upload"
      >
        <FiUpload size={20} />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".png,.jpg,.jpeg,.gif,.csv,.pdf,.mov,.xls,.xlsx"
      />
    </>
  );
};

export default FileUpload;