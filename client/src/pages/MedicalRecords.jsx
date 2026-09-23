import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, UploadCloud, Plus, X, Image as ImageIcon, 
  Droplet, Activity, Eye, File, CheckCircle, AlertCircle 
} from 'lucide-react';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Blood Tests',
    reportDate: new Date().toISOString().split('T')[0]
  });

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/records/my-records`);
      if (res.data.success) setRecords(res.data.records);
    } catch (err) {
      console.error("Failed to fetch records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setFile(null);
      e.target.value = null; // reset input
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file to upload.');

    setUploading(true);
    setError('');

    // We MUST use FormData to send files via Axios
    const submitData = new FormData();
    submitData.append('file', file);
    submitData.append('title', formData.title);
    submitData.append('category', formData.category);
    submitData.append('reportDate', formData.reportDate);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/records/upload`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsModalOpen(false);
      setFile(null);
      setFormData({ ...formData, title: '' });
      fetchRecords(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload record.');
    } finally {
      setUploading(false);
    }
  };

  // 🔒 SECURE FILE VIEWING 
  // We fetch the file as a Blob using our JWT token, then create a local browser URL
  const handleViewSecureFile = async (id, mimeType) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/records/secure-view/${id}`, {
        responseType: 'blob'
      });
      // Create a temporary URL in the browser memory
      const fileUrl = URL.createObjectURL(new Blob([res.data], { type: mimeType }));
      window.open(fileUrl, '_blank');
    } catch (err) {
      alert("Failed to open document securely.");
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Blood Tests': return <Droplet className="text-red-500" />;
      case 'Imaging': return <ImageIcon className="text-purple-500" />;
      case 'Prescriptions': return <FileText className="text-blue-500" />;
      case 'Diagnostic Tests': return <Activity className="text-orange-500" />;
      default: return <File className="text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">Medical Records</h1>
          <p className="text-slate-600 dark:text-slate-400">Securely manage and view your uploaded health documents.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={20} /> Upload Record
        </button>
      </div>

      {/* Records Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading records...</div>
      ) : records.length === 0 ? (
        <div className="bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center transition-colors">
          <div className="w-16 h-16 bg-slate-50 dark:bg-[#0f0e0c] text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No records found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Upload your first medical report to keep it securely stored.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Click here to upload
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <motion.div 
              key={record._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-50 dark:bg-[#0f0e0c] rounded-lg border border-slate-100 dark:border-slate-800">
                  {getCategoryIcon(record.category)}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                  <CheckCircle size={12} /> Verified Owner
                </div>
              </div>
              
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate font-serif" title={record.title}>
                {record.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {record.category} • {new Date(record.reportDate).toLocaleDateString()}
              </p>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 dark:text-slate-500 truncate w-32" title={record.originalFileName}>
                  {record.originalFileName}
                </span>
                <button 
                  onClick={() => handleViewSecureFile(record._id, record.mimeType)}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                >
                  <Eye size={16} /> View
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#141311] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f0e0c]">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Upload Medical Record</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpload} className="p-5 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Complete Blood Count (CBC)" className="w-full p-2.5 bg-white dark:bg-[#0f0e0c] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 bg-white dark:bg-[#0f0e0c] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                      {['Blood Tests', 'Diagnostic Tests', 'Imaging', 'Prescriptions', 'Discharge Summaries', 'Medical History', 'Other'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Report Date</label>
                    <input type="date" required value={formData.reportDate} onChange={(e) => setFormData({...formData, reportDate: e.target.value})} className="w-full p-2.5 bg-white dark:bg-[#0f0e0c] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">File (PDF, JPG, PNG)</label>
                  <input type="file" required accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/20 file:text-primary-700 dark:file:text-primary-400 hover:file:bg-primary-100 dark:hover:file:bg-primary-900/40 border border-slate-300 dark:border-slate-700 rounded-lg p-1" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Maximum file size: 5MB</p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={uploading} className="px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
                    {uploading ? 'Uploading...' : 'Save Record'}
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