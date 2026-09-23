import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Award, Calendar, Clock, X, CheckCircle, AlertCircle, Stethoscope, BriefcaseMedical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Specialists() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [specialties, setSpecialties] = useState([]);
  
  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalError, setModalError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/doctors`);
      if (res.data.success) {
        setDoctors(res.data.data);
        // Extract unique specialties
        const specs = [...new Set(res.data.data.map(d => d.specialization))];
        setSpecialties(specs);
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookClick = (doctor) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedDoctor(doctor);
    setBookingDate('');
    setBookingTime('');
    setModalError('');
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      setModalError('Please select both date and time');
      return;
    }

    try {
      setBookingLoading(true);
      setModalError('');
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/doctors/appointment`,
        {
          doctorId: selectedDoctor._id,
          date: bookingDate,
          timeSlot: bookingTime
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast('Appointment booked successfully!');
        setSelectedDoctor(null);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (doctor.hospital?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter ? doctor.specialization === specialtyFilter : true;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif mb-3">Specialist Directory</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Consult with top-tier specialists from across the country. Find the right doctor for your specific medical needs and book an appointment instantly.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white dark:bg-[#141311] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by doctor or hospital name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0f0e0c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0f0e0c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none appearance-none transition-all"
          >
            <option value="">All Specialties</option>
            {specialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading specialists...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400 bg-white dark:bg-[#141311] rounded-xl border border-slate-200 dark:border-slate-800">
          No specialists found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <motion.div 
              key={doctor._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">{doctor.name}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-medium text-sm flex items-center gap-1 mt-1">
                      <BriefcaseMedical size={14} /> {doctor.specialization}
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    ₹{doctor.consultationFee}
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="truncate">{doctor.hospital?.name || 'Unknown Hospital'}, {doctor.hospital?.location?.city || ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Award size={16} className="text-slate-400" />
                    <span>{doctor.experienceYears} Years Experience</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Stethoscope size={16} className="text-slate-400 mt-0.5" />
                    <span className="leading-tight">{doctor.qualifications}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {doctor.availability.map((time) => (
                    <span key={time} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f0e0c]">
                <button 
                  onClick={() => handleBookClick(doctor)}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar size={18} /> Book Appointment
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#141311] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f0e0c]">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Book Appointment</h2>
                <button onClick={() => setSelectedDoctor(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-5">
                <div className="flex items-center gap-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800/50">
                  <div className="w-12 h-12 bg-primary-200 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xl">
                    {selectedDoctor.name.charAt(4)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{selectedDoctor.name}</h4>
                    <p className="text-xs text-primary-600 dark:text-primary-400">{selectedDoctor.specialization}</p>
                  </div>
                </div>

                {modalError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> {modalError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar size={16} /> Select Date
                  </label>
                  <input 
                    type="date" 
                    required 
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate} 
                    onChange={(e) => setBookingDate(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-[#0f0e0c] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Clock size={16} /> Select Time Slot
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedDoctor.availability.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setBookingTime(time)}
                        className={`py-2 px-3 border rounded-lg text-sm font-medium transition-all ${
                          bookingTime === time 
                            ? 'bg-primary-600 border-primary-600 text-white' 
                            : 'bg-white dark:bg-[#0f0e0c] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-400 dark:hover:border-primary-600'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={bookingLoading} 
                    className="w-full py-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? 'Confirming...' : `Confirm Booking • ₹${selectedDoctor.consultationFee}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50"
          >
            <CheckCircle size={20} />
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
