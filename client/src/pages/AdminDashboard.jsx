import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Activity, CheckCircle, Clock, AlertTriangle, 
  Search, X, Save, FileText, User, Building2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Extra security check on the frontend
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchReports();
  }, [user, navigate]);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/admin/all`);
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (error) {
      console.error("Failed to fetch admin reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/reports/admin/${selectedReport._id}`, {
        status: statusUpdate,
        adminNote: adminNote.trim() || undefined
      });
      
      setSelectedReport(null);
      setAdminNote('');
      fetchReports(); // Refresh the list
    } catch (error) {
      alert("Failed to update report status.");
    } finally {
      setUpdating(false);
    }
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

  // Calculate stats
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'Submitted' || r.status === 'Pending').length;
  const inProgressReports = reports.filter(r => r.status === 'In Progress').length;
  const resolvedReports = reports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;

  const filteredReports = reports.filter(r => 
    r.reportId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-20 text-slate-500">Loading admin dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-slate-900 rounded-xl text-white shadow-lg">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Government Admin Dashboard</h1>
          <p className="text-slate-600">Monitor and manage formal hospital service reports.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-full"><FileText size={24}/></div>
          <div><p className="text-sm text-slate-500 font-medium">Total Reports</p><p className="text-2xl font-bold text-slate-900">{totalReports}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Clock size={24}/></div>
          <div><p className="text-sm text-slate-500 font-medium">Pending Action</p><p className="text-2xl font-bold text-slate-900">{pendingReports}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full"><Activity size={24}/></div>
          <div><p className="text-sm text-slate-500 font-medium">In Progress</p><p className="text-2xl font-bold text-slate-900">{inProgressReports}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle size={24}/></div>
          <div><p className="text-sm text-slate-500 font-medium">Resolved</p><p className="text-2xl font-bold text-slate-900">{resolvedReports}</p></div>
        </div>
      </div>

      {/* Reports Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Recent Reports</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID or Hospital..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Report ID</th>
                <th className="px-6 py-4">Hospital</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredReports.map((report) => (
                <tr key={report._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{report.reportId}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{report.hospital?.name || "Unknown"}</td>
                  <td className="px-6 py-4">{report.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        setSelectedReport(report);
                        setStatusUpdate(report.status);
                        setAdminNote('');
                      }} 
                      className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No reports match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANAGE REPORT MODAL */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-900 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2"><ShieldAlert size={20} /> Manage Report: {selectedReport.reportId}</h2>
                <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              
              <div className="flex flex-col md:flex-row h-[70vh] md:h-auto max-h-[80vh]">
                {/* Left Side: Report Details */}
                <div className="w-full md:w-1/2 p-6 bg-slate-50 border-r border-slate-200 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hospital</h3>
                      <p className="font-semibold text-slate-900 flex items-center gap-2"><Building2 size={16}/> {selectedReport.hospital?.name}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Citizen Details</h3>
                      <p className="font-medium text-slate-800 flex items-center gap-2"><User size={16}/> {selectedReport.submittedBy?.name}</p>
                      <p className="text-sm text-slate-600 ml-6">{selectedReport.submittedBy?.email}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Category</h3>
                      <p className="font-medium text-slate-800 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500"/> {selectedReport.category}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</h3>
                      <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed">
                        {selectedReport.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Admin Actions */}
                <form onSubmit={handleUpdateReport} className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Update Status</label>
                      <select 
                        value={statusUpdate} 
                        onChange={(e) => setStatusUpdate(e.target.value)} 
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="Submitted">Submitted (Awaiting Review)</option>
                        <option value="In Progress">In Progress (Under Investigation)</option>
                        <option value="Resolved">Resolved (Action Taken)</option>
                        <option value="Rejected">Rejected (Invalid Report)</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Add Internal Admin Note</label>
                      <textarea 
                        rows={4} 
                        value={adminNote} 
                        onChange={(e) => setAdminNote(e.target.value)} 
                        placeholder="Log internal investigation steps, communications with hospital, etc. (Not visible to citizen)" 
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm" 
                      />
                    </div>

                    {selectedReport.adminNotes && selectedReport.adminNotes.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Previous Notes</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                          {selectedReport.adminNotes.map((note, i) => (
                            <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                              <span className="font-semibold text-slate-800 block mb-1">{new Date(note.date).toLocaleString()}</span>
                              {note.note}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setSelectedReport(null)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" disabled={updating} className="px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
                      <Save size={16} /> {updating ? 'Saving...' : 'Update Report'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}