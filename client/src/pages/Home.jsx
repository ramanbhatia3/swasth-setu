import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Brain, FileText, ShieldAlert, ArrowRight, 
  Activity, HeartPulse, Building2, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MacroInsightsWidget from '../components/MacroInsightsWidget';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white dark:bg-[#0f0e0c] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 dark:opacity-10"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-primary-400/10 dark:bg-primary-400/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 text-primary-800 dark:text-primary-300 font-semibold text-sm mb-6 shadow-sm">
              <Activity size={16} /> {t('Empowering Indian Citizens')}
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-tight font-serif">
              {t('A Transparent & Intelligent')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-400 dark:from-primary-400 dark:to-primary-200">
                {t('Healthcare Ecosystem')}
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              {t('home_desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/services" className="px-8 py-4 bg-primary-800 text-white rounded-xl font-bold text-lg hover:bg-primary-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                <Search size={20} /> {t('Find Hospitals')}
              </Link>
              <Link to="/ai-report" className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2">
                <Brain size={20} className="text-primary-600 dark:text-primary-400" /> {t('Ask AI Assistant')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-primary-900 dark:bg-primary-950 text-white py-12 border-y border-primary-800 dark:border-primary-900 relative z-20 -mt-10 mx-4 md:mx-auto max-w-6xl rounded-2xl shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 divide-x divide-primary-800 dark:divide-primary-900 text-center">
          <div>
            <p className="text-4xl font-black text-primary-300 mb-1">100%</p>
            <p className="text-sm font-medium text-primary-100/80 uppercase tracking-wide">Data Privacy</p>
          </div>
          <div>
            <p className="text-4xl font-black text-white mb-1">Zero</p>
            <p className="text-sm font-medium text-primary-100/80 uppercase tracking-wide">Cost Manipulation</p>
          </div>
          <div>
            <p className="text-4xl font-black text-primary-300 mb-1">24/7</p>
            <p className="text-sm font-medium text-primary-100/80 uppercase tracking-wide">AI Assistance</p>
          </div>
          <div>
            <p className="text-4xl font-black text-white mb-1">Govt</p>
            <p className="text-sm font-medium text-primary-100/80 uppercase tracking-wide">Compliant</p>
          </div>
        </div>
      </section>

      {/* MACRO INSIGHTS WIDGET */}
      <MacroInsightsWidget />

      {/* CORE FEATURES */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeIn} className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 font-serif">{t('Everything You Need in One Platform')}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">{t('home_features_desc')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <motion.div {...fadeIn} className="bg-white dark:bg-[#141311] p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 group">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Hospital Discovery</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Search and filter hospitals by exact facilities, specializations, and transparent treatment costs. Compare them side-by-side.
            </p>
            <Link to="/services" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-800 dark:hover:text-primary-300">
              Explore Hospitals <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Feature 2 */}
          <motion.div {...fadeIn} className="bg-white dark:bg-[#141311] p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 group">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Secure Health Profile</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Maintain your vitals, allergies, and emergency contacts. Upload and securely view medical records with JWT-protected encryption.
            </p>
            <Link to={user ? "/profile" : "/login"} className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-800 dark:hover:text-primary-300">
              Manage Profile <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Feature 3 */}
          <motion.div {...fadeIn} className="bg-white dark:bg-[#141311] p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 group">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Health Assistant</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Powered by Google Gemini. Ask questions about medical terminology or hospital services with strict medical safety guardrails.
            </p>
            <Link to="/ai-report" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-800 dark:hover:text-primary-300">
              Chat with AI <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Feature 4 */}
          <motion.div {...fadeIn} className="bg-white dark:bg-[#141311] p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-rose-200 dark:hover:border-rose-800 transition-all duration-300 group lg:col-span-1 md:col-span-2">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Government Reporting</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Found a discrepancy in hospital pricing or unavailable emergency services? Submit formal reports directly to our secure admin dashboard for investigation.
            </p>
            <Link to="/feedback" className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold hover:text-rose-800 dark:hover:text-rose-300">
              File a Report <ArrowRight size={16} />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-primary-800 dark:bg-primary-900 py-20 mt-auto transition-colors">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <HeartPulse size={48} className="text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">{t('Ready to take control of your healthcare?')}</h2>
          <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
            {t('home_cta_desc')}
          </p>
          {!user ? (
            <Link to="/register" className="px-8 py-4 bg-white text-primary-800 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg inline-block">
              Create Free Account
            </Link>
          ) : (
            <Link to="/services" className="px-8 py-4 bg-white text-primary-800 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg inline-block">
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}