import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import { 
  LogOut, 
  Shield, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Inbox, 
  ChevronRight, 
  FileText,
  Search,
  Filter,
  User,
  MapPin,
  Calendar,
  Download,
  ExternalLink,
  ClipboardList,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const PoliceDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFIR, setSelectedFIR] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [isConcludeModalOpen, setIsConcludeModalOpen] = useState(false);
  const [concludingFIR, setConcludingFIR] = useState(null);
  const [finalNotes, setFinalNotes] = useState('');

  // Management State
  const [updating, setUpdating] = useState(false);
  const [managementForm, setManagementForm] = useState({
    status: '',
    policeNotes: '',
    severity: ''
  });

  const API_URL = 'http://localhost:5000'; // Base URL for evidence links

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sync form when modal opens
  useEffect(() => {
    if (selectedFIR) {
      setManagementForm({
        status: selectedFIR.status,
        policeNotes: selectedFIR.policeNotes || '',
        severity: selectedFIR.severity
      });
    }
  }, [selectedFIR]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/dashboard/police');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to synchronize with Central Dispatch');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (fir) => {
    setSelectedFIR(fir);
    setIsModalOpen(true);
  };

  const handleConcludeClick = (e, fir) => {
    e.stopPropagation();
    setConcludingFIR(fir);
    setFinalNotes('');
    setIsConcludeModalOpen(true);
  };

  const handleConcludeSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await axiosInstance.patch(`/fir/${concludingFIR._id}/status`, {
        status: 'resolved',
        policeNotes: finalNotes || 'Investigation concluded successfully.'
      });
      if (res.data.success) {
        toast.success(`Case ${concludingFIR.firNumber} successfully resolved.`);
        setIsConcludeModalOpen(false);
        fetchStats();
      }
    } catch (error) {
      toast.error('Conclusion protocol failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Decrypting Police Records...</p>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const recentFIRs = stats?.myRecentFIRs || [];
  const unassignedFIRs = stats?.unassignedFIRs || [];

  const handleClaimCase = async (firId) => {
    try {
      setUpdating(true);
      const res = await axiosInstance.patch(`/fir/${firId}/status`, {
        assignedOfficer: user._id,
        status: 'investigating',
        remarks: 'Officer claimed case from central dispatch.'
      });
      if (res.data.success) {
        toast.success('Investigation Claimed. Standard operational protocols engaged.');
        fetchDashboardData();
        if (isModalOpen) setIsModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signal lost during recruitment.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await axiosInstance.patch(`/fir/${selectedFIR._id}/status`, {
        ...managementForm,
        remarks: `Manual status update by Officer ${user.name}`
      });
      if (res.data.success) {
        toast.success('Case Log Synchronized.');
        fetchDashboardData();
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error('Failed to update case manifest.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Officer Command Header */}
      <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center border-4 border-slate-700 shadow-2xl shrink-0 group">
              <Shield className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="badge-blue !bg-blue-500/20 !text-blue-400 !border-blue-500/30 uppercase text-[10px] font-black tracking-widest">Active Duty</span>
                <span className="text-slate-500 font-bold text-xs uppercase tracking-tighter">Precinct: {user?.policeStation?.name || 'Central'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
                Dispatch Portal
              </h1>
              <p className="text-slate-400 text-lg font-medium">
                Officer {user?.name} <span className="text-slate-600 mx-2">|</span> ID: {user?.badgeNumber || 'UNASSIGNED'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <button 
               className="bg-slate-800 hover:bg-slate-700 text-white py-3 px-8 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 border border-slate-700/50"
               onClick={logout}
             >
                <LogOut className="w-5 h-5 text-rose-500" />
                End Shift
             </button>
          </div>
        </div>
      </div>

      {/* Operational Metrics Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Assigned', value: overview.myAssigned || 0, icon: <Inbox className="w-5 h-5" />, color: 'blue' },
          { label: 'Under Investigation', value: overview.myInvestigating || 0, icon: <Clock className="w-5 h-5" />, color: 'amber' },
          { label: 'Successfully Resolved', value: overview.myResolved || 0, icon: <CheckCircle2 className="w-5 h-5" />, color: 'emerald' },
          { label: 'Unassigned Emergency', value: overview.totalUnassigned || 0, icon: <AlertTriangle className="w-5 h-5" />, color: 'rose' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="card-premium p-6 flex items-center gap-5 bg-white border border-slate-200"
          >
            <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Records Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FileText className="w-6 h-6 text-indigo-500" />
              Active Assignments
            </h3>
            <div className="flex gap-4 items-center">
               <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setShowResolved(false)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!showResolved ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Active
                  </button>
                  <button 
                    onClick={() => setShowResolved(true)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showResolved ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Resolved
                  </button>
               </div>
               <div className="flex gap-2">
                  <button className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"><Search className="w-4 h-4 text-slate-600" /></button>
               </div>
            </div>
          </div>

          <div className="card-premium overflow-hidden border border-slate-200 bg-white">
            {recentFIRs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 italic">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Case ID</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Classification</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentFIRs
                      .filter(fir => showResolved ? (fir.status === 'resolved' || fir.status === 'closed') : (fir.status !== 'resolved' && fir.status !== 'closed'))
                      .map((fir) => (
                      <tr 
                        key={fir._id} 
                        onClick={() => handleViewDetails(fir)}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            {fir.firNumber || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-700 capitalize">{fir.crimeCategory}</span>
                             <span className={`text-[10px] font-bold ${fir.isUrgent ? 'text-rose-500' : 'text-slate-400'}`}>
                               {fir.isUrgent ? '• HIGH PRIORITY' : '• Routine Inquiry'}
                             </span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-600 line-clamp-1 max-w-[200px]">{fir.title}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`badge-blue lowercase text-[10px] ${
                             fir.status === 'investigating' ? '!bg-amber-100 !text-amber-700 !border-amber-200' :
                             fir.status === 'resolved' ? '!bg-emerald-600 !text-white !border-none px-3 py-1 font-black shadow-lg shadow-emerald-100' :
                             '!bg-blue-100 !text-blue-700 !border-blue-200'
                           }`}>
                             {fir.status.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-3">
                              {!showResolved && (
                                 <button 
                                    onClick={(e) => handleConcludeClick(e, fir)}
                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 group/btn"
                                    title="Conclude Investigation"
                                 >
                                    <Check className="w-4 h-4" />
                                 </button>
                              )}
                              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                           </div>
                        </td>
                     </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                 <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8" />
                 </div>
                 <h4 className="text-lg font-bold text-slate-800">No active cases assigned</h4>
                 <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm font-medium">Your assigned records will populate here once headquarters confirms dispatch.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
           <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 px-2">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
              Central Dispatch
           </h3>
           
           <div className="space-y-4">
              {unassignedFIRs.length > 0 ? (
                unassignedFIRs.map((fir) => (
                  <motion.div 
                    key={fir._id}
                    whileHover={{ scale: 1.02 }}
                    className="card-premium p-5 border-l-4 border-l-rose-500 flex flex-col bg-white overflow-hidden relative"
                  >
                     <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest italic ${fir.isUrgent ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                           {fir.isUrgent ? 'Emergency Signal' : 'Standard Dispatch'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{format(new Date(fir.createdAt), 'MMM dd, HH:mm')}</span>
                     </div>
                     <h4 className="text-sm font-bold text-slate-800 mb-1 leading-snug">{fir.title}</h4>
                     <p className="text-xs font-medium text-slate-500 mb-4">{fir.crimeCategory} · {fir.complainant?.name}</p>
                     
                     <button 
                        onClick={() => handleClaimCase(fir._id)}
                        disabled={updating}
                        className="w-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 disabled:opacity-50"
                     >
                        {updating ? 'Processing...' : 'Claim Investigation'}
                     </button>
                  </motion.div>
                ))
              ) : (
                 <div className="card-premium p-8 text-center bg-emerald-50/50 border-emerald-100 border-dashed border-2">
                    <p className="text-sm font-bold text-emerald-800">Clear Deck</p>
                    <p className="text-[10px] font-medium text-emerald-600 mt-1 uppercase tracking-wider">No pending unassigned cases</p>
                 </div>
              )}
           </div>

           <div className="card-premium p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-200">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-4 italic leading-none">Intelligence Briefing</p>
              <h4 className="text-lg font-bold leading-tight mb-4">You have resolved {overview.myResolved || 0} cases this quarter.</h4>
              <p className="text-sm font-medium text-indigo-100/80 leading-relaxed">Your efficiency rating is currently <span className="text-white font-black underline decoration-indigo-400 decoration-2 underline-offset-4">Top 5%</span> within this precinct.</p>
           </div>
        </div>
      </div>

      {/* FIR Detail Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Case Record: ${selectedFIR?.firNumber || ''}`}
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
                           <p className="text-sm font-bold text-slate-800">{selectedFIR.complainant?.phone || 'Private Number'}</p>
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

                  {/* Case Management (Only shown for assigned officer) */}
                  {(selectedFIR.assignedOfficer?._id === user._id || selectedFIR.assignedOfficer === user._id) ? (
                    <section className="space-y-6 pt-6 border-t border-slate-100">
                       <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-2">
                          <Shield className="w-5 h-5 text-indigo-600" />
                          Investigation Management
                       </h3>
                       <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-800">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Case Status</label>
                             <select 
                                className="input-field !bg-slate-800 !border-slate-700 !text-white"
                                value={managementForm.status}
                                onChange={(e) => setManagementForm({...managementForm, status: e.target.value})}
                             >
                                <option value="under_review">Under Review</option>
                                <option value="investigating">Under Investigation</option>
                                <option value="resolved">Case Resolved</option>
                                <option value="closed">Closed/Archived</option>
                                <option value="rejected">Rejected/Invalid</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Threat Severity</label>
                             <select 
                                className="input-field !bg-slate-800 !border-slate-700 !text-white"
                                value={managementForm.severity}
                                onChange={(e) => setManagementForm({...managementForm, severity: e.target.value})}
                             >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="critical">Critical/Red Alert</option>
                             </select>
                          </div>
                          <div className="md:col-span-2 space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Investigation Notes</label>
                             <textarea 
                                className="input-field !bg-slate-800 !border-slate-700 !text-white h-32"
                                placeholder="Enter confidential case notes here..."
                                value={managementForm.policeNotes}
                                onChange={(e) => setManagementForm({...managementForm, policeNotes: e.target.value})}
                             />
                          </div>
                          <div className="md:col-span-2">
                             <button 
                                type="submit"
                                disabled={updating}
                                className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40 disabled:opacity-50"
                             >
                                {updating ? 'Encrypting Update...' : 'Update Case Files'}
                             </button>
                          </div>
                       </form>
                    </section>
                  ) : !selectedFIR.assignedOfficer && (
                    <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl text-center">
                        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-rose-900 mb-2 uppercase tracking-tight italic">Case Unclaimed</h4>
                        <p className="text-rose-700 text-sm font-medium mb-6">This record is currently in the unassigned pool. No investigation has started.</p>
                        <button 
                           onClick={() => handleClaimCase(selectedFIR._id)}
                           disabled={updating}
                           className="bg-rose-500 text-white py-4 px-10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 disabled:opacity-50"
                        >
                           {updating ? 'Processing Claim...' : 'Take Ownership of Case'}
                        </button>
                    </div>
                  )}
               </div>

               {/* Right Column: Meta Info */}
               <div className="space-y-8">
                  <div className="card-premium p-6 border border-slate-200 bg-slate-50/30">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Incident Logs</h4>
                     <div className="space-y-6">
                        <div className="flex gap-4">
                           <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date/Time</p>
                              <p className="text-xs font-bold text-slate-700">{format(new Date(selectedFIR.incidentDate), 'MMM dd, yyyy')}</p>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Geolocation</p>
                              <p className="text-xs font-bold text-slate-700 leading-snug">{selectedFIR.location?.address}, {selectedFIR.location?.city}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Evidence Vault */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                        Evidence Vault
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

      {/* Conclude Investigation Modal */}
      <Modal
        isOpen={isConcludeModalOpen}
        onClose={() => setIsConcludeModalOpen(false)}
        title="Conclude Investigation Protocol"
      >
        <div className="space-y-8">
           <div className="flex items-center gap-4 bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100">
                 <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-emerald-900 tracking-tight italic uppercase">Finalize Report</h3>
                 <p className="text-emerald-700 text-xs font-semibold">Confirming the resolution of Case ID: {concludingFIR?.firNumber}</p>
              </div>
           </div>

           <form onSubmit={handleConcludeSubmit} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Final Investigative Statement (Public)</label>
                 <textarea 
                    className="input-field h-40 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter the official closing statement for the citizen..."
                    required
                    value={finalNotes}
                    onChange={(e) => setFinalNotes(e.target.value)}
                 />
                 <p className="text-[10px] font-bold text-slate-400 italic">This statement will be visible to the complainant in their Portal.</p>
              </div>

              <div className="flex gap-4 pt-4">
                 <button 
                    type="button"
                    onClick={() => setIsConcludeModalOpen(false)}
                    className="flex-1 px-8 py-5 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all font-monoital italic"
                 >
                    Cancel
                 </button>
                 <button 
                    type="submit"
                    disabled={updating}
                    className="flex-[2] bg-emerald-600 text-white px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50 font-monoital underline italic"
                 >
                    {updating ? 'Encrypting Final Entry...' : 'Officially Conclude Investigation'}
                 </button>
              </div>
           </form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default PoliceDashboard;
