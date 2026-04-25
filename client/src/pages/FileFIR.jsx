import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { MapPin, FileText, UploadCloud, AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

const FileFIR = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    crimeCategory: 'theft',
    incidentDate: '',
    incidentTime: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
    isUrgent: false,
    isAnonymous: false,
  });

  const [evidenceFiles, setEvidenceFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('location.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        location: { ...formData.location, [field]: value }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleFileChange = (e) => {
    setEvidenceFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('crimeCategory', formData.crimeCategory);
      data.append('incidentDate', formData.incidentDate);
      if (formData.incidentTime) data.append('incidentTime', formData.incidentTime);
      data.append('location', JSON.stringify(formData.location));
      data.append('isUrgent', formData.isUrgent);
      data.append('isAnonymous', formData.isAnonymous);

      if (evidenceFiles.length > 0) {
        evidenceFiles.forEach((file) => {
          data.append('evidence', file);
        });
      }

      await axiosInstance.post('/fir', data);

      toast.success('FIR filed securely on the Blockchain Database!');
      navigate('/citizen', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to file FIR');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/citizen')} className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-slate-500 hover:text-indigo-600 border border-slate-200">
           <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             Register Formal Complaint
          </h1>
          <p className="text-slate-500 font-medium">Under Section 154 CrPC. False reports are severely penalized.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-premium p-8 sm:p-10 space-y-10">
        
        {/* Dynamic Context API Panel */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl flex items-start gap-4 border border-indigo-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mt-10 -mr-10"></div>
          <AlertCircle className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5 relative z-10" />
          <div className="relative z-10">
             <h4 className="font-bold text-indigo-900 mb-1">Automated Police Dispatch Notifier Enabled</h4>
             <p className="text-sm text-indigo-800 leading-relaxed font-medium">
               External APIs configured: Submitting this securely routes a Twilio SMS payload instantly to your registered mobile and broadcasts the Pin-code to Precinct Geo-trackers.
             </p>
          </div>
        </div>

        {/* Overview Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">1</div>
            <h2 className="text-xl font-bold text-slate-800">Incident Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 sm:pl-11">
            <div className="md:col-span-2 space-y-1">
              <label className="input-label" htmlFor="title">Incident Subject</label>
              <input type="text" id="title" name="title" required className="input-field shadow-none border-slate-300 bg-white" placeholder="e.g. Stolen Wallet at Central Park Pavilion" value={formData.title} onChange={handleChange} />
            </div>

            <div className="space-y-1">
              <label className="input-label" htmlFor="crimeCategory">Category</label>
              <select id="crimeCategory" name="crimeCategory" required className="input-field shadow-none border-slate-300 bg-white" value={formData.crimeCategory} onChange={handleChange}>
                <option value="theft">Theft / Robbery</option>
                <option value="cybercrime">Cyber Security Fraud</option>
                <option value="assault">Physical Assault</option>
                <option value="missing_person">Missing Person</option>
                <option value="vandalism">Vandalism</option>
                <option value="other">Other Category</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="input-label" htmlFor="incidentDate">Date</label>
                  <input type="date" id="incidentDate" name="incidentDate" required className="input-field shadow-none border-slate-300 bg-white" value={formData.incidentDate} max={new Date().toISOString().split('T')[0]} onChange={handleChange} />
               </div>
               <div className="space-y-1">
                  <label className="input-label" htmlFor="incidentTime">Time</label>
                  <input type="time" id="incidentTime" name="incidentTime" className="input-field shadow-none border-slate-300 bg-white" value={formData.incidentTime} onChange={handleChange} />
               </div>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="input-label" htmlFor="description">Comprehensive Statement</label>
              <textarea id="description" name="description" required minLength="20" rows={5} className="input-field shadow-none border-slate-300 bg-white resize-none" placeholder="Provide every possible identifying detail about the event..." value={formData.description} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">2</div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">Geolocation Matrix <MapPin className="w-5 h-5 text-indigo-500" /></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 sm:pl-11">
            <div className="md:col-span-2 space-y-1">
              <label className="input-label" htmlFor="address">Exact Street Address</label>
              <input type="text" id="address" name="location.address" required className="input-field shadow-none border-slate-300 bg-white" placeholder="Street layout and adjacent landmarks" value={formData.location.address} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="input-label" htmlFor="city">Jurisdiction / City</label>
              <input type="text" id="city" name="location.city" className="input-field shadow-none border-slate-300 bg-white" value={formData.location.city} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="input-label" htmlFor="state">State</label>
                <input type="text" id="state" name="location.state" className="input-field shadow-none border-slate-300 bg-white" value={formData.location.state} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="input-label" htmlFor="pincode">Pincode</label>
                <input type="text" id="pincode" name="location.pincode" className="input-field shadow-none border-slate-300 bg-white" value={formData.location.pincode} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Evidence & Configs */}
        <div className="space-y-6 pt-4">
           <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">3</div>
            <h2 className="text-xl font-bold text-slate-800">Evidence Vault</h2>
          </div>
          
          <div className="pl-0 sm:pl-11 space-y-8">
            <div>
              <div className="mt-2 flex justify-center px-6 pt-8 pb-10 border-2 border-slate-300 border-dashed rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group hover:border-indigo-400">
                <div className="space-y-2 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label htmlFor="evidence" className="relative cursor-pointer rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload official documents</span>
                      <input id="evidence" name="evidence" type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.mp4" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1 text-slate-500 font-medium">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {evidenceFiles.length > 0 ? (
                      <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">{evidenceFiles.length} file(s) attached securely</span>
                    ) : 'PNG, JPG, PDF, MP4 up to 10MB'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center p-1">
                  <input type="checkbox" name="isUrgent" className="peer w-6 h-6 text-rose-600 rounded-lg border-slate-300 bg-white focus:ring-rose-500/30 checked:border-rose-600 outline-none transition-all cursor-pointer shadow-sm appearance-none" checked={formData.isUrgent} onChange={handleChange} />
                  <ShieldAlert className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" />
                </div>
                <div>
                  <span className="text-slate-800 font-bold leading-none block mt-1">Mark Priority As Critical</span>
                  <span className="text-sm text-slate-500 font-medium tracking-tight">Requires immediate attention from dispatch.</span>
                </div>
              </label>
              
              <label className="flex items-start gap-4 cursor-pointer">
                <div className="relative flex items-center justify-center p-1">
                  <input type="checkbox" name="isAnonymous" className="peer w-6 h-6 text-slate-900 rounded-lg border-slate-300 bg-white focus:ring-slate-900/30 checked:border-slate-900 outline-none transition-all cursor-pointer shadow-sm appearance-none" checked={formData.isAnonymous} onChange={handleChange} />
                  <ShieldAlert className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" />
                </div>
                <div>
                  <span className="text-slate-800 font-bold leading-none block mt-1">Conceal Identity</span>
                  <span className="text-sm text-slate-500 font-medium tracking-tight">Masks name globally from non-admin officers.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-5 text-xl tracking-tight shadow-xl group">
            {isSubmitting ? (
              <span className="flex justify-center items-center gap-2">
                 <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Encrypting Payload...
              </span>
            ) : "Submit Official Legal Report"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default FileFIR;
