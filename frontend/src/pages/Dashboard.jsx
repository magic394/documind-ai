import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useDocuments } from '../hooks/useDocuments';
import { 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  Brain,
  Activity,
  Download,
  MoreVertical,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { documents, loading, getStats } = useDocuments();
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    completed: 0,
    highRisk: 0,
    avgRiskScore: 0
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    if (documents) {
      const stats = getStats();
      setStats(stats);
    }
  }, [documents]);

  // Generate activity data
  const generateActivityData = () => {
    const days = selectedTimeframe === 'week' ? 7 : 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        uploads: Math.floor(Math.random() * 10) + 1,
        analyses: Math.floor(Math.random() * 8) + 1,
      });
    }
    return data;
  };

  // Generate document type data
  const getDocumentTypeData = () => {
    const types = {};
    documents?.forEach(doc => {
      const type = doc.document_type || 'unknown';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };

  const recentDocuments = documents?.slice(0, 5) || [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary-500 animate-pulse" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-8">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Welcome back! 👋</h1>
              <p className="text-primary-100 text-lg">
                Your documents are being analyzed in real-time
              </p>
            </div>
            <Link
              to="/upload"
              className="group bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all hover-lift"
            >
              <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Upload New</span>
            </Link>
          </div>
          
          {/* Floating particles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Stats Grid with glass morphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Documents', value: stats.total, icon: FileText, change: '+12%', color: 'from-blue-500 to-blue-600' },
            { title: 'Processed', value: stats.completed, icon: CheckCircle, change: '+8%', color: 'from-green-500 to-green-600' },
            { title: 'In Progress', value: stats.processing, icon: Clock, change: '-3%', color: 'from-yellow-500 to-yellow-600' },
            { title: 'Risk Score', value: stats.avgRiskScore, icon: AlertTriangle, suffix: 'avg', change: '-5%', color: 'from-red-500 to-red-600' },
          ].map((stat, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
              <div className="relative glass-morphism rounded-3xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color} bg-opacity-10`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {stat.value}{stat.suffix && <span className="text-lg text-secondary-400 ml-1">{stat.suffix}</span>}
                </h3>
                <p className="text-secondary-400 text-sm">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <div className="lg:col-span-2 glass-morphism rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-400" />
                Activity Overview
              </h3>
              <div className="flex gap-2">
                {['week', 'month'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
                      selectedTimeframe === tf
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700'
                    }`}
                  >
                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateActivityData()}>
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '1rem',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="uploads"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorUploads)"
                  />
                  <Area
                    type="monotone"
                    dataKey="analyses"
                    stroke="#14b8a6"
                    fillOpacity={1}
                    fill="url(#colorAnalyses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Document Type Pie Chart */}
          <div className="glass-morphism rounded-3xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-400" />
              Document Types
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getDocumentTypeData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getDocumentTypeData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '1rem',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {getDocumentTypeData().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-secondary-300">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Documents with enhanced design */}
        <div className="glass-morphism rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-400" />
              Recent Documents
            </h3>
            <Link
              to="/documents"
              className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group"
            >
              View all
              <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentDocuments.map((doc, index) => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                className="group block"
              >
                <div className="relative p-4 bg-secondary-800/50 rounded-2xl hover:bg-secondary-800 transition-all duration-300 hover-lift">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/0 to-accent-500/0 group-hover:from-primary-500/10 group-hover:via-primary-500/5 group-hover:to-accent-500/10 rounded-2xl transition-all duration-500"></div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {doc.file_name}
                        </p>
                        <p className="text-sm text-secondary-400">
                          Uploaded {formatDistanceToNow(new Date(doc.upload_date))} ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {doc.status === 'completed' && (
                        <>
                          <div className="text-right">
                            <p className="text-sm text-secondary-400">Risk Score</p>
                            <div className={`text-lg font-bold ${
                              doc.risk_score < 30 ? 'text-green-400' :
                              doc.risk_score < 60 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {doc.risk_score}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-xl text-xs font-medium ${
                            doc.risk_score < 30 ? 'bg-green-400/10 text-green-400' :
                            doc.risk_score < 60 ? 'bg-yellow-400/10 text-yellow-400' :
                            'bg-red-400/10 text-red-400'
                          }`}>
                            {doc.risk_score < 30 ? 'Low Risk' : doc.risk_score < 60 ? 'Medium Risk' : 'High Risk'}
                          </div>
                        </>
                      )}
                      
                      {doc.status === 'processing' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-400/10 rounded-xl">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-yellow-400">Processing...</span>
                        </div>
                      )}
                      
                      <button className="p-2 hover:bg-secondary-700 rounded-xl transition-colors">
                        <MoreVertical className="w-4 h-4 text-secondary-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {recentDocuments.length === 0 && (
              <div className="text-center py-12">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-secondary-800 rounded-3xl flex items-center justify-center">
                    <FileText className="w-12 h-12 text-secondary-600" />
                  </div>
                </div>
                <p className="text-secondary-400 mb-4">No documents yet</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover-lift"
                >
                  <Upload className="w-4 h-4" />
                  Upload your first document
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}