import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Settings,
  LogOut,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
  { name: 'Upload', to: '/upload', icon: Upload, color: 'from-green-500 to-green-600' },
  { name: 'Documents', to: '/documents', icon: FileText, color: 'from-purple-500 to-purple-600' },
  { name: 'Settings', to: '/settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
];

export default function Sidebar({ open, setOpen }) {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-secondary-900 to-secondary-950 shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-secondary-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-gradient">DocuMind</span>
              </span>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 hover:bg-secondary-800 rounded-xl transition-colors">
              <X className="w-5 h-5 text-secondary-400" />
            </button>
          </div>
          <SidebarContent logout={logout} mobile />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-gradient-to-b from-secondary-900 to-secondary-950 border-r border-secondary-800">
          <div className="flex items-center h-20 px-6 border-b border-secondary-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold">
                <span className="text-gradient">DocuMind</span>
                <span className="text-xs text-accent-400 block -mt-1">AI</span>
              </span>
            </div>
          </div>
          <SidebarContent logout={logout} />
        </div>
      </div>
    </>
  );
}

function SidebarContent({ logout, mobile }) {
  return (
    <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            onClick={mobile ? () => document.querySelector('button')?.click() : undefined}
            className={({ isActive }) =>
              `group relative flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-white'
                  : 'text-secondary-400 hover:text-white hover:bg-secondary-800/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl opacity-20`}></div>
                )}
                <div className={`absolute left-0 w-1 h-8 bg-gradient-to-b ${item.color} rounded-r-full transform scale-0 ${
                  isActive ? 'scale-100' : 'group-hover:scale-100'
                } transition-transform duration-300`}></div>
                <item.icon className={`mr-3 h-5 w-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-secondary-400'
                }`} />
                <span className="flex-1">{item.name}</span>
                <ChevronRight className={`w-4 h-4 transition-all ${
                  isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`} />
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="px-4 mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-2xl transition-all group"
        >
          <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="flex-1 text-left">Logout</span>
          <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </button>
      </div>
    </div>
  );
}