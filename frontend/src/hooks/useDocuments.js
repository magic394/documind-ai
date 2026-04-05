import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/documents');
      setDocuments(response.data.documents || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (id) => {
    try {
      const response = await api.get(`/api/document/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Error fetching document');
    }
  };

  const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh documents list
      await fetchDocuments();
      
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Error uploading document');
    }
  };

  const retryAnalysis = async (documentId) => {
    try {
      const response = await api.post('/api/analyze-document', { documentId });
      
      // Refresh documents list
      await fetchDocuments();
      
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Error retrying analysis');
    }
  };

  const getStats = () => {
    const stats = {
      total: documents.length,
      processing: documents.filter(d => d.status === 'processing').length,
      completed: documents.filter(d => d.status === 'completed').length,
      highRisk: documents.filter(d => d.risk_score > 60).length,
      avgRiskScore: 0
    };

    const completedDocs = documents.filter(d => d.status === 'completed' && d.risk_score);
    if (completedDocs.length > 0) {
      stats.avgRiskScore = Math.round(
        completedDocs.reduce((sum, doc) => sum + (doc.risk_score || 0), 0) / completedDocs.length
      );
    }

    return stats;
  };

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    getDocument,
    uploadDocument,
    retryAnalysis,
    getStats
  };
}