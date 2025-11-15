import { useState, useCallback } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';
import { uploadFile } from '../lib/api';

interface FileUploaderProps {
  onSuccess: (fileId: string) => void;
}

export default function FileUploader({ onSuccess }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateFile = (file: File): boolean => {
    const validExtensions = ['.exe', '.elf', '.so', '.dll', '.bin'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt) && !file.type.includes('octet-stream')) {
      setError('Invalid file type. Please upload a binary file (.exe, .elf, .so, .dll, .bin)');
      return false;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File too large. Maximum size is 100MB');
      return false;
    }

    return true;
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const response = await uploadFile(file);
      onSuccess(response.file_id);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  }, [onSuccess]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-12 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-500/5'
            : 'border-white/20 bg-white/5 hover:border-white/40'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileInput}
          disabled={isUploading}
        />

        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          {selectedFile ? (
            <File className="w-16 h-16 mb-4 text-green-400" />
          ) : (
            <Upload className="w-16 h-16 mb-4 text-white/60" />
          )}

          {isUploading ? (
            <>
              <div className="w-12 h-12 mb-4 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-white/80">Uploading {selectedFile?.name}...</p>
            </>
          ) : selectedFile ? (
            <>
              <p className="text-white/90 mb-2">{selectedFile.name}</p>
              <p className="text-white/60">Click to select a different file</p>
            </>
          ) : (
            <>
              <p className="text-white/90 mb-2">Drop your binary here</p>
              <p className="text-white/60">or click to browse</p>
              <p className="text-white/40 mt-4">Supports .exe, .elf, .so, .dll, .bin</p>
            </>
          )}
        </label>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
}
