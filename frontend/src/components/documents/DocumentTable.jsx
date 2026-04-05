import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, AlertTriangle, CheckCircle, Clock, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DocumentTable({ documents }) {
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
      processing: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Clock },
      pending: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', icon: FileText },
      error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRiskBadge = (score) => {
    if (!score && score !== 0) return '-';
    
    const config = {
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };

    let level = 'low';
    if (score >= 60) level = 'high';
    else if (score >= 30) level = 'medium';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[level]}`}>
        {score}
      </span>
    );
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {doc.file_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {doc.document_type || 'Unknown type'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {doc.file_type?.split('/').pop().toUpperCase() || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(doc.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRiskBadge(doc.risk_score)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(doc.upload_date), { addSuffix: true })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/documents/${doc.id}`}
                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {documents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No documents found</p>
        </div>
      )}
    </div>
  );
}