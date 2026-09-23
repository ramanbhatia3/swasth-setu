import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f0e0c] font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <div className="bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs text-center py-2 px-4 font-medium border-b border-slate-300 dark:border-slate-800">
        <span className="font-bold mr-1 text-slate-700 dark:text-slate-300">Government Sandbox Prototype:</span>
        Performance indicators, costs, and success rates reflect structured benchmark datasets integrated for prototype validation under Technovate 2026 Guidelines.
      </div>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}