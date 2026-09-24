import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Minus, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CompareHospitals() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLoc({ lat: 28.6139, lng: 77.2090 })
      );
    } else {
      setUserLoc({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return Math.round(R * c);
  };

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

  if (loading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading comparison...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-serif">{t('Compare Hospitals')}</h1>
        <p className="text-slate-600 dark:text-slate-400">Side-by-side comparison of your selected healthcare facilities.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm text-left transition-colors">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#0f0e0c]/50 divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 w-48 font-semibold text-slate-500 dark:text-slate-400">Feature</th>
              {hospitals.map(h => (
                <th key={h._id} className="p-4 min-w-[250px]">
                  <div className="font-bold text-lg text-slate-900 dark:text-white mb-1 font-serif">{h.name}</div>
                  <div className="text-xs font-normal text-slate-500 dark:text-slate-400">{h.location.city}, {h.location.state}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            
            {/* Type Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Hospital Type</td>
              {hospitals.map(h => <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300">{h.type}</td>)}
            </tr>

            {/* Verification Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Verification Status</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4">
                  {h.isVerified ? <span className="text-primary-600 dark:text-primary-500 font-medium flex items-center gap-1"><Check size={16}/> Verified</span> : <span className="text-slate-400 dark:text-slate-500">Unverified</span>}
                </td>
              ))}
            </tr>

            {/* Clinical Success Rates Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Clinical Success Rates</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                  {h.metrics?.successRate ? (
                    <span className={h.metrics.successRate >= 90 ? 'text-green-600 dark:text-green-400' : ''}>
                      {h.metrics.successRate}%
                    </span>
                  ) : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* Annual Patient Volume Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Annual Patient Volume</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300">
                  {h.metrics?.successfulPatientsCount ? h.metrics.successfulPatientsCount.toLocaleString() : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* Estimated Procedure Pricing Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Estimated Procedure Pricing</td>
              {hospitals.map(h => {
                let displayPrice = <Minus size={16} className="text-slate-300 dark:text-slate-600"/>;
                if (h.procedures && h.procedures.length > 0) {
                  const min = Math.min(...h.procedures.map(p => p.estimatedCost.min));
                  const max = Math.max(...h.procedures.map(p => p.estimatedCost.max));
                  displayPrice = `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
                }
                return (
                  <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300">
                    {displayPrice}
                  </td>
                );
              })}
            </tr>

            {/* Ratings: Patient Satisfaction Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Patient Satisfaction (out of 5)</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                  {h.ratings?.patientSatisfaction ? `${h.ratings.patientSatisfaction.toFixed(1)} / 5.0` : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* Ratings: Infrastructure Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Infrastructure Score (out of 10)</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                  {h.ratings?.infrastructure ? `${h.ratings.infrastructure.toFixed(1)} / 10` : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* Ratings: Care Quality Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Care Quality Score (out of 10)</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                  {h.ratings?.careQuality ? `${h.ratings.careQuality.toFixed(1)} / 10` : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* ICU Beds Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">ICU Beds Available</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                  {h.statistics?.icuBeds ? h.statistics.icuBeds : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* Ambulances Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Ambulances</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                  {h.statistics?.ambulances ? h.statistics.ambulances : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* Insurance & Empanelment Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Insurance & Empanelment</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 text-sm">
                  {h.insuranceEmpaneled && h.insuranceEmpaneled.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {h.insuranceEmpaneled.map((ins, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded text-xs border border-blue-200 dark:border-blue-800">{ins}</span>
                      ))}
                    </div>
                  ) : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* Awards Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Awards & Recognitions</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 text-sm">
                  {h.awards && h.awards.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1">
                      {h.awards.map((aw, idx) => <li key={idx}>{aw}</li>)}
                    </ul>
                  ) : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* Languages Spoken Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Languages Spoken</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 text-sm font-medium">
                  {h.languagesSpoken && h.languagesSpoken.length > 0 ? h.languagesSpoken.join(', ') : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* ED Wait Time Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Avg. Emergency Wait Time</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                  {h.averageEDWaitTimeMins ? `~${h.averageEDWaitTimeMins} mins` : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* Disease Specific Success Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Key Disease Success Rates</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 text-sm">
                  {h.diseaseSpecificSuccess && h.diseaseSpecificSuccess.length > 0 ? (
                    <ul className="space-y-2">
                      {h.diseaseSpecificSuccess.map((d, idx) => (
                        <li key={idx} className="border-b border-slate-200 dark:border-slate-800 pb-1 last:border-0 last:pb-0">
                          <span className="font-semibold block">{d.disease}</span>
                          <span className="text-xs text-slate-500">{d.successRate}% Success ({d.recoveredPatients.toLocaleString()} recovered)</span>
                        </li>
                      ))}
                    </ul>
                  ) : <Minus size={16} className="text-slate-300 dark:text-slate-600"/>}
                </td>
              ))}
            </tr>

            {/* Distance Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Distance (approx.)</td>
              {hospitals.map(h => {
                const dist = userLoc && h.location?.coordinates?.lat ? calculateDistance(userLoc.lat, userLoc.lng, h.location.coordinates.lat, h.location.coordinates.lng) : null;
                return (
                  <td key={h._id} className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                    {dist !== null ? (
                      <span className="flex items-center gap-1"><MapPin size={16} className="text-primary-500" /> {dist} km away</span>
                    ) : (
                      <span className="text-slate-400 text-sm">N/A</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Facility Checkmarks */}
            {['ICU', 'Organ Transplant', 'Emergency', 'Blood Bank'].map(facilityName => (
              <tr key={facilityName} className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">{facilityName}</td>
                {hospitals.map(h => {
                  const hasFacility = h.facilities?.some(f => f.toLowerCase().includes(facilityName.toLowerCase()));
                  return (
                    <td key={h._id} className="p-4 text-center">
                      {hasFacility ? (
                        <Check size={20} className="text-green-500 mx-auto" />
                      ) : (
                        <Minus size={20} className="text-slate-300 dark:text-slate-600 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* CTAs Row */}
            <tr className="divide-x divide-slate-200 dark:divide-slate-800 border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0f0e0c]/20">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f0e0c]/30">Actions</td>
              {hospitals.map(h => (
                <td key={h._id} className="p-4">
                  <div className="flex flex-col gap-2">
                    <Link 
                      to={`/hospital/${h._id}`} 
                      className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-center rounded-lg font-medium transition-colors"
                    >
                      View Details
                    </Link>
                    <Link 
                      to={`/feedback?hospitalId=${h._id}`} 
                      className="w-full py-2 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-center rounded-lg font-medium transition-colors"
                    >
                      File Report
                    </Link>
                  </div>
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </motion.div>
    </div>
  );
}