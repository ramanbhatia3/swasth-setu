import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Search, Brain, MessageSquare, Map as MapIcon, User, Menu, X, Activity, LogOut, FileText, ShieldAlert, Sun, Moon, Stethoscope, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
const navigationItems = [
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
  `relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
    isActive ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10' : 'text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
    isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
  }`;

export default function Navbar() {
  const { t, i18n } = useTranslation();
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
              <div className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">{t('Swasth Setu')}</div>
              <div className="hidden lg:block text-[11px] text-slate-500 dark:text-slate-400">{t('Community Health Services')}</div>
            </div>
          </Link>

          {/* Tablet + desktop nav */}
          <div className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
            {navigationItems.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.end} className={desktopLinkClass} title={item.label}>
                {({ isActive }) => (
                  <>
                    <item.icon size={18} />
                    <span className="hidden lg:inline">{t(item.label)}</span>
                    {isActive && (
                      <motion.span layoutId="nav-underline" className="absolute left-3 right-3 -bottom-[1px] h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full lg:left-9" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Tablet + desktop actions */}
          <div className="hidden md:flex md:items-center md:gap-3 md:pl-4 md:ml-2 md:border-l md:border-slate-200 dark:md:border-slate-700/60">
            
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <Globe size={16} className="text-slate-400" />
              <select
                value={i18n.language?.split('-')[0] || 'en'}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer dark:bg-slate-900"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="pa">PA</option>
                <option value="ta">TA</option>
                <option value="te">TE</option>
              </select>
            </div>

            {user ? (
              <div className="relative group ml-1">
                <button className="flex items-center gap-2 p-1 pr-2 rounded-full border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none">
                  {showAvatarImg ? (
                    <img
                      src={user.profileImage}
                      alt={user.name || 'Profile'}
                      onError={() => setImgError(true)}
                      className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm">
                      {getInitial(user.name)}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{firstName}</span>
                  <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user.email || 'User Account'}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <ShieldAlert size={16} />
                        {t('Admin')} Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/records"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <FileText size={16} />
                        {t('Records')}
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={logout}
                      className="flex items-center w-full gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      {t('Logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 ml-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-all font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <User size={16} /> {t('Sign In')}
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
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Globe size={16} />
              <select
                value={i18n.language?.split('-')[0] || 'en'}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer dark:bg-slate-900"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="pa">PA</option>
                <option value="ta">TA</option>
                <option value="te">TE</option>
              </select>
            </div>
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
                  <item.icon size={20} /> {t(item.label)}
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
                      <ShieldAlert size={20} /> {t('Admin')} Dashboard
                    </NavLink>
                  )}
                  {!isAdmin && (
                    <NavLink to="/records" onClick={closeMenu} className={mobileLinkClass}>
                      <FileText size={20} /> My {t('Records')}
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
                    <User size={20} /> {t('Sign In')}
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