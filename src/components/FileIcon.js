// src/components/FileIcon.js
import React from 'react';
import { FaFileCsv, FaFileImage, FaFilePdf, FaFile } from 'react-icons/fa';

const FileIcon = ({ fileType, size = 24 }) => {
  switch (fileType.toLowerCase()) {
    case 'csv':
      return <FaFileCsv size={size} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FaFileImage size={size} />;
    case 'pdf':
      return <FaFilePdf size={size} />;
    default:
      return <FaFile size={size} />;
  }
};

export default FileIcon;