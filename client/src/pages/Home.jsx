import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Bot, HeartPulse, Brain, Baby, Bone, 
  Stethoscope, Activity, ShieldCheck, BarChart3, Users
} from 'lucide-react';

const categories = [
  { name: 'Cardiology', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-50' },
  { name: 'Neurology', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
  { name: 'Orthopedics', icon: Bone, color: 'text-orange-500', bg: 'bg-orange-50' },
  { name: 'Pediatrics', icon: Baby, color: 'text-green-500', bg: 'bg-green-50' },
  { name: 'General Medicine', icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-50' },
];

const features = [
  {
    title: 'Transparent Matching',
    description: 'Find hospitals that match your specific budget, required facilities, and location requirements.',
    icon: BarChart3,
  },
  {
    title: 'AI Healthcare Navigation',
    description: 'Describe your medical needs in natural language, and let AI translate them into structured searches.',
    icon: Bot,
  },
  {
    title: 'Secure Health Profile',
    description: 'Maintain your medical records privately and only share them with doctors when you explicitly consent.',
    icon: ShieldCheck,
  }
];

export default function Home() {
  return (
    <div className="flex flex-col">
      
      {/* HERO SECTION */}
      <section className="relative bg-white border-b border-slate-200 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Copy */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Activity size={16} /> Official Healthcare Discovery Portal
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
                Healthcare that understands <span className="text-blue-600">your needs.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                Describe your requirements in plain language. Compare hospitals, maintain your health profile, and get AI-assisted insights—all in one secure platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/services" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  <Search size={20} /> Find Hospitals
                </Link>
                <Link to="/ai-report" className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm">
                  <Bot size={20} /> Ask AI Assistant
                </Link>
              </div>
            </motion.div>

            {/* Right Visual (AI Search Preview) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 relative z-10">
                <div className="flex items-center gap-3 mb-4 text-slate-800 font-medium pb-4 border-b border-slate-100">
                  <Bot className="text-blue-600" /> AI Natural Language Search
                </div>
                <p className="text-slate-600 italic mb-6">
                  "I need kidney treatment near Chandigarh with a budget of ₹2 lakh and dialysis facilities."
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-sm text-slate-500">Extracted Concern</span>
                    <span className="text-sm font-medium text-slate-900 bg-white px-2 py-1 rounded shadow-sm">Nephrology</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-sm text-slate-500">Location</span>
                    <span className="text-sm font-medium text-slate-900 bg-white px-2 py-1 rounded shadow-sm">Chandigarh</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-sm text-slate-500">Budget Limit</span>
                    <span className="text-sm font-medium text-slate-900 bg-white px-2 py-1 rounded shadow-sm">₹2,00,000</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-center text-sm font-medium text-blue-600 flex items-center justify-center gap-1">
                  <Activity size={16} /> 92% Match Found
                </div>
              </div>
              
              {/* Decorative blobs behind the card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
            <div>
              <div className="text-3xl font-bold text-white mb-1">150+</div>
              <div className="text-sm text-slate-400">Registered Hospitals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">45</div>
              <div className="text-sm text-slate-400">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-slate-400">AI Assistance</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">10k+</div>
              <div className="text-sm text-slate-400">Patients Guided</div>
            </div>
          </div>
          <div className="text-center mt-6 text-xs text-slate-500 uppercase tracking-widest">
            * Sample Data for Prototype Demonstration
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Explore Departments</h2>
            <p className="text-slate-600">Browse hospitals and specialists based on specific medical categories.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, idx) => (
              <motion.div 
                key={category.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group text-center"
              >
                <div className={`w-12 h-12 mx-auto ${category.bg} ${category.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon size={24} />
                </div>
                <h3 className="font-medium text-slate-800">{category.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY SWASTH SETU SECTION */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Swasth Setu?</h2>
            <p className="text-slate-600">Built to bring transparency, privacy, and ease to your healthcare journey.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 transform rotate-3">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}