import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, X, Plus, Trash2, Ambulance, Bed, Stethoscope, 
  MapPin, ShieldAlert, Check, ChevronRight, ChevronLeft, LocateFixed
} from 'lucide-react';
import { indianStates } from '../../../data/indianStates';
import { HospitalDoctor, HospitalType } from '../../../types';

interface RegisterHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (credentials: { hospitalId: string; tempPassword: string; hospitalName: string }) => void;
}

const DEFAULT_SPECIALIZATIONS = [
  'Emergency Trauma Care', 'Orthopedics', 'Cardiology', 'Neurology & Neurosurgery',
  'General Surgery', 'Intensive Care Unit (ICU)', 'Burn Care Unit', 'Pediatrics & NICU',
  'Physiotherapy & Rehab', 'Anesthesiology', 'Radiology & Imaging', 'Critical Care'
];

const DEFAULT_SERVICES = [
  '24/7 Emergency & Trauma', 'Blood Bank (24/7)', 'Advanced Trauma OT', '128-Slice CT Scanner',
  '3T MRI Imaging', 'Cath Lab', 'Digital X-Ray & Ultrasound', 'Dialysis Center',
  'In-House Pathology Lab', '24/7 Pharmacy', 'Emergency Resuscitation Unit'
];

export const RegisterHospitalModal: React.FC<RegisterHospitalModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic Info
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalType, setHospitalType] = useState<HospitalType>('Multi-Specialty');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Delhi');
  const [city, setCity] = useState('New Delhi');
  const [pinCode, setPinCode] = useState('');
  const [latitude, setLatitude] = useState('28.6139');
  const [longitude, setLongitude] = useState('77.2090');
  const [contactNumber, setContactNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  // Step 2: Capacity
  const [totalBeds, setTotalBeds] = useState(100);
  const [availableBeds, setAvailableBeds] = useState(35);
  const [occupiedBeds, setOccupiedBeds] = useState(65);
  const [icuBeds, setIcuBeds] = useState(20);
  const [availableIcuBeds, setAvailableIcuBeds] = useState(6);
  const [emergencyBeds, setEmergencyBeds] = useState(15);
  const [availableEmergencyBeds, setAvailableEmergencyBeds] = useState(5);
  const [ventilators, setVentilators] = useState(12);

  const [totalAmbulances, setTotalAmbulances] = useState(4);
  const [availableAmbulances, setAvailableAmbulances] = useState(3);
  const [emergencyAmbulances, setEmergencyAmbulances] = useState(2);
  const [ambulanceContact, setAmbulanceContact] = useState('');
  const [ambulanceStatus, setAmbulanceStatus] = useState<'Available' | 'On Duty' | 'Standby' | 'Unavailable'>('Available');

  // Step 3: Doctors
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([
    {
      name: 'Dr. Rajesh Sharma',
      specialization: 'Emergency Trauma Specialist',
      department: 'Emergency & Critical Care',
      qualification: 'MBBS, MS (Trauma Surgery)',
      experience: '12 Years',
      availability: '24/7 On-Call',
      contact: '+91 98112 34567',
      emergencyAvailability: true,
      shiftTiming: 'Emergency Shift (24 hrs)',
    },
  ]);

  // Step 4: Specializations & Services
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([
    'Emergency Trauma Care', 'Orthopedics', 'Intensive Care Unit (ICU)', 'Cardiology'
  ]);
  const [customSpec, setCustomSpec] = useState('');

  const [selectedServices, setSelectedServices] = useState<string[]>([
    '24/7 Emergency & Trauma', 'Blood Bank (24/7)', 'Advanced Trauma OT', '128-Slice CT Scanner', '24/7 Pharmacy'
  ]);
  const [customService, setCustomService] = useState('');

  // Step 5: Coverage
  const [coverageAreas, setCoverageAreas] = useState<string[]>([
    'Sector 62', 'Indirapuram', 'Vaishali', 'Noida Electronic City'
  ]);
  const [newArea, setNewArea] = useState('');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(25);

  // Step 6: Emergency Capabilities
  const [capabilities, setCapabilities] = useState({
    emergency24x7: true,
    traumaCenter: true,
    icuAvailable: true,
    ambulanceAvailable: true,
    emergencySurgery: true,
    bloodBank: true,
    ventilatorAvailable: true,
    physiotherapyRehab: true,
    accidentTreatment: true,
    notes: 'Designated level-1 emergency trauma care response center with immediate triage pipeline.'
  });

  const availableCities = useMemo(() => {
    return state ? (indianStates[state] || []) : [];
  }, [state]);

  if (!isOpen) return null;

  const handleAddDoctor = () => {
    setDoctors([
      ...doctors,
      {
        name: '',
        specialization: 'Emergency Medicine',
        department: 'Emergency',
        qualification: 'MBBS',
        experience: '5 Years',
        availability: 'On Call',
        contact: '',
        emergencyAvailability: true,
        shiftTiming: 'Day Shift (08:00 - 16:00)'
      }
    ]);
  };

  const handleRemoveDoctor = (idx: number) => {
    setDoctors(doctors.filter((_, i) => i !== idx));
  };

  const handleUpdateDoctor = (idx: number, field: keyof HospitalDoctor, val: any) => {
    const updated = [...doctors];
    updated[idx] = { ...updated[idx], [field]: val };
    setDoctors(updated);
  };

  const toggleSpec = (spec: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const addCustomSpec = () => {
    if (customSpec.trim() && !selectedSpecializations.includes(customSpec.trim())) {
      setSelectedSpecializations([...selectedSpecializations, customSpec.trim()]);
      setCustomSpec('');
    }
  };

  const toggleService = (srv: string) => {
    setSelectedServices(prev =>
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  const addCustomService = () => {
    if (customService.trim() && !selectedServices.includes(customService.trim())) {
      setSelectedServices([...selectedServices, customService.trim()]);
      setCustomService('');
    }
  };

  const addCoverageArea = () => {
    if (newArea.trim() && !coverageAreas.includes(newArea.trim())) {
      setCoverageAreas([...coverageAreas, newArea.trim()]);
      setNewArea('');
    }
  };

  const removeCoverageArea = (area: string) => {
    setCoverageAreas(coverageAreas.filter(a => a !== area));
  };

  const handleAutoGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(5));
          setLongitude(pos.coords.longitude.toFixed(5));
        },
        () => {
          // fallback default
        }
      );
    }
  };

  const validateStep1 = () => {
    if (!hospitalName.trim()) return 'Hospital Name is required.';
    if (!registrationNumber.trim()) return 'Registration / License Number is required.';
    if (!city.trim()) return 'City is required.';
    if (!contactNumber.trim()) return 'Contact Phone Number is required.';
    if (!emergencyContact.trim()) return 'Emergency Contact is required.';
    if (!email.trim()) return 'Official Email is required.';
    return null;
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const step1Err = validateStep1();
    if (step1Err) {
      setCurrentStep(1);
      setError(step1Err);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        hospitalName: hospitalName.trim(),
        hospitalType,
        registrationNumber: registrationNumber.trim(),
        address: address.trim(),
        state,
        city,
        pinCode: pinCode.trim(),
        latitude: parseFloat(latitude) || 28.6139,
        longitude: parseFloat(longitude) || 77.2090,
        contactNumber: contactNumber.trim(),
        emergencyContact: emergencyContact.trim(),
        email: email.trim(),
        website: website.trim(),
        capacity: {
          totalBeds: Number(totalBeds) || 0,
          availableBeds: Number(availableBeds) || 0,
          occupiedBeds: Number(occupiedBeds) || 0,
          icuBeds: Number(icuBeds) || 0,
          availableIcuBeds: Number(availableIcuBeds) || 0,
          emergencyBeds: Number(emergencyBeds) || 0,
          availableEmergencyBeds: Number(availableEmergencyBeds) || 0,
          ventilators: Number(ventilators) || 0,
        },
        ambulances: {
          total: Number(totalAmbulances) || 0,
          available: Number(availableAmbulances) || 0,
          emergency: Number(emergencyAmbulances) || 0,
          contactNumber: ambulanceContact || contactNumber,
          status: ambulanceStatus,
        },
        doctors: doctors.filter(d => d.name.trim().length > 0),
        specializations: selectedSpecializations,
        services: selectedServices,
        coverageAreas,
        serviceRadiusKm: Number(serviceRadiusKm) || 25,
        emergencyCapabilities: capabilities,
        adminId: 'ADMIN',
      };

      const res = await fetch('/api/admin/hospitals/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      onRegistered({
        hospitalId: data.hospitalId,
        tempPassword: data.tempPassword,
        hospitalName: data.hospital.hospitalName,
      });
    } catch (err: any) {
      setError(err.message || 'Error occurred during hospital registration');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Capacity' },
    { num: 3, label: 'Medical Staff' },
    { num: 4, label: 'Specializations' },
    { num: 5, label: 'Coverage' },
    { num: 6, label: 'Emergency Ready' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">Register New Hospital</h2>
              <p className="text-xs text-slate-400">Operation Rakshak 3.2 — Hospital Access Provisioning</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Strip */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 shrink-0 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[560px] gap-2">
            {stepTitles.map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  if (st.num < currentStep) setCurrentStep(st.num);
                  else if (st.num > currentStep && !validateStep1()) setCurrentStep(st.num);
                }}
                className={`flex items-center gap-2 py-1 px-3 rounded-lg text-xs font-semibold transition ${
                  currentStep === st.num
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : currentStep > st.num
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === st.num ? 'bg-cyan-500 text-slate-950 font-bold' :
                  currentStep > st.num ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {currentStep > st.num ? '✓' : st.num}
                </span>
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200 text-sm">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Hospital Basic Information</h3>
                <p className="text-xs text-slate-400">Essential identifiers and official contact channels</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Hospital Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Apollo Super Specialty Hospital"
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Hospital Type *</label>
                  <select
                    value={hospitalType}
                    onChange={e => setHospitalType(e.target.value as HospitalType)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Trauma Center">Trauma Center</option>
                    <option value="Multi-Specialty">Multi-Specialty</option>
                    <option value="Specialty Hospital">Specialty Hospital</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Registration / License Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., REG-DL-2024-9842"
                    value={registrationNumber}
                    onChange={e => setRegistrationNumber(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Physical Address *</label>
                  <input
                    type="text"
                    placeholder="Plot 12, Institutional Area, Ring Road"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">State *</label>
                  <select
                    value={state}
                    onChange={e => {
                      setState(e.target.value);
                      const cities = indianStates[e.target.value] || [];
                      if (cities.length > 0) setCity(cities[0]);
                    }}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {Object.keys(indianStates).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">City / District *</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {availableCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g., 110001"
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-slate-400">GPS Coordinates (Lat / Lng) *</label>
                    <button
                      type="button"
                      onClick={handleAutoGPS}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <LocateFixed className="w-3 h-3" /> Get Current
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Lat: 28.6139"
                      value={latitude}
                      onChange={e => setLatitude(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      placeholder="Lng: 77.2090"
                      value={longitude}
                      onChange={e => setLongitude(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Main Contact Number *</label>
                  <input
                    type="text"
                    placeholder="+91 11 2345 6789"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Emergency Contact / Helpline (24/7) *</label>
                  <input
                    type="text"
                    placeholder="+91 11 2345 9999 or 102"
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    className="w-full bg-slate-800/80 border border-rose-500/40 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Official Email *</label>
                  <input
                    type="email"
                    placeholder="emergency@apollohospitals.org"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Website (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://www.apollohospitals.com"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Capacity */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <div className="border-b border-slate-800 pb-2 mb-4">
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Ambulance className="w-4 h-4" /> Ambulance Fleet Information
                  </h3>
                  <p className="text-xs text-slate-400">Total fleet sizing and readiness metrics</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Total Ambulances</label>
                    <input
                      type="number"
                      min={0}
                      value={totalAmbulances}
                      onChange={e => setTotalAmbulances(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Available Now</label>
                    <input
                      type="number"
                      min={0}
                      value={availableAmbulances}
                      onChange={e => setAvailableAmbulances(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/80 border border-emerald-500/40 rounded-xl px-3 py-2 text-emerald-300 text-center font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Emergency ALS Units</label>
                    <input
                      type="number"
                      min={0}
                      value={emergencyAmbulances}
                      onChange={e => setEmergencyAmbulances(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Ambulance Dispatch Status</label>
                    <select
                      value={ambulanceStatus}
                      onChange={e => setAmbulanceStatus(e.target.value as any)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Available">Available</option>
                      <option value="On Duty">On Duty</option>
                      <option value="Standby">Standby</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <div className="border-b border-slate-800 pb-2 mb-4">
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Bed className="w-4 h-4" /> Bed & Critical Care Capacity
                  </h3>
                  <p className="text-xs text-slate-400">Total, emergency, ICU, and ventilator capacity</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Total Hospital Beds</label>
                    <input
                      type="number"
                      min={0}
                      value={totalBeds}
                      onChange={e => setTotalBeds(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Available Beds</label>
                    <input
                      type="number"
                      min={0}
                      value={availableBeds}
                      onChange={e => setAvailableBeds(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/80 border border-emerald-500/40 rounded-xl px-3 py-2 text-emerald-300 text-center font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Occupied Beds</label>
                    <input
                      type="number"
                      min={0}
                      value={occupiedBeds}
                      onChange={e => setOccupiedBeds(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Ventilators</label>
                    <input
                      type="number"
                      min={0}
                      value={ventilators}
                      onChange={e => setVentilators(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">ICU Beds (Total)</label>
                    <input
                      type="number"
                      min={0}
                      value={icuBeds}
                      onChange={e => setIcuBeds(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Available ICU Beds</label>
                    <input
                      type="number"
                      min={0}
                      value={availableIcuBeds}
                      onChange={e => setAvailableIcuBeds(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/80 border border-cyan-500/40 rounded-xl px-3 py-2 text-cyan-300 text-center font-bold focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Emergency Trauma Beds</label>
                    <input
                      type="number"
                      min={0}
                      value={emergencyBeds}
                      onChange={e => setEmergencyBeds(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Available Emergency Beds</label>
                    <input
                      type="number"
                      min={0}
                      value={availableEmergencyBeds}
                      onChange={e => setAvailableEmergencyBeds(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/80 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 text-center font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Medical Staff (Doctors) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> Doctors & Medical Staff
                  </h3>
                  <p className="text-xs text-slate-400">Add key physicians, trauma surgeons, and emergency specialists</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDoctor}
                  className="py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Doctor
                </button>
              </div>

              <div className="space-y-4">
                {doctors.map((doc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 relative space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                      <span className="text-xs font-semibold text-slate-300">Doctor #{idx + 1}</span>
                      {doctors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDoctor(idx)}
                          className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Doctor Name</label>
                        <input
                          type="text"
                          placeholder="Dr. Full Name"
                          value={doc.name}
                          onChange={e => handleUpdateDoctor(idx, 'name', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Specialization</label>
                        <input
                          type="text"
                          placeholder="e.g. Trauma Surgery, Neuro"
                          value={doc.specialization}
                          onChange={e => handleUpdateDoctor(idx, 'specialization', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Department</label>
                        <input
                          type="text"
                          placeholder="Emergency / ICU / Ortho"
                          value={doc.department}
                          onChange={e => handleUpdateDoctor(idx, 'department', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Qualification</label>
                        <input
                          type="text"
                          placeholder="MBBS, MS, MCh"
                          value={doc.qualification}
                          onChange={e => handleUpdateDoctor(idx, 'qualification', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Experience</label>
                        <input
                          type="text"
                          placeholder="e.g. 10 Years"
                          value={doc.experience}
                          onChange={e => handleUpdateDoctor(idx, 'experience', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Direct Contact / Extension</label>
                        <input
                          type="text"
                          placeholder="+91 98765 43210"
                          value={doc.contact}
                          onChange={e => handleUpdateDoctor(idx, 'contact', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Shift Timing</label>
                        <input
                          type="text"
                          placeholder="Morning (08-16) / Night"
                          value={doc.shiftTiming}
                          onChange={e => handleUpdateDoctor(idx, 'shiftTiming', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center mt-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={doc.emergencyAvailability}
                            onChange={e => handleUpdateDoctor(idx, 'emergencyAvailability', e.target.checked)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 bg-slate-900"
                          />
                          <span className="text-xs text-slate-300 font-medium">Available for Emergency Critical Response</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Specializations & Services */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <div className="border-b border-slate-800 pb-2 mb-3">
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Clinical Specializations</h3>
                  <p className="text-xs text-slate-400">Select specialties available for SOS accident dispatch routing</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DEFAULT_SPECIALIZATIONS.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpec(spec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        selectedSpecializations.includes(spec)
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {spec} {selectedSpecializations.includes(spec) ? '✓' : '+'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom specialization..."
                    value={customSpec}
                    onChange={e => setCustomSpec(e.target.value)}
                    className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomSpec}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <div className="border-b border-slate-800 pb-2 mb-3">
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Hospital Services & Facilities</h3>
                  <p className="text-xs text-slate-400">Diagnostic, surgical, and life-support amenities</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DEFAULT_SERVICES.map(srv => (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => toggleService(srv)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        selectedServices.includes(srv)
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {srv} {selectedServices.includes(srv) ? '✓' : '+'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom facility / service..."
                    value={customService}
                    onChange={e => setCustomService(e.target.value)}
                    className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomService}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Location & Coverage */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Hospital Coverage & Dispatch Radius
                </h3>
                <p className="text-xs text-slate-400">Nearby localities, sectors, and emergency dispatch bounds</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Primary Emergency Coverage Radius: <span className="text-cyan-400 font-bold">{serviceRadiusKm} km</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={serviceRadiusKm}
                  onChange={e => setServiceRadiusKm(parseInt(e.target.value) || 25)}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>5 km (Local)</span>
                  <span>25 km (Regional Standard)</span>
                  <span>60 km (Inter-City Highway)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Nearby Sectors / Colonies Served</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {coverageAreas.map(area => (
                    <span
                      key={area}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => removeCoverageArea(area)}
                        className="text-slate-400 hover:text-rose-400 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter locality / sector name..."
                    value={newArea}
                    onChange={e => setNewArea(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCoverageArea();
                      }
                    }}
                    className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={addCoverageArea}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold"
                  >
                    + Add Area
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Emergency Capabilities */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Emergency Capabilities Matrix
                </h3>
                <p className="text-xs text-slate-400">Designated trauma facilities available for immediate critical care</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'emergency24x7', label: '24/7 Emergency Department' },
                  { key: 'traumaCenter', label: 'Dedicated Level 1/2 Trauma Center' },
                  { key: 'icuAvailable', label: 'ICU & Critical Care Units Active' },
                  { key: 'ambulanceAvailable', label: 'Ambulance Fleet On Standby' },
                  { key: 'emergencySurgery', label: 'Emergency Surgery / Trauma OT' },
                  { key: 'bloodBank', label: '24/7 Licensed Blood Bank' },
                  { key: 'ventilatorAvailable', label: 'Ventilator Life Support' },
                  { key: 'physiotherapyRehab', label: 'Physiotherapy & Rehabilitation' },
                  { key: 'accidentTreatment', label: 'Road Accident Resuscitation Unit' },
                ].map(item => (
                  <label
                    key={item.key}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      (capabilities as any)[item.key]
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-medium">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={(capabilities as any)[item.key]}
                      onChange={e => setCapabilities({ ...capabilities, [item.key]: e.target.checked })}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4 bg-slate-900"
                    />
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Emergency Protocols & Special Notes</label>
                <textarea
                  rows={3}
                  value={capabilities.notes}
                  onChange={e => setCapabilities({ ...capabilities, notes: e.target.value })}
                  placeholder="Special instructions for emergency dispatch teams..."
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium transition"
            >
              Cancel
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="py-2 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
