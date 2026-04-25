import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Globe, 
  TrendingUp,
  UserPlus,
  ShieldCheck,
  Search,
  MoreVertical,
  Activity,
  AlertCircle,
  FileText,
  User,
  ClipboardList,
  Calendar,
  MapPin,
  Download,
  ExternalLink,
  Settings as SettingsIcon,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, provision, settings, analytics
  const [selectedFIR, setSelectedFIR] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = 'http://localhost:5000';
  
  // Provision Form State
  const [provisionData, setProvisionData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    badgeNumber: '',
    designation: 'Sub-Inspector'
  });
  const [provisioning, setProvisioning] = useState(false);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/dashboard/admin');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      toast.error('System synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (fir) => {
    setSelectedFIR(fir);
    setIsModalOpen(true);
  };

  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    try {
      setProvisioning(true);
      const res = await axiosInstance.post('/admin/police', provisionData);
      if (res.data.success) {
        toast.success(`Officer ${provisionData.name} successfully provisioned.`);
        setProvisionData({
          name: '',
          email: '',
          password: '',
          phone: '',
          badgeNumber: '',
          designation: 'Sub-Inspector'
        });
        fetchAdminStats(); 
        setActiveTab('overview');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Provisioning failed');
    } finally {
      setProvisioning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <Activity className="w-12 h-12 animate-pulse text-indigo-500" />
        <p className="font-black uppercase tracking-[0.3em] text-xs">Accessing Root Node...</p>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const recentFIRs = stats?.recentFIRs || [];
  const charts = stats?.charts || {};

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <motion.div 
          key="overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          {/* Global Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { label: 'Total FIRs', value: overview.totalFIRs, icon: <ShieldAlert className="w-6 h-6" />, color: 'indigo' },
               { label: 'Active Citizens', value: overview.totalCitizens, icon: <Users className="w-6 h-6" />, color: 'emerald' },
               { label: 'Legal Officers', value: overview.totalOfficers, icon: <ShieldCheck className="w-6 h-6" />, color: 'blue' },
               { label: 'Hotspot Alerts', value: overview.urgentFIRs, icon: <AlertCircle className="w-6 h-6" />, color: 'rose' },
             ].map((m, i) => (
               <div key={i} className="card-premium p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                 <div className={`absolute top-0 right-0 p-4 transition-transform group-hover:scale-110 text-slate-100`}>
                    {m.icon && React.cloneElement(m.icon, { className: 'w-24 h-24' })}
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">{m.label}</p>
                 <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{m.value || 0}</p>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
             <div className="xl:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                     <Globe className="w-7 h-7 text-indigo-500" />
                     Intelligence Stream
                     <span className="ml-3 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black border border-indigo-100 shadow-sm">
                       {recentFIRs.length} RECORDS
                     </span>
                  </h3>
                </div>

                <div className="card-premium border border-slate-200 bg-white max-h-[400px] overflow-y-auto overflow-x-hidden">
                    <table className="w-full text-left border-collapse relative">
                      <thead className="bg-slate-50 italic sticky top-0 z-10 shadow-sm">
                         <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Target</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Classification</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Assignment</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {recentFIRs.map((fir) => (
                           <tr 
                              key={fir._id} 
                              onClick={() => handleViewDetails(fir)}
                              className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                            >
                              <td className="px-6 py-5">
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800 line-clamp-1">{fir.title}</span>
                                    <span className="text-[10px] font-bold font-mono text-indigo-500">{fir.firNumber}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${fir.severity === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-slate-300'}`}></div>
                                    <span className="text-xs font-bold text-slate-600 capitalize">{fir.crimeCategory}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <span className="text-xs font-bold text-slate-500 italic">
                                   {fir.assignedOfficer?.name || 'Unassigned Dispatch'}
                                 </span>
                              </td>
                              <td className="px-6 py-5">
                                 <span className="badge-blue uppercase text-[9px] font-black italic">
                                    {fir.status.replace('_', ' ')}
                                 </span>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             <div className="space-y-8">
                <div className="card-premium p-8 bg-slate-900 border-none text-white relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                   <TrendingUp className="w-10 h-10 text-indigo-400 mb-6" />
                   <h3 className="text-2xl font-black tracking-tight mb-2">Network Health</h3>
                   <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                      System integrity is verified. Advanced cryptographic layers are protecting 100% of recorded evidence blocks.
                   </p>
                   <div className="space-y-4">
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 w-[94%]" />
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                         <span>Uptime</span>
                         <span className="text-indigo-400">99.9%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      );
    }

    if (activeTab === 'provision') {
      return (
        <motion.div 
          key="provision"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="max-w-4xl mx-auto"
        >
           <div className="card-premium p-12 bg-white border border-slate-200">
                <div className="text-center mb-12">
                   <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100 border border-indigo-100">
                      <UserPlus className="w-10 h-10" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight italic mb-2">Provision Officer Credentials</h2>
                   <p className="text-slate-500 font-medium">Inject new authorized investigator records into the central database.</p>
                </div>

                <form onSubmit={handleProvisionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                      <input 
                        type="text" 
                        required 
                        className="input-field bg-slate-50/50 border-slate-200" 
                        placeholder="Officer Name"
                        value={provisionData.name}
                        onChange={(e) => setProvisionData({...provisionData, name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Email ID</label>
                      <input 
                        type="email" 
                        required 
                        className="input-field bg-slate-50/50 border-slate-200" 
                        placeholder="official@crms.gov"
                        value={provisionData.email}
                        onChange={(e) => setProvisionData({...provisionData, email: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Passphrase</label>
                      <input 
                        type="password" 
                        required 
                        className="input-field bg-slate-50/50 border-slate-200" 
                        placeholder="••••••••"
                        value={provisionData.password}
                        onChange={(e) => setProvisionData({...provisionData, password: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Badge Number</label>
                      <input 
                        type="text" 
                        required 
                        className="input-field bg-slate-50/50 border-slate-200 font-mono" 
                        placeholder="POL-SHD-0000"
                        value={provisionData.badgeNumber}
                        onChange={(e) => setProvisionData({...provisionData, badgeNumber: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                      <input 
                        type="tel" 
                        required 
                        className="input-field bg-slate-50/50 border-slate-200" 
                        placeholder="99XXXXXXXX"
                        value={provisionData.phone}
                        onChange={(e) => setProvisionData({...provisionData, phone: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departmental Rank</label>
                      <select 
                        className="input-field bg-slate-50/50 border-slate-200"
                        value={provisionData.designation}
                        onChange={(e) => setProvisionData({...provisionData, designation: e.target.value})}
                      >
                         <option>Sub-Inspector</option>
                         <option>Inspector of Police</option>
                         <option>Circle Inspector</option>
                         <option>Superintendent</option>
                         <option>Lead Detective</option>
                      </select>
                   </div>
                   
                   <div className="md:col-span-2 pt-6">
                      <button 
                        type="submit" 
                        disabled={provisioning}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-5 rounded-2xl text-lg shadow-2xl italic font-black uppercase tracking-widest transition-all disabled:opacity-50"
                      >
                        {provisioning ? 'Cryptographic Provisioning...' : 'Authorize Investigator'}
                      </button>
                   </div>
                </form>
             </div>
          </motion.div>
      );
    }

    if (activeTab === 'settings') {
      return (
        <motion.div 
          key="settings"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <div className="card-premium p-8 bg-white border border-slate-200">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                   <SettingsIcon className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">Admin Configuration</h3>
                   <p className="text-sm font-medium text-slate-500">Manage system-wide parameters and intelligence tools.</p>
                </div>
             </div>

             <div className="space-y-3">
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all group"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                         <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                         <p className="font-black text-slate-900 uppercase text-xs tracking-widest">View Intelligence Analytics</p>
                         <p className="text-xs font-medium text-slate-500">Visualize user demographics and case trends.</p>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 transition-all group opacity-50 cursor-not-allowed">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                         <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                         <p className="font-black text-slate-400 uppercase text-xs tracking-widest">System Audit Logs</p>
                         <p className="text-xs font-medium text-slate-300">Detailed trail of all root-level actions.</p>
                      </div>
                   </div>
                   <MoreVertical className="w-5 h-5 text-slate-200" />
                </button>
             </div>
          </div>
        </motion.div>
      );
    }

    if (activeTab === 'analytics') {
      return (
        <motion.div 
          key="analytics"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between mb-2">
             <button 
               onClick={() => setActiveTab('settings')}
               className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest flex items-center gap-2"
             >
                ← Back to Settings
             </button>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Activity className="w-6 h-6 text-indigo-600" />
                Intelligence Command Center
             </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Distribution Pie */}
            <div className="card-premium p-8 bg-white border border-slate-200 h-[450px] flex flex-col">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 italic">Personnel Distribution</h4>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.rolesDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {charts.rolesDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '16px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Case Categories Bar */}
            <div className="card-premium p-8 bg-white border border-slate-200 h-[450px] flex flex-col">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 italic">Case Classification Matrix</h4>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.firsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trends Area */}
            <div className="lg:col-span-2 card-premium p-8 bg-white border border-slate-200 h-[450px] flex flex-col">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 italic">Crime reporting velocity (Last 6 Months)</h4>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.firsByMonth}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }} />
                    <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={6} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-20"
    >
      {/* Global Command Header */}
      <div className="bg-slate-950 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-800">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] border-2 border-indigo-400/30 shrink-0 transform rotate-3">
              <LayoutDashboard className="w-12 h-12 text-white" />
            </div>
            <div>
              <div className="flex gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-700/50 mb-4 w-fit">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('provision')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'provision' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Provision
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'settings' || activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-1 uppercase leading-none">
                Admin <span className="text-indigo-400">HQ</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium opacity-80">Command: {user?.name}</p>
            </div>
          </div>
          
          <button className="p-4 bg-slate-900 text-rose-500 rounded-2xl hover:bg-slate-800 transition-colors border border-slate-800 shadow-xl group" onClick={logout}>
            <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      {/* FIR Detail Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Intelligence Briefing: ${selectedFIR?.firNumber || ''}`}
      >
        {selectedFIR && (
          <div className="space-y-10">
            {/* Classification Header */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100">
                     <FileText className="w-8 h-8" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{selectedFIR.title}</h2>
                     <div className="flex items-center gap-3">
                        <span className="badge-blue !bg-slate-100 !text-slate-600 !border-slate-200 text-[10px] font-black uppercase tracking-widest italic">{selectedFIR.crimeCategory}</span>
                        <span className={`badge-blue !border-none text-[10px] font-black uppercase tracking-widest ${selectedFIR.isUrgent ? 'animate-pulse !text-rose-500' : '!text-slate-400'}`}>
                           {selectedFIR.isUrgent ? 'PRIORITY ALPHA' : 'Standard Priority'}
                        </span>
                     </div>
                  </div>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Protocol</span>
                  <span className="badge-blue !bg-indigo-600 !text-white !border-none px-6 py-2 text-xs font-black uppercase tracking-widest italic shadow-lg shadow-indigo-100">{selectedFIR.status.replace('_', ' ')}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Left Column: Complainant & Incident */}
               <div className="md:col-span-2 space-y-8">
                  <section className="space-y-4">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-2">
                        <User className="w-3.5 h-3.5" />
                        Complainant Information
                     </h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Legal Name</p>
                           <p className="text-sm font-bold text-slate-800">{selectedFIR.complainant?.name || 'Anonymous'}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Signal</p>
                           <p className="text-sm font-bold text-slate-800">{selectedFIR.complainant?.email || 'N/A'}</p>
                        </div>
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-2">
                        <ClipboardList className="w-3.5 h-3.5" />
                        Formal Description
                     </h4>
                     <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <p className="text-slate-600 font-medium leading-relaxed italic">{selectedFIR.description}</p>
                     </div>
                  </section>
               </div>

               {/* Right Column: Meta Info */}
               <div className="space-y-8">
                  <div className="card-premium p-6 border border-slate-200 bg-slate-50/30">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Incident Logs</h4>
                     <div className="space-y-6">
                        <div className="flex gap-4">
                           <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Reported</p>
                              <p className="text-xs font-bold text-slate-700">{format(new Date(selectedFIR.createdAt), 'MMM dd, yyyy')}</p>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Region</p>
                              <p className="text-xs font-bold text-slate-700 leading-snug">Geocoded Metadata</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Evidence Vault */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                        Audit Vault
                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[9px]">{selectedFIR.evidence?.length || 0} Blocks</span>
                     </h4>
                     <div className="space-y-2">
                        {selectedFIR.evidence && selectedFIR.evidence.length > 0 ? (
                           selectedFIR.evidence.map((file, idx) => (
                              <a 
                                 key={idx}
                                 href={`${API_URL}/${file.path}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                       <Download className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{file.originalName}</span>
                                 </div>
                                 <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                              </a>
                           ))
                        ) : (
                           <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No evidence uploaded</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default AdminDashboard;
