import React, { useState } from 'react';
import { Menu, Bell, Search, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Header({ setSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'Document analysis completed', time: '2 min ago', read: false },
    { id: 2, text: 'High risk document detected', time: '1 hour ago', read: false },
    { id: 3, text: 'Welcome to DocuMind AI!', time: '1 day ago', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    // In a real app, you'd fetch notifications from API
    toast.success('Notifications updated', { icon: '🔔' });
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    toast.success('Opening settings', { icon: '⚙️' });
  };

  const handleProfileClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    if (searchTerm.trim()) {
      navigate(`/documents?search=${searchTerm}`);
      toast.success(`Searching for: ${searchTerm}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-secondary-900/50 backdrop-blur-xl border-b border-secondary-800">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-secondary-800 rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-secondary-400" />
        </button>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            name="search"
            type="text"
            placeholder="Search documents..."
            className="w-64 pl-10 pr-4 py-2 bg-secondary-800/50 border border-secondary-700 rounded-xl text-sm text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all"
          />
        </form>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleNotificationClick}
            className="relative p-2 hover:bg-secondary-800 rounded-xl transition-colors group"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-secondary-400 group-hover:text-white transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          
          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-morphism rounded-xl shadow-2xl border border-secondary-700 overflow-hidden z-50">
              <div className="p-3 border-b border-secondary-700 flex justify-between items-center">
                <h3 className="font-semibold text-white">Notifications</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-primary-400 hover:text-primary-300"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-3 border-b border-secondary-700/50 hover:bg-secondary-800/50 cursor-pointer transition-colors ${!notif.read ? 'bg-primary-500/5' : ''}`}
                    onClick={() => {
                      toast.info(`Notification: ${notif.text}`);
                      setShowNotifications(false);
                    }}
                  >
                    <p className="text-sm text-white">{notif.text}</p>
                    <p className="text-xs text-secondary-400 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center border-t border-secondary-700">
                <button className="text-xs text-primary-400 hover:text-primary-300">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={handleSettingsClick}
          className="p-2 hover:bg-secondary-800 rounded-xl transition-colors group"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-secondary-400 group-hover:text-white transition-colors" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 p-1 hover:bg-secondary-800 rounded-xl transition-colors group"
            aria-label="User menu"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-secondary-400 group-hover:text-white transition-colors" />
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 glass-morphism rounded-xl shadow-2xl border border-secondary-700 overflow-hidden z-50">
              <div className="p-3 border-b border-secondary-700">
                <p className="text-sm font-medium text-white">{user?.email || 'User'}</p>
                <p className="text-xs text-secondary-400">Free Plan</p>
              </div>
              <div className="p-2">
                <button 
                  className="w-full text-left px-3 py-2 text-sm text-secondary-300 hover:bg-secondary-800 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => {
                    navigate('/profile');
                    setShowUserMenu(false);
                  }}
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                <button 
                  className="w-full text-left px-3 py-2 text-sm text-secondary-300 hover:bg-secondary-800 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                >
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <hr className="my-2 border-secondary-700" />
                <button 
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}