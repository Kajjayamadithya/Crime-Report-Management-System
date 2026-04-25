import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, ArrowRight, ShieldAlert, Users, Database } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const { role } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validRoles = ['citizen', 'police', 'admin'];

  useEffect(() => {
    if (!validRoles.includes(role)) {
       navigate('/');
    }
  }, [role, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Pass 'role' (the portal requested) to the login context
    const result = await login(email, password, role);
    setIsLoading(false);

    if (result.success) {
      const from = location.state?.from?.pathname || `/${result.role}`;
      navigate(from, { replace: true });
    }
  };

  const getRoleContent = () => {
    switch(role) {
      case 'police': return { icon: <ShieldCheck className="w-10 h-10 text-white" />, title: 'Officer Dispatch Portal', bg: 'from-blue-600 to-indigo-800' };
      case 'admin': return { icon: <Database className="w-10 h-10 text-white" />, title: 'System Admin Root', bg: 'from-rose-600 to-red-800' };
      default: return { icon: <Users className="w-10 h-10 text-white" />, title: 'Citizen Portal', bg: 'from-emerald-500 to-teal-700' };
    }
  };

  const content = getRoleContent();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      {/* Left Abstract Art Side - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 justify-center items-center">
        <div className={`absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${content.bg} to-slate-900`}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-white max-w-lg p-12"
        >
          <div className={`w-20 h-20 bg-gradient-to-br ${content.bg} rounded-3xl flex items-center justify-center mb-8 shadow-2xl transform -rotate-6`}>
            {content.icon}
          </div>
          <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight capitalize">
            {role} Access Gateway
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            CRMS empowers citizens and law enforcement to collaborate seamlessly. Track, manage, and resolve incidents with absolute cryptographic security.
          </p>
        </motion.div>
      </div>

      {/* Right Login Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              {content.title}
            </h2>
            <p className="text-slate-500 font-medium">Please enter your authorized credentials.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="input-label" htmlFor="email">Email Identifier</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="input-field pl-12 bg-white"
                  placeholder={`${role}@jurisdiction.gov`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="input-label" htmlFor="password">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  className="input-field pl-12 bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-lg mt-4 group"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Initialize Session
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-200 text-center">
            {role !== 'admin' ? (
              <p className="text-slate-600 font-medium">
                Don't have clearance?{' '}
                <Link to={`/${role}/register`} className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase text-sm">
                  Register as {role}
                </Link>
              </p>
            ) : (
              <p className="text-slate-500 font-medium text-sm">
                Admin registration is restricted. Contact network administrator.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
