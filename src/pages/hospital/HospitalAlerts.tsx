import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../../contexts/HospitalContext';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Droplet, 
  BedDouble, 
  Radio, 
  Volume2, 
  VolumeX,
  CheckCheck,
  Ambulance,
  X,
  Navigation,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const HospitalAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { 
    alerts, 
    incomingPatients, 
    ambulances: fleetAmbulances = [], 
    dispatchAmbulance, 
    markAlertRead, 
    markAllAlertsRead, 
    soundEnabled, 
    setSoundEnabled 
  } = useHospital();

  // Dispatch modal state
  const [dispatchingIncidentId, setDispatchingIncidentId] = useState<string | null>(null);
  const [selectedFleetId, setSelectedFleetId] = useState<string>('');
  const [driverNameInput, setDriverNameInput] = useState('');
  const [driverPhoneInput, setDriverPhoneInput] = useState('');
  const [etaInput, setEtaInput] = useState<number>(8);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  const handleAction = (alert: any) => {
    markAlertRead(alert.id);
    if (alert.incidentId) {
      setDispatchingIncidentId(alert.incidentId);
      // Preselect first available ambulance if any
      const avail = fleetAmbulances.find(a => a.status === 'AVAILABLE') || fleetAmbulances[0];
      if (avail) {
        setSelectedFleetId(avail.id);
        setDriverNameInput(avail.driverName || 'Hospital Driver');
        setDriverPhoneInput(avail.driverPhone || '+91 98765 43210');
      }
    } else if (alert.link) {
      navigate(alert.link);
    }
  };

  const handleExecuteDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchingIncidentId || !selectedFleetId) {
      alert('Please select an available ambulance from your fleet.');
      return;
    }
    setDispatchLoading(true);
    try {
      await dispatchAmbulance(
        dispatchingIncidentId,
        selectedFleetId,
        {
          driverName: driverNameInput,
          driverPhone: driverPhoneInput,
          etaMinutes: etaInput
        }
      );
      setDispatchingIncidentId(null);
      setSelectedFleetId('');
      setDriverNameInput('');
      setDriverPhoneInput('');
      alert('Ambulance successfully assigned and dispatched to emergency scene!');
    } catch (err: any) {
      alert('Failed to dispatch ambulance: ' + err.message);
    } finally {
      setDispatchLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Automated Dispatch Monitor
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Alerts & System Notifications ({alerts.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Incoming emergency cases assigned by Central Command, critical operational warnings, and ambulance dispatch queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors",
              soundEnabled ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400" : "bg-slate-800 border-slate-700 text-slate-400"
            )}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Siren Active' : 'Siren Muted'}</span>
          </button>

          {alerts.some(a => !a.read) && (
            <button
              onClick={markAllAlertsRead}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* ALERTS FEED */}
      {alerts.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">All Clear — No Active Alerts</h3>
          <p className="text-xs text-slate-400 mt-1">
            Trauma bay telemetry and hospital resource monitoring are normal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'HIGH' || alert.severity === 'MEDIUM';
            const matchingPatient = incomingPatients.find(p => p.incidentId === alert.incidentId || p.id === alert.incidentId);
            const isDispatched = matchingPatient && (matchingPatient.ambulanceStatus === 'EN_ROUTE' || matchingPatient.admissionStatus === 'EN_ROUTE');

            return (
              <div
                key={alert.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-200 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                  !alert.read 
                    ? isCritical 
                      ? "bg-red-950/30 border-red-800/80 shadow-lg shadow-red-950/40" 
                      : "bg-cyan-950/20 border-cyan-800/60"
                    : "bg-slate-900/60 border-slate-800 opacity-80 hover:opacity-100"
                )}
              >
                <div className="flex items-start gap-3.5">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                    isCritical ? "bg-red-600/20 text-red-400" :
                    isWarning ? "bg-amber-500/20 text-amber-400" : "bg-cyan-500/10 text-cyan-400"
                  )}>
                    {alert.type === 'incoming_patient' || alert.type === 'critical_patient' ? <Flame className="w-5 h-5" /> :
                     alert.type === 'blood_stock' ? <Droplet className="w-5 h-5" /> :
                     alert.type === 'bed_capacity' ? <BedDouble className="w-5 h-5" /> :
                     alert.type === 'command_message' ? <Radio className="w-5 h-5" /> :
                     <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider",
                        isCritical ? "bg-red-600 text-white animate-pulse" :
                        isWarning ? "bg-amber-500 text-black" : "bg-cyan-600 text-white"
                      )}>
                        {alert.severity}
                      </span>
                      <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl">{alert.message}</p>
                    
                    {matchingPatient && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-cyan-300 border border-slate-700">
                          Patient ID: {matchingPatient.patientId}
                        </span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 border border-slate-700">
                          Incident: {matchingPatient.incidentId}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded font-bold",
                          isDispatched ? "bg-blue-900/60 text-blue-300 border border-blue-700" : "bg-orange-900/60 text-orange-300 border border-orange-700 animate-pulse"
                        )}>
                          {isDispatched ? `Ambulance Dispatched (${matchingPatient.ambulanceNumber})` : 'Awaiting Ambulance Dispatch'}
                        </span>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                      {new Date(alert.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!alert.read && (
                    <button
                      onClick={() => markAlertRead(alert.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700"
                    >
                      Dismiss
                    </button>
                  )}

                  {alert.incidentId ? (
                    <button
                      onClick={() => handleAction(alert)}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <Ambulance className="w-4 h-4" />
                      <span>Assign & Dispatch</span>
                    </button>
                  ) : alert.link && (
                    <button
                      onClick={() => handleAction(alert)}
                      className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISPATCH MODAL FROM NOTIFICATION */}
      {dispatchingIncidentId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Assign & Dispatch Fleet Ambulance</h3>
                  <p className="text-xs text-slate-400 font-mono">Incident: {dispatchingIncidentId}</p>
                </div>
              </div>
              <button
                onClick={() => setDispatchingIncidentId(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteDispatch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Available Ambulance From Fleet
                </label>
                {fleetAmbulances.length === 0 ? (
                  <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-xl text-amber-300 text-xs text-center">
                    No ambulances registered in your hospital fleet yet. Please register ambulances in the Ambulance Tracking tab first.
                  </div>
                ) : (
                  <select
                    value={selectedFleetId}
                    onChange={(e) => {
                      const ambId = e.target.value;
                      setSelectedFleetId(ambId);
                      const found = fleetAmbulances.find(a => a.id === ambId);
                      if (found) {
                        setDriverNameInput(found.driverName || '');
                        setDriverPhoneInput(found.driverPhone || '');
                      }
                    }}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Available Ambulance Unit --</option>
                    {fleetAmbulances.map((amb) => (
                      <option key={amb.id} value={amb.id}>
                        {amb.name} ({amb.vehicleNumber}) - {amb.status || 'AVAILABLE'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Assigned Driver Name
                  </label>
                  <input
                    type="text"
                    value={driverNameInput}
                    onChange={(e) => setDriverNameInput(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Driver Phone Number
                  </label>
                  <input
                    type="text"
                    value={driverPhoneInput}
                    onChange={(e) => setDriverPhoneInput(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Estimated Arrival Time (ETA Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={etaInput}
                  onChange={(e) => setEtaInput(Number(e.target.value))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDispatchingIncidentId(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatchLoading || fleetAmbulances.length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{dispatchLoading ? 'Dispatching...' : 'CONFIRM & DISPATCH AMBULANCE'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

