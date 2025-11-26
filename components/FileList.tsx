import React from 'react';
import { UploadedFile } from '../types';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove, onMoveUp, onMoveDown }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 border border-slate-200 rounded-xl bg-white/50 border-dashed">
        No files added yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file, index) => (
        <div 
          key={file.id} 
          className="group flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-200"
        >
          <div className="flex items-center space-x-4 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded font-bold text-xs">
              PDF
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate" title={file.file.name}>
                {file.file.name}
              </p>
              <p className="text-xs text-slate-500">
                {(file.file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 pl-4">
            <button
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"
              title="Move Up"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            
            <button
              onClick={() => onMoveDown(index)}
              disabled={index === files.length - 1}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"
              title="Move Down"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            <button
              onClick={() => onRemove(file.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Remove File"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;