import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, ShieldCheck, Phone, Globe, ArrowLeft, Stethoscope, 
  Building2, IndianRupee, Star, MessageSquare, X, User, AlertCircle,
  AlertTriangle, UploadCloud, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Helper component for rendering stars
const StarRating = ({ rating, setRating, label }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating && setRating(star)}
          disabled={!setRating}
          className={`${star <= rating ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'} ${setRating ? 'hover:text-yellow-400' : ''} transition-colors focus:outline-none`}
        >
          <Star fill={star <= rating ? 'currentColor' : 'none'} size={setRating ? 28 : 16} />
        </button>
      ))}
    </div>
  </div>
);

export default function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Review States
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ count: 0, average: 0 });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewForm, setReviewForm] = useState({
    rating: 0, experience: '', categories: { staffCommunication: 0, cleanliness: 0, waitingTime: 0 }
  });

  // Report States (NEW)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportForm, setReportForm] = useState({ category: 'Poor Service', description: '' });
  const [reportFile, setReportFile] = useState(null);

  const fetchHospitalData = async () => {
    try {
      const [hospRes, revRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/hospitals/${id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/reviews/${id}`)
      ]);
      
      if (hospRes.data.success) setHospital(hospRes.data.hospital);
      if (revRes.data.success) {
        setReviews(revRes.data.reviews);
        setReviewStats({ count: revRes.data.count, average: revRes.data.averageRating });
      }
    } catch (error) {
      console.error("Failed to fetch hospital data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitalData(); }, [id]);

  // --- REVIEW LOGIC ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return setReviewError("Please provide an overall rating (1-5 stars).");
    if (reviewForm.categories.staffCommunication === 0 || reviewForm.categories.cleanliness === 0 || reviewForm.categories.waitingTime === 0) {
      return setReviewError("Please provide a rating for Staff Behavior, Cleanliness, and Waiting Time.");
    }
    setSubmittingReview(true);
    setReviewError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, { hospitalId: id, ...reviewForm });
      setIsReviewModalOpen(false);
      fetchHospitalData();
    } catch (error) {
      setReviewError(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // --- REPORT LOGIC (NEW) ---
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.description.trim()) return setReportError("Please describe the issue.");
    
    setSubmittingReport(true);
    setReportError('');
    setReportSuccess('');

    const formData = new FormData();
    formData.append('hospitalId', id);
    formData.append('category', reportForm.category);
    formData.append('description', reportForm.description);
    formData.append('incidentDate', new Date().toISOString());
    if (reportFile) formData.append('evidence', reportFile);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/reports`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setReportSuccess(`Report submitted successfully! Ref ID: ${res.data.report.reportId}`);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess('');
        setReportForm({ category: 'Poor Service', description: '' });
        setReportFile(null);
      }, 3000);
    } catch (error) {
      setReportError(error.response?.data?.message || "Failed to submit report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  // Authentication Checks
  const requireAuth = (callback) => {
    if (!user) {
      alert("Please sign in to perform this action.");
      navigate('/login');
    } else {
      callback();
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading details...</div>;
  if (!hospital) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Hospital not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#141311] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8 transition-colors">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f0e0c]/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 font-serif">
                {hospital.name}
                {hospital.isVerified && <ShieldCheck className="text-primary-500" size={28} title="Verified by Swasth Setu" />}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-2">
                <MapPin size={18} /> {hospital.location.address}, {hospital.location.city}, {hospital.location.state}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-3 py-1 rounded-full font-bold text-sm border border-yellow-200 dark:border-yellow-900/50">
                  <Star fill="currentColor" size={16} /> {reviewStats.average || '0.0'}
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">({reviewStats.count} Reviews)</span>
              </div>
            </div>
            <span className="px-4 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 font-semibold rounded-full border border-primary-200 dark:border-primary-800">
              {hospital.type} Hospital
            </span>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-200 dark:border-slate-800">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Stethoscope className="text-primary-600 dark:text-primary-400" /> Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {hospital.specializations.map((spec, i) => <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700">{spec}</span>)}
              </div>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Building2 className="text-primary-600 dark:text-primary-400" /> Facilities</h2>
              <div className="flex flex-wrap gap-2">
                {hospital.facilities.map((fac, i) => <span key={i} className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium border border-primary-100 dark:border-primary-800/50 rounded-lg">{fac}</span>)}
              </div>
            </section>
          </div>
          
          <div className="col-span-1 space-y-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Contact Info</h3>
              <div className="space-y-3 text-sm">
                {hospital.contact?.phone && <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Phone size={16} className="text-primary-600 dark:text-primary-400" /> {hospital.contact.phone}</p>}
                {hospital.contact?.website && <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Globe size={16} className="text-primary-600 dark:text-primary-400" /> <a href="#" className="hover:underline text-primary-600 dark:text-primary-400">Visit Website</a></p>}
              </div>
            </div>

            {/* NEW: Report Hospital Button */}
            <button 
              onClick={() => requireAuth(() => setIsReportModalOpen(true))}
              className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex justify-center items-center gap-2 shadow-sm"
            >
              <AlertTriangle size={18} /> Report Hospital
            </button>
          </div>
        </div>
        
        {/* REVIEWS SECTION */}
        <div className="p-8 bg-white dark:bg-[#141311]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif">
              <MessageSquare className="text-primary-600 dark:text-primary-400" /> Patient Feedback
            </h2>
            <button onClick={() => requireAuth(() => setIsReviewModalOpen(true))} className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm shadow-sm flex items-center gap-2">
              <Star size={18} fill="currentColor" /> Write a Review
            </button>
          </div>
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-[#0f0e0c]/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <MessageSquare size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No reviews yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-[#141311]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {review.user?.profileImage ? <img src={review.user.profileImage} alt="User" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" /> : <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"><User size={20} /></div>}
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{review.user?.name || "Anonymous User"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-100 dark:border-yellow-900/50"><Star fill="currentColor" size={12} /> {review.rating}</div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic border-l-2 border-slate-200 dark:border-slate-700 pl-3 my-4">"{review.experience}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ---------------- MODALS ---------------- */}
      
      {/* Review Modal (Omitted inner content for brevity, same as before) */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#141311] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f0e0c]">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Share Your Experience</h2>
                <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={24} /></button>
              </div>
              <form onSubmit={handleReviewSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {reviewError && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0" /> {reviewError}</div>}
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-100 dark:border-primary-900/50 flex flex-col items-center">
                  <StarRating label="Overall Experience" rating={reviewForm.rating} setRating={(val) => setReviewForm({...reviewForm, rating: val})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-[#0f0e0c] rounded-xl border border-slate-200 dark:border-slate-800">
                    <StarRating label="Staff Behavior" rating={reviewForm.categories.staffCommunication} setRating={(val) => setReviewForm({...reviewForm, categories: {...reviewForm.categories, staffCommunication: val}})} />
                  </div>
                  <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-[#0f0e0c] rounded-xl border border-slate-200 dark:border-slate-800">
                    <StarRating label="Cleanliness" rating={reviewForm.categories.cleanliness} setRating={(val) => setReviewForm({...reviewForm, categories: {...reviewForm.categories, cleanliness: val}})} />
                  </div>
                  <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-[#0f0e0c] rounded-xl border border-slate-200 dark:border-slate-800">
                    <StarRating label="Waiting Time" rating={reviewForm.categories.waitingTime} setRating={(val) => setReviewForm({...reviewForm, categories: {...reviewForm.categories, waitingTime: val}})} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Written Experience (Required)</label>
                  <textarea required maxLength={1000} rows={4} value={reviewForm.experience} onChange={(e) => setReviewForm({...reviewForm, experience: e.target.value})} className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141311] rounded-lg focus:ring-2 focus:ring-primary-500 resize-none text-sm text-slate-900 dark:text-white" />
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={submittingReview} className="px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm disabled:opacity-70">{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW: GOVERNMENT REPORT MODAL */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#141311] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border-t-4 border-red-600 dark:border-red-500">
              <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f0e0c]">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><AlertTriangle className="text-red-600 dark:text-red-500" /> Formal Hospital Report</h2>
                <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleReportSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {reportError && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0" /> {reportError}</div>}
                {reportSuccess && <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm rounded-lg flex items-start gap-2"><CheckCircle size={16} className="mt-0.5 shrink-0" /> {reportSuccess}</div>}
                
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 text-xs rounded-lg border border-amber-200 dark:border-amber-900/50">
                  This form is for reporting severe operational issues to government administrators (e.g., unavailable emergency services, incorrect information). Please use regular Feedback for general service experiences.
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Report Category</label>
                  <select value={reportForm.category} onChange={(e) => setReportForm({...reportForm, category: e.target.value})} className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141311] rounded-lg focus:ring-2 focus:ring-red-500 sm:text-sm text-slate-900 dark:text-white">
                    {['Poor Service', 'Excessive Waiting Time', 'Facility Unavailable', 'Incorrect Information', 'Cleanliness Issue', 'Staff Behaviour', 'Billing/Cost Concern', 'Emergency Service Issue', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea required rows={4} value={reportForm.description} onChange={(e) => setReportForm({...reportForm, description: e.target.value})} placeholder="Describe the issue in detail..." className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141311] rounded-lg focus:ring-2 focus:ring-red-500 resize-none sm:text-sm text-slate-900 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><UploadCloud size={16} /> Optional Evidence (Image/PDF)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setReportFile(e.target.files[0])} className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg p-1" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Max size: 5MB</p>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={submittingReport || reportSuccess} className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-70">
                    {submittingReport ? 'Submitting...' : 'Submit Official Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}