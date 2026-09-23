import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MedicalRecords from './pages/MedicalRecords';
import FindServices from './pages/FindServices';
import HospitalDetails from './pages/HospitalDetails';
import CompareHospitals from './pages/CompareHospitals';
import Feedback from './pages/Feedback';
import AdminDashboard from './pages/AdminDashboard';
import AiReport from './pages/AiReport'; // <-- NEW
import HospitalMap from './pages/Map';
import Specialists from './pages/Specialists';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            
            {/* PUBLIC ROUTES */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="services" element={<FindServices />} />
            <Route path="hospital/:id" element={<HospitalDetails />} />
            <Route path="compare" element={<CompareHospitals />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="ai-report" element={<AiReport />} /> {/* <-- NOW A REAL PAGE */}
            <Route path="specialists" element={<Specialists />} />
            
            {/* PROTECTED ROUTES (Requires Login) */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<Profile />} />
              <Route path="records" element={<MedicalRecords />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>

            <Route element={<HospitalMap />} path="/map" />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;