import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Wait for the auth context to finish checking localStorage
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin text-blue-600">
          <Activity size={32} />
        </div>
      </div>
    );
  }

  // If no user is found, redirect to login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}