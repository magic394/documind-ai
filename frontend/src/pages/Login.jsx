import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, ArrowRight, Sparkles, Shield, Zap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back!', {
          icon: '👋',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        navigate('/');
      } else {
        await register(email, password);
        toast.success('Account created successfully!', {
          icon: '🎉',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message, {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-900 via-primary-950 to-secondary-900 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="animated-grid absolute inset-0 opacity-20"></div>
      
      {/* Floating particles */}
      <div className="particle-bg absolute inset-0"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
      
      {/* Mouse parallax effect */}
      <div 
        className="absolute w-96 h-96 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full filter blur-3xl opacity-10 transition-transform duration-300"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
        }}
      ></div>

      <div className="relative w-full max-w-md px-4">
        {/* Logo with floating animation */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500 hover-lift">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-gradient">DocuMind AI</span>
          </h1>
          <p className="text-secondary-400 text-lg">
            Intelligence meets document automation
          </p>
        </div>

        {/* Main card */}
        <div className="glass-morphism rounded-3xl p-8 hover-glow transition-all duration-500">
          {/* Feature badges */}
          <div className="flex justify-center gap-3 mb-8">
            <div className="px-3 py-1 bg-primary-500/10 rounded-full text-xs text-primary-400 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Secure
            </div>
            <div className="px-3 py-1 bg-accent-500/10 rounded-full text-xs text-accent-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> AI-Powered
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400 group-focus-within:text-primary-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-secondary-800/50 border border-secondary-700 rounded-2xl text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="you@example.com"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-focus-within:opacity-30 blur-xl transition-opacity -z-10"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400 group-focus-within:text-primary-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-secondary-800/50 border border-secondary-700 rounded-2xl text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-primary-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-focus-within:opacity-30 blur-xl transition-opacity -z-10"></div>
              </div>
            </div>

            {!isLogin && (
              <p className="text-xs text-secondary-400 text-center">
                By signing up, you agree to our Terms and Privacy Policy
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-2xl overflow-hidden group hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="shimmer absolute inset-0"></div>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-secondary-400 hover:text-primary-400 transition-colors text-sm group"
            >
              <span className="relative">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300"></span>
              </span>
              <span className="ml-1 font-semibold text-primary-400">
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-6 mt-8 text-secondary-500 text-xs">
          <span>🔒 256-bit encryption</span>
          <span>⚡ Real-time processing</span>
          <span>🌐 GDPR compliant</span>
        </div>
      </div>
    </div>
  );
}