import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Activity, ShieldCheck, CheckSquare, Square, 
  ChevronRight, AlertCircle, TrendingUp, Users, IndianRupee, HeartPulse,
  Sparkles, X, Send, Bot, Award, ExternalLink
} from 'lucide-react';

export default function FindServices() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Standard List Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('successRate');
  const [invalidMessage, setInvalidMessage] = useState('');
  const [parsedContext, setParsedContext] = useState(null);
  const [compareList, setCompareList] = useState([]);

  // --- AI Concierge (Single Best Hospital) Modal States ---
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiHistory, setAiHistory] = useState([
    {
      sender: 'ai',
      text: "Hello! Ask me for the single best hospital for any chronic condition, region, or budget (e.g. *\"best cancer hospital in punjab in 2 lakh\"*). I will calculate and recommend strictly the #1 facility with the highest verified clinical success rate.",
      hospital: null
    }
  ]);
  const chatBottomRef = useRef(null);

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

  useEffect(() => { 
    fetchHospitals('', sortBy); 
  }, []);

  const handleStandardSearch = (e) => {
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

  const handleAiConciergeSubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userText = aiPrompt.trim();
    setAiHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setAiPrompt('');
    setAiLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/ai/recommend`, {
        message: userText
      });

      if (res.data.success) {
        setAiHistory(prev => [...prev, {
          sender: 'ai',
          text: res.data.reply,
          hospital: res.data.hospital
        }]);
      }
    } catch (err) {
      setAiHistory(prev => [...prev, {
        sender: 'ai',
        text: "Could not retrieve the recommendation right now. Please verify your connection or parameters.",
        hospital: null
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory, aiLoading]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Search Header */}
      <div className="mb-10 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-300 text-sm font-semibold mb-4">
          <Sparkles size={16} /> Verified Hospital Registry
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 font-serif">Find Specialized Care</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Search the complete directory below, or use the AI Concierge for an instant single #1 recommendation.
        </p>

        {/* Action Toolbar: Search + AI Single Match Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-primary-700 to-primary-500 text-white rounded-xl font-bold hover:from-primary-800 hover:to-primary-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base"
          >
            <Bot size={20} />
            Ask AI Concierge (#1 Best Match)
          </button>
        </div>

        {/* Standard Multi-Hospital Search Bar */}
        <form onSubmit={handleStandardSearch} className="relative flex items-center shadow-lg rounded-2xl bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 p-2 focus-within:ring-2 focus-within:ring-primary-600 transition-shadow">
          <Search className="text-slate-400 ml-4 shrink-0" size={24} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all hospitals: e.g. 'Cancer treatment in Punjab', 'Cardiology in Delhi'..." 
            className="w-full px-4 py-4 text-slate-700 dark:text-white bg-transparent outline-none text-base md:text-lg placeholder-slate-400"
          />
          <button type="submit" className="bg-primary-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-800 transition-colors shrink-0">
            Search List
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT SIDEBAR: SORTING & CONTEXT */}
        <div className="w-full lg:w-1/4 shrink-0">
          <div className="bg-white dark:bg-[#141311] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Sort Results By</label>
              <select 
                value={sortBy} 
                onChange={handleSortChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="successRate">Highest Clinical Success Rate</option>
                <option value="matchScore">Best Requirement Match</option>
                <option value="budgetLow">Estimated Cost: Low to High</option>
                <option value="patientCount">Most Patients Treated</option>
              </select>
            </div>

            {/* AI Detected Context */}
            <AnimatePresence>
              {parsedContext && (parsedContext.detectedLocation || parsedContext.detectedSpecialties?.length > 0 || parsedContext.detectedBudget) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/50 rounded-xl"
                >
                  <h3 className="text-xs font-bold text-primary-800 dark:text-primary-400 uppercase tracking-wider mb-3">AI Detected Requirements</h3>
                  <div className="space-y-2 text-sm text-primary-900 dark:text-primary-300">
                    {parsedContext.detectedSpecialties?.length > 0 && (
                      <p className="flex items-start gap-2"><HeartPulse size={16} className="mt-0.5 shrink-0"/> {parsedContext.detectedSpecialties.join(', ')}</p>
                    )}
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

        {/* RIGHT AREA: FULL SORTED LIST */}
        <div className="w-full lg:w-3/4">
          
          {/* Compare Toolbar */}
          <AnimatePresence>
            {compareList.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-xl mb-6 flex justify-between items-center shadow-lg sticky top-24 z-10 border border-slate-700">
                <span className="font-medium">{compareList.length} Hospital(s) selected</span>
                <button onClick={() => navigate('/compare', { state: { hospitalIds: compareList } })} className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-2">
                  Compare Now <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Invalid Input Banner */}
          {invalidMessage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 mt-1 shrink-0" size={24} />
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-bold text-lg mb-1">Invalid Search Query</h3>
                <p className="text-red-700 dark:text-red-400">{invalidMessage}</p>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-20">
              <Activity className="animate-spin text-primary-600 mx-auto mb-4" size={32} />
              <p className="text-slate-500 font-medium">Scanning verified database and sorting by clinical outcomes...</p>
            </div>
          ) : !invalidMessage && hospitals.length === 0 ? (
            <div className="bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center shadow-sm">
              <Search className="text-slate-300 dark:text-slate-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No matching hospitals found</h3>
              <p className="text-slate-500">Try broadening your search term or checking nationwide centers.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm text-slate-500 font-medium px-1">
                <span>Showing {hospitals.length} hospital(s)</span>
                <span>Default sorting: Success Rate (High to Low)</span>
              </div>

              {hospitals.map((hospital) => (
                <motion.div key={hospital._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all flex flex-col md:flex-row group">
                  
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors font-serif">{hospital.name}</h3>
                        <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-sm mt-1.5 font-medium">
                          <MapPin size={16} className="text-slate-400" /> {hospital.location.address}, {hospital.location.city}, {hospital.location.state}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {hospital.isVerified && (
                          <div className="flex items-center gap-1 text-xs font-bold text-primary-800 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/40 px-3 py-1.5 rounded-lg border border-primary-100 dark:border-primary-800">
                            <ShieldCheck size={14} /> Verified
                          </div>
                        )}
                        {hospital.metrics?.nabhAccredited && (
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            NABH
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 my-5 p-4 bg-slate-50 dark:bg-[#0f0e0c]/50 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 font-bold text-lg border-2 border-primary-200 dark:border-primary-800">
                          {hospital.metrics?.successRate}%
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Success Rate</p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-300 flex items-center gap-1"><TrendingUp size={14} className="text-primary-600 dark:text-primary-400"/> Verified Outcomes</p>
                        </div>
                      </div>
                      <div className="w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">
                          <Users size={24} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Patients Treated</p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-300">{hospital.metrics?.successfulPatientsCount?.toLocaleString()}+ successful</p>
                        </div>
                      </div>
                    </div>

                    {searchQuery && hospital.matchScore && (
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-bold px-2 py-0.5 rounded ${hospital.matchScore >= 80 ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                            {hospital.matchScore}% Match
                          </span>
                        </div>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 pl-1">
                          {hospital.matchExplanations?.map((expl, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-primary-500 mt-0.5">•</span> {expl}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hospital.chronicConditionsHandled?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {hospital.chronicConditionsHandled.slice(0, 4).map((cond, i) => (
                          <span key={i} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-md border border-blue-100 dark:border-blue-900/50">
                            {cond}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0f0e0c]/30 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between w-full md:w-72 shrink-0">
                    <div>
                      {hospital.procedures && hospital.procedures.length > 0 && (
                        <div className="mb-6 p-4 bg-white dark:bg-[#141311] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">Procedure Package</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight mb-2">{hospital.procedures[0].name}</p>
                          <p className="text-lg font-black text-primary-700 dark:text-primary-400">₹{hospital.procedures[0].estimatedCost.min.toLocaleString()} <span className="text-sm font-medium text-slate-500 dark:text-slate-600 line-through">₹{hospital.procedures[0].estimatedCost.max.toLocaleString()}</span></p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3 mt-auto">
                      <button onClick={() => navigate(`/hospital/${hospital._id}`)} className="w-full bg-slate-900 dark:bg-primary-800 text-white text-sm font-bold px-4 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-primary-900 transition-colors shadow-sm">
                        View Full Details
                      </button>
                      <button onClick={() => toggleCompare(hospital._id)} className={`w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-3 rounded-xl border-2 transition-colors ${compareList.includes(hospital._id) ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141311] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}`}>
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

      {/* --- MODAL: AI CONCIERGE (GIVES STRICTLY THE SINGLE #1 BEST HOSPITAL) --- */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#141311] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col h-[650px]"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 dark:bg-[#0f0e0c] text-white p-5 flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-600 rounded-lg text-white">
                    <Award size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Concierge: #1 Best Hospital Advisor</h3>
                    <p className="text-xs text-slate-400">Recommends strictly one top facility with highest verified success rate</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAiModalOpen(false)} 
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Chat Conversation Area */}
              <div className="flex-grow p-5 overflow-y-auto bg-slate-50 dark:bg-[#0f0e0c] space-y-5">
                {aiHistory.map((item, index) => (
                  <div key={index} className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] ${item.sender === 'user' ? 'bg-primary-700 text-white p-4 rounded-2xl rounded-tr-sm text-sm md:text-base shadow-sm' : 'space-y-3'}`}>
                      
                      {item.sender === 'ai' && (
                        <div className="bg-white dark:bg-[#141311] p-5 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                          {item.text}
                        </div>
                      )}

                      {/* Highlight Card for the Single Best Hospital */}
                      {item.hospital && (
                        <div className="bg-gradient-to-br from-primary-900 to-slate-900 dark:to-slate-950 text-white p-5 rounded-2xl border border-primary-700 shadow-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 bg-primary-500/20 border border-primary-400/30 text-primary-300 text-xs font-bold rounded-full uppercase tracking-wider">
                              #1 Recommended Facility
                            </span>
                            <span className="text-2xl font-black text-primary-400">
                              {item.hospital.metrics?.successRate}% Success
                            </span>
                          </div>

                          <h4 className="text-xl font-bold mb-1 font-serif">{item.hospital.name}</h4>
                          <p className="text-sm text-slate-300 flex items-center gap-1.5 mb-4">
                            <MapPin size={15} /> {item.hospital.location.address}, {item.hospital.location.city}, {item.hospital.location.state}
                          </p>

                          <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-800/80 mb-4 text-xs text-slate-300">
                            <div>
                              <span className="text-slate-400 block font-medium">Patients Treated</span>
                              <strong className="text-sm text-white font-bold">{item.hospital.metrics?.successfulPatientsCount?.toLocaleString()}+</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Starting Package</span>
                              <strong className="text-sm text-white font-bold">₹{item.hospital.procedures?.[0]?.estimatedCost?.min?.toLocaleString() || 'N/A'}</strong>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              setIsAiModalOpen(false);
                              navigate(`/hospital/${item.hospital._id}`);
                            }}
                            className="w-full py-2.5 bg-primary-500 hover:bg-primary-400 text-slate-950 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow"
                          >
                            View Hospital Profile <ExternalLink size={16} />
                          </button>
                        </div>
                      )}

                      {item.sender === 'user' && item.text}
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="p-4 bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3 text-sm">
                      <Activity size={18} className="animate-spin text-primary-600" />
                      Evaluating hospital database to find the single best match...
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAiConciergeSubmit} className="p-4 bg-white dark:bg-[#141311] border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0">
                <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. best cancer hospital in punjab in 2 lakh"
                  className="flex-grow px-4 py-3 bg-slate-50 dark:bg-[#0f0e0c] border border-slate-300 dark:border-slate-700 focus:border-primary-600 rounded-xl text-sm outline-none transition-all text-slate-800 dark:text-slate-200"
                  disabled={aiLoading}
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="px-5 py-3 bg-primary-700 hover:bg-primary-800 text-white font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}