import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import DocumentTable from '../components/documents/DocumentTable';
import { useDocuments } from '../hooks/useDocuments';
import { Search, Filter, RefreshCw, FileText } from 'lucide-react';

export default function Documents() {
  const { documents, loading, fetchDocuments } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and analyze your uploaded documents
            </p>
          </div>
          <Link
            to="/upload"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Upload New
          </Link>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="error">Error</option>
              </select>
              <button
                onClick={() => fetchDocuments()}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Document Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredDocuments?.length > 0 ? (
          <DocumentTable documents={filteredDocuments} />
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No documents found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by uploading your first document'}
            </p>
            <Link
              to="/upload"
              className="inline-flex px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Upload Document
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}