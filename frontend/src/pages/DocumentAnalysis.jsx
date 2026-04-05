import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import DocumentViewer from '../components/documents/DocumentViewer';
import { useDocuments } from '../hooks/useDocuments';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  FileText,
  Calendar,
  User,
  Building,
  DollarSign,
  Tag,
  Mail,
  Phone,
  MapPin,
  Shield,
  FileCheck,
  AlertOctagon,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDocument, retryAnalysis } = useDocuments();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const data = await getDocument(id);
      setDocument(data);
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryAnalysis = async () => {
    try {
      setRetrying(true);
      await retryAnalysis(id);
      toast.success('Analysis retriggered successfully');
      await loadDocument();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRetrying(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskColor = (score) => {
    if (score < 30) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (score < 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const getFieldIcon = (fieldName) => {
    switch(fieldName) {
      case 'company_name': return <Building className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'amount': return <DollarSign className="w-4 h-4" />;
      case 'contract_id': return <FileText className="w-4 h-4" />;
      case 'address': return <MapPin className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="text-white text-sm mt-4">Loading document...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!document) return null;

  const analysis = document.analysis ? JSON.parse(document.analysis.ai_response_json) : null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/documents')}
            className="flex items-center gap-2 text-secondary-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Documents
          </button>
          
          {document.status === 'error' && (
            <button
              onClick={handleRetryAnalysis}
              disabled={retrying}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 hover-lift"
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Retry Analysis'}
            </button>
          )}
        </div>

        {/* Document Info */}
        <div className="glass-morphism rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative p-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2 break-all">
                  {document.file_name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-secondary-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(document.upload_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(document.status)}
                    <span className="capitalize text-secondary-300">
                      {document.status}
                    </span>
                  </div>
                  {document.document_type && document.document_type !== 'unknown' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary-500/10 rounded-full">
                      <Tag className="w-3 h-3 text-primary-400" />
                      <span className="text-xs text-primary-400 capitalize">
                        {document.document_type}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {document.status === 'completed' && (
              <div className={`px-6 py-3 rounded-xl ${getRiskColor(document.risk_score)}`}>
                <div className="text-sm font-medium mb-1">Risk Score</div>
                <div className="text-3xl font-bold">{document.risk_score}</div>
              </div>
            )}
          </div>
        </div>

        {/* Document Viewer & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Viewer */}
          <div className="glass-morphism rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-400" />
              Document Preview
            </h2>
            <DocumentViewer fileUrl={document.file_url} fileName={document.file_name} />
          </div>

          {/* AI Analysis Results */}
          <div className="space-y-6">
            {document.status === 'processing' && (
              <div className="glass-morphism rounded-2xl p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary-400" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  AI is Analyzing Your Document
                </h3>
                <p className="text-secondary-400">
                  Our AI is extracting key information and assessing risk factors. This may take a few moments...
                </p>
              </div>
            )}

            {document.status === 'error' && (
              <div className="glass-morphism rounded-2xl p-8 text-center">
                <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Analysis Failed
                </h3>
                <p className="text-secondary-400 mb-6">
                  There was an error analyzing your document. Please try again.
                </p>
                <button
                  onClick={handleRetryAnalysis}
                  disabled={retrying}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors hover-lift"
                >
                  {retrying ? 'Retrying...' : 'Retry Analysis'}
                </button>
              </div>
            )}

            {document.status === 'completed' && analysis && (
              <>
                {/* Summary */}
                <div className="glass-morphism rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-primary-400" />
                    Summary
                  </h3>
                  <p className="text-secondary-300 leading-relaxed">
                    {analysis.summary}
                  </p>
                  {analysis.confidence_score && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-secondary-400">Analysis Confidence</span>
                        <span className="text-white font-medium">
                          {Math.round(analysis.confidence_score * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                          style={{ width: `${analysis.confidence_score * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Compliance Status */}
                {analysis.compliance_check && (
                  <div className={`glass-morphism rounded-2xl p-6 border-l-4 ${
                    analysis.compliance_check.status === 'compliant' ? 'border-green-500' :
                    analysis.compliance_check.status === 'non-compliant' ? 'border-red-500' :
                    'border-yellow-500'
                  }`}>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary-400" />
                      Compliance Status
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        analysis.compliance_check.status === 'compliant' ? 'bg-green-500/20 text-green-400' :
                        analysis.compliance_check.status === 'non-compliant' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {analysis.compliance_check.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    {analysis.compliance_check.issues?.length > 0 && (
                      <ul className="space-y-2 mt-3">
                        {analysis.compliance_check.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-secondary-300 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Extracted Fields */}
                {analysis.extracted_fields && Object.keys(analysis.extracted_fields).length > 0 && (
                  <div className="glass-morphism rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary-400" />
                      Extracted Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(analysis.extracted_fields).map(([key, value]) => (
                        value && value !== 'Not found' && value !== 'Not found in preview' && (
                          <div key={key} className="p-3 bg-secondary-800/50 rounded-lg hover:bg-secondary-800 transition-colors">
                            <div className="flex items-center gap-2 text-secondary-400 text-xs mb-1">
                              {getFieldIcon(key)}
                              <span className="capitalize">{key.replace('_', ' ')}</span>
                            </div>
                            <p className="text-sm font-medium text-white break-words">{value}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Entities */}
                {analysis.key_entities && analysis.key_entities.length > 0 && (
                  <div className="glass-morphism rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-primary-400" />
                      Key Entities Detected
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.key_entities.map((entity, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg text-sm text-primary-400 hover:bg-primary-500/20 transition-colors cursor-default"
                        >
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flags */}
                {analysis.flags && analysis.flags.length > 0 && (
                  <div className="glass-morphism rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      Flags & Warnings
                    </h3>
                    <div className="space-y-3">
                      {analysis.flags.map((flag, index) => (
                        <div 
                          key={index} 
                          className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-red-300 text-sm">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}