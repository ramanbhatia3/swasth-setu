import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Minus } from 'lucide-react';

export default function CompareHospitals() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If user typed /compare manually without selecting anything, kick them back
    if (!location.state || !location.state.hospitalIds || location.state.hospitalIds.length === 0) {
      navigate('/services');
      return;
    }

    const fetchComparison = async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/hospitals/compare`, {
          hospitalIds: location.state.hospitalIds
        });
        if (res.data.success) setHospitals(res.data.hospitals);
      } catch (error) {
        console.error("Comparison fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [location, navigate]);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading comparison...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Compare Hospitals</h1>
        <p className="text-slate-600">Side-by-side comparison of your selected healthcare facilities.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-x-auto">
        <table className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm text-left">
          <thead>
            <tr className="bg-slate-50 divide-x divide-slate-200 border-b border-slate-200">
              <th className="p-4 w-48 font-semibold text-slate-500">Feature</th>
              {hospitals.map(h => (
                <th key={h._id} className="p-4 min-w-[250px]">
                  <div className="font-bold text-lg text-slate-900 mb-1">{h.name}</div>
                  <div className="text-xs font-normal text-slate-500">{h.location.city}, {h.location.state}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            
            {/* Type Row */}
            <tr className="divide-x divide-slate-200">
              <td className="p-4 font-medium text-slate-700 bg-slate-50">Hospital Type</td>
              {hospitals.map(h => <td key={h._id} className="p-4 text-slate-700">{h.type}</td>)}
            </tr>

            {/* Verification Row */}
            <tr className="divide-x divide-slate-200">
              <td className="p-4 font-medium text-slate-700 bg-slate-50">Verification Status</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4">
                  {h.isVerified ? <span className="text-emerald-600 font-medium flex items-center gap-1"><Check size={16}/> Verified</span> : <span className="text-slate-400">Unverified</span>}
                </td>
              ))}
            </tr>

            {/* Specializations Row */}
            <tr className="divide-x divide-slate-200">
              <td className="p-4 font-medium text-slate-700 bg-slate-50">Specializations</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 align-top">
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {h.specializations.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Facilities Row */}
            <tr className="divide-x divide-slate-200">
              <td className="p-4 font-medium text-slate-700 bg-slate-50">Key Facilities</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 align-top">
                  <div className="flex flex-wrap gap-1">
                    {h.facilities.map((f, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-xs rounded border border-slate-200">{f}</span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Beds Row */}
            <tr className="divide-x divide-slate-200">
              <td className="p-4 font-medium text-slate-700 bg-slate-50">Total Beds</td>
              {hospitals.map(h => <td key={h._id} className="p-4 text-slate-700">{h.statistics?.beds || <Minus size={16} className="text-slate-300"/>}</td>)}
            </tr>

          </tbody>
        </table>
      </motion.div>
    </div>
  );
}