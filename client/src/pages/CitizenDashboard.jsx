import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import { 
  LogOut, 
  Home, 
  PlusCircle, 
  Activity, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  ChevronRight,
  ShieldCheck,
  User,
  ShieldAlert,
  MapPin,
  Calendar,
  ClipboardList,
  Download,
  ExternalLink,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const CitizenDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFIR, setSelectedFIR] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchCitizenStats();
  }, []);

  const fetchCitizenStats = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/dashboard/citizen');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to synchronize status node');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (fir) => {
    setSelectedFIR(fir);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <Activity className="w-12 h-12 animate-pulse text-blue-500" />
        <p className="font-black uppercase tracking-[0.3em] text-xs font-monoital">Synchronizing Status Node...</p>
      </div>
    );
  }

  const recentFIRs = stats?.recentFIRs || [];

  const getStatusStep = (status) => {
    const steps = ['submitted', 'under_review', 'investigating', 'resolved'];
    return steps.indexOf(status);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-20"
    >
      {/* Hero Tracking Center */}
      <div className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-10 sm:p-14 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-800">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] border-2 border-blue-400/30 shrink-0 transform -rotate-3">
               <span className="text-4xl font-black text-white">{user?.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-500 text-white text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase italic">Citizen Protocol</span>
                <span className="text-slate-500 font-bold text-xs uppercase tracking-tight">Node: Verified</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-1 uppercase leading-none">Intelligence <span className="text-blue-400 italic">Portal</span></h1>
              <p className="text-slate-400 text-lg font-medium opacity-80 font-monoital">complainant_id: {user?._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <button className="bg-slate-900/50 hover:bg-rose-500/10 text-rose-500 border border-slate-800 py-4 px-8 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 group" onClick={logout}>
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            End Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="xl:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic font-monoital">
                  <Activity className="w-7 h-7 text-blue-600 " />
                  Active Incident Archives
               </h3>
               <Link to="/citizen/file-fir" className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 italic font-monoital underline">
                  <PlusCircle className="w-4 h-4" />
                  New Report
               </Link>
            </div>

            <div className="card-premium overflow-hidden border border-slate-200 bg-white">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 font-monoital italic">
                       <tr>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tracking_ID</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned_Agent</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Protocol_Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {recentFIRs.map((fir) => (
                         <tr 
                           key={fir._id} 
                           onClick={() => handleViewDetails(fir)}
                           className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                         >
                            <td className="px-6 py-6 font-monoital">
                               <div className="flex flex-col">
                                  <span className="text-sm font-black text-slate-800">{fir.firNumber}</span>
                                  <span className="text-[10px] font-black text-blue-500 tracking-tighter italic">{format(new Date(fir.createdAt), 'MMM dd, yyyy')}</span>
                               </div>
                            </td>
                            <td className="px-6 py-6 font-monoital">
                               <div className="flex flex-col max-w-[200px]">
                                  <span className="text-sm font-bold text-slate-800 truncate italic">{fir.title}</span>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fir.crimeCategory}</span>
                               </div>
                            </td>
                            <td className="px-6 py-6 font-monoital">
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${fir.assignedOfficer ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                     <ShieldCheck className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-xs font-bold text-slate-700">{fir.assignedOfficer?.name || 'Pending Dispatch'}</span>
                                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{fir.assignedOfficer?.designation || '---'}</span>
                                  </div>
                                </div>
                            </td>
                            <td className="px-6 py-6 text-right font-monoital italic">
                               <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                  fir.status === 'resolved' || fir.status === 'closed' ? 'bg-emerald-600 text-white' :
                                  fir.status === 'investigating' ? 'bg-blue-600 text-white animate-pulse' :
                                  fir.status === 'rejected' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'
                               }`}>
                                  {fir.status.replace('_', ' ')}
                               </span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
         </div>

         <div className="space-y-8 font-monoital italic">
            <div className="card-premium p-8 bg-white border border-slate-200 h-fit">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-blue-500 " />
                  System Metrics
               </h4>
               <div className="space-y-8">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                        <FileText className="w-7 h-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total_Reports</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stats?.overview?.totalFiled || 0}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100">
                        <Clock className="w-7 h-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In_Investigation</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stats?.overview?.investigating || 0}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100">
                        <CheckCircle2 className="w-7 h-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resolved_Success</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stats?.overview?.resolved || 0}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="card-premium p-8 bg-slate-950 border-none text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
               <ShieldCheck className="w-10 h-10 text-blue-400 mb-6" />
               <h3 className="text-xl font-black tracking-tight mb-3 uppercase italic underline">Privacy Protocol</h3>
               <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6 italic opacity-80">
                  Officer details are strictly for case context. Unauthorised contact is tracked and logged in the departmental audit trail.
               </p>
               <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-black uppercase text-slate-500 italic">
                  <span>Encryption</span>
                  <span className="text-blue-400">active</span>
               </div>
            </div>
         </div>
      </div>

      {/* Resolution Briefing Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Intelligence Briefing: ${selectedFIR?.firNumber || ''}`}
      >
        {selectedFIR && (
          <div className="space-y-10">
            {/* Resolution Success Banner */}
            {(selectedFIR.status === 'resolved' || selectedFIR.status === 'closed') && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-emerald-600 rounded-[2rem] p-8 text-white flex items-center justify-between shadow-2xl shadow-emerald-100 italic font-monoital"
               >
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">Investigation Concluded</h3>
                        <p className="text-emerald-100 text-sm font-semibold opacity-90 italic">Case status synchronized to DEPARTMENTAL_RESOLVED</p>
                     </div>
                  </div>
                  <ShieldCheck className="w-12 h-12 opacity-30" />
               </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {/* Lifecycle Progress */}
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-monoital">Investigation Lifecycle</h4>
                  <div className="space-y-0 italic font-monoital">
                     {[
                        { label: 'Report Indexed', status: 'submitted' },
                        { label: 'Headquarters Review', status: 'under_review' },
                        { label: 'Field Investigation', status: 'investigating' },
                        { label: 'Resolution Verified', status: 'resolved' },
                     ].map((step, idx, arr) => {
                        const currentStepIdx = getStatusStep(selectedFIR.status);
                        const isActive = idx <= currentStepIdx;
                        const isLast = idx === arr.length - 1;
                        
                        return (
                           <div key={idx} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                 <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-300'}`}>
                                    {isActive ? <Check className="w-3 h-3" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                                 </div>
                                 {!isLast && <div className={`w-0.5 h-12 transition-all ${isActive && idx < currentStepIdx ? 'bg-blue-600' : 'bg-slate-100'}`} />}
                              </div>
                              <div className="pt-0.5">
                                 <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</p>
                                 {isActive && idx === currentStepIdx && <p className="text-[9px] font-bold text-blue-500 uppercase">Current Protocol</p>}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* Case Details */}
               <div className="md:col-span-2 space-y-8">
                  <section className="space-y-4">
                     <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <FileText className="w-3.5 h-3.5 text-blue-500" />
                           Official Briefing
                        </h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-monoital">Severity_Node: {selectedFIR.severity}</span>
                     </div>
                     <div className="bg-slate-50 border border-slate-200 p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                           <ShieldAlert className="w-24 h-24" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4 uppercase italic font-monoital underline">{selectedFIR.title}</h3>
                        <p className="text-slate-600 font-semibold leading-relaxed italic text-sm">{selectedFIR.description}</p>
                     </div>
                  </section>

                  {/* Resolution Statement */}
                  {selectedFIR.policeNotes && (
                     <section className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-2 italic font-monoital">
                           <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                           Final Investigative Summary
                        </h4>
                        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] relative shadow-inner">
                           <p className="text-emerald-900 font-bold leading-relaxed italic text-sm">{selectedFIR.policeNotes}</p>
                           <div className="mt-6 flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                 <User className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none mb-1 underline">Authorized Signature</p>
                                 <p className="text-xs font-bold text-emerald-600">Officer {selectedFIR.assignedOfficer?.name || 'Assigned Agent'}</p>
                              </div>
                           </div>
                        </div>
                     </section>
                  )}

                  <div className="grid grid-cols-2 gap-6 pt-4">
                     <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl italic font-monoital">
                        <Calendar className="w-5 h-5 text-blue-500 shrink-0 " />
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported_On</p>
                           <p className="text-xs font-bold text-slate-700">{format(new Date(selectedFIR.createdAt), 'MMM dd, yyyy')}</p>
                        </div>
                     </div>
                     <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl italic font-monoital">
                        <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident_Locale</p>
                           <p className="text-xs font-bold text-slate-700">Central Precinct</p>
                        </div>
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

export default CitizenDashboard;
