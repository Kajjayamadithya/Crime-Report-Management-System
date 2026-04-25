import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import PoliceDashboard from './pages/PoliceDashboard';
import AdminDashboard from './pages/AdminDashboard';
import FileFIR from './pages/FileFIR';

import { ShieldAlert, LogOut } from 'lucide-react'; 

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register') || location.pathname === '/';

  return (
    <>
      <div className="min-h-screen bg-mesh text-slate-800 font-sans flex flex-col transition-all duration-300 selection:bg-indigo-500 selection:text-white">
        
        {/* Floating Glass Navbar */}
        <nav className="glass-nav sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              
              <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-2 rounded-xl shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                   <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                  CRMS
                  <span className="text-slate-400 font-medium ml-3 text-sm tracking-normal hidden sm:inline border-l border-slate-300 pl-3">
                    Crime Report Management Platform
                  </span>
                </h1>
              </Link>
              
              {user && !isAuthPage ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-bold text-slate-800">{user.name}</span>
                    <span className="text-xs text-slate-500 font-medium">{user.email}</span>
                  </div>
                  <span className="badge-blue uppercase text-[10px] px-3 py-1.5 shadow-sm">
                    {user.role}
                  </span>
                  <button onClick={logout} className="ml-2 p-2 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   {!user && location.pathname !== '/' && (
                     <Link to="/" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                       Change Role
                     </Link>
                   )}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main Routing Container */}
        <main className="flex-1 w-full mx-auto relative z-10 flex flex-col">
          <Routes>
            {/* Landing */}
            <Route path="/" element={!user ? <Landing /> : <Navigate to={`/${user.role}`} replace />} />

            {/* Dynamic Auth Routes built around Role */}
            <Route path="/:role/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} replace />} />
            <Route path="/:role/register" element={!user ? <Register /> : <Navigate to={`/${user.role}`} replace />} />

            {/* Protected Routes: Citizen */}
            <Route element={<ProtectedRoute roles={['citizen']} />}>
              <Route path="/citizen" element={<div className="max-w-7xl mx-auto px-4 w-full py-8"><CitizenDashboard /></div>} />
              <Route path="/citizen/file-fir" element={<div className="max-w-7xl mx-auto px-4 w-full py-8"><FileFIR /></div>} />
            </Route>

            {/* Protected Routes: Police */}
            <Route element={<ProtectedRoute roles={['police']} />}>
              <Route path="/police" element={<div className="max-w-7xl mx-auto px-4 w-full py-8"><PoliceDashboard /></div>} />
            </Route>

            {/* Protected Routes: Admin */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<div className="max-w-7xl mx-auto px-4 w-full py-8"><AdminDashboard /></div>} />
            </Route>

            {/* Fallbacks */}
            {/* If they hit /login without a role, kick them back to landing to pick a role */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />

            {/* Catch-all Not Found */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center p-12 text-center my-auto min-h-[50vh]">
                <h1 className="text-8xl font-black text-slate-200 mb-4 tracking-tighter">404</h1>
                <p className="text-2xl font-semibold text-slate-600 mb-8">Page vanished into thin air.</p>
                <Link to="/" className="btn-primary shadow-xl px-8 py-3 rounded-full">Return to Safety</Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
      
      {/* Global Toast Notifications */}
      <ToastContainer position="top-center" autoClose={4000} theme="colored" />
    </>
  );
}

export default App;
