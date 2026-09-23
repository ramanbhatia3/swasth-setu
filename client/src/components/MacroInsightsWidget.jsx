import { motion } from 'framer-motion';
import { HeartPulse, Activity, Stethoscope, MapPin } from 'lucide-react';

export default function MacroInsightsWidget() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
      <motion.div {...fadeIn} className="bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
              <Activity className="text-primary-600 dark:text-primary-400" />
              Macro Healthcare Insights
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time aggregated data across our verified hospital network
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-800/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Data
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Cardiac Care */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0f0e0c] border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3 text-slate-600 dark:text-slate-400">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
                <HeartPulse size={20} />
              </div>
              <h3 className="font-bold text-sm">Cardiac Care</h3>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">₹1.4 Lakh</p>
            <p className="text-xs text-slate-500 mt-1">Average package cost</p>
          </div>

          {/* Pancreatic Treatment */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0f0e0c] border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3 text-slate-600 dark:text-slate-400">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <Activity size={20} />
              </div>
              <h3 className="font-bold text-sm">Pancreatic Treatment</h3>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">₹2.2 Lakh</p>
            <p className="text-xs text-slate-500 mt-1">Average treatment cost</p>
          </div>

          {/* Dialysis */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0f0e0c] border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3 text-slate-600 dark:text-slate-400">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <Stethoscope size={20} />
              </div>
              <h3 className="font-bold text-sm">Dialysis</h3>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">₹18,000</p>
            <p className="text-xs text-slate-500 mt-1">Average monthly package</p>
          </div>

          {/* Regional Distribution */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0f0e0c] border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-3 mb-3 text-slate-600 dark:text-slate-400">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold text-sm">Center Distribution</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between items-center"><span className="text-slate-500">North</span><span className="font-bold text-slate-700 dark:text-slate-300">32%</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">South</span><span className="font-bold text-slate-700 dark:text-slate-300">38%</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">East</span><span className="font-bold text-slate-700 dark:text-slate-300">12%</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">West</span><span className="font-bold text-slate-700 dark:text-slate-300">18%</span></div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
