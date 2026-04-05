import React, { useState } from 'react';
import { FileText, Download, Maximize2, Minimize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentViewer({ fileUrl, fileName }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(null);

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const renderViewer = () => {
    const ext = getFileExtension(fileName);

    if (ext === 'pdf') {
      return (
        <div className="relative w-full h-full bg-secondary-900 rounded-lg overflow-hidden">
          {/* PDF Controls */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 bg-secondary-800/90 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-secondary-700 rounded transition-colors"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4 text-white" />
            </button>
            <span className="text-sm text-white px-2">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-secondary-700 rounded transition-colors"
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-4 h-4 text-white" />
            </button>
          </div>

          <iframe
            src={`${fileUrl}#toolbar=0&zoom=${zoom}`}
            className="w-full h-full"
            style={{ transform: `scale(${zoom/100})`, transformOrigin: '0 0' }}
            onLoad={() => setLoading(false)}
            title={fileName}
          />
        </div>
      );
    } else if (ext === 'txt') {
      return (
        <div className="w-full h-full min-h-[500px] p-4 bg-secondary-900 rounded-lg font-mono text-sm overflow-auto">
          <pre className="text-secondary-300 whitespace-pre-wrap font-mono">
            Loading text content...
          </pre>
        </div>
      );
    } else if (ext === 'docx') {
      return (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-secondary-900 rounded-lg">
          <div className="text-center p-8">
            <FileText className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">DOCX Document</p>
            <p className="text-secondary-400 text-sm mb-6">
              Preview not available for DOCX files. Download to view.
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download File
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-secondary-900 rounded-lg">
          <div className="text-center p-8">
            <FileText className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">Cannot Preview</p>
            <p className="text-secondary-400 text-sm mb-6">
              This file type cannot be previewed. Download to view.
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download File
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-secondary-950 p-4' : ''}`}>
      {/* Viewer Controls */}
      <div className="absolute top-2 right-2 flex gap-2 z-30">
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-secondary-800/90 backdrop-blur-sm rounded-lg hover:bg-secondary-700 transition-colors"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-white" />
          ) : (
            <Maximize2 className="w-4 h-4 text-white" />
          )}
        </button>
        <button
          onClick={handleDownload}
          className="p-2 bg-secondary-800/90 backdrop-blur-sm rounded-lg hover:bg-secondary-700 transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4 text-white" />
        </button>
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-red-500/90 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary-900/80 backdrop-blur-sm rounded-lg z-20">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="text-white text-sm mt-3">Loading document...</p>
          </div>
        </div>
      )}

      {/* Viewer */}
      <div className={`${isFullscreen ? 'h-full' : 'h-[500px]'} rounded-lg overflow-hidden border border-secondary-800`}>
        {renderViewer()}
      </div>
    </div>
  );
}