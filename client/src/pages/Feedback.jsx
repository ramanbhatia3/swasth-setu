import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Star, ArrowRight, Building2 } from 'lucide-react';

export default function Feedback() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // We reuse the existing search API, filtering just by the hospital name/city text
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/hospitals/search?city=${searchTerm}`);
      if (res.data.success) {
        setResults(res.data.hospitals);
      }
    } catch (error) {
      console.error("Failed to search hospitals for feedback", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600">
            <MessageSquare size={40} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Share Your Experience</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Your feedback brings transparency to the healthcare system. Search for a hospital below to leave a User Experience Rating (cleanliness, waiting times, and staff behavior).
        </p>
      </motion.div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by city (e.g., Chandigarh, Mumbai)..."
              className="block w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-700"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
          >
            {isSearching ? 'Searching...' : 'Find Hospital'}
          </button>
        </form>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((hospital) => (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={hospital._id} 
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="p-3 bg-slate-50 rounded-lg text-slate-400 border border-slate-100">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{hospital.name}</h3>
                  <p className="text-sm text-slate-500">{hospital.location.city}, {hospital.location.state}</p>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/hospital/${hospital._id}`)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors w-full sm:w-auto justify-center"
              >
                <Star size={16} /> Leave Review <ArrowRight size={16} />
              </button>
            </motion.div>
          ))
        ) : (
          searchTerm && !isSearching && (
            <div className="text-center py-8 text-slate-500">
              No hospitals found matching your search. Try adjusting the city name.
            </div>
          )
        )}
      </div>
    </div>
  );
}