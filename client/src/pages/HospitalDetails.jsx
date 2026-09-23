import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, ShieldCheck, Phone, Globe, ArrowLeft, Stethoscope, 
  Building2, IndianRupee, Star, MessageSquare, X, User, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Helper component for rendering stars
const StarRating = ({ rating, setRating, label }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating && setRating(star)}
          disabled={!setRating}
          className={`${star <= rating ? 'text-yellow-400' : 'text-slate-200'} ${setRating ? 'hover:text-yellow-400' : ''} transition-colors focus:outline-none`}
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    experience: '',
    categories: { staffCommunication: 0, cleanliness: 0, waitingTime: 0 }
  });

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

  useEffect(() => {
    fetchHospitalData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return setReviewError("Please provide an overall rating (1-5 stars).");
    
    setSubmitting(true);
    setReviewError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, {
        hospitalId: id,
        ...reviewForm
      });
      
      setIsModalOpen(false);
      fetchHospitalData(); // Refresh reviews
    } catch (error) {
      setReviewError(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWriteReviewClick = () => {
    if (!user) {
      alert("Please sign in to leave a review.");
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading details...</div>;
  if (!hospital) return <div className="text-center py-20 text-slate-500">Hospital not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        {/* Header (Same as Phase 7) */}
        <div className="p-8 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                {hospital.name}
                {hospital.isVerified && <ShieldCheck className="text-emerald-500" size={28} title="Verified by Swasth Setu" />}
              </h1>
              <p className="text-lg text-slate-600 flex items-center gap-2 mt-2">
                <MapPin size={18} /> {hospital.location.address}, {hospital.location.city}, {hospital.location.state}
              </p>
              
              {/* Review Aggregate Badge */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold text-sm">
                  <Star fill="currentColor" size={16} /> {reviewStats.average || '0.0'}
                </div>
                <span className="text-sm text-slate-500 font-medium">({reviewStats.count} Reviews)</span>
              </div>
            </div>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-800 font-semibold rounded-full border border-blue-200">
              {hospital.type} Hospital
            </span>
          </div>
        </div>

        {/* Existing Specs & Facilities */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-200">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Stethoscope className="text-blue-600" /> Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {hospital.specializations.map((spec, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-800 text-sm font-medium rounded-lg">{spec}</span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Building2 className="text-blue-600" /> Facilities</h2>
              <div className="flex flex-wrap gap-2">
                {hospital.facilities.map((fac, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-sm font-medium border border-emerald-100 rounded-lg">{fac}</span>
                ))}
              </div>
            </section>
          </div>
          
          <div className="col-span-1 space-y-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-4">Contact Info</h3>
              <div className="space-y-3 text-sm">
                {hospital.contact?.phone && <p className="flex items-center gap-2 text-slate-700"><Phone size={16} className="text-blue-600" /> {hospital.contact.phone}</p>}
                {hospital.contact?.website && <p className="flex items-center gap-2 text-slate-700"><Globe size={16} className="text-blue-600" /> <a href="#" className="hover:underline text-blue-600">Visit Website</a></p>}
              </div>
            </div>
          </div>
        </div>
        
        {/* NEW REVIEWS SECTION */}
        <div className="p-8 bg-white">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="text-blue-600" /> Patient Feedback
            </h2>
            <button 
              onClick={handleWriteReviewClick}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm shadow-sm flex items-center gap-2"
            >
              <Star size={18} fill="currentColor" /> Write a Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <MessageSquare size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No reviews yet.</p>
              <p className="text-sm text-slate-500">Be the first to share your experience at this hospital.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="p-5 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {review.user?.profileImage ? (
                        <img src={review.user.profileImage} alt="User" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <User size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{review.user?.name || "Anonymous User"}</p>
                        <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-100">
                      <Star fill="currentColor" size={12} /> {review.rating}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic border-l-2 border-slate-200 pl-3 my-4">"{review.experience}"</p>
                  
                  {review.categories && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-medium">Staff:</span> <StarRating rating={review.categories.staffCommunication} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-medium">Cleanliness:</span> <StarRating rating={review.categories.cleanliness} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Review Submission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Share Your Experience</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleReviewSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {reviewError && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> {reviewError}
                  </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                  <StarRating 
                    label="Overall Experience" 
                    rating={reviewForm.rating} 
                    setRating={(val) => setReviewForm({...reviewForm, rating: val})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <StarRating label="Staff Communication" rating={reviewForm.categories.staffCommunication} setRating={(val) => setReviewForm({...reviewForm, categories: {...reviewForm.categories, staffCommunication: val}})} />
                  <StarRating label="Hospital Cleanliness" rating={reviewForm.categories.cleanliness} setRating={(val) => setReviewForm({...reviewForm, categories: {...reviewForm.categories, cleanliness: val}})} />
                  <StarRating label="Waiting Time" rating={reviewForm.categories.waitingTime} setRating={(val) => setReviewForm({...reviewForm, categories: {...reviewForm.categories, waitingTime: val}})} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Written Experience (Required)</label>
                  <textarea 
                    required 
                    maxLength={1000}
                    rows={4}
                    value={reviewForm.experience}
                    onChange={(e) => setReviewForm({...reviewForm, experience: e.target.value})}
                    placeholder="Tell us about the facilities, staff behavior, and overall service. Please avoid sharing sensitive medical details."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1 text-right">{reviewForm.experience.length}/1000</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-70">
                    {submitting ? 'Submitting...' : 'Submit Review'}
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