import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Search, Brain, MessageSquare, User, Menu, X, Activity, LogOut, FileText, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navigationItems = [
  { label: 'Home', path: '/', icon: Home, end: true }, // end: true — otherwise NavLink matches every nested route
  { label: 'Find Services', path: '/services', icon: Search },
  { label: 'AI Report', path: '/ai-report', icon: Brain },
  { label: 'Feedback', path: '/feedback', icon: MessageSquare },
];

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?';
}

// Shared classes so the active-state logic lives in one place
const desktopLinkClass = ({ isActive }) =>
  `relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'text-teal-700' : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
    isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'
  }`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user, logout } = useAuth();
  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => e.key === 'Escape' && closeMenu();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeMenu]);

  const isAdmin = user?.role === 'admin';
  const firstName = user?.name?.split(' ')[0] || 'Account';
  const showAvatarImg = user?.profileImage && !imgError;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="p-1.5 bg-teal-700 rounded-lg text-white group-hover:bg-teal-800 transition-colors">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold text-slate-900 tracking-tight">Swasth Setu</div>
              <div className="hidden lg:block text-[11px] text-slate-500">Community Health Services</div>
            </div>
          </Link>

          {/* Tablet + desktop nav */}
          <div className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
            {navigationItems.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.end} className={desktopLinkClass} title={item.label}>
                {({ isActive }) => (
                  <>
                    <item.icon size={18} />
                    <span className="hidden lg:inline">{item.label}</span>
                    {isActive && (
                      <span className="absolute left-3 right-3 -bottom-[1px] h-0.5 bg-teal-700 rounded-full lg:left-9" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Tablet + desktop actions */}
          <div className="hidden md:flex md:items-center md:gap-1 lg:gap-2 md:pl-2 lg:pl-4 md:ml-1 lg:ml-2 md:border-l md:border-slate-200">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    title="Admin"
                    className="flex items-center gap-1.5 text-sm font-semibold text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors"
                  >
                    <ShieldAlert size={16} />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                )}

                <Link
                  to="/records"
                  title="My Records"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <FileText size={18} />
                  <span className="hidden lg:inline">Records</span>
                </Link>

                <Link to="/profile" className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                  {showAvatarImg ? (
                    <img
                      src={user.profileImage}
                      alt={user.name || 'Profile'}
                      onError={() => setImgError(true)}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-semibold text-sm border border-teal-100">
                      {getInitial(user.name)}
                    </div>
                  )}
                  <span className="hidden lg:inline text-sm font-medium text-slate-700">{firstName}</span>
                </Link>

                <button
                  onClick={logout}
                  title="Logout"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={17} />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800 transition-colors text-sm font-medium shadow-sm"
              >
                <User size={17} /> Sign In
              </NavLink>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className="md:hidden text-slate-600 hover:text-teal-700 focus:outline-none p-2 -mr-2 rounded-lg hover:bg-slate-50"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navigationItems.map((item) => (
                <NavLink key={item.path} to={item.path} end={item.end} onClick={closeMenu} className={mobileLinkClass}>
                  <item.icon size={20} /> {item.label}
                </NavLink>
              ))}

              {user ? (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    {showAvatarImg ? (
                      <img
                        src={user.profileImage}
                        alt={user.name || 'Profile'}
                        onError={() => setImgError(true)}
                        className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-semibold text-sm border border-teal-100">
                        {getInitial(user.name)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{user?.name || 'Account'}</div>
                      {isAdmin && <div className="text-xs text-rose-600 font-medium">Administrator</div>}
                    </div>
                  </div>

                  {isAdmin && (
                    <NavLink to="/admin" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-semibold text-rose-700 bg-rose-50 border border-rose-100">
                      <ShieldAlert size={20} /> Admin Dashboard
                    </NavLink>
                  )}
                  <NavLink to="/records" onClick={closeMenu} className={mobileLinkClass}>
                    <FileText size={20} /> My Records
                  </NavLink>
                  <NavLink to="/profile" onClick={closeMenu} className={mobileLinkClass}>
                    <User size={20} /> My Profile
                  </NavLink>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex w-full items-center gap-3 px-3 py-3 mt-1 rounded-lg text-base font-medium bg-rose-50 text-rose-600"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-base font-medium bg-teal-700 text-white shadow-sm"
                  >
                    <User size={20} /> Sign In
                  </NavLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}