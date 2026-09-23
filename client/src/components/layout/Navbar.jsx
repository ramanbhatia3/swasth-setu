import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Search, Brain, MessageSquare, User, Menu, X, Activity, LogOut, FileText, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navigationItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Find Services', path: '/services', icon: Search },
  { label: 'AI Report', path: '/ai-report', icon: Brain },
  { label: 'Feedback', path: '/feedback', icon: MessageSquare },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-blue-600 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
                <Activity size={24} />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">SWASTH SETU</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigationItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600 border-b-2 border-blue-600 py-5' : 'text-slate-600'}`}>
                <item.icon size={18} /> {item.label}
              </NavLink>
            ))}
            
            {user ? (
              <div className="flex items-center gap-5 pl-4 border-l border-slate-200">
                {/* NEW: ONLY SHOW TO ADMINS */}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-1.5">
                    <ShieldAlert size={16} /> Admin
                  </Link>
                )}

                <Link to="/records" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  <FileText size={18} /> Records
                </Link>

                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">{user.name.charAt(0)}</div>
                  )}
                  <span className="text-sm font-medium text-slate-700">{user.name.split(' ')[0]}</span>
                </Link>
                <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">Logout</button>
              </div>
            ) : (
              <NavLink to="/login" className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"><User size={18} /> Sign In</NavLink>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-blue-600 focus:outline-none p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-slate-200 bg-white overflow-hidden">
            <div className="px-4 pt-2 pb-4 space-y-1 shadow-inner">
              {navigationItems.map((item) => (
                <NavLink key={item.path} to={item.path} onClick={closeMenu} className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <item.icon size={20} /> {item.label}
                </NavLink>
              ))}
              
              {user ? (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {user.role === 'admin' && (
                    <NavLink to="/admin" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-bold text-red-700 bg-red-50 mb-2 border border-red-100">
                      <ShieldAlert size={20} /> Admin Dashboard
                    </NavLink>
                  )}
                  <NavLink to="/records" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"><FileText size={20} /> My Records</NavLink>
                  <NavLink to="/profile" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"><User size={20} /> My Profile</NavLink>
                  <button onClick={() => { logout(); closeMenu(); }} className="flex w-full items-center gap-3 px-3 py-3 mt-2 rounded-md text-base font-medium bg-red-50 text-red-600"><LogOut size={20} /> Logout</button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <NavLink to="/login" onClick={closeMenu} className="flex items-center justify-center gap-3 px-3 py-3 rounded-md text-base font-medium bg-blue-600 text-white shadow-sm"><User size={20} /> Sign In</NavLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}