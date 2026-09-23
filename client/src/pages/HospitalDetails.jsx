import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, Phone, Globe, ArrowLeft, Stethoscope, Building2, IndianRupee } from 'lucide-react';

export default function HospitalDetails() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/hospitals/${id}`);
        if (res.data.success) setHospital(res.data.hospital);
      } catch (error) {
        console.error("Failed to fetch hospital", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading hospital details...</div>;
  if (!hospital) return <div className="text-center py-20 text-slate-500">Hospital not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                {hospital.name}
                {hospital.isVerified && <ShieldCheck className="text-emerald-500" size={28} title="Verified by Swasth Setu" />}
              </h1>
              <p className="text-lg text-slate-600 flex items-center gap-2 mt-2">
                <MapPin size={18} /> {hospital.location.address}, {hospital.location.city}, {hospital.location.state} - {hospital.location.pincode}
              </p>
            </div>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-800 font-semibold rounded-full border border-blue-200">
              {hospital.type} Hospital
            </span>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
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

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><IndianRupee className="text-blue-600" /> Sample Treatment Costs</h2>
              <p className="text-sm text-slate-500 mb-4">* Estimates only. Actual costs may vary based on patient condition.</p>
              <div className="space-y-3">
                {hospital.services.map((service, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-medium text-slate-800">{service.name}</span>
                    <span className="font-bold text-slate-900">₹{service.estimatedCost.min.toLocaleString()} - ₹{service.estimatedCost.max.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-4">Hospital Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600">Total Beds</span>
                  <span className="font-semibold text-slate-900">{hospital.statistics?.beds || 'N/A'}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-600">Total Doctors</span>
                  <span className="font-semibold text-slate-900">{hospital.statistics?.doctors || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border border-slate-200 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-4">Contact Info</h3>
              <div className="space-y-3 text-sm">
                {hospital.contact?.phone && (
                  <p className="flex items-center gap-2 text-slate-700"><Phone size={16} className="text-blue-600" /> {hospital.contact.phone}</p>
                )}
                {hospital.contact?.website && (
                  <p className="flex items-center gap-2 text-slate-700"><Globe size={16} className="text-blue-600" /> <a href="#" className="hover:underline text-blue-600">Visit Website</a></p>
                )}
              </div>
            </div>

            <button className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
              Report Hospital (Coming Soon)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}