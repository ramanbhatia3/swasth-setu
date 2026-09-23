import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Search, Brain, MessageSquare, Map as MapIcon, User, Menu, X, Activity, LogOut, FileText, ShieldAlert, Sun, Moon, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navigationItems = [
  { label: 'Home', path: '/', icon: Home, end: true }, // end: true — otherwise NavLink matches every nested route
  { label: 'Find Services', path: '/services', icon: Search },
  { label: 'Specialists', path: '/specialists', icon: Stethoscope },
  { label: 'Live Map', path: '/map', icon: MapIcon },
  { label: 'AI Report', path: '/ai-report', icon: Brain },
  { label: 'Feedback', path: '/feedback', icon: MessageSquare },
];

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?';
}

// Shared classes so the active-state logic lives in one place
const desktopLinkClass = ({ isActive }) =>
  `relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
    isActive ? 'text-primary-800 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'text-slate-600 dark:text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
    isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
  }`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user, logout } = useAuth();
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const [isDark, setIsDark] = useState(
    localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

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
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="p-1.5 bg-primary-800 rounded-lg text-white group-hover:bg-primary-900 transition-colors shadow-sm">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Swasth Setu</div>
              <div className="hidden lg:block text-[11px] text-slate-500 dark:text-slate-400">Community Health Services</div>
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
                      <motion.span layoutId="nav-underline" className="absolute left-3 right-3 -bottom-[1px] h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full lg:left-9" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Tablet + desktop actions */}
          <div className="hidden md:flex md:items-center md:gap-1 lg:gap-2 md:pl-2 lg:pl-4 md:ml-1 lg:ml-2 md:border-l md:border-slate-200 dark:md:border-slate-700">
            
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    title="Admin"
                    className="flex items-center gap-1.5 text-sm font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1.5 rounded-lg border border-rose-100 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                  >
                    <ShieldAlert size={16} />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                )}

                {!isAdmin && (
                  <Link
                    to="/records"
                    title="My Records"
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <FileText size={18} />
                    <span className="hidden lg:inline">Records</span>
                  </Link>
                )}

                <Link to="/profile" className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  {showAvatarImg ? (
                    <img
                      src={user.profileImage}
                      alt={user.name || 'Profile'}
                      onError={() => setImgError(true)}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-primary-800 dark:text-primary-400 font-semibold text-sm border border-primary-100 dark:border-primary-800">
                      {getInitial(user.name)}
                    </div>
                  )}
                  <span className="hidden lg:inline text-sm font-medium text-slate-700 dark:text-slate-300">{firstName}</span>
                </Link>

                <button
                  onClick={logout}
                  title="Logout"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                >
                  <LogOut size={17} />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-800 text-white hover:bg-primary-900 transition-colors text-sm font-medium shadow-sm"
              >
                <User size={17} /> Sign In
              </NavLink>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              className="text-slate-600 dark:text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 focus:outline-none p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navigationItems.map((item) => (
                <NavLink key={item.path} to={item.path} end={item.end} onClick={closeMenu} className={mobileLinkClass}>
                  <item.icon size={20} /> {item.label}
                </NavLink>
              ))}

              {user ? (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    {showAvatarImg ? (
                      <img
                        src={user.profileImage}
                        alt={user.name || 'Profile'}
                        onError={() => setImgError(true)}
                        className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-primary-800 dark:text-primary-400 font-semibold text-sm border border-primary-100 dark:border-primary-800">
                        {getInitial(user.name)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'Account'}</div>
                      {isAdmin && <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">Administrator</div>}
                    </div>
                  </div>

                  {isAdmin && (
                    <NavLink to="/admin" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800">
                      <ShieldAlert size={20} /> Admin Dashboard
                    </NavLink>
                  )}
                  {!isAdmin && (
                    <NavLink to="/records" onClick={closeMenu} className={mobileLinkClass}>
                      <FileText size={20} /> My Records
                    </NavLink>
                  )}
                  <NavLink to="/profile" onClick={closeMenu} className={mobileLinkClass}>
                    <User size={20} /> My Profile
                  </NavLink>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex w-full items-center gap-3 px-3 py-3 mt-1 rounded-lg text-base font-medium bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-base font-medium bg-primary-800 text-white shadow-sm"
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