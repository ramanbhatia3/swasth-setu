import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Activity size={20} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SWASTH SETU</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              An AI-powered government healthcare discovery platform connecting citizens with appropriate healthcare facilities, transparent matching, and personal health insights.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Find Hospitals</Link></li>
              <li><Link to="/ai-report" className="hover:text-blue-400 transition-colors">AI Health Assistant</Link></li>
              <li><Link to="/feedback" className="hover:text-blue-400 transition-colors">Submit Feedback</Link></li>
              <li><Link to="/profile" className="hover:text-blue-400 transition-colors">My Health Profile</Link></li>
            </ul>
          </div>

          {/* Legal / Govt Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Information</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Government Healthcare Guidelines</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Swasth Setu Healthcare Initiative. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Demo Prototype — Not for Actual Medical Diagnosis</p>
        </div>
      </div>
    </footer>
  );
}