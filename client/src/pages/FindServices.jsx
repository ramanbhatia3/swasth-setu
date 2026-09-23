import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Activity, ShieldCheck, CheckSquare, Square, 
  ChevronRight, AlertCircle, TrendingUp, Users, IndianRupee, HeartPulse
} from 'lucide-react';

export default function FindServices() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // New Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('successRate');
  const [invalidMessage, setInvalidMessage] = useState('');
  const [parsedContext, setParsedContext] = useState(null);
  
  const [compareList, setCompareList] = useState([]);

  const fetchHospitals = async (q = '', sort = 'successRate') => {
    setLoading(true);
    setInvalidMessage('');
    setParsedContext(null);
    
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/hospitals/search`, {
        params: { q, sortBy: sort }
      });
      
      if (res.data.success) {
        if (res.data.isInvalidQuery) {
          setInvalidMessage(res.data.message);
          setHospitals([]);
        } else {
          setHospitals(res.data.hospitals);
          setParsedContext(res.data.parsedQuery);
        }
      }
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load (empty query -> returns top hospitals by success rate)
  useEffect(() => { 
    fetchHospitals('', sortBy); 
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHospitals(searchQuery, sortBy);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    fetchHospitals(searchQuery, newSort);
  };

  const toggleCompare = (hospitalId) => {
    if (compareList.includes(hospitalId)) {
      setCompareList(compareList.filter(id => id !== hospitalId));
    } else {
      if (compareList.length >= 3) return alert("You can only compare up to 3 hospitals at a time.");
      setCompareList([...compareList, hospitalId]);
    }
  };

  const handleCompareNow = () => {
    navigate('/compare', { state: { hospitalIds: compareList } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Natural Language Search Bar */}
      <div className="mb-10 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Find Specialized Care</h1>
        <p className="text-slate-600 mb-8">
          Describe what you're looking for naturally. e.g., <span className="italic font-medium text-slate-800">"Pancreatic disease treatment in Chandigarh under 200000"</span>
        </p>

        <form onSubmit={handleSearch} className="relative flex items-center shadow-lg rounded-2xl bg-white border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-teal-600 transition-shadow">
          <Search className="text-slate-400 ml-4 shrink-0" size={24} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by condition, specialty, city, or budget..." 
            className="w-full px-4 py-4 text-slate-700 bg-transparent outline-none text-lg placeholder-slate-400"
          />
          <button type="submit" className="bg-teal-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-800 transition-colors shrink-0">
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT SIDEBAR: SORTING & CONTEXT */}
        <div className="w-full lg:w-1/4 shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-900 mb-2">Sort Results By</label>
              <select 
                value={sortBy} 
                onChange={handleSortChange} 
                className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-600 outline-none text-sm font-medium text-slate-700"
              >
                <option value="successRate">Highest Clinical Success Rate</option>
                <option value="matchScore">Best Requirement Match</option>
                <option value="budgetLow">Estimated Cost: Low to High</option>
                <option value="patientCount">Most Patients Treated</option>
              </select>
            </div>

            {/* AI Parsing Context Display */}
            <AnimatePresence>
              {parsedContext && (parsedContext.detectedLocation || parsedContext.detectedSpecialties?.length > 0 || parsedContext.detectedBudget) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="p-4 bg-teal-50 border border-teal-100 rounded-xl"
                >
                  <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-3">AI Detected Requirements</h3>
                  <div className="space-y-2 text-sm text-teal-900">
                    {parsedContext.detectedSpecialties?.length > 0 && (
                      <p className="flex items-start gap-2"><HeartPulse size={16} className="mt-0.5 shrink-0"/> {parsedContext.detectedSpecialties.join(', ')}</p>
                    )}
                    {/* CHANGED THIS LINE BELOW TO USE detectedLocation */}
                    {parsedContext.detectedLocation && (
                      <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0"/> Region: {parsedContext.detectedLocation}</p>
                    )}
                    {parsedContext.detectedBudget && (
                      <p className="flex items-start gap-2"><IndianRupee size={16} className="mt-0.5 shrink-0"/> Max Budget: ₹{parsedContext.detectedBudget.toLocaleString()}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* RIGHT AREA: RESULTS */}
        <div className="w-full lg:w-3/4">
          
          {/* Compare Toolbar */}
          <AnimatePresence>
            {compareList.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-900 text-white p-4 rounded-xl mb-6 flex justify-between items-center shadow-lg sticky top-24 z-10">
                <span className="font-medium">{compareList.length} Hospital(s) selected</span>
                <button onClick={handleCompareNow} className="bg-white text-slate-900 px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
                  Compare Now <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Invalid Input Banner */}
          {invalidMessage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-1 shrink-0" size={24} />
              <div>
                <h3 className="text-red-800 font-bold text-lg mb-1">Invalid Search Query</h3>
                <p className="text-red-700">{invalidMessage}</p>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-20">
              <Activity className="animate-spin text-teal-600 mx-auto mb-4" size={32} />
              <p className="text-slate-500 font-medium">Analyzing query and scoring hospitals...</p>
            </div>
          ) : !invalidMessage && hospitals.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
              <Search className="text-slate-300 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No exact matches found</h3>
              <p className="text-slate-500">Try adjusting your location or using different medical terms.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {hospitals.map((hospital) => (
                <motion.div key={hospital._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col md:flex-row group">
                  
                  {/* Card Main Content */}
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{hospital.name}</h3>
                        <p className="text-slate-600 flex items-center gap-1.5 text-sm mt-1.5 font-medium">
                          <MapPin size={16} className="text-slate-400" /> {hospital.location.address}, {hospital.location.city}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {hospital.isVerified && (
                          <div className="flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">
                            <ShieldCheck size={14} /> Verified
                          </div>
                        )}
                        {hospital.metrics?.nabhAccredited && (
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            NABH Accredited
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="flex flex-wrap gap-6 my-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-teal-100 text-teal-700 font-bold text-lg border-2 border-teal-200">
                          {hospital.metrics?.successRate}%
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Clinical Success</p>
                          <p className="text-sm font-medium text-slate-800 flex items-center gap-1"><TrendingUp size={14} className="text-teal-600"/> High Rating</p>
                        </div>
                      </div>
                      <div className="w-px bg-slate-200 hidden sm:block"></div>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                          <Users size={24} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Patients Treated</p>
                          <p className="text-sm font-medium text-slate-800">{hospital.metrics?.successfulPatientsCount?.toLocaleString()}+ successful</p>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Match Score & Explanations (Appears only if searching) */}
                    {searchQuery && hospital.matchScore && (
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-bold px-2 py-0.5 rounded ${hospital.matchScore >= 80 ? 'bg-teal-100 text-teal-800' : hospital.matchScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                            {hospital.matchScore}% Match
                          </span>
                          <span className="text-sm font-medium text-slate-600">to your requirements</span>
                        </div>
                        <ul className="text-sm text-slate-600 space-y-1 pl-1">
                          {hospital.matchExplanations?.map((expl, i) => (
                            <li key={i} className={`flex items-start gap-1.5 ${expl.includes('exceed') ? 'text-rose-600 font-medium' : ''}`}>
                              <span className="text-teal-500 mt-0.5">•</span> {expl}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Chronic Conditions Tags */}
                    {hospital.chronicConditionsHandled?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {hospital.chronicConditionsHandled.slice(0, 4).map((cond, i) => (
                          <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
                            {cond}
                          </span>
                        ))}
                        {hospital.chronicConditionsHandled.length > 4 && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">+{hospital.chronicConditionsHandled.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Sidebar Actions */}
                  <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-6 flex flex-col justify-between w-full md:w-72 shrink-0">
                    <div>
                      {hospital.procedures && hospital.procedures.length > 0 && (
                        <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">Sample Cost</p>
                          <p className="text-sm font-bold text-slate-800 leading-tight mb-2">{hospital.procedures[0].name}</p>
                          <p className="text-lg font-black text-teal-700">₹{hospital.procedures[0].estimatedCost.min.toLocaleString()} <span className="text-sm font-medium text-slate-500 line-through">₹{hospital.procedures[0].estimatedCost.max.toLocaleString()}</span></p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3 mt-auto">
                      <button onClick={() => navigate(`/hospital/${hospital._id}`)} className="w-full bg-slate-900 text-white text-sm font-bold px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
                        View Full Details
                      </button>
                      <button onClick={() => toggleCompare(hospital._id)} className={`w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-3 rounded-xl border-2 transition-colors ${compareList.includes(hospital._id) ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                        {compareList.includes(hospital._id) ? <CheckSquare size={18} /> : <Square size={18} />} 
                        {compareList.includes(hospital._id) ? 'Added to Compare' : 'Compare Hospital'}
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