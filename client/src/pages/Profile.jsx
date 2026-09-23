import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Activity, AlertTriangle, Phone, Save, CheckCircle, 
  FileText, ShieldAlert, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  
  // Tabs State
  const [activeTab, setActiveTab] = useState('health'); // 'health' or 'reports'
  
  // Health Profile State
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    gender: 'Prefer not to say', bloodGroup: 'Unknown', height: '', weight: '',
    allergies: '', existingConditions: '', emergencyContact: { name: '', phone: '', relation: '' }
  });

  // Reports State
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Fetch Health Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile/my-profile`);
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setFormData({
            gender: p.gender || 'Prefer not to say', bloodGroup: p.bloodGroup || 'Unknown',
            height: p.height || '', weight: p.weight || '',
            allergies: p.allergies?.join(', ') || '', existingConditions: p.existingConditions?.join(', ') || '',
            emergencyContact: p.emergencyContact || { name: '', phone: '', relation: '' }
          });
        }
      } catch (error) { console.error("Failed to fetch profile:", error); } 
      finally { setLoadingProfile(false); }
    };
    fetchProfile();
  }, []);

  // Fetch My Reports
  useEffect(() => {
    if (activeTab === 'reports' && myReports.length === 0) {
      const fetchReports = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/my-reports`);
          if (res.data.success) setMyReports(res.data.reports);
        } catch (error) { console.error("Failed to fetch reports:", error); } 
        finally { setLoadingReports(false); }
      };
      fetchReports();
    }
  }, [activeTab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    const submissionData = {
      ...formData,
      allergies: formData.allergies.split(',').map(i => i.trim()).filter(i => i),
      existingConditions: formData.existingConditions.split(',').map(i => i.trim()).filter(i => i),
    };
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/profile/my-profile`, submissionData);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      alert("Failed to save changes. Please try again.");
    } finally { setSaving(false); }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-amber-100 text-amber-800';
      case 'Resolved': return 'bg-emerald-100 text-emerald-800';
      case 'Closed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loadingProfile) return <div className="p-12 text-center text-slate-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* User Header */}
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

        {/* Custom Tabs Navigation */}
        <div className="flex border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('health')}
            className={`pb-4 px-4 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'health' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Activity size={18} /> Health Profile
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`pb-4 px-4 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'reports' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldAlert size={18} /> My Govt. Reports
          </button>
        </div>

        {/* TAB 1: HEALTH PROFILE */}
        {activeTab === 'health' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {successMsg && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 border border-emerald-100"><CheckCircle size={20} /> {successMsg}</div>}
            
            {/* Medical Vitals */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">
                <Activity className="text-blue-500" /> Basic Medical Vitals
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg bg-white">{['Unknown', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Gender</label><select name="gender" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg bg-white">{['Prefer not to say', 'Male', 'Female', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label><input type="number" name="height" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label><input type="number" name="weight" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg" /></div>
              </div>
            </div>

            {/* Health History */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">
                <AlertTriangle className="text-orange-500" /> Health History
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Allergies (comma separated)</label><input type="text" name="allergies" value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Existing Conditions (comma separated)</label><input type="text" name="existingConditions" value={formData.existingConditions} onChange={(e) => setFormData({...formData, existingConditions: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg" /></div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-sm">
                <Save size={20} /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: MY REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {loadingReports ? (
              <div className="text-center py-12 text-slate-500"><Activity className="animate-spin text-blue-500 mx-auto mb-2" /> Loading reports...</div>
            ) : myReports.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
                <ShieldAlert size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="font-medium text-slate-900 mb-1">No reports filed</h3>
                <p className="text-slate-500 text-sm">You haven't submitted any formal hospital reports yet.</p>
              </div>
            ) : (
              myReports.map(report => (
                <div key={report._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{report.reportId}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(report.status)}`}>{report.status}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mt-2">{report.hospital.name}</h3>
                    <p className="text-sm text-slate-600 font-medium">{report.category}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Clock size={14} /> Submitted: {new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button className="px-4 py-2 border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors w-full md:w-auto text-center">
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        )}

      </motion.div>
    </div>
  );
}