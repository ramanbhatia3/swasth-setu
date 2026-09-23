import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MedicalRecords from './pages/MedicalRecords';
import FindServices from './pages/FindServices'; // <-- NEW

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            
            {/* PUBLIC ROUTES */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            <Route path="services" element={<FindServices />} /> {/* <-- UPDATED */}
            <Route path="ai-report" element={<div className="p-8 text-center text-xl">AI Report (Coming Soon)</div>} />
            
            {/* PROTECTED ROUTES (Requires Login) */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<Profile />} />
              <Route path="records" element={<MedicalRecords />} />
              <Route path="feedback" element={<div className="p-8 text-center text-xl">Feedback (Coming Soon)</div>} />
            </Route>

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;