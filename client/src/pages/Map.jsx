import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, CircleMarker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, List, Search, Filter, AlertTriangle, CheckCircle2, Info, Clock, Activity, ExternalLink, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- Custom Leaflet Marker Icons based on Performance ---
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const icons = {
  'Good': createCustomIcon('#10b981'), // Emerald
  'Needs Monitoring': createCustomIcon('#f59e0b'), // Amber
  'Requires Attention': createCustomIcon('#ef4444'), // Rose
  'Insufficient Data': createCustomIcon('#94a3b8') // Slate
};

const genericIcon = createCustomIcon('#2563eb'); // Professional Blue

// --- Custom Cluster Styling ---
const createClusterCustomIcon = function (cluster) {
  const count = cluster.getChildCount();
  let size = 40;
  let color = 'rgba(13, 92, 58, 0.9)'; // Primary 800 for medium clusters

  if (count < 10) {
    size = 35;
    color = 'rgba(16, 185, 129, 0.9)'; // Primary 500 for small clusters
  } else if (count >= 40) {
    size = 50;
    color = 'rgba(37, 99, 235, 0.9)'; // Blue for large clusters
  }

  return L.divIcon({
    html: `<div style="
      width: ${size}px; 
      height: ${size}px; 
      background-color: ${color}; 
      color: white; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: 900; 
      font-size: 14px;
      border: 3px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      transition: all 0.2s ease-in-out;
    ">${count}</div>`,
    className: 'custom-cluster-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};


// Component to dynamically pan map when searching
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

export default function HospitalMap() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  
  // View & Filter States
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [isHeatmap, setIsHeatmap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Map Positioning
  const [mapCenter, setMapCenter] = useState([22.9734, 78.6569]); // Center of India
  const [mapZoom, setMapZoom] = useState(5);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/hospitals/map-data`);
        if (res.data.success) {
          setHospitals(res.data.hospitals);
          setLastUpdated(res.data.lastUpdated);
        }
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || h.performanceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Region Summary based on filtered view
  const summary = {
    total: filteredHospitals.length,
    good: filteredHospitals.filter(h => h.performanceStatus === 'Good').length,
    attention: filteredHospitals.filter(h => h.performanceStatus === 'Requires Attention').length,
    reports: filteredHospitals.reduce((acc, h) => acc + h.stats.totalReports, 0)
  };

  const handleSearchSelect = (hospital) => {
    setMapCenter([hospital.coordinates.lat, hospital.coordinates.lng]);
    setMapZoom(14);
    setViewMode('map');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0f0e0c] transition-colors">
        <Activity className="animate-spin text-primary-600 mb-4" size={40} />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Initializing Geographical Data...</h2>
        <p className="text-slate-500 dark:text-slate-400">Mapping hospital coordinates and aggregating performance reports.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0f0e0c] overflow-hidden transition-colors">
      
      {/* TOP TOOLBAR */}
      <div className="bg-white dark:bg-[#141311] border-b border-slate-200 dark:border-slate-800 p-4 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 z-10 shadow-sm transition-colors">
        <div className="w-full md:w-auto text-center md:text-left">
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2 font-serif">
            <MapIcon className="text-primary-600 dark:text-primary-400" /> {isAdmin ? 'National Healthcare Infrastructure' : 'Find Hospitals'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-1 mt-1">
            <Clock size={12} /> Data refreshed: {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search hospital or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-primary-500 rounded-lg text-sm outline-none transition-colors text-slate-900 dark:text-slate-200"
            />
          </div>
          
          {isAdmin && (
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-primary-500 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="Good">Good</option>
              <option value="Needs Monitoring">Needs Monitoring</option>
              <option value="Requires Attention">Requires Attention</option>
            </select>
          )}

          <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1 shrink-0 w-full sm:w-auto justify-center">
            <button onClick={() => setViewMode('map')} className={`px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1 transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-slate-900 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <MapIcon size={16} /> Map
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1 transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <List size={16} /> List
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow relative flex">
        
        {viewMode === 'map' ? (
          <div className="w-full h-full relative z-0">
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
            >
              <MapController center={mapCenter} zoom={mapZoom} />
              <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

              {!isHeatmap || !isAdmin ? (
                <MarkerClusterGroup 
  chunkedLoading 
  maxClusterRadius={50} 
  iconCreateFunction={createClusterCustomIcon}
>
                  {filteredHospitals.map(hospital => (
                    <Marker 
                      key={hospital.id} 
                      position={[hospital.coordinates.lat, hospital.coordinates.lng]}
                      icon={isAdmin ? icons[hospital.performanceStatus] : genericIcon}
                    >
                      {!isAdmin && (
                        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                          <div className="font-bold text-slate-800 text-sm">{hospital.name}</div>
                          <div className="text-xs text-slate-500">{hospital.city}, {hospital.state}</div>
                        </Tooltip>
                      )}
                      <Popup className="hospital-popup">
                        <div className="min-w-[200px]">
                          <h3 className="font-bold text-slate-900 text-sm mb-1 font-serif">{hospital.name}</h3>
                          <p className="text-xs text-slate-500 mb-3">{hospital.city}, {hospital.state}</p>
                          
                          {isAdmin ? (
                            <div className="grid grid-cols-2 gap-2 mb-4 border-t border-slate-100 pt-3">
                              {hospital.performanceStatus !== 'Insufficient Data' && (
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                                  <p className={`text-xs font-bold ${
                                    hospital.performanceStatus === 'Good' ? 'text-emerald-600' :
                                    hospital.performanceStatus === 'Requires Attention' ? 'text-rose-600' :
                                    'text-amber-600'
                                  }`}>{hospital.performanceStatus}</p>
                                </div>
                              )}
                              {hospital.stats.resolutionRate !== null && (
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Resolution</p>
                                  <p className="text-xs font-bold text-slate-800">{hospital.stats.resolutionRate}%</p>
                                </div>
                              )}
                              {hospital.stats.totalReports > 0 && (
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Reports</p>
                                  <p className="text-xs font-bold text-slate-800">{hospital.stats.totalReports}</p>
                                </div>
                              )}
                              {hospital.stats.criticalOpen > 0 && (
                                <div>
                                  <p className="text-[10px] text-rose-400 font-bold uppercase">Critical Issues</p>
                                  <p className="text-xs font-bold text-rose-600">{hospital.stats.criticalOpen}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 mb-4 border-t border-slate-100 pt-3">
                              {hospital.stats.resolutionRate !== null && (
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Success Rate</p>
                                  <p className="text-xs font-bold text-emerald-600">{hospital.stats.resolutionRate}%</p>
                                </div>
                              )}
                              {hospital.stats.totalReports > 0 && (
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Cases Handled</p>
                                  <p className="text-xs font-bold text-slate-800">{hospital.stats.totalReports}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <button 
                            onClick={() => navigate(`/hospital/${hospital.id}`)}
                            className="w-full py-2 bg-primary-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary-700"
                          >
                            View Extended Details <ExternalLink size={12} />
                          </button>

                          {isAdmin && (
                            <button onClick={() => navigate('/admin')} className="w-full py-1.5 mt-2 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold hover:bg-slate-200">
                              Admin Investigation
                            </button>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              ) : (
                // Heatmap visual representation (sized by complaint volume)
                filteredHospitals.map(hospital => {
                  if (hospital.stats.totalReports === 0) return null;
                  return (
                    <CircleMarker
                      key={`heat-${hospital.id}`}
                      center={[hospital.coordinates.lat, hospital.coordinates.lng]}
                      radius={Math.min(30, Math.max(10, hospital.stats.totalReports * 2))}
                      pathOptions={{ 
                        fillColor: '#ef4444', 
                        color: '#ef4444', 
                        weight: 1, 
                        fillOpacity: 0.5 
                      }}
                    >
                      <Popup>
                        <h3 className="font-bold text-sm">{hospital.name}</h3>
                        <p className="text-rose-600 font-bold text-xs mt-1"><Flame size={14} className="inline"/> {hospital.stats.totalReports} Grievances Filed</p>
                      </Popup>
                    </CircleMarker>
                  );
                })
              )}
            </MapContainer>

            {/* FLOATING MAP LEGEND & CONTROLS */}
            <div className="absolute bottom-4 md:bottom-6 left-4 right-4 md:right-auto md:left-6 z-[1000] flex flex-col gap-4">
              
              {isAdmin ? (
                <>
                  {/* Region Summary Card */}
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 text-sm w-full md:w-80">
                    <h4 className="font-black text-slate-900 dark:text-white mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">Region Summary</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      <div className="text-slate-600 dark:text-slate-400">Total Facilities: <strong className="text-slate-900 dark:text-slate-200">{summary.total}</strong></div>
                      <div className="text-slate-600 dark:text-slate-400">Total Reports: <strong className="text-slate-900 dark:text-slate-200">{summary.reports}</strong></div>
                      <div className="text-emerald-600 dark:text-emerald-400">Performing Well: <strong>{summary.good}</strong></div>
                      <div className="text-rose-600 dark:text-rose-400">Critical Status: <strong>{summary.attention}</strong></div>
                    </div>
                  </div>

                  {/* Legend Card */}
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 text-sm w-full md:w-64">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-black text-slate-900 dark:text-white">Hospital Status</h4>
                      <button 
                        onClick={() => setIsHeatmap(!isHeatmap)}
                        className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${isHeatmap ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                      >
                        Heatmap Mode
                      </button>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> <span className="text-slate-700 dark:text-slate-300 font-medium">Good Performance</span></li>
                      <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> <span className="text-slate-700 dark:text-slate-300 font-medium">Needs Monitoring</span></li>
                      <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div> <span className="text-slate-700 dark:text-slate-300 font-medium">Requires Attention</span></li>
                      <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-600"></div> <span className="text-slate-700 dark:text-slate-300 font-medium">Insufficient Data</span></li>
                    </ul>
                  </div>
                </>
              ) : (
                /* USER: Macro Healthcare Insights Card */
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-sm w-full md:w-80 hover:shadow-2xl transition-shadow duration-300 hidden sm:block">
                  <h4 className="font-black text-slate-900 dark:text-white text-lg font-serif">Macro Healthcare Insights</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    Real-time aggregated data across our verified hospital network ({summary.total} Total Hospitals)
                  </p>
                  
                  <div className="mb-4">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Live Data</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center group">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs group-hover:text-primary-600 transition-colors">Cardiac Care</p>
                          <p className="text-[10px] text-slate-500">Average package cost</p>
                        </div>
                        <span className="font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded text-xs">₹1.4 Lakh</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs group-hover:text-primary-600 transition-colors">Pancreatic Treatment</p>
                          <p className="text-[10px] text-slate-500">Average treatment cost</p>
                        </div>
                        <span className="font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded text-xs">₹2.2 Lakh</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs group-hover:text-primary-600 transition-colors">Dialysis</p>
                          <p className="text-[10px] text-slate-500">Average monthly package</p>
                        </div>
                        <span className="font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded text-xs">₹18,000</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Center Distribution</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg text-center transition-colors">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">North</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 text-sm">32%</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg text-center transition-colors">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">South</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 text-sm">38%</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg text-center transition-colors">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">East</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 text-sm">12%</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg text-center transition-colors">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">West</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 text-sm">18%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // LIST VIEW
          <div className="w-full h-full overflow-y-auto p-6 bg-slate-50 dark:bg-[#0f0e0c]">
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredHospitals.map(hospital => (
                <div key={hospital.id} className="bg-white dark:bg-[#141311] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white font-serif">{hospital.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{hospital.city}, {hospital.state}</p>
                    {isAdmin && (
                      <div className="flex flex-wrap gap-2">
                        {hospital.performanceStatus !== 'Insufficient Data' && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                            hospital.performanceStatus === 'Good' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                            hospital.performanceStatus === 'Requires Attention' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' :
                            'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          }`}>
                            {hospital.performanceStatus}
                          </span>
                        )}
                        {hospital.stats.resolutionRate !== null && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {hospital.stats.resolutionRate}% Resolution
                          </span>
                        )}
                        {hospital.stats.totalReports > 0 && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {hospital.stats.totalReports} Total Reports
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button 
                      onClick={() => handleSearchSelect(hospital)} 
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
                    >
                      <MapIcon size={16} /> Locate on Map
                    </button>
                    <button 
                      onClick={() => navigate(`/hospital/${hospital.id}`)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 flex items-center justify-center gap-2"
                    >
                      View Profile <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredHospitals.length === 0 && (
                <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                  <Info size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-lg text-slate-700 dark:text-slate-300">No hospitals match your criteria</p>
                  <p>Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}