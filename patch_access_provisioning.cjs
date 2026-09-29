const fs = require('fs');

const content = `import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Search, Plus, Edit2, Car, Phone, User, Cpu, Save, X, AlertCircle,
  Eye, RefreshCw, CheckCircle2, ChevronRight, ChevronLeft, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, doc, setDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { indianStates } from '../../data/indianStates';

export default function AccessProvisioning() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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
    // Step 1: Location & Basics
    name: '', email: '', state: '', district: '', city: '', pinCode: '',
    // Step 2: Device & Vehicle
    deviceId: '', deviceSerial: '', vehicleReg: '', installDate: new Date().toISOString().split('T')[0],
    // Step 3: Emergency Contacts
    c1Name: '', c1Rel: 'Father', c1Mobile: '+91',
    c2Name: '', c2Rel: 'Mother', c2Mobile: '+91',
    c3Name: '', c3Rel: 'Brother', c3Mobile: '+91',
    // Step 4: Role & ID
    role: 'Customer',
    customerId: '',
    generatedPassword: ''
  });

  const availableDistricts = useMemo(() => {
    return formData.state ? (indianStates[formData.state] || []) : [];
  }, [formData.state]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    let custData: any[] = [];
    try {
      if (isFirebaseConfigured && db) {
        const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        custData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (dbErr: any) {
      console.warn('Firestore fetch failed:', dbErr.message);
    }
    
    // Also merge from localStorage to prevent loss if Firebase is disconnected
    try {
       const local = JSON.parse(localStorage.getItem('rakshak_customers') || '[]');
       const merged = [...custData];
       local.forEach((l: any) => {
         if (!merged.find(m => m.id === l.id)) {
            merged.push(l);
         }
       });
       setCustomers(merged);
       localStorage.setItem('rakshak_customers', JSON.stringify(merged));
    } catch (e) {
       setCustomers(custData);
    }
    setLoading(false);
  };

  const handleOpenProvisionModal = () => {
    // Determine sequences based on total customers
    const count = customers.length + 1;
    const seq = count.toString().padStart(3, '0');
    
    setFormData({
      name: '', email: '', state: '', district: '', city: '', pinCode: '',
      deviceId: \`OBD/\${seq}\`, deviceSerial: \`9596\${seq}\`, 
      vehicleReg: '', installDate: new Date().toISOString().split('T')[0],
      c1Name: '', c1Rel: 'Father', c1Mobile: '+91',
      c2Name: '', c2Rel: 'Mother', c2Mobile: '+91',
      c3Name: '', c3Rel: 'Brother', c3Mobile: '+91',
      role: 'Customer',
      customerId: \`USR\${Date.now().toString().slice(-6)}\`,
      generatedPassword: ''
    });
    setValidationError('');
    setCurrentStep(1);
    setProvisionSuccess(false);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset district if state changes
    if (name === 'state') {
       setFormData(prev => ({ ...prev, [name]: value, district: '' }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
    setValidationError('');
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setValidationError('');
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const validateStep = (step: number) => {
    switch(step) {
      case 1:
        if (!formData.name || !formData.email || !formData.state || !formData.district || !formData.city || !formData.pinCode) {
          setValidationError('All fields are required.');
          return false;
        }
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$/.test(formData.email)) {
          setValidationError('Invalid email format.');
          return false;
        }
        if (!/^\\d{6}$/.test(formData.pinCode)) {
          setValidationError('PIN code must be exactly 6 digits.');
          return false;
        }
        return true;
      case 2:
        if (!formData.deviceId || !formData.deviceSerial || !formData.vehicleReg || !formData.installDate) {
          setValidationError('All fields are required.');
          return false;
        }
        if (!/^[A-Z]{2}\\s?\\d{1,2}\\s?[A-Z]{1,3}\\s?\\d{4}$/.test(formData.vehicleReg.toUpperCase())) {
          setValidationError('Invalid Vehicle Reg. Use format like UP 31 XX 1234');
          return false;
        }
        return true;
      case 3:
        const phoneRegex = /^\\+91\\d{10}$/;
        if (!formData.c1Name || !formData.c1Rel || !formData.c1Mobile ||
            !formData.c2Name || !formData.c2Rel || !formData.c2Mobile ||
            !formData.c3Name || !formData.c3Rel || !formData.c3Mobile) {
          setValidationError('Please fill all emergency contact details.');
          return false;
        }
        if (!phoneRegex.test(formData.c1Mobile) || !phoneRegex.test(formData.c2Mobile) || !phoneRegex.test(formData.c3Mobile)) {
          setValidationError('Mobile numbers must start with +91 followed by 10 digits.');
          return false;
        }
        return true;
      case 4:
        return !!formData.customerId;
      default: return true;
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleGenerateAccess = async () => {
    setIsProvisioning(true);
    const pass = generatePassword();
    setFormData(prev => ({ ...prev, generatedPassword: pass }));
    
    try {
      const customerData = {
        name: formData.name,
        email: formData.email,
        address: {
          state: formData.state,
          district: formData.district,
          city: formData.city,
          pinCode: formData.pinCode,
        },
        device: {
          id: formData.deviceId,
          serial: formData.deviceSerial,
        },
        vehicle: {
          regNo: formData.vehicleReg.toUpperCase(),
          installDate: formData.installDate,
        },
        emergencyContacts: [
          { name: formData.c1Name, relation: formData.c1Rel, mobile: formData.c1Mobile },
          { name: formData.c2Name, relation: formData.c2Rel, mobile: formData.c2Mobile },
          { name: formData.c3Name, relation: formData.c3Rel, mobile: formData.c3Mobile },
        ],
        role: formData.role,
        customerId: formData.customerId,
        password: pass, // Stored to allow user login demo
        status: 'active',
        createdAt: serverTimestamp()
      };

      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'customers', formData.customerId), customerData);
      }

      // Add to local state
      const localData = { ...customerData, id: formData.customerId, createdAt: new Date().toISOString() };
      const updated = [localData, ...customers];
      setCustomers(updated);
      localStorage.setItem('rakshak_customers', JSON.stringify(updated));

      // Auto-save auth mock for landing page login
      const mockAuth = JSON.parse(localStorage.getItem('rakshak_mock_auth') || '{}');
      mockAuth[formData.customerId] = {
        password: pass,
        role: formData.role.toLowerCase()
      };
      localStorage.setItem('rakshak_mock_auth', JSON.stringify(mockAuth));

      setProvisionSuccess(true);
      setCurrentStep(5); // Success step
    } catch (error) {
      console.error("Error provisioning:", error);
      alert("Failed to provision access. Please try again.");
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-rakshak-cyan" />
            Access Provisioning
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage and provision access for devices and users.</p>
        </div>
        <button 
          onClick={handleOpenProvisionModal}
          className="flex items-center gap-2 bg-rakshak-cyan hover:bg-rakshak-cyan/90 text-slate-900 px-4 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <Plus size={18} />
          New Provisioning
        </button>
      </div>

      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative z-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/80">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Name or Vehicle..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#060D1A] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-rakshak-cyan outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="animate-spin text-slate-500" size={24} />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <ShieldCheck size={48} className="mb-4 opacity-20" />
              <p>No provisioned accesses found.</p>
              <button onClick={handleOpenProvisionModal} className="mt-4 text-rakshak-cyan hover:underline text-sm">
                Create the first one
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-800/50 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Customer ID</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Name & Contact</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Vehicle & Device</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Location</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {customers.filter(c => 
                  c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  c.customerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.vehicle?.regNo?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-sm text-rakshak-cyan bg-rakshak-cyan/10 border border-rakshak-cyan/20 px-2 py-1 rounded">
                        {customer.customerId || customer.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{customer.name}</span>
                        <span className="text-xs text-slate-400">{customer.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono text-white">{customer.vehicle?.regNo}</span>
                        <span className="text-xs text-slate-400">ID: {customer.device?.id}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      {customer.address?.city}, {customer.address?.state}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setViewCustomer(customer)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Provisioning Multi-Step Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#060D1A]/90 backdrop-blur-sm" onClick={() => !isProvisioning && !provisionSuccess && setIsModalOpen(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#0A1122] border border-slate-700/60 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-5 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="text-rakshak-cyan" /> 
                    {provisionSuccess ? 'Access Granted Successfully' : 'Provision New Access'}
                  </h2>
                  {!provisionSuccess && (
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4].map(step => (
                        <div key={step} className="flex items-center">
                          <div className={\`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold \${currentStep === step ? 'bg-rakshak-cyan text-slate-900' : currentStep > step ? 'bg-rakshak-cyan/30 text-rakshak-cyan border border-rakshak-cyan/30' : 'bg-slate-800 text-slate-500'}\`}>
                            {currentStep > step ? <CheckCircle2 size={12} /> : step}
                          </div>
                          {step < 4 && <div className={\`w-8 h-0.5 \${currentStep > step ? 'bg-rakshak-cyan/30' : 'bg-slate-800'}\`} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {!isProvisioning && (
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-900/50 to-[#060D1A]">
                {validationError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p>{validationError}</p>
                  </div>
                )}

                {/* STEP 1: Basic Info & Location */}
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700/50 pb-2 mb-4">Location & Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-rakshak-cyan outline-none" placeholder="Enter full name" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Email <span className="text-red-400">*</span></label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-rakshak-cyan outline-none" placeholder="Required for login" required />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">State</label>
                        <select name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-rakshak-cyan outline-none">
                          <option value="">Select State</option>
                          {Object.keys(indianStates).map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">District</label>
                        <select name="district" value={formData.district} onChange={handleInputChange} disabled={!formData.state} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-rakshak-cyan outline-none disabled:opacity-50">
                          <option value="">Select District</option>
                          {availableDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-rakshak-cyan outline-none" placeholder="Enter city name" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">PIN Code</label>
                        <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} maxLength={6} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-rakshak-cyan outline-none font-mono" placeholder="6-digit PIN" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Device & Vehicle */}
                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700/50 pb-2 mb-4">Device & Vehicle Allocation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Device ID (Auto-generated)</label>
                        <input type="text" name="deviceId" value={formData.deviceId} readOnly className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-300 font-mono opacity-80" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Device Serial (Auto-generated)</label>
                        <input type="text" name="deviceSerial" value={formData.deviceSerial} readOnly className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-300 font-mono opacity-80" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Vehicle Registration</label>
                        <input type="text" name="vehicleReg" value={formData.vehicleReg} onChange={handleInputChange} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-rakshak-cyan outline-none font-mono uppercase" placeholder="e.g. UP 31 XX 1234" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Installation Date</label>
                        <input type="date" name="installDate" value={formData.installDate} onChange={handleInputChange} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-rakshak-cyan outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Contacts */}
                {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700/50 pb-2 mb-4">Emergency Contacts</h3>
                    
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        <h4 className="text-xs font-bold text-rakshak-cyan mb-3">Contact {num}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-medium text-slate-400 mb-1">Name</label>
                            <input type="text" name={\`c\${num}Name\`} value={(formData as any)[\`c\${num}Name\`]} onChange={handleInputChange} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rakshak-cyan outline-none" placeholder="Name" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-slate-400 mb-1">Relationship</label>
                            <select name={\`c\${num}Rel\`} value={(formData as any)[\`c\${num}Rel\`]} onChange={handleInputChange} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rakshak-cyan outline-none">
                              {['Father', 'Mother', 'Brother', 'Sister', 'Wife', 'Husband', 'Cousin', 'Cousin Sister', 'Friend'].map(rel => (
                                <option key={rel} value={rel}>{rel}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-slate-400 mb-1">Mobile</label>
                            <input type="text" name={\`c\${num}Mobile\`} value={(formData as any)[\`c\${num}Mobile\`]} onChange={handleInputChange} maxLength={13} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rakshak-cyan outline-none font-mono" placeholder="+91..." />
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* STEP 4: Access Configuration */}
                {currentStep === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700/50 pb-2 mb-4">Access Roles & Credentials</h3>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Assign Role</label>
                      <select name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-rakshak-cyan outline-none">
                        <option value="Customer">Customer</option>
                        <option value="Owner">Owner</option>
                        <option value="Family">Family</option>
                        <option value="Driver">Driver</option>
                      </select>
                    </div>

                    <div className="bg-rakshak-cyan/5 border border-rakshak-cyan/20 rounded-xl p-5 mt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-rakshak-cyan/20 flex items-center justify-center text-rakshak-cyan">
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Generated Customer ID</h4>
                          <p className="text-xs text-slate-400">Used for login and API access</p>
                        </div>
                      </div>
                      <div className="mt-4 bg-[#060D1A] border border-slate-700/50 rounded-lg p-3 flex justify-between items-center">
                        <span className="font-mono text-lg text-rakshak-cyan tracking-widest">{formData.customerId}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: Success */}
                {currentStep === 5 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-500/20">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Access Provisioned!</h3>
                    <p className="text-slate-400 mb-8 max-w-sm">The new user can now log in to their dashboard using the credentials below.</p>
                    
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md text-left">
                      <div className="mb-4">
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">User / Customer ID</label>
                        <div className="text-lg font-mono text-white mt-1">{formData.customerId}</div>
                      </div>
                      <div className="mb-4">
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Login Email</label>
                        <div className="text-lg font-mono text-white mt-1">{formData.email}</div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Generated Password</label>
                        <div className="text-lg font-mono text-rakshak-cyan mt-1 select-all">{formData.generatedPassword}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
                {currentStep < 5 ? (
                  <>
                    <button 
                      onClick={prevStep}
                      disabled={currentStep === 1 || isProvisioning}
                      className="px-4 py-2 flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    
                    {currentStep < 4 ? (
                      <button 
                        onClick={nextStep}
                        className="px-5 py-2 flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={handleGenerateAccess}
                        disabled={isProvisioning}
                        className="px-6 py-2 flex items-center gap-2 bg-rakshak-cyan hover:bg-rakshak-cyan/90 text-slate-900 rounded-lg font-bold transition-colors disabled:opacity-50"
                      >
                        {isProvisioning ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                        {isProvisioning ? 'Generating...' : 'Grant Access'}
                      </button>
                    )}
                  </>
                ) : (
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Close & Return to Dashboard
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
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#060D1A]/90 backdrop-blur-sm" onClick={() => setViewCustomer(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0A1122] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-slate-800/30">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  Customer Profile
                  <span className="font-mono text-rakshak-cyan text-xs bg-rakshak-cyan/10 border border-rakshak-cyan/20 px-2 py-1 rounded">
                    {viewCustomer.customerId || viewCustomer.id}
                  </span>
                </h2>
                <button onClick={() => setViewCustomer(null)} className="text-slate-400 hover:text-white p-1"><X size={20}/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                  <div><p className="text-[10px] text-slate-500 mb-0.5">Name</p><p className="text-sm text-white font-medium">{viewCustomer.name}</p></div>
                  <div><p className="text-[10px] text-slate-500 mb-0.5">Email</p><p className="text-sm text-white">{viewCustomer.email}</p></div>
                  <div className="col-span-2"><p className="text-[10px] text-slate-500 mb-0.5">Location</p><p className="text-sm text-white">{viewCustomer.address?.city}, {viewCustomer.address?.district}, {viewCustomer.address?.state} - {viewCustomer.address?.pinCode}</p></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                     <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Device</h3>
                     <p className="text-xs text-slate-400 mb-1">ID: <span className="font-mono text-white">{viewCustomer.device?.id}</span></p>
                     <p className="text-xs text-slate-400">Serial: <span className="font-mono text-white">{viewCustomer.device?.serial}</span></p>
                   </div>
                   <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                     <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Vehicle</h3>
                     <p className="text-xs text-slate-400 mb-1">Reg: <span className="font-mono text-white">{viewCustomer.vehicle?.regNo}</span></p>
                     <p className="text-xs text-slate-400">Install: <span className="font-mono text-white">{viewCustomer.vehicle?.installDate}</span></p>
                   </div>
                </div>

                {viewCustomer.emergencyContacts && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Emergency Contacts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                       {viewCustomer.emergencyContacts.map((contact: any, i: number) => (
                          <div key={i} className="bg-[#060D1A] p-3 rounded-lg border border-slate-700/50">
                            <p className="text-xs font-bold text-rakshak-cyan">{contact.relation}</p>
                            <p className="text-sm text-white my-0.5">{contact.name}</p>
                            <p className="text-xs font-mono text-slate-400">{contact.mobile}</p>
                          </div>
                       ))}
                    </div>
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
`;

fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', content);
