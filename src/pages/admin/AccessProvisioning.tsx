import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Search, Plus, Edit2, Car, Phone, User, Cpu, Save, X, AlertCircle,
  Eye, RefreshCw, CheckCircle2, ChevronRight, ChevronLeft, Lock, Users, Copy, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, doc, setDoc, getDocs, query } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { indianStates } from '../../data/indianStates';
import { TelemetrySyncService } from '../../services/TelemetrySyncService';
import { cn } from '../../lib/utils';

export default function AccessProvisioning() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [resetPasswordState, setResetPasswordState] = useState<any>(null);

  // Provisioning Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // View Profile Modal
  const [viewCustomer, setViewCustomer] = useState<any>(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: '', email: '', state: '', district: '', city: '', pinCode: '',
    deviceId: '', deviceSerial: '', vehicleReg: '', installDate: new Date().toISOString().split('T')[0],
    vehicleType: 'Four-Wheeler', company: '', brand: '', model: '', color: '',
    c1Name: '', c1Rel: 'Father', c1Mobile: '+91',
    c2Name: '', c2Rel: 'Mother', c2Mobile: '+91',
    c3Name: '', c3Rel: 'Brother', c3Mobile: '+91',
    role: 'Customer',
    customerId: '',
    familyId: '',
    generatedPassword: ''
  });

  const availableDistricts = useMemo(() => {
    return formData.state ? (indianStates[formData.state] || []) : [];
  }, [formData.state]);

  const [isFetchingPin, setIsFetchingPin] = useState(false);

  useEffect(() => {
    if (formData.pinCode && formData.pinCode.length === 6) {
      const fetchLocation = async () => {
        setIsFetchingPin(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pinCode}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            const state = postOffice.State;
            const district = postOffice.District;
            const city = postOffice.Block !== 'NA' ? postOffice.Block : postOffice.Name;

            setFormData(prev => ({
              ...prev,
              state: Object.keys(indianStates).includes(state) ? state : prev.state,
              district: district || prev.district,
              city: city || prev.city
            }));
          }
        } catch (e) {
          console.error("PIN fetch error", e);
        } finally {
          setIsFetchingPin(false);
        }
      };
      fetchLocation();
    }
  }, [formData.pinCode]);

  const fetchCustomers = async () => {
    setLoading(true);
    let custData: any[] = [];
    try {
      TelemetrySyncService.initialize();
      if (isFirebaseConfigured && db) {
        const q = query(collection(db, 'customers'));
        const querySnapshot = await getDocs(q);
        custData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (dbErr: any) {
      console.warn('Firestore fetch failed:', dbErr.message);
    }
    
    // Merge with TelemetrySyncService data
    try {
       const synced = TelemetrySyncService.getCustomers();
       const merged = [...custData];
       synced.forEach((l: any) => {
         if (!merged.find(m => (m.customerId || m.id) === (l.customerId || l.id))) {
            merged.push({
              ...l,
              id: l.customerId || l.id,
              vehicle: { regNo: l.vehicleReg, model: l.vehicleModel },
              device: { id: l.deviceId, serial: l.deviceSerial || '9596001' },
              address: { city: l.city, state: l.state, district: l.district || l.city, pinCode: l.pinCode || '110001' }
            });
         }
       });
       setCustomers(merged);
    } catch (e) {
       setCustomers(custData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleOpenProvisionModal = () => {
    const count = customers.length + 1;
    const seq = count.toString().padStart(3, '0');
    
    setFormData({
      name: '', email: '', state: '', district: '', city: '', pinCode: '',
      deviceId: `OBD/${seq}`, deviceSerial: `9596${seq}`, 
      vehicleReg: '', installDate: new Date().toISOString().split('T')[0],
      vehicleType: 'Four-Wheeler', company: '', brand: '', model: '', color: '',
      c1Name: '', c1Rel: 'Father', c1Mobile: '+91',
      c2Name: '', c2Rel: 'Mother', c2Mobile: '+91',
      c3Name: '', c3Rel: 'Brother', c3Mobile: '+91',
      role: 'Customer',
      customerId: `USR${Date.now().toString().slice(-6)}`,
      familyId: `FAM${Math.floor(1000 + Math.random() * 9000)}`,
      generatedPassword: ''
    });
    setValidationError('');
    setCurrentStep(1);
    setProvisionSuccess(false);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'state') {
       setFormData(prev => ({ ...prev, [name]: value, district: '' }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
    setValidationError('');
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.name.trim()) { setValidationError('Full Name is required'); return false; }
      if (!formData.email.trim() || !formData.email.includes('@')) { setValidationError('A valid Email address is required'); return false; }
      if (!formData.state) { setValidationError('State is required'); return false; }
    }
    if (step === 2) {
      if (!formData.vehicleReg.trim()) { setValidationError('Vehicle Registration Number is required'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setValidationError('');
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setValidationError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleGenerateAccess = async () => {
    setIsProvisioning(true);
    const pass = generatePassword();
    setFormData(prev => ({ ...prev, generatedPassword: pass }));

    const newRecord = {
      customerId: formData.customerId,
      familyId: formData.familyId,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'active',
      vehicle: {
        regNo: formData.vehicleReg.toUpperCase(),
        vehicleType: formData.vehicleType,
        company: formData.company,
        brand: formData.brand,
        model: formData.model,
        color: formData.color,
        installDate: formData.installDate
      },
      device: {
        id: formData.deviceId,
        serial: formData.deviceSerial
      },
      address: {
        state: formData.state,
        district: formData.district,
        city: formData.city,
        pinCode: formData.pinCode
      },
      emergencyContacts: [
        { name: formData.c1Name, relation: formData.c1Rel, mobile: formData.c1Mobile },
        { name: formData.c2Name, relation: formData.c2Rel, mobile: formData.c2Mobile },
        { name: formData.c3Name, relation: formData.c3Rel, mobile: formData.c3Mobile }
      ].filter(c => c.name && c.mobile),
      requiresPasswordChange: true,
      temporaryPassword: pass,
      createdAt: new Date().toISOString()
    };

    try {
      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'customers', formData.customerId), newRecord);
      }
      
      const updated = [newRecord, ...customers];
      setCustomers(updated);
      setProvisionSuccess(true);
      setCurrentStep(5);
    } catch (error) {
      console.error("Error provisioning:", error);
      alert("Failed to provision access.");
    } finally {
      setIsProvisioning(false);
    }
  };

  const confirmResetPassword = async (customerId: string) => {
    setIsProvisioning(true);
    const pass = generatePassword();
    try {
      setResetPasswordState({ customerId, newPassword: pass });
      setCustomers(customers.map(c => (c.customerId || c.id) === customerId ? { ...c, requiresPasswordChange: true } : c));
      if (viewCustomer) setViewCustomer({ ...viewCustomer, requiresPasswordChange: true });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleToggleStatus = async (customerId: string, status: string) => {
    setIsProvisioning(true);
    try {
      setCustomers(customers.map(c => (c.customerId || c.id) === customerId ? { ...c, status } : c));
      if (viewCustomer) setViewCustomer({ ...viewCustomer, status });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProvisioning(false);
    }
  };

  const filtered = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    const reg = c.vehicle?.regNo || c.vehicleReg || '';
    const dev = c.device?.id || c.deviceId || '';
    return (
      (c.name || '').toLowerCase().includes(q) || 
      (c.customerId || c.id || '').toLowerCase().includes(q) ||
      (c.familyId || '').toLowerCase().includes(q) ||
      reg.toLowerCase().includes(q) ||
      dev.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full pb-20 font-sans flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={13} /> Access Control & Hardware Provisioning
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Subscriber & Transponder Provisioning
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage and provision credentials for IoT hardware and verified driver accounts.</p>
        </div>
        <button 
          onClick={handleOpenProvisionModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md text-xs sm:text-sm shrink-0"
        >
          <Plus size={16} />
          New Provisioning
        </button>
      </div>

      <div className="bolt-card border border-slate-800 rounded-2xl overflow-hidden flex flex-col relative z-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID, Name, Vehicle (e.g. DL 01 AK 4921)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white placeholder:text-slate-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-mono text-slate-300 border border-slate-700">
            Total: <strong className="text-white">{filtered.length}</strong>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="animate-spin text-blue-400" size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ShieldCheck size={40} className="mb-3 opacity-40 text-slate-500" />
              <p className="text-xs font-semibold text-slate-300">No provisioned subscriber accesses found.</p>
              <button onClick={handleOpenProvisionModal} className="mt-3 text-blue-400 hover:underline text-xs font-bold">
                Provision New Hardware Account
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead className="bg-slate-900/90 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer ID</th>
                  <th className="p-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Family ID</th>
                  <th className="p-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Name & Email</th>
                  <th className="p-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle & Device</th>
                  <th className="p-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
                  <th className="p-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((customer) => {
                  const custId = customer.customerId || customer.id;
                  const regNo = customer.vehicle?.regNo || customer.vehicleReg || 'DL 01 AK 4921';
                  const devId = customer.device?.id || customer.deviceId || 'OBD-3.0-DEL';
                  const city = customer.address?.city || customer.city || 'New Delhi';
                  const state = customer.address?.state || customer.state || 'Delhi';
                  const famId = customer.familyId || `FAM${custId.replace(/\D/g, '').slice(-4) || '1001'}`;

                  return (
                    <tr key={customer.id || custId} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono text-xs text-blue-400 bg-blue-950/80 border border-blue-500/30 px-2.5 py-0.5 rounded font-bold">
                          {custId}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-xs text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-2.5 py-0.5 rounded font-bold">
                          {famId}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{customer.name}</span>
                          <span className="text-[11px] text-slate-400">{customer.email}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-slate-200">{regNo}</span>
                          <span className="text-[11px] text-cyan-400 font-mono">Device: {devId}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-xs text-slate-300">
                        {city}, {state}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          ACTIVE
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button 
                          onClick={() => setViewCustomer(customer)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Provisioning Multi-Step Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bolt-card border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white"
            >
              <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <ShieldCheck className="text-blue-400" size={20} /> 
                    {provisionSuccess ? 'Access Granted Successfully' : 'Provision New Transponder & Account'}
                  </h2>
                  {!provisionSuccess && (
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4].map(step => (
                        <div key={step} className="flex items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === step ? 'bg-blue-600 text-white' : currentStep > step ? 'bg-blue-950 text-blue-400 border border-blue-500/40' : 'bg-slate-800 text-slate-500'}`}>
                            {currentStep > step ? <CheckCircle2 size={10} /> : step}
                          </div>
                          {step < 4 && <div className={`w-6 h-0.5 ${currentStep > step ? 'bg-blue-500' : 'bg-slate-800'}`} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {!isProvisioning && (
                  <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {validationError && (
                  <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl flex items-start gap-2 text-red-300 text-xs">
                    <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
                    <p>{validationError}</p>
                  </div>
                )}

                {/* STEP 1: Basic Info & Location */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">Location & Driver Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Full Driver Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none" placeholder="e.g. Rajesh Malhotra" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Email <span className="text-red-400">*</span></label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none" placeholder="driver@highway.in" required />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">State</label>
                        <select name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none">
                          <option value="">Select State</option>
                          {Object.keys(indianStates).map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">District</label>
                        <select name="district" value={formData.district} onChange={handleInputChange} disabled={!formData.state} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none disabled:opacity-50">
                          <option value="">Select District</option>
                          {availableDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none" placeholder="e.g. Noida / New Delhi" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">PIN Code</label>
                        <div className="relative">
                          <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} maxLength={6} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono" placeholder="6-digit PIN" />
                          {isFetchingPin && <RefreshCw size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-400" />}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Device & Vehicle */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">Hardware Transponder & Vehicle Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Device ID (Auto)</label>
                        <input type="text" name="deviceId" value={formData.deviceId} readOnly className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Device Serial (Auto)</label>
                        <input type="text" name="deviceSerial" value={formData.deviceSerial} readOnly className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Vehicle Registration Number <span className="text-red-400">*</span></label>
                        <input type="text" name="vehicleReg" value={formData.vehicleReg} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:border-blue-500 outline-none" placeholder="e.g. DL 01 AK 4921" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Vehicle Category</label>
                        <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none">
                          <option value="Four-Wheeler">Four-Wheeler (Car / SUV)</option>
                          <option value="Two-Wheeler">Two-Wheeler (Motorcycle / Scooter)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Vehicle Company</label>
                        <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none" placeholder="e.g. Tata Motors, Mahindra, Honda" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Vehicle Brand / Series</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none" placeholder="e.g. Nexon, XUV700, City" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Vehicle Model</label>
                        <input type="text" name="model" value={formData.model} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none" placeholder="e.g. Nexon EV Empowered Plus" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Vehicle Color</label>
                        <input type="text" name="color" value={formData.color} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none" placeholder="e.g. Fearless Red / Pearl White" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Installation Date</label>
                        <input type="date" name="installDate" value={formData.installDate} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Contacts */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">Emergency Golden-Hour Contacts</h3>
                    {[1, 2].map((num) => (
                      <div key={num} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                        <h4 className="text-[11px] font-bold text-blue-400 mb-2">Emergency Contact {num}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <input type="text" name={`c${num}Name`} value={(formData as any)[`c${num}Name`]} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none" placeholder="Contact Name" />
                          </div>
                          <div>
                            <select name={`c${num}Rel`} value={(formData as any)[`c${num}Rel`]} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none">
                              {['Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Friend'].map(rel => (
                                <option key={rel} value={rel}>{rel}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <input type="text" name={`c${num}Mobile`} value={(formData as any)[`c${num}Mobile`]} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none" placeholder="+91..." />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 4: Access Configuration */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">Access Credentials Summary</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900 p-3 rounded-xl border border-blue-500/30">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Customer ID</span>
                        <p className="text-sm font-mono font-bold text-blue-400 mt-1">{formData.customerId}</p>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-indigo-500/30">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Family ID</span>
                        <p className="text-sm font-mono font-bold text-indigo-400 mt-1">{formData.familyId}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-400">Target Vehicle: </span>
                      <strong className="font-mono text-white ml-1">{formData.vehicleReg.toUpperCase()}</strong>
                    </div>
                  </div>
                )}

                {/* STEP 5: Success */}
                {currentStep === 5 && (
                  <div className="flex flex-col items-center justify-center text-center py-4 space-y-4">
                    <div className="w-12 h-12 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Transponder Provisioned!</h3>
                      <p className="text-slate-400 text-xs mt-1">
                        Credentials active. Transponder linked to vehicle telemetry stream.
                      </p>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 w-full text-left space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-slate-400 text-xs">User ID:</span>
                        <span className="font-mono font-bold text-blue-400 text-sm">{formData.customerId}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-slate-400 text-xs">Family ID:</span>
                        <span className="font-mono font-bold text-indigo-400 text-sm">{formData.familyId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">Temporary Password:</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">{formData.generatedPassword}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
                {currentStep < 5 ? (
                  <>
                    <button 
                      onClick={prevStep}
                      disabled={currentStep === 1 || isProvisioning}
                      className="px-4 py-2 flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-40"
                    >
                      <ChevronLeft size={14} /> Back
                    </button>
                    
                    {currentStep < 4 ? (
                      <button 
                        onClick={nextStep}
                        className="px-4 py-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button 
                        onClick={handleGenerateAccess}
                        disabled={isProvisioning}
                        className="px-5 py-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {isProvisioning ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                        {isProvisioning ? 'Generating...' : 'Grant Provisioned Access'}
                      </button>
                    )}
                  </>
                ) : (
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Done & Return to Registry
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Customer Modal */}
      <AnimatePresence>
        {viewCustomer && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bolt-card border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col text-white"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-white">{viewCustomer.name}</h2>
                  <span className="font-mono text-blue-400 text-xs bg-blue-950/80 border border-blue-500/30 px-2 py-0.5 rounded font-bold">
                    {viewCustomer.customerId || viewCustomer.id}
                  </span>
                </div>
                <button onClick={() => setViewCustomer(null)} className="text-slate-400 hover:text-white p-1"><X size={18}/></button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">Driver Name</p><p className="text-xs text-white font-bold mt-0.5">{viewCustomer.name}</p></div>
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">Email</p><p className="text-xs text-slate-300 font-medium mt-0.5">{viewCustomer.email}</p></div>
                  <div className="col-span-2"><p className="text-[10px] text-slate-400 uppercase font-bold">Location</p><p className="text-xs text-slate-200 mt-0.5">{viewCustomer.address?.city || viewCustomer.city}, {viewCustomer.address?.state || viewCustomer.state}</p></div>
                </div>

                <div className="space-y-3">
                   <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hardware Device</p>
                     <p className="text-xs text-cyan-400 font-mono font-bold">ID: {viewCustomer.device?.id || viewCustomer.deviceId}</p>
                   </div>
                   <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Vehicle Specifications</p>
                     <div className="grid grid-cols-2 gap-2 text-xs">
                       <div><span className="text-slate-400">Reg No:</span> <strong className="text-white font-mono">{viewCustomer.vehicle?.regNo || viewCustomer.vehicleReg}</strong></div>
                       <div><span className="text-slate-400">Category:</span> <strong className="text-cyan-400">{viewCustomer.vehicle?.vehicleType || 'Four-Wheeler'}</strong></div>
                       <div><span className="text-slate-400">Company:</span> <strong className="text-white">{viewCustomer.vehicle?.company || 'N/A'}</strong></div>
                       <div><span className="text-slate-400">Brand:</span> <strong className="text-white">{viewCustomer.vehicle?.brand || 'N/A'}</strong></div>
                       <div><span className="text-slate-400">Model:</span> <strong className="text-white">{viewCustomer.vehicle?.model || 'N/A'}</strong></div>
                       <div><span className="text-slate-400">Color:</span> <strong className="text-white">{viewCustomer.vehicle?.color || 'N/A'}</strong></div>
                     </div>
                   </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => confirmResetPassword(viewCustomer.customerId || viewCustomer.id)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    Generate Temporary Reset Password
                  </button>
                </div>
                {resetPasswordState && resetPasswordState.customerId === (viewCustomer.customerId || viewCustomer.id) && (
                  <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-300">Generated Temporary Password:</span>
                    <span className="font-mono text-sm font-bold text-white bg-slate-900 px-3 py-1 rounded border border-slate-700">{resetPasswordState.newPassword}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
