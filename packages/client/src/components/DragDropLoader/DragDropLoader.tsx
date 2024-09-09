import { CloudUpload } from '@mui/icons-material';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';

interface DragDropLoaderProps {
  onFileLoad: (files: File) => void;
  acceptedFileTypes?: string;
}

export const DragDropLoader: React.FC<DragDropLoaderProps> = ({ onFileLoad, acceptedFileTypes = '*' }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const file = files[0];
      if (files) {
        onFileLoad(file);
      }
    },
    [onFileLoad],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      const file = files[0];
      if (files) {
        onFileLoad(file);
      }
    },
    [onFileLoad],
  );

  const handleContainerClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleContainerClick}
    >
      <CloudUpload className="text-4xl mb-4 text-gray-400" />
      <p className="mb-2">Drag and drop files here, or click anywhere to select files</p>
      <input ref={fileInputRef} type="file" accept={acceptedFileTypes} onChange={handleFileInput} className="hidden" />
    </div>
  );
};
