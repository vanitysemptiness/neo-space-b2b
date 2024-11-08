"use client";

import { FileData } from "../types/message";

interface FileListProps {
  files: FileData[];
  onRemoveFile: (fileName: string) => void;
}

export default function FileList({ files, onRemoveFile }: FileListProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Uploaded Files</h2>
      <div className="space-y-3">
        {files.map((file) => (
          <div key={file.fileName} className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{file.fileName}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {Object.keys(file.sheets).length} sheets
                </p>
                {file.summary && (
                  <p className="text-sm text-gray-600 mt-2">{file.summary}</p>
                )}
                {file.topics && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {file.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  {Object.entries(file.sheets).map(([sheetName, data]) => (
                    <div key={sheetName} className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">
                        {sheetName}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {data[0]?.map((header: any, index: number) => (
                                <th
                                  key={index}
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {header || `Column ${index + 1}`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {data
                              .slice(1)
                              .map((row: any[], rowIndex: number) => (
                                <tr key={rowIndex}>
                                  {row.map((cell: any, cellIndex: number) => (
                                    <td
                                      key={cellIndex}
                                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                    >
                                      {cell ?? "-"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(file.fileName)}
                className="text-red-600 hover:text-red-700"
              >
                <span className="sr-only">Remove file</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
