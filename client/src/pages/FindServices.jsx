import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Search, MapPin, Activity, Stethoscope, IndianRupee, 
  ShieldCheck, CheckSquare, Square, Building2, ChevronRight 
} from 'lucide-react';

export default function FindServices() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    city: '', specialization: '', facility: '', maxBudget: ''
  });

  const [compareList, setCompareList] = useState([]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.facility) params.append('facility', filters.facility);
      if (filters.maxBudget) params.append('maxBudget', filters.maxBudget);

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/hospitals/search?${params.toString()}`);
      if (res.data.success) {
        setHospitals(res.data.hospitals);
      }
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitals(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const toggleCompare = (hospitalId) => {
    if (compareList.includes(hospitalId)) {
      setCompareList(compareList.filter(id => id !== hospitalId));
    } else {
      if (compareList.length >= 3) return alert("You can only compare up to 3 hospitals at a time.");
      setCompareList([...compareList, hospitalId]);
    }
  };

  // Navigates to the comparison page, passing the selected IDs securely in memory
  const handleCompareNow = () => {
    navigate('/compare', { state: { hospitalIds: compareList } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Healthcare Services</h1>
        <p className="text-slate-600">Discover hospitals and see how well they match your specific requirements.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT SIDEBAR: FILTERS */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Search size={20} className="text-blue-600" /> Filter Criteria
            </h2>
            <form onSubmit={handleSearch} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin size={16} className="text-slate-400" /></div>
                  <input type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="e.g. Chandigarh, Delhi" className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 sm:text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Stethoscope size={16} className="text-slate-400" /></div>
                  <select name="specialization" value={filters.specialization} onChange={handleFilterChange} className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white">
                    <option value="">All Specializations</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Nephrology">Nephrology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Required Facility</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Building2 size={16} className="text-slate-400" /></div>
                  <select name="facility" value={filters.facility} onChange={handleFilterChange} className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white">
                    <option value="">Any Facility</option>
                    <option value="Dialysis">Dialysis</option>
                    <option value="ICU">ICU</option>
                    <option value="Operation Theatre">Operation Theatre</option>
                    <option value="Blood Bank">Blood Bank</option>
                    <option value="24x7 Emergency">24x7 Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Estimated Budget (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IndianRupee size={16} className="text-slate-400" /></div>
                  <input type="number" name="maxBudget" value={filters.maxBudget} onChange={handleFilterChange} placeholder="e.g. 200000" className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 sm:text-sm" />
                </div>
              </div>

              <button type="submit" className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                <Search size={18} /> Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT AREA: RESULTS */}
        <div className="w-full lg:w-3/4">
          
          {compareList.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white p-4 rounded-xl mb-6 flex justify-between items-center shadow-lg sticky top-24 z-10">
              <span className="font-medium">{compareList.length} Hospital(s) selected for comparison</span>
              <button onClick={handleCompareNow} className="bg-white text-slate-900 px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
                Compare Now <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <Activity className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
              <p className="text-slate-500">Matching requirements...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Search className="text-slate-300 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No hospitals found</h3>
              <p className="text-slate-500">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {hospitals.map((hospital) => (
                <motion.div key={hospital._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                  
                  {/* Card Content */}
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{hospital.name}</h3>
                        <p className="text-slate-600 flex items-center gap-1.5 text-sm mt-1">
                          <MapPin size={14} className="text-slate-400" /> {hospital.location.address}, {hospital.location.city}
                        </p>
                      </div>
                      {hospital.isVerified && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <ShieldCheck size={14} /> Verified Profile
                        </div>
                      )}
                    </div>

                    {/* NEW: TRANSPARENT MATCHING UI */}
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-bold px-2 py-0.5 rounded ${hospital.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' : hospital.matchScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {hospital.matchScore}% Match
                        </span>
                        <span className="text-sm font-medium text-slate-700">Requirement Compatibility</span>
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {hospital.matchExplanations.map((expl, i) => (
                          <li key={i} className={expl.includes('⚠') ? 'text-amber-600 font-medium' : ''}>{expl}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {hospital.specializations.slice(0,3).map((spec, i) => (
                        <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">{spec}</span>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-6 flex flex-col justify-between w-full md:w-64 shrink-0">
                    <div>
                      {hospital.services && hospital.services.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Sample Service</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">{hospital.services[0].name}</p>
                          <p className="text-lg font-bold text-slate-900 mt-0.5">₹{hospital.services[0].estimatedCost.min.toLocaleString()} - ₹{hospital.services[0].estimatedCost.max.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <button onClick={() => navigate(`/hospital/${hospital._id}`)} className="w-full bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                        View Details
                      </button>
                      <button onClick={() => toggleCompare(hospital._id)} className={`w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${compareList.includes(hospital._id) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
                        {compareList.includes(hospital._id) ? <CheckSquare size={16} /> : <Square size={16} />} {compareList.includes(hospital._id) ? 'Selected' : 'Compare'}
                      </button>
                    </div>
                  </div>
                  
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}