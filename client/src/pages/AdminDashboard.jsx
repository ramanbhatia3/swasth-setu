import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, AlertTriangle, CheckCircle2, Clock, 
  Flame, ShieldAlert, TrendingUp, Search, Filter, RefreshCw, 
  Download, Eye, UserCheck, Bot, Sparkles, X, ChevronRight, 
  BarChart3, GitCompare, Users, FileText, Bell, Check, Edit3, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data States
  const [kpis, setKpis] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [charts, setCharts] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals & Drawers
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedHospitalDetail, setSelectedHospitalDetail] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editOfficer, setEditOfficer] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Comparison State
  const [compareHospitals, setCompareHospitals] = useState([]);

  // Toast State
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const apiUrl = import.meta.env.VITE_API_URL;

      const [kpiRes, perfRes, compRes, chartRes, aiRes, notifRes, auditRes, offRes] = await Promise.all([
        axios.get(`${apiUrl}/admin/overview`, headers),
        axios.get(`${apiUrl}/admin/performance`, headers),
        axios.get(`${apiUrl}/admin/complaints?limit=50`, headers),
        axios.get(`${apiUrl}/admin/analytics`, headers),
        axios.get(`${apiUrl}/admin/ai-insights`, headers),
        axios.get(`${apiUrl}/admin/notifications`, headers),
        axios.get(`${apiUrl}/admin/audit-logs`, headers),
        axios.get(`${apiUrl}/admin/officers`, headers)
      ]);

      if (kpiRes.data.success) setKpis(kpiRes.data.kpis);
      if (perfRes.data.success) setHospitals(perfRes.data.performance);
      if (compRes.data.success) setComplaints(compRes.data.reports);
      if (chartRes.data.success) setCharts(chartRes.data.charts);
      if (aiRes.data.success) setAiInsights(aiRes.data.insights);
      if (notifRes.data.success) setNotifications(notifRes.data.notifications);
      if (auditRes.data.success) setAuditLogs(auditRes.data.logs);
      if (offRes.data.success) setOfficers(offRes.data.officers);
    } catch (error) {
      console.error('Failed to load administrative portal data:', error);
      showToast('⚠️ Failed to load administrative records. Ensure user has admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setIsUpdating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.put(
        `${apiUrl}/admin/complaints/${selectedComplaint._id}`,
        {
          status: editStatus || selectedComplaint.status,
          adminRemarks: editRemarks,
          assignedOfficer: editOfficer ? { name: editOfficer } : undefined
        },
        getAuthHeaders()
      );

      if (res.data.success) {
        showToast('Official action logged and grievance updated.');
        setSelectedComplaint(null);
        fetchAllAdminData();
      }
    } catch (error) {
      showToast('Error updating complaint.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenHospitalDetail = async (hospitalId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${apiUrl}/admin/hospital/${hospitalId}`, getAuthHeaders());
      if (res.data.success) {
        setSelectedHospitalDetail(res.data);
      }
    } catch (err) {
      showToast('Could not fetch detailed hospital profile.');
    }
  };

  const handleExportCSV = () => {
    window.open(`${import.meta.env.VITE_API_URL}/admin/export/complaints`, '_blank');
  };

  const filteredComplaints = complaints.filter(c => {
    const matchSearch = filterSearch === '' ||
      c.hospitalName?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      c.description?.toLowerCase().includes(filterSearch.toLowerCase());
    const matchCat = filterCategory === '' || c.category === filterCategory;
    const matchSev = filterSeverity === '' || c.severity === filterSeverity;
    const matchStat = filterStatus === '' || c.status === filterStatus;
    return matchSearch && matchCat && matchSev && matchStat;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Good': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Average': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Needs Attention': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Critical': return 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse';
      case 'Resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-rose-600 text-white font-bold';
      case 'High': return 'bg-amber-500 text-white font-semibold';
      case 'Medium': return 'bg-blue-600 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium border border-teal-400"
          >
            <CheckCircle2 size={18} /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP GOVERNMENT ADMINISTRATIVE HEADER */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl text-slate-950 font-black shadow-lg">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight font-serif">Swasth Setu Central Authority</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
                GOVT OF INDIA
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Hospital Performance Surveillance & Grievance Redressal Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={fetchAllAdminData}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh Registry Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={handleExportCSV}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white text-sm font-semibold transition-colors"
          >
            <Download size={16} /> Export All CSV
          </button>

          <div className="border-l border-slate-800 pl-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <div className="hidden md:block text-left leading-tight">
              <div className="text-sm font-bold text-white">{user?.name || 'Administrator'}</div>
              <div className="text-[11px] text-teal-400 font-medium">Chief Monitoring Officer</div>
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD BODY WITH SIDEBAR */}
      <div className="flex-grow flex">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 shrink-0 hidden md:block">
          <div className="space-y-1">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'performance', label: 'Hospital Performance', icon: Building2 },
              { id: 'complaints', label: 'Reports & Complaints', icon: AlertTriangle, count: complaints.length },
              { id: 'analytics', label: 'Statistical Analytics', icon: BarChart3 },
              { id: 'comparison', label: 'Hospital Comparison', icon: GitCompare },
              { id: 'officers', label: 'Officers & Escalations', icon: Users },
              { id: 'audit', label: 'Official Audit Trail', icon: FileText },
              { id: 'notifications', label: 'System Alerts', icon: Bell, count: notifications.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-950'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-teal-800 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500">
            <p className="font-semibold text-slate-400 uppercase tracking-wider mb-2">Security Standard</p>
            <p className="leading-relaxed">All administrative modifications are logged into the immutable audit registry with ISO compliant timestamps.</p>
          </div>
        </aside>

        {/* MAIN DISPLAY AREA */}
        <main className="flex-grow p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">

          {/* 1. DASHBOARD OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* TOP 8 ANALYTICAL KPI CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Hospitals', value: kpis?.totalHospitals || 0, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/60' },
                  { label: 'Total Grievances', value: kpis?.totalReports || 0, icon: FileText, color: 'text-slate-300', bg: 'bg-slate-950/50 border-slate-800' },
                  { label: 'Pending Filings', value: kpis?.pendingReports || 0, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/60' },
                  { label: 'Under Investigation', value: kpis?.underReview || 0, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/60' },
                  { label: 'Resolved Matters', value: kpis?.resolvedReports || 0, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/60' },
                  { label: 'Critical Backlog', value: kpis?.criticalIssues || 0, icon: Flame, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/60' },
                  { label: 'Requires Attention', value: kpis?.hospitalsRequiringAttention || 0, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-950/30 border-amber-900/60' },
                  { label: 'High Performing', value: kpis?.highPerformingHospitals || 0, icon: TrendingUp, color: 'text-teal-400', bg: 'bg-teal-950/40 border-teal-800/60' }
                ].map((kpi, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border ${kpi.bg} shadow-md backdrop-blur-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                      <kpi.icon size={20} className={kpi.color} />
                    </div>
                    <div className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              {/* AI ADMINISTRATIVE ADVISORY PANEL */}
              <div className="bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-950 border border-teal-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-500 text-slate-950 rounded-xl">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        Swasth Setu AI Strategic Intelligence
                      </h2>
                      <p className="text-xs text-teal-300">Automated diagnostic synthesis derived from current incident distributions</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-900/80 text-teal-300 border border-teal-700">
                    Live Telemetry
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {aiInsights.map((insight, idx) => (
                    <div key={idx} className="bg-slate-950/70 border border-teal-900/50 p-4 rounded-xl text-sm leading-relaxed text-slate-300">
                      <span className="text-teal-400 font-bold block mb-1">Observation #{idx + 1}</span>
                      {insight}
                    </div>
                  ))}
                </div>
              </div>

              {/* URGENT ESCALATIONS & REPEATED COMPLAINTS TICKER */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Critical Issues Requiring Immediate Action */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-rose-400 flex items-center gap-2">
                      <Flame size={18} /> High Priority / Escalated Filings
                    </h3>
                    <button onClick={() => setActiveTab('complaints')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold">
                      View All <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {complaints.filter(c => c.severity === 'Critical' || c.isEscalated).slice(0, 4).map(comp => (
                      <div key={comp._id} className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-sm">{comp.hospitalName}</span>
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-rose-600 text-white">Critical</span>
                            {comp.isEscalated && <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-600 text-white">SLA Breached</span>}
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-1">{comp.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedComplaint(comp);
                            setEditStatus(comp.status);
                            setEditRemarks(comp.adminRemarks || '');
                            setEditOfficer(comp.assignedOfficer?.name || '');
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-white shrink-0"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hospitals Requiring Direct Administrative Attention */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                      <AlertTriangle size={18} /> Attention Required Facilities
                    </h3>
                    <button onClick={() => setActiveTab('performance')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold">
                      Performance Matrix <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {hospitals.filter(h => h.status === 'Critical' || h.status === 'Needs Attention').slice(0, 4).map(h => (
                      <div key={h.hospitalId} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-sm">{h.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{h.city}, {h.state}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-medium">{h.reasons?.[0]}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${getStatusBadge(h.status)}`}>
                            {h.status}
                          </span>
                          <button
                            onClick={() => handleOpenHospitalDetail(h.hospitalId)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                          >
                            <ArrowUpRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. HOSPITAL PERFORMANCE MONITORING TAB */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight font-serif">Hospital Performance Directory</h2>
                  <p className="text-sm text-slate-400">Standardized grievance metrics, resolution percentages, and compliance status</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">Good: Res Rate ≥ 75%</span>
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 font-semibold">Needs Attention: Backlog ≥ 4</span>
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 font-semibold">Critical: Unresolved Criticals</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/90 text-xs font-bold uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Hospital Facility</th>
                        <th className="px-4 py-4">Location</th>
                        <th className="px-4 py-4 text-center">Reports</th>
                        <th className="px-4 py-4 text-center">Unresolved</th>
                        <th className="px-4 py-4 text-center">Critical</th>
                        <th className="px-4 py-4 text-center">Resolution Rate</th>
                        <th className="px-4 py-4 text-center">Avg Time</th>
                        <th className="px-6 py-4 text-center">Compliance Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {hospitals.map(h => (
                        <tr key={h.hospitalId} className="hover:bg-slate-900/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-white max-w-xs truncate">{h.name}</td>
                          <td className="px-4 py-4 text-slate-400">{h.city}, {h.state}</td>
                          <td className="px-4 py-4 text-center font-bold text-slate-200">{h.totalReports}</td>
                          <td className="px-4 py-4 text-center font-bold text-amber-400">{h.pendingIssues}</td>
                          <td className="px-4 py-4 text-center font-bold text-rose-400">{h.criticalIssues}</td>
                          <td className="px-4 py-4 text-center">
                            <div className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                              {h.resolutionRate}%
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-slate-300">{h.averageResolutionTimeDays}d</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(h.status)}`}>
                              {h.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleOpenHospitalDetail(h.hospitalId)}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                            >
                              Inspect Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. REPORTS & COMPLAINTS MANAGEMENT TAB */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight font-serif">Citizen Healthcare Grievance Queue</h2>
                  <p className="text-sm text-slate-400">Formal complaints submitted by citizens undergoing investigation</p>
                </div>
                <button
                  onClick={() => {
                    setFilterSearch('');
                    setFilterCategory('');
                    setFilterSeverity('');
                    setFilterStatus('');
                  }}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw size={12} /> Reset Filters
                </button>
              </div>

              {/* ADVANCED FILTERING TOOLBAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Search hospital or issue text..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:ring-2 focus:ring-teal-600 outline-none"
                >
                  <option value="">All Categories</option>
                  {['Cleanliness', 'Staff Behavior', 'Infrastructure', 'Medicine Availability', 'Equipment', 'Waiting Time', 'Emergency Services', 'Treatment/Service Issues'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:ring-2 focus:ring-teal-600 outline-none"
                >
                  <option value="">All Severities</option>
                  {['Low', 'Medium', 'High', 'Critical'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:ring-2 focus:ring-teal-600 outline-none"
                >
                  <option value="">All Statuses</option>
                  {['Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* COMPLAINTS DATA TABLE */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/90 text-xs font-bold uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Hospital Facility</th>
                        <th className="px-4 py-4">Category</th>
                        <th className="px-4 py-4">Severity</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Officer</th>
                        <th className="px-4 py-4">Date Filed</th>
                        <th className="px-6 py-4 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredComplaints.map(comp => (
                        <tr key={comp._id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{comp.hospitalName}</div>
                            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{comp.description}</div>
                            {comp.isRepeated && (
                              <span className="inline-block mt-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                                Repeated Category
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 font-medium text-slate-300">{comp.category}</td>
                          <td className="px-4 py-4">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full ${getSeverityBadge(comp.severity)}`}>
                              {comp.severity}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${getStatusBadge(comp.status)}`}>
                              {comp.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-300 text-xs font-medium">
                            {comp.assignedOfficer?.name || 'Unassigned'}
                          </td>
                          <td className="px-4 py-4 text-slate-400 text-xs">
                            {new Date(comp.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedComplaint(comp);
                                setEditStatus(comp.status);
                                setEditRemarks(comp.adminRemarks || '');
                                setEditOfficer(comp.assignedOfficer?.name || '');
                              }}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
                            >
                              <Edit3 size={13} /> Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. STATISTICAL ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight font-serif">Grievance Analytics & Distribution</h2>
                <p className="text-sm text-slate-400">Quantitative insights derived from actual database records</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Category Breakdown (Clean SVG Distribution Bar) */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-bold text-base text-white mb-6">Incidents by Issue Category</h3>
                  <div className="space-y-4">
                    {charts?.categoryDistribution?.map((cat, idx) => {
                      const total = charts.categoryDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
                      const pct = Math.round((cat.count / total) * 100);
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                            <span>{cat._id}</span>
                            <span>{cat.count} cases ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
                            <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Severity Breakdown */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-bold text-base text-white mb-6">Severity Tier Distribution</h3>
                  <div className="grid grid-cols-2 gap-4 my-6">
                    {charts?.severityDistribution?.map((sev, idx) => (
                      <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded uppercase font-black ${getSeverityBadge(sev._id)}`}>{sev._id}</span>
                        <div className="text-2xl font-black text-white mt-2">{sev.count}</div>
                        <p className="text-[11px] text-slate-400">Total Filings</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-teal-950/30 border border-teal-900/60 rounded-xl text-xs text-teal-300">
                    <strong>Critical Incident Protocol:</strong> Any matter flagged with Critical Severity requires an assigned medical officer inspection report logged within 48 hours.
                  </div>
                </div>

                {/* Top Facilities with Open Cases */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
                  <h3 className="font-bold text-base text-white mb-4">Grievance Backlog by Healthcare Facility</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {charts?.topComplainedHospitals?.map((h, i) => (
                      <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                        <p className="text-sm font-bold text-white truncate">{h._id}</p>
                        <div className="flex items-center justify-between mt-3 text-xs">
                          <span className="text-slate-400">Total: <strong className="text-white">{h.count}</strong></span>
                          <span className="text-rose-400">Critical: <strong>{h.critical}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 5. HOSPITAL COMPARISON TAB */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight font-serif">Administrative Hospital Comparison</h2>
                <p className="text-sm text-slate-400">Evaluate up to 3 institutions side-by-side to review compliance disparities</p>
              </div>

              {/* Selector */}
              <div className="flex flex-wrap gap-2 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                {hospitals.slice(0, 12).map(h => {
                  const isSelected = compareHospitals.some(c => c.hospitalId === h.hospitalId);
                  return (
                    <button
                      key={h.hospitalId}
                      onClick={() => {
                        if (isSelected) {
                          setCompareHospitals(compareHospitals.filter(c => c.hospitalId !== h.hospitalId));
                        } else {
                          if (compareHospitals.length >= 3) return showToast('You can compare max 3 hospitals simultaneously.');
                          setCompareHospitals([...compareHospitals, h]);
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {h.name} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>

              {/* Comparison Matrix */}
              {compareHospitals.length >= 2 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {compareHospitals.map(h => (
                    <div key={h.hospitalId} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                      <h3 className="text-lg font-black text-white">{h.name}</h3>
                      <p className="text-xs text-slate-400">{h.city}, {h.state}</p>

                      <div className="space-y-3 pt-3 border-t border-slate-800 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Resolution Rate</span>
                          <span className="font-bold text-emerald-400">{h.resolutionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Filings</span>
                          <span className="font-bold text-white">{h.totalReports}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Active Unresolved</span>
                          <span className="font-bold text-amber-400">{h.pendingIssues}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Critical Issues</span>
                          <span className="font-bold text-rose-400">{h.criticalIssues}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Avg Resolution Turnaround</span>
                          <span className="font-bold text-slate-200">{h.averageResolutionTimeDays} Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Calculated Status</span>
                          <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getStatusBadge(h.status)}`}>{h.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-400">
                  Select at least 2 hospitals from the list above to view comparative benchmarks.
                </div>
              )}
            </div>
          )}

          {/* 6. OFFICERS & ESCALATIONS TAB */}
          {activeTab === 'officers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight font-serif">Administrative Roster & Case Workload</h2>
                <p className="text-sm text-slate-400">Medical monitoring officers and active unresolved caseload distributions</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {officers.map((off, i) => (
                  <div key={i} className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center font-bold">
                      <Users size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{off.name}</h4>
                      <p className="text-xs text-teal-400 font-medium">{off.role}</p>
                      <p className="text-xs text-slate-400 mt-1">{off.district}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-sm">
                      <span className="text-slate-400">Active Caseload</span>
                      <span className="px-3 py-1 rounded-full bg-slate-800 font-black text-white">{off.activeCases}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. OFFICIAL AUDIT TRAIL TAB */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight font-serif">Immutable Administrative Audit Trail</h2>
                <p className="text-sm text-slate-400">Cryptographically recorded log of status alterations and staff assignments</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-900/90 border-b border-slate-800 text-xs font-bold text-slate-400 flex justify-between">
                  <span>RECENT ACTIONS ({auditLogs.length})</span>
                  <span>SECURITY CLASSIFICATION: OFFICIAL</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {auditLogs.map(log => (
                    <div key={log._id} className="p-4 text-sm flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">{log.adminName}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-teal-400 font-mono">{log.action}</span>
                          <span className="text-xs text-slate-400">• {log.hospitalName}</span>
                        </div>
                        <p className="text-slate-300 text-xs">{log.details}</p>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 8. SYSTEM NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight font-serif">System Alerts & SLA Monitors</h2>
                <p className="text-sm text-slate-400">Automated triggers generated for critical unaddressed incidents</p>
              </div>

              <div className="space-y-4">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl text-white ${notif.severity === 'Critical' ? 'bg-rose-600' : 'bg-amber-600'}`}>
                      <Bell size={20} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-white text-base">{notif.title}</h4>
                        <span className="text-xs text-slate-500 font-mono">{new Date(notif.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-300">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* COMPLAINT INSPECTOR DRAWER / MODAL */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">Grievance Resolution Inspector</h3>
                  <p className="text-xs text-slate-400 font-mono">Case #{selectedComplaint._id.slice(-8)}</p>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateComplaint} className="p-6 space-y-5 overflow-y-auto flex-grow text-sm">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Hospital Facility</label>
                  <p className="text-white font-bold text-base">{selectedComplaint.hospitalName}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Citizen Statement</label>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                    {selectedComplaint.description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Action Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-teal-600 outline-none"
                    >
                      {['Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Assigned Officer</label>
                    <select
                      value={editOfficer}
                      onChange={(e) => setEditOfficer(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-teal-600 outline-none"
                    >
                      <option value="Unassigned">Unassigned</option>
                      {officers.map(o => (
                        <option key={o.name} value={o.name}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Administrative Remarks & Action Plan</label>
                  <textarea
                    rows={3}
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    placeholder="Enter formal findings, on-site directions, or resolution documentation..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-teal-600 outline-none resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-black shadow-lg"
                  >
                    {isUpdating ? 'Recording Action...' : 'Save & Log Audit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HOSPITAL COMPREHENSIVE PROFILE MODAL */}
      <AnimatePresence>
        {selectedHospitalDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-white">{selectedHospitalDetail.hospital.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedHospitalDetail.hospital.location?.address}, {selectedHospitalDetail.hospital.location?.city}, {selectedHospitalDetail.hospital.location?.state}
                  </p>
                </div>
                <button onClick={() => setSelectedHospitalDetail(null)} className="text-slate-400 hover:text-white">
                  <X size={22} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-grow text-sm">
                
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">Total Reports</span>
                    <p className="text-2xl font-black text-white mt-1">{selectedHospitalDetail.metrics.totalReports}</p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">Active Backlog</span>
                    <p className="text-2xl font-black text-amber-400 mt-1">{selectedHospitalDetail.metrics.pending}</p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">Resolution Rate</span>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{selectedHospitalDetail.metrics.resolutionRate}%</p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">Critical Priority</span>
                    <p className="text-2xl font-black text-rose-400 mt-1">{selectedHospitalDetail.metrics.critical}</p>
                  </div>
                </div>

                {/* Repeated Issue Clusters Warning */}
                {selectedHospitalDetail.metrics.repeatedCategories?.length > 0 && (
                  <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-xl">
                    <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} /> Systemic Problem Detection
                    </h4>
                    {selectedHospitalDetail.metrics.repeatedCategories.map((rep, idx) => (
                      <p key={idx} className="text-xs text-amber-200">{rep.warning}</p>
                    ))}
                  </div>
                )}

                {/* Recent Complaints Log for this Hospital */}
                <div>
                  <h4 className="font-bold text-white mb-3">Recent Grievance History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedHospitalDetail.metrics.recentReports?.map(r => (
                      <div key={r._id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{r.category}</span>
                          <p className="text-slate-400 line-clamp-1">{r.description}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded border font-bold ${getStatusBadge(r.status)}`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}