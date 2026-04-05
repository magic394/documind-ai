import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useDocuments } from '../hooks/useDocuments';
import { Upload as UploadIcon, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Upload() {
  const navigate = useNavigate();
  const { uploadDocument } = useDocuments();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const result = await uploadDocument(selectedFile);
      clearInterval(interval);
      setUploadProgress(100);
      
      toast.success('Document uploaded successfully!');
      
      // Navigate to document analysis after short delay
      setTimeout(() => {
        navigate(`/documents/${result.id}`);
      }, 1000);
      
    } catch (error) {
      clearInterval(interval);
      toast.error(error.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Document</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload your document for AI-powered analysis and compliance checking
          </p>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer
            ${isDragActive 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
            }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <UploadIcon className={`w-12 h-12 ${isDragActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}`} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              or click to browse
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Supports PDF, DOCX, TXT (Max 10MB)
            </p>
          </div>
        </div>

        {/* Selected File */}
        {selectedFile && (
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                  <File className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              {!uploading && (
                <button
                  onClick={removeFile}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                  <span className="text-gray-900 dark:text-white font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                {uploadProgress === 100 && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mt-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Upload complete! Redirecting...</span>
                  </div>
                )}
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && !uploading && uploadProgress === 0 && (
              <button
                onClick={handleUpload}
                className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all flex items-center justify-center gap-2"
              >
                <UploadIcon className="w-4 h-4" />
                Start Upload
              </button>
            )}
          </div>
        )}

        {/* Tips Section */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tips for best results</h3>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Use high-quality scans or digital documents for better text extraction</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Ensure all text is clearly visible and not handwritten</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>Maximum file size is 10MB for optimal processing</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}