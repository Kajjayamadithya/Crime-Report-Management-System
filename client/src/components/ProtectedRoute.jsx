import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// roles = array of allowed roles, e.g., ['admin', 'police']
const ProtectedRoute = ({ roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, but route restricted to specific roles
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect logic depending on their role to a suitable fallback dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'police') return <Navigate to="/police" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
