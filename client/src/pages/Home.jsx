import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Brain, FileText, ShieldAlert, ArrowRight, 
  Activity, HeartPulse, Building2, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-sm mb-6 shadow-sm">
              <Activity size={16} /> Empowering Indian Citizens
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
              A Transparent & Intelligent <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
                Healthcare Ecosystem
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Swasth Setu bridges the gap between citizens and healthcare providers. Find verified hospitals, compare treatment costs, secure your medical records, and get instant AI guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/services" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                <Search size={20} /> Find Hospitals
              </Link>
              <Link to="/ai-report" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2">
                <Brain size={20} className="text-blue-600" /> Ask AI Assistant
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-slate-900 text-white py-12 border-y border-slate-800 relative z-20 -mt-10 mx-4 md:mx-auto max-w-6xl rounded-2xl shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 divide-x divide-slate-800 text-center">
          <div>
            <p className="text-4xl font-black text-blue-400 mb-1">100%</p>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Data Privacy</p>
          </div>
          <div>
            <p className="text-4xl font-black text-emerald-400 mb-1">Zero</p>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Cost Manipulation</p>
          </div>
          <div>
            <p className="text-4xl font-black text-blue-400 mb-1">24/7</p>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">AI Assistance</p>
          </div>
          <div>
            <p className="text-4xl font-black text-emerald-400 mb-1">Govt</p>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Compliant</p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeIn} className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need in One Platform</h2>
          <p className="text-lg text-slate-600">Built to ensure transparency, accessibility, and accountability.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <motion.div {...fadeIn} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Hospital Discovery</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Search and filter hospitals by exact facilities, specializations, and transparent treatment costs. Compare them side-by-side.
            </p>
            <Link to="/services" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800">
              Explore Hospitals <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Feature 2 */}
          <motion.div {...fadeIn} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Health Profile</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Maintain your vitals, allergies, and emergency contacts. Upload and securely view medical records with JWT-protected encryption.
            </p>
            <Link to={user ? "/profile" : "/login"} className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-800">
              Manage Profile <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Feature 3 */}
          <motion.div {...fadeIn} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI Health Assistant</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Powered by Google Gemini. Ask questions about medical terminology or hospital services with strict medical safety guardrails.
            </p>
            <Link to="/ai-report" className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-800">
              Chat with AI <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Feature 4 */}
          <motion.div {...fadeIn} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group lg:col-span-1 md:col-span-2">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Government Reporting</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Found a discrepancy in hospital pricing or unavailable emergency services? Submit formal reports directly to our secure admin dashboard for investigation.
            </p>
            <Link to="/feedback" className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-800">
              File a Report <ArrowRight size={16} />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-blue-600 py-20 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <HeartPulse size={48} className="text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to take control of your healthcare?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Join Swasth Setu today. It's completely free for citizens and takes less than a minute to set up your secure profile.
          </p>
          {!user ? (
            <Link to="/register" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg inline-block">
              Create Free Account
            </Link>
          ) : (
            <Link to="/services" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg inline-block">
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}