import React, { useState } from 'react';
import { useHospital } from '../../contexts/HospitalContext';
import { 
  Ambulance, 
  MapPin, 
  Gauge, 
  Clock, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ExternalLink,
  Radio,
  Building2,
  Users,
  Plus,
  Trash2,
  Edit3,
  Phone,
  ShieldCheck,
  X
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../../lib/utils';
import { PatientAdmissionStatus } from '../../types/hospital';

// Fix leaflet icon default issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Hospital Marker Icon (Cyan)
const hospitalIcon = new L.DivIcon({
  className: 'custom-hospital-marker',
  html: `<div style="
    background: #06b6d4;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.6);
    border: 2px solid white;
  ">🏥</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Custom Ambulance Marker Icon
const createAmbulanceIcon = (severity: string) => {
  const isCritical = severity === 'CRITICAL';
  const color = isCritical ? '#ef4444' : '#f59e0b';
  return new L.DivIcon({
    className: 'custom-ambulance-marker',
    html: `<div style="
      background: ${color};
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 0 15px ${color};
      border: 2px solid white;
      animation: pulse 1.5s infinite;
    ">🚑</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const AmbulanceTrackingHospital: React.FC = () => {
  const { 
    incomingPatients, 
    hospital, 
    updatePatientStatus, 
    lastTelemetryUpdate,
    ambulances: fleetAmbulances = [],
    addAmbulance,
    updateAmbulance,
    deleteAmbulance,
    dispatchAmbulance
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'tracking' | 'fleet'>('tracking');
  const [selectedAmbulance, setSelectedAmbulance] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Dispatch Modal state
  const [dispatchingIncident, setDispatchingIncident] = useState<any | null>(null);
  const [selectedFleetId, setSelectedFleetId] = useState<string>('');
  const [driverNameInput, setDriverNameInput] = useState('');
  const [driverPhoneInput, setDriverPhoneInput] = useState('');
  const [etaInput, setEtaInput] = useState<number>(8);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  // Register Ambulance Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newAmbName, setNewAmbName] = useState('');
  const [newAmbNumber, setNewAmbNumber] = useState('');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newParamedicName, setNewParamedicName] = useState('');
  const [newEquipment, setNewEquipment] = useState('ALS Ventilator, Defibrillator, Oxygen');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Hospital coordinates (default to New Delhi if not set)
  const hospLat = hospital?.latitude || 28.5672;
  const hospLng = hospital?.longitude || 77.2100;

  // Active incoming transits
  const activeTransits = incomingPatients.filter(
    p => p.admissionStatus === 'EN_ROUTE' || p.admissionStatus === 'ARRIVED'
  );

  // Pending dispatch incidents assigned to this hospital
  const pendingDispatches = incomingPatients.filter(
    p => p.admissionStatus === 'PENDING_DISPATCH' || !p.ambulanceAssigned || p.ambulanceStatus === 'PENDING_DISPATCH'
  );

  const secondsSinceUpdate = lastTelemetryUpdate 
    ? Math.floor((Date.now() - lastTelemetryUpdate.getTime()) / 1000) 
    : null;
  const isTelemetryDelayed = secondsSinceUpdate !== null && secondsSinceUpdate > 60;

  const handleStatusChange = async (patient: any, nextStatus: PatientAdmissionStatus) => {
    setUpdatingId(patient.id);
    try {
      await updatePatientStatus(patient.id, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExecuteDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchingIncident || !selectedFleetId) {
      alert('Please select an ambulance from your fleet.');
      return;
    }
    setDispatchLoading(true);
    try {
      await dispatchAmbulance(
        dispatchingIncident.incidentId || dispatchingIncident.id,
        selectedFleetId,
        {
          driverName: driverNameInput,
          driverPhone: driverPhoneInput,
          etaMinutes: etaInput
        }
      );
      setDispatchingIncident(null);
      setSelectedFleetId('');
      setDriverNameInput('');
      setDriverPhoneInput('');
      alert('Ambulance successfully dispatched to emergency scene.');
    } catch (err: any) {
      alert('Failed to dispatch ambulance: ' + err.message);
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleRegisterAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmbName || !newAmbNumber) {
      alert('Please fill in ambulance name and vehicle number.');
      return;
    }
    setRegisterLoading(true);
    try {
      await addAmbulance({
        name: newAmbName,
        vehicleNumber: newAmbNumber,
        type: 'ALS (Advanced Life Support)',
        driverName: newDriverName || 'State Driver',
        driverPhone: newDriverPhone || '+91 98765 43210',
        paramedicName: newParamedicName || 'Trained Paramedic',
        equipment: newEquipment.split(',').map(s => s.trim()),
        status: 'AVAILABLE'
      });
      setShowRegisterModal(false);
      setNewAmbName('');
      setNewAmbNumber('');
      setNewDriverName('');
      setNewDriverPhone('');
      setNewParamedicName('');
    } catch (err: any) {
      alert('Failed to register ambulance: ' + err.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER & TABS */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Hospital Fleet & Emergency Dispatch
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Ambulance Command & Fleet Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch hospital fleet ambulances to assigned emergency cases and monitor real-time GPS telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('tracking')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === 'tracking' ? "bg-cyan-500 text-black shadow-md" : "text-slate-300 hover:text-white"
              )}
            >
              Live Tracking & Dispatch ({activeTransits.length + pendingDispatches.length})
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === 'fleet' ? "bg-cyan-500 text-black shadow-md" : "text-slate-300 hover:text-white"
              )}
            >
              Ambulance Fleet ({fleetAmbulances.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'tracking' ? (
        <>
          {/* PENDING DISPATCH BANNER IF ANY */}
          {pendingDispatches.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-600/80 rounded-2xl p-4 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
                  Action Required: Pending Ambulance Dispatches ({pendingDispatches.length})
                </span>
                <span className="text-[11px] text-amber-400 font-mono">Assigned by State Command</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingDispatches.map((pend) => (
                  <div key={pend.id} className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{pend.patientName}</span>
                      <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded">
                        {pend.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{pend.location}</span>
                    </p>
                    <button
                      onClick={() => {
                        setDispatchingIncident(pend);
                        if (fleetAmbulances.length > 0) {
                          setSelectedFleetId(fleetAmbulances.find(a => a.status === 'AVAILABLE')?.id || fleetAmbulances[0].id);
                          setDriverNameInput(fleetAmbulances[0].driverName || '');
                          setDriverPhoneInput(fleetAmbulances[0].driverPhone || '');
                        }
                      }}
                      className="w-full py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                    >
                      <Ambulance className="w-4 h-4" />
                      <span>DISPATCH AMBULANCE FROM FLEET</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAP & LIST GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col h-[520px]">
              <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  Tactical Fleet Map
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Target: {hospital?.hospitalName || 'Hospital'} ({hospLat.toFixed(4)}, {hospLng.toFixed(4)})
                </span>
              </div>

              <div className="flex-1 relative z-0">
                <MapContainer
                  center={[hospLat, hospLng]}
                  zoom={13}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />

                  <Marker position={[hospLat, hospLng]} icon={hospitalIcon}>
                    <Popup>
                      <div className="p-1 text-slate-900">
                        <strong className="block text-sm">{hospital?.hospitalName || 'Hospital Facility'}</strong>
                        <span className="text-xs text-slate-600 block">{hospital?.address}</span>
                        <span className="text-xs text-emerald-600 font-bold block mt-1">Designated Emergency Intake</span>
                      </div>
                    </Popup>
                  </Marker>

                  {activeTransits.map((amb) => {
                    const ambLat = amb.lat || (hospLat + 0.02);
                    const ambLng = amb.lng || (hospLng + 0.02);

                    return (
                      <React.Fragment key={amb.id}>
                        <Marker
                          position={[ambLat, ambLng]}
                          icon={createAmbulanceIcon(amb.severity)}
                          eventHandlers={{
                            click: () => setSelectedAmbulance(amb)
                          }}
                        >
                          <Popup>
                            <div className="p-1 text-slate-900">
                              <strong className="block text-sm">{amb.ambulanceId}</strong>
                              <span className="text-xs font-semibold text-red-600 block">
                                Patient: {amb.patientId} &bull; {amb.severity}
                              </span>
                              <span className="text-xs text-slate-600 block">ETA: {amb.eta}</span>
                              <span className="text-xs text-slate-600 block">Speed: {amb.currentSpeed || 60} km/h</span>
                            </div>
                          </Popup>
                        </Marker>

                        <Polyline
                          positions={[
                            [ambLat, ambLng],
                            [hospLat, hospLng]
                          ]}
                          color={amb.severity === 'CRITICAL' ? '#ef4444' : '#06b6d4'}
                          weight={3}
                          dashArray="5, 10"
                        />
                      </React.Fragment>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col h-[520px]">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Approaching Units ({activeTransits.length})
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">Live Sync</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {activeTransits.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl my-auto">
                    <Ambulance className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    No ambulances en route to this facility currently.
                  </div>
                ) : (
                  activeTransits.map((amb) => {
                    const isSelected = selectedAmbulance?.id === amb.id;
                    const isCritical = amb.severity === 'CRITICAL';

                    return (
                      <div
                        key={amb.id}
                        onClick={() => setSelectedAmbulance(amb)}
                        className={cn(
                          "p-3.5 rounded-xl border transition-all cursor-pointer",
                          isSelected ? "border-cyan-500 bg-cyan-950/20" :
                          isCritical ? "border-red-800/60 bg-red-950/20" : "border-slate-700/60 bg-slate-800/40"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Ambulance className={cn(
                              "w-4 h-4",
                              isCritical ? "text-red-400" : "text-cyan-400"
                            )} />
                            <span className="text-xs font-bold text-white">{amb.ambulanceId}</span>
                            <span className="text-[10px] font-mono text-slate-400">({amb.ambulanceNumber})</span>
                          </div>
                          <span className={cn(
                            "text-[10px] font-black uppercase px-1.5 py-0.5 rounded",
                            isCritical ? "bg-red-600 text-white" : "bg-cyan-500 text-black"
                          )}>
                            {amb.severity}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 mb-2">
                          <span className="text-slate-400">Patient: </span>
                          <strong className="text-white">{amb.patientName}</strong> ({amb.patientId})
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-mono mb-2.5">
                          <div>ETA: <strong className="text-cyan-400">{amb.eta}</strong></div>
                          <div>Speed: <strong className="text-slate-200">{amb.currentSpeed || 58} km/h</strong></div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/60">
                          {amb.admissionStatus === 'EN_ROUTE' ? (
                            <button
                              disabled={updatingId === amb.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(amb, 'ARRIVED');
                              }}
                              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition-colors"
                            >
                              Mark Arrived
                            </button>
                          ) : amb.admissionStatus === 'ARRIVED' ? (
                            <button
                              disabled={updatingId === amb.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(amb, 'HANDED_OVER');
                              }}
                              className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-colors"
                            >
                              Patient Handed Over
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Handover Complete
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* FLEET MANAGEMENT TAB */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Registered Hospital Fleet</h2>
              <p className="text-xs text-slate-400">Manage ambulance vehicles, drivers, contact numbers, and equipment readiness.</p>
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Ambulance</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fleetAmbulances.length === 0 ? (
              <div className="col-span-full bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
                <Ambulance className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No ambulances in fleet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Register your hospital ambulances so doctors and emergency desk staff can dispatch them instantly when incidents are assigned.
                </p>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="mt-4 px-4 py-2 bg-cyan-500 text-black font-bold rounded-xl text-xs inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add First Ambulance
                </button>
              </div>
            ) : (
              fleetAmbulances.map((amb: any) => (
                <div key={amb.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 font-bold">
                        🚑
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{amb.name}</h4>
                        <span className="text-xs font-mono text-cyan-400">{amb.vehicleNumber}</span>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                      amb.status === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                      amb.status === 'ON_DUTY' ? 'bg-blue-950 text-blue-300 border-blue-700' :
                      'bg-amber-950 text-amber-300 border-amber-700'
                    )}>
                      {amb.status || 'AVAILABLE'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Driver:</span>
                      <strong className="text-white">{amb.driverName || 'Assigned Driver'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-mono text-cyan-300">{amb.driverPhone || '+91 98765 43210'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Paramedic:</span>
                      <span className="text-slate-200">{amb.paramedicName || 'Trained Paramedic'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      Eq: {Array.isArray(amb.equipment) ? amb.equipment.join(', ') : 'ALS Trauma Kit'}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ambulance ${amb.name} (${amb.vehicleNumber})?`)) {
                          deleteAmbulance(amb.id);
                        }
                      }}
                      className="p-2 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                      title="Delete Ambulance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DISPATCH MODAL */}
      {dispatchingIncident && (
        <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-950 border border-cyan-500/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Emergency Fleet Dispatch</span>
                <h3 className="text-lg font-black text-white">Dispatch Ambulance to Incident</h3>
              </div>
              <button 
                onClick={() => setDispatchingIncident(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <div>Patient: <strong className="text-white">{dispatchingIncident.patientName}</strong> ({dispatchingIncident.patientId})</div>
              <div>Severity: <span className="text-red-400 font-bold">{dispatchingIncident.severity}</span></div>
              <div>Location: <span className="text-cyan-300">{dispatchingIncident.location}</span></div>
            </div>

            <form onSubmit={handleExecuteDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Available Ambulance From Fleet</label>
                <select
                  value={selectedFleetId}
                  onChange={(e) => {
                    setSelectedFleetId(e.target.value);
                    const found = fleetAmbulances.find((a: any) => a.id === e.target.value);
                    if (found) {
                      setDriverNameInput(found.driverName || '');
                      setDriverPhoneInput(found.driverPhone || '');
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">-- Choose Ambulance Unit --</option>
                  {fleetAmbulances.map((amb: any) => (
                    <option key={amb.id} value={amb.id}>
                      {amb.name} ({amb.vehicleNumber}) - {amb.status || 'AVAILABLE'}
                    </option>
                  ))}
                </select>
                {fleetAmbulances.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1">No ambulances registered yet. Please register an ambulance in the Fleet tab first.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={driverNameInput}
                    onChange={(e) => setDriverNameInput(e.target.value)}
                    placeholder="Ramesh Kumar"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Driver Phone</label>
                  <input
                    type="text"
                    value={driverPhoneInput}
                    onChange={(e) => setDriverPhoneInput(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Estimated ETA (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={etaInput}
                  onChange={(e) => setEtaInput(parseInt(e.target.value) || 8)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDispatchingIncident(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatchLoading || fleetAmbulances.length === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black rounded-xl text-xs shadow-lg shadow-cyan-600/30"
                >
                  {dispatchLoading ? 'Dispatching...' : 'CONFIRM & DISPATCH AMBULANCE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER AMBULANCE MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-950 border border-cyan-500/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Hospital Fleet Management</span>
                <h3 className="text-lg font-black text-white">Register New Ambulance Unit</h3>
              </div>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterAmbulance} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Ambulance Name / ID</label>
                  <input
                    type="text"
                    value={newAmbName}
                    onChange={(e) => setNewAmbName(e.target.value)}
                    placeholder="ALS Unit 01"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Vehicle Registration Number</label>
                  <input
                    type="text"
                    value={newAmbNumber}
                    onChange={(e) => setNewAmbNumber(e.target.value)}
                    placeholder="DL 01 AB 1234"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    placeholder="Ramesh Kumar"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Driver Phone</label>
                  <input
                    type="text"
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">On-Duty Paramedic Name</label>
                <input
                  type="text"
                  value={newParamedicName}
                  onChange={(e) => setNewParamedicName(e.target.value)}
                  placeholder="Nurse Rajesh Kumar"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Equipment (Comma separated)</label>
                <input
                  type="text"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="ALS Ventilator, Defibrillator, Oxygen Cylinder"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl text-xs shadow-lg shadow-cyan-500/20"
                >
                  {registerLoading ? 'Saving...' : 'SAVE & REGISTER AMBULANCE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
