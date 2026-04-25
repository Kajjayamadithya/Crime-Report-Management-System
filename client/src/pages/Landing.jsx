import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, ShieldCheck, Database } from 'lucide-react';

const Landing = () => {
  const roles = [
    {
      id: 'citizen',
      title: 'Citizen Reporting',
      description: 'Public portal for filing and tracking authentic First Information Reports securely.',
      icon: <Users className="w-10 h-10 text-emerald-500" />,
      gradient: 'from-emerald-500/10 to-teal-500/5',
      border: 'hover:border-emerald-400/50',
      badge: 'Public'
    },
    {
      id: 'police',
      title: 'Police Command',
      description: 'Law enforcement portal for analyzing, assigning, and escalating registered crime reports.',
      icon: <ShieldCheck className="w-10 h-10 text-indigo-500" />,
      gradient: 'from-indigo-500/10 to-blue-500/5',
      border: 'hover:border-indigo-400/50',
      badge: 'Secure'
    },
    {
      id: 'admin',
      title: 'System Administration',
      description: 'Root portal for platform integrity, account provisioning, and overriding protocols.',
      icon: <Database className="w-10 h-10 text-rose-500" />,
      gradient: 'from-rose-500/10 to-red-500/5',
      border: 'hover:border-rose-400/50',
      badge: 'Restricted'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-8">
      
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-8 transform -rotate-3"
        >
          <ShieldAlert className="w-12 h-12 text-white" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-6xl font-black text-slate-800 tracking-tighter mb-4"
        >
          Select Your Identity.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-500 font-medium leading-relaxed"
        >
          The CRMS platform routes data dynamically based on your clearance level. Please identify your role to access the appropriate gateway.
        </motion.p>
      </div>

      {/* Role Selection Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 px-4">
        {roles.map((r, index) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (index * 0.1) }}
          >
            <div className={`h-full card-premium bg-gradient-to-br ${r.gradient} border-2 border-transparent ${r.border} transition-all duration-300 group`}>
              <div className="p-8 sm:p-10 flex flex-col h-full relative overflow-hidden">
                
                <div className="absolute top-0 right-0 p-4">
                  <span className="uppercase text-[10px] font-bold tracking-widest text-slate-400 bg-white/50 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200">
                    {r.badge}
                  </span>
                </div>

                <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {r.icon}
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">{r.title}</h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-grow">
                  {r.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                   <Link to={`/${r.id}/login`} className="flex-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold py-3 px-4 rounded-xl text-center shadow-sm transition-all hover:border-slate-300">
                     Login
                   </Link>
                   {r.id !== 'admin' && (
                     <Link to={`/${r.id}/register`} className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl text-center shadow-md transition-all">
                       Register
                     </Link>
                   )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default Landing;
