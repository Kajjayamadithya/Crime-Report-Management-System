import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Database, Users, BadgeAlert } from 'lucide-react';

const Register = () => {
  const { role } = useParams();
  const validRoles = ['citizen', 'police', 'admin'];
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    badgeNumber: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!validRoles.includes(role)) {
       navigate('/');
    }
  }, [role, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Inject the route parameter role into the payload 
    const payload = { ...formData, role };
    const result = await register(payload);
    setIsLoading(false);

    if (result.success) {
      navigate(`/${role}`, { replace: true });
    }
  };

  const getRoleContent = () => {
    switch(role) {
      case 'police': return { icon: <ShieldCheck className="w-10 h-10 text-white" />, title: 'Officer Registration', bg: 'from-blue-600 to-indigo-800' };
      case 'admin': return { icon: <Database className="w-10 h-10 text-white" />, title: 'Admin Setup', bg: 'from-rose-600 to-red-800' };
      default: return { icon: <Users className="w-10 h-10 text-white" />, title: 'Citizen Onboarding', bg: 'from-emerald-500 to-teal-700' };
    }
  };

  const content = getRoleContent();

  if (role === 'admin' || role === 'police') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-8 text-center bg-slate-50">
        <div className={`w-20 h-20 bg-gradient-to-br ${content.bg} rounded-3xl flex items-center justify-center mb-8 shadow-2xl`}>
          {content.icon}
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter uppercase">Registration Restricted</h1>
        <p className="text-slate-500 text-xl font-medium mb-8 max-w-lg">
          The creation of <span className="text-indigo-600 font-bold capitalize">{role}</span> accounts via public web forms is strictly forbidden. 
          All authorized credentials must be provisioned internally by the System Administrator.
        </p>
        <Link to={`/${role}/login`} className="btn-primary px-10 py-4 shadow-xl shadow-indigo-100">
          Return to {role} Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-row-reverse">
       {/* Right Abstract Art Side - Hidden on Mobile */}
       <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 justify-center items-center">
        <div className={`absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${content.bg} to-slate-900`}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-white max-w-lg p-12 text-right"
        >
          <div className={`ml-auto w-20 h-20 bg-gradient-to-br ${content.bg} rounded-2xl flex items-center justify-center mb-8 shadow-2xl`}>
            {content.icon}
          </div>
          <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight text-white capitalize">
            Deploy your<br/>{role} identity.
          </h1>
          <p className="text-indigo-200 text-lg font-medium leading-relaxed">
            CRMS requires strict pre-verification of all credentials to enforce platform integrity.
          </p>
        </motion.div>
      </div>

      {/* Left Registration Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto pt-24 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 pl-1 text-center lg:text-left">
            <span className="badge-blue uppercase text-xs mb-3 inline-block shadow-sm">Portal: {role}</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {content.title}
            </h2>
            <p className="text-slate-500 font-medium tracking-tight">Supply required legal specifics for the database record.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="space-y-1">
              <label className="input-label" htmlFor="name">Legal Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input id="name" name="name" type="text" required className="input-field pl-12 bg-white" placeholder="John Doe" value={formData.name} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="input-label" htmlFor="email">Official Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input id="email" name="email" type="email" required className="input-field pl-12 bg-white" placeholder={`john@${role === 'citizen' ? 'domain' : 'gov'}.com`} value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="input-label" htmlFor="phone">Contact Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <input id="phone" name="phone" type="tel" required pattern="[6-9][0-9]{9}" title="Valid 10-digit number" className="input-field pl-12 bg-white" placeholder="9876543210" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            {/* Dynamic Police Field */}
            {role === 'police' && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-1 origin-top overflow-hidden">
                 <label className="input-label" htmlFor="badgeNumber">Precinct Badge ID</label>
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                     <BadgeAlert className="h-5 w-5" />
                   </div>
                   <input id="badgeNumber" name="badgeNumber" type="text" required className="input-field pl-12 bg-white" placeholder="POL-XXX-YYYY" value={formData.badgeNumber} onChange={handleChange} />
                 </div>
               </motion.div>
            )}

            <div className="space-y-1 pb-2">
              <label className="input-label" htmlFor="password">Security Passphrase</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input id="password" name="password" type="password" required minLength="6" className="input-field pl-12 bg-white" placeholder="••••••••" value={formData.password} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-base mt-4 group shadow-xl">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Establishing Record...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Finalize Provisioning
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-200">
            <p className="text-slate-600 font-medium">
              Already credentialed?{' '}
              <Link to={`/${role}/login`} className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
