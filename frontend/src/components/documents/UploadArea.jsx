import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadArea({ onUpload, onFileSelect, selectedFile, uploading, progress }) {
  const [dragError, setDragError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setDragError('File is too large. Max size is 10MB');
      } else if (error.code === 'file-invalid-type') {
        setDragError('Invalid file type. Please upload PDF, DOCX, or TXT');
      } else {
        setDragError(error.message);
      }
      return;
    }

    setDragError(null);
    if (acceptedFiles.length > 0 && onFileSelect) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1
  });

  const handleRemove = () => {
    if (onFileSelect) {
      onFileSelect(null);
    }
    setDragError(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : dragError
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
          }`}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${
              isDragActive 
                ? 'bg-primary-100 dark:bg-primary-900/30' 
                : dragError
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <Upload className={`w-12 h-12 ${
                isDragActive 
                  ? 'text-primary-600' 
                  : dragError
                    ? 'text-red-600'
                    : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isDragActive 
              ? 'Drop your file here' 
              : dragError
                ? 'Upload failed'
                : 'Drag & drop your file here'}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            {dragError || 'or click to browse'}
          </p>
          
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Supports PDF, DOCX, TXT (Max 10MB)
          </p>
        </div>
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <File className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            
            {!uploading && (
              <button
                onClick={handleRemove}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  {progress < 100 ? 'Uploading...' : 'Upload complete'}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">{progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress === 100 && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs mt-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Uploaded successfully</span>
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && !uploading && progress === 0 && (
            <button
              onClick={onUpload}
              className="mt-3 w-full py-2 px-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {dragError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300">{dragError}</p>
        </div>
      )}
    </div>
  );
}