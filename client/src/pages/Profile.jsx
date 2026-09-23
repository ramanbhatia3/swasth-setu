import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Activity, Droplet, AlertTriangle, Phone, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    gender: 'Prefer not to say',
    bloodGroup: 'Unknown',
    height: '',
    weight: '',
    allergies: '',
    existingConditions: '',
    emergencyContact: { name: '', phone: '', relation: '' }
  });

  // Fetch Profile on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile/my-profile`);
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setFormData({
            gender: p.gender || 'Prefer not to say',
            bloodGroup: p.bloodGroup || 'Unknown',
            height: p.height || '',
            weight: p.weight || '',
            // Convert arrays to comma-separated strings for easy editing
            allergies: p.allergies?.join(', ') || '',
            existingConditions: p.existingConditions?.join(', ') || '',
            emergencyContact: p.emergencyContact || { name: '', phone: '', relation: '' }
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency_')) {
      const field = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    // Convert comma-separated strings back to arrays
    const submissionData = {
      ...formData,
      allergies: formData.allergies.split(',').map(i => i.trim()).filter(i => i),
      existingConditions: formData.existingConditions.split(',').map(i => i.trim()).filter(i => i),
    };

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/profile/my-profile`, submissionData);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000); // Hide message after 3 seconds
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Header Header */}
        <div className="flex items-center gap-4 mb-8">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-16 h-16 rounded-full shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
              {user?.name?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
            <p className="text-slate-500">{user?.email}</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 border border-emerald-100">
            <CheckCircle size={20} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Medical Vitals Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">
              <Activity className="text-blue-500" /> Basic Medical Vitals
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                  {['Unknown', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                  {['Prefer not to say', 'Male', 'Female', 'Other'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 175" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 70" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Health History Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">
              <AlertTriangle className="text-orange-500" /> Health History
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Allergies (comma separated)</label>
                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Peanuts, Penicillin, Dust" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Existing Conditions (comma separated)</label>
                <input type="text" name="existingConditions" value={formData.existingConditions} onChange={handleChange} placeholder="e.g. Asthma, Type 2 Diabetes" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          </div>

          {/* Emergency Contact Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">
              <Phone className="text-emerald-500" /> Emergency Contact
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" name="emergency_name" value={formData.emergencyContact.name} onChange={handleChange} placeholder="Contact Name" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                <input type="text" name="emergency_relation" value={formData.emergencyContact.relation} onChange={handleChange} placeholder="e.g. Brother, Spouse" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="tel" name="emergency_phone" value={formData.emergencyContact.phone} onChange={handleChange} placeholder="+91 9876543210" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-sm"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}