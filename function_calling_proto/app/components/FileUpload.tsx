"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { FileData } from "../types/message";

interface FileUploadProps {
  onFileUpload: (data: FileData) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const processFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      const sheets: { [key: string]: any[][] } = {};
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      });

      onFileUpload({
        fileName: file.name,
        sheets,
      });
    } catch (err) {
      setError("Failed to parse file. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileType = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(fileType || "")) {
      setError("Please upload only Excel or CSV files");
      return;
    }

    await processFile(file);
  };

  return (
    <div
      className="mb-6"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div
        className={`
        border-2 border-dashed rounded-lg p-6 text-center
        ${dragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"}
        ${uploading ? "opacity-50" : ""}
        transition-all duration-200
      `}
      >
        <label className="block cursor-pointer">
          <span className="text-gray-700 font-medium block mb-2">
            Drop your Excel or CSV file here, or click to upload
          </span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-gray-500 mt-1
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: .xlsx, .xls, .csv
        </p>
      </div>

      {uploading && (
        <div className="flex items-center justify-center mt-4 text-blue-600">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
          Processing file...
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
