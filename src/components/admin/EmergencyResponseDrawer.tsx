import React, { useState, useEffect, useMemo } from 'react';
import { useEmergencyResponse } from '../../contexts/EmergencyResponseContext';
import { HospitalRecommendationItem, IncidentLifecycleStatus } from '../../types/emergency';
import { EmergencyMap } from './EmergencyMap';
import { HospitalDetailsModal } from './HospitalDetailsModal';
import { HospitalAssignmentModal } from './HospitalAssignmentModal';
import { 
  X, AlertTriangle, ShieldCheck, HeartPulse, Clock, MapPin, 
  Phone, User, Car, Zap, RefreshCw, CheckCircle2, ChevronDown, 
  ChevronUp, Activity, ExternalLink, ShieldAlert, ArrowRight, Ambulance,
  Building2, Search, SlidersHorizontal
} from 'lucide-react';

export const EmergencyResponseDrawer: React.FC = () => {
  const { 
    activeIncident, 
    isDrawerOpen, 
    closeEmergency, 
    assignHospital, 
    acknowledgeEmergency,
    recalculateRecommendations, 
    updateIncidentStatus,
    resolveEmergency,
    markResponding,
    allHospitals = []
  } = useEmergencyResponse();

  const [inspectingHospital, setInspectingHospital] = useState<HospitalRecommendationItem | null>(null);
  const [assigningHospital, setAssigningHospital] = useState<HospitalRecommendationItem | null>(null);
  const [isAssignOverride, setIsAssignOverride] = useState(false);
  const [showIneligible, setShowIneligible] = useState(false);
  const [showAllEligible, setShowAllEligible] = useState(false);
  const [showAllHospitalsModal, setShowAllHospitalsModal] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [recomputing, setRecomputing] = useState(false);

  // Time elapsed since detection
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Distance helper
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const filteredAllHospitals = useMemo(() => {
    if (!allHospitals) return [];
    const q = hospitalSearch.toLowerCase().trim();
    return allHospitals
      .filter((h: any) => {
        const name = h.hospitalName || h.name || '';
        const addr = h.address || '';
        const id = h.hospitalId || h.id || '';
        return (
          !q ||
          name.toLowerCase().includes(q) ||
          addr.toLowerCase().includes(q) ||
          id.toLowerCase().includes(q)
        );
      })
      .map((h: any) => {
        const dist = calculateDistanceKm(
          activeIncident?.latitude || 0,
          activeIncident?.longitude || 0,
          h.latitude || 0,
          h.longitude || 0
        );
        const estEta = Math.max(3, Math.round(dist * 2.2));
        return {
          ...h,
          name: h.hospitalName || h.name || 'Hospital Facility',
          calculatedDistance: dist,
          estimatedEta: estEta,
        };
      })
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [allHospitals, hospitalSearch, activeIncident]);

  const handleAssignCustomHospital = (h: any) => {
    const item: HospitalRecommendationItem = {
      rank: 99,
      badge: 'ELIGIBLE',
      hospitalId: h.hospitalId || h.id || 'HOSP',
      hospitalName: h.hospitalName || h.name || 'Hospital Facility',
      distanceKm: h.calculatedDistance || 0,
      etaMinutes: h.estimatedEta || 10,
      etaText: `${h.estimatedEta || 10} mins`,
      isEligible: true,
      address: h.address || 'Address not listed',
      contactNumber: h.contactNumber || h.emergencyContact || '+91 11 0000 0000',
      emergencyContact: h.emergencyContact || h.contactNumber || '+91 11 0000 0000',
      coordinates: {
        lat: h.latitude || 0,
        lng: h.longitude || 0,
      },
      whyRecommended: ['Direct administrative directory selection'],
      suitabilityFactors: [],
      specializations: h.specializations || ['Emergency Trauma', 'Critical Care'],
      operationalScore: 85,
      resourcesSnapshot: {
        icuBedsAvailable: h.capacity?.availableIcuBeds ?? h.icuBedsAvailable ?? 5,
        icuBedsTotal: h.capacity?.icuBeds ?? 15,
        emergencyBedsAvailable: h.capacity?.availableEmergencyBeds ?? h.emergencyBedsAvailable ?? 8,
        emergencyBedsTotal: h.capacity?.emergencyBeds ?? 20,
        generalBedsAvailable: h.capacity?.availableBeds ?? h.generalBedsAvailable ?? 25,
        generalBedsTotal: h.capacity?.totalBeds ?? 100,
        availableAmbulances: h.ambulances?.available ?? h.availableAmbulances ?? 2,
        traumaCapable: Boolean(h.emergencyCapabilities?.traumaCenter ?? h.traumaCapable ?? true),
        emergency24x7: Boolean(h.emergencyCapabilities?.emergency24x7 ?? true),
        bloodBankAvailable: Boolean(h.emergencyCapabilities?.bloodBank ?? true),
        ventilators: h.capacity?.ventilators ?? 6,
      },
      dataFreshness: {
        resourceLastUpdated: new Date().toISOString(),
        isStale: false,
        minutesAgo: 0,
        freshnessLabel: 'Live Directory',
      },
    };
    setShowAllHospitalsModal(false);
    handleStartAssignment(item, true);
  };

  useEffect(() => {
    if (!activeIncident) return;
    const interval = setInterval(() => {
      const detected = new Date(activeIncident.detectedAt).getTime();
      const diff = Math.max(0, Math.floor((Date.now() - detected) / 1000));
      setElapsedSeconds(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeIncident]);

  if (!isDrawerOpen || !activeIncident) return null;

  const isCritical = activeIncident.severity === 'CRITICAL';
  const hasAssigned = Boolean(activeIncident.assignedHospitalId);
  const isAcknowledged = Boolean(activeIncident.hospitalAcknowledged);

  const recommendations = activeIncident.hospitalRecommendations || [];
  const primaryHosp = recommendations[0] || null;
  const alternativeHosps = recommendations.slice(1);
  const ineligibleHosps = activeIncident.ineligibleHospitals || [];

  // Elapsed format
  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s ago`;
  };

  const handleStartAssignment = (hospital: HospitalRecommendationItem, isOverride: boolean = false) => {
    setIsAssignOverride(isOverride);
    setAssigningHospital(hospital);
  };

  const handleConfirmAssignment = async (reason: string, department: string) => {
    if (!assigningHospital) return;
    await assignHospital({
      incidentId: activeIncident.incidentId,
      hospitalId: assigningHospital.hospitalId,
      hospitalName: assigningHospital.hospitalName,
      department,
      assignmentReason: reason,
      isManualOverride: isAssignOverride,
      adminId: 'ADMIN'
    });
  };

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      await recalculateRecommendations(activeIncident.incidentId);
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeEmergency}
      />

      <div className="fixed inset-y-0 right-0 z-[1050] w-full max-w-5xl bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* TOP HEADER */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs uppercase shadow-lg ${
              isCritical ? 'bg-red-600 text-white animate-pulse shadow-red-600/30' : 'bg-amber-500 text-black shadow-amber-500/20'
            }`}>
              {activeIncident.severity.slice(0, 4)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/80">
                  {activeIncident.incidentId}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {activeIncident.vehicleId}
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  activeIncident.status === 'HOSPITAL_ACKNOWLEDGED'
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                    : hasAssigned
                      ? 'bg-sky-950/70 text-sky-300 border-sky-700/60'
                      : 'bg-red-950/70 text-red-300 border-red-700/60 animate-pulse'
                }`}>
                  {activeIncident.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span>Patient: <strong className="text-white">{activeIncident.patientName}</strong></span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Detected {formatElapsed(elapsedSeconds)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeIncident.statusLegacy !== 'responding' && !hasAssigned && activeIncident.status !== 'INCIDENT_CLOSED' && (
              <button
                onClick={async () => {
                  await markResponding(activeIncident.incidentId);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors flex items-center gap-1"
                title="Mark incident as Responding"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mark Responding</span>
              </button>
            )}

            {activeIncident.status !== 'INCIDENT_CLOSED' && activeIncident.statusLegacy !== 'resolved' && (
              <button
                onClick={async () => {
                  const notes = prompt('Enter incident resolution notes (optional):', 'Emergency successfully managed and resolved by Admin');
                  if (notes !== null) {
                    await resolveEmergency(activeIncident.incidentId, notes || undefined);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors flex items-center gap-1"
                title="Mark incident as Resolved"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolve SOS</span>
              </button>
            )}

            <button
              onClick={handleRecompute}
              disabled={recomputing}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors border border-slate-800 flex items-center gap-1.5 text-xs font-medium"
              title="Recalculate Recommendations based on Live Beds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recomputing ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Refresh Beds</span>
            </button>

            <button
              onClick={closeEmergency}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DRAWER CONTENT - DUAL COLUMN LAYOUT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* TOP ACKNOWLEDGEMENT NOTIFICATION BAR */}
          {hasAssigned && (
            <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
              isAcknowledged 
                ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-700/60 text-emerald-200' 
                : 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border-amber-600/70 text-amber-200 animate-pulse'
            }`}>
              <div className="flex items-center gap-3">
                {isAcknowledged ? (
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isAcknowledged 
                      ? `✓ Destination Hospital Acknowledged (${activeIncident.assignedHospitalName || activeIncident.assignedHospitalId})` 
                      : `⚠ Awaiting Hospital Acknowledgement from ${activeIncident.assignedHospitalName || activeIncident.assignedHospitalId}`}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {isAcknowledged 
                      ? 'Trauma bay prepared • Critical care response team mobilised and awaiting patient arrival.' 
                      : 'Hospital desk notified via priority telemetry dispatch. 3-minute acknowledgement timeout active.'}
                  </p>
                </div>
              </div>

              {!isAcknowledged && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => acknowledgeEmergency(activeIncident.incidentId, activeIncident.assignedHospitalId || '')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acknowledge on Behalf</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DUAL COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Map & Telemetry Details (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Emergency Map Component */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Live Geofence & Incident Location</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">GPS Telemetry</span>
                </div>

                <EmergencyMap
                  accidentLat={activeIncident.latitude}
                  accidentLng={activeIncident.longitude}
                  accidentLocationText={activeIncident.locationText}
                  recommendations={recommendations}
                  assignedHospitalId={activeIncident.assignedHospitalId}
                  ambulanceLocation={activeIncident.ambulance ? {
                    lat: activeIncident.ambulance.lat || 28.6139,
                    lng: activeIncident.ambulance.lng || 77.2090,
                    speed: activeIncident.ambulance.speed,
                    etaText: activeIncident.ambulance.etaText
                  } : null}
                  onSelectHospital={(h) => setInspectingHospital(h)}
                />
              </div>

              {/* Accident Location Card */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Incident Coordinates & Location</span>
                <p className="text-xs font-bold text-slate-200 leading-relaxed">{activeIncident.locationText}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                  <span>Lat: <strong className="text-cyan-400">{activeIncident.latitude?.toFixed(4) || 'N/A'}</strong></span>
                  <span>Lng: <strong className="text-cyan-400">{activeIncident.longitude?.toFixed(4) || 'N/A'}</strong></span>
                  <span>Speed: <strong className="text-white">{activeIncident.speed} km/h</strong></span>
                </div>
              </div>

              {/* Vehicle & Telemetry Sensors */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-amber-400" />
                    <span>Vehicle & Impact Telemetry</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    {activeIncident.deviceStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Impact Force</span>
                    <span className="text-sm font-black text-rose-400 font-mono">
                      {activeIncident.sensorData?.impactForceG || 4.8} G
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Airbags</span>
                    <span className="text-sm font-black text-white">
                      {activeIncident.sensorData?.airbagDeployed ? '✓ DEPLOYED' : 'Not Deployed'}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Roll-over Sensor</span>
                    <span className="text-sm font-black text-amber-400">
                      {activeIncident.sensorData?.rollOver ? '⚠ DETECTED' : 'Normal'}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Pre-Impact Speed</span>
                    <span className="text-sm font-black text-white font-mono">
                      {activeIncident.sensorData?.speedBeforeImpact || activeIncident.speed || 55} km/h
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Profile */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{activeIncident.patientName}</h5>
                    <span className="text-[11px] text-slate-400 block">ID: {activeIncident.patientId}</span>
                  </div>
                </div>
                {activeIncident.mobile && (
                  <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl text-xs font-mono text-cyan-300">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{activeIncident.mobile}</span>
                  </div>
                )}
              </div>

              {/* Ambulance Tracking Progression if Assigned */}
              {activeIncident.ambulance && (
                <div className="bg-slate-900/80 border border-sky-800/60 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                      <Ambulance className="w-4 h-4" />
                      <span>Dispatched Ambulance Telemetry</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      ETA: {activeIncident.ambulance.etaText}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Unit</span>
                      <span className="font-bold text-white">{activeIncident.ambulance.id} ({activeIncident.ambulance.number})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Current Speed</span>
                      <span className="font-bold text-cyan-400">{activeIncident.ambulance.speed} km/h</span>
                    </div>
                  </div>

                  {/* Stage Advance Buttons for Admin / Paramedics */}
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1.5">Advance Incident Stage:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateIncidentStatus(activeIncident.incidentId, 'AMBULANCE_EN_ROUTE', { ambulanceStatus: 'EN_ROUTE' })}
                        className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-bold"
                      >
                        En Route
                      </button>
                      <button
                        onClick={() => updateIncidentStatus(activeIncident.incidentId, 'PATIENT_ARRIVED', { admissionStatus: 'ARRIVED' })}
                        className="px-2 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-xl text-[11px] font-bold"
                      >
                        Patient Arrived
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Intelligent Recommendations & Action Panel (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Hospital Assignment & Recommendations ({recommendations.length} Evaluated)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live backend recommendation engine filtered by location radius, ICU beds, trauma center, and transit ETA.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                      📍 GPS Proximity
                    </span>
                    <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-800/60">
                      🏥 Trauma Level
                    </span>
                    <span className="text-[10px] bg-indigo-950/60 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-800/60">
                      🛏️ ICU Bed Match
                    </span>
                    <span className="text-[10px] bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded font-mono border border-cyan-800/60">
                      ⏱️ Real-Time ETA
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={() => setShowAllHospitalsModal(true)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
                    title="View and assign any hospital from the entire platform directory"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Browse All Facilities ({allHospitals.length})</span>
                  </button>
                </div>
              </div>

              {/* FALLBACK VIEW IF NO SUITABLE HOSPITALS */}
              {recommendations.length === 0 && (
                <div className="bg-red-950/30 border border-red-800/80 rounded-3xl p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">No Suitable Hospital Found</h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                      No nearby hospital within the configured radius currently meets all required trauma criteria and bed availability thresholds for this emergency.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setShowIneligible(true)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
                    >
                      View Excluded / Ineligible Facilities ({ineligibleHosps.length})
                    </button>
                    <button
                      onClick={() => handleRecompute()}
                      className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Emergency Search</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 🥇 PRIMARY RECOMMENDATION CARD (RANK 1) */}
              {primaryHosp && (
                <div className={`rounded-3xl border p-5 transition-all relative overflow-hidden ${
                  activeIncident.assignedHospitalId === primaryHosp.hospitalId
                    ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-600/80 shadow-xl shadow-emerald-950/20'
                    : 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/60 shadow-xl shadow-amber-950/20'
                }`}>
                  {/* Badge & Rank Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-full flex items-center gap-1">
                        <span>🥇 RECOMMENDED</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                        {primaryHosp.hospitalId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Suitability</span>
                        <span className="text-sm font-black text-emerald-400">{primaryHosp.operationalScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Hospital Name & Location */}
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <span>{primaryHosp.hospitalName}</span>
                      {primaryHosp.resourcesSnapshot.traumaCapable && (
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800/60">
                          Trauma Center
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{primaryHosp.address}</span>
                    </p>
                  </div>

                  {/* Operational Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 my-4 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Distance</span>
                      <span className="text-sm font-black text-white font-mono">{primaryHosp.distanceKm} km</span>
                    </div>
                    <div className="border-x border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">ETA</span>
                      <span className="text-sm font-black text-cyan-400 font-mono">{primaryHosp.etaText}</span>
                    </div>
                    <div className="border-r border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">ICU Beds</span>
                      <span className="text-sm font-black text-indigo-400 font-mono">
                        {primaryHosp.resourcesSnapshot.icuBedsAvailable} free
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Ambulances</span>
                      <span className="text-sm font-black text-sky-400 font-mono">
                        {primaryHosp.resourcesSnapshot.availableAmbulances} units
                      </span>
                    </div>
                  </div>

                  {/* "Why Recommended" Explanation Checklist */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Why Recommended?</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {primaryHosp.whyRecommended.map((reason, rIdx) => (
                        <div key={rIdx} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Freshness indicator */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Beds: {primaryHosp.dataFreshness.freshnessLabel}
                    </span>
                    <span className="font-mono text-cyan-400 font-medium">
                      Emergency Desk: {primaryHosp.emergencyContact}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3 mt-4">
                    <button
                      onClick={() => setInspectingHospital(primaryHosp)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Full Profile</span>
                    </button>

                    {activeIncident.assignedHospitalId === primaryHosp.hospitalId ? (
                      <div className="px-5 py-2.5 bg-emerald-800/80 text-emerald-100 font-black rounded-xl text-xs flex items-center gap-2 border border-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Currently Assigned Hospital</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartAssignment(primaryHosp, false)}
                        className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
                      >
                        <HeartPulse className="w-4 h-4" />
                        <span>ASSIGN TO THIS HOSPITAL</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 🥈 ALTERNATIVE HOSPITALS (TOP 2 & 3) */}
              {alternativeHosps.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                    Alternative Recommendations ({alternativeHosps.length})
                  </span>

                  <div className="space-y-3">
                    {alternativeHosps.map((altHosp) => (
                      <div
                        key={altHosp.hospitalId}
                        className={`p-4 rounded-2xl border transition-all ${
                          activeIncident.assignedHospitalId === altHosp.hospitalId
                            ? 'bg-emerald-950/30 border-emerald-600'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                                Rank #{altHosp.rank} • ALTERNATIVE
                              </span>
                              <span className="text-xs font-bold text-emerald-400">
                                {altHosp.operationalScore}% Match
                              </span>
                              {altHosp.dataFreshness.isStale && (
                                <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                                  ⚠ Stale Data ({altHosp.dataFreshness.minutesAgo}m)
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-white">{altHosp.hospitalName}</h4>
                            <p className="text-xs text-slate-400 truncate max-w-sm">{altHosp.address}</p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2 font-mono">
                              <span>Dist: <strong className="text-white">{altHosp.distanceKm} km</strong></span>
                              <span>ETA: <strong className="text-cyan-400">{altHosp.etaText}</strong></span>
                              <span>ICU: <strong className="text-indigo-400">{altHosp.resourcesSnapshot.icuBedsAvailable} beds</strong></span>
                              <span>Emerg: <strong className="text-emerald-400">{altHosp.resourcesSnapshot.emergencyBedsAvailable} beds</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => setInspectingHospital(altHosp)}
                              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                            >
                              Details
                            </button>

                            {activeIncident.assignedHospitalId === altHosp.hospitalId ? (
                              <span className="px-3 py-2 bg-emerald-800 text-emerald-100 font-bold rounded-xl text-xs">
                                Assigned
                              </span>
                            ) : (
                              <button
                                onClick={() => handleStartAssignment(altHosp, true)}
                                className="px-4 py-2 bg-slate-700 hover:bg-red-600 hover:text-white text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                              >
                                <span>Assign</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INELIGIBLE / NOT SUITABLE HOSPITALS (TRANSPARENT JUSTIFICATIONS) */}
              {ineligibleHosps.length > 0 && (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                  <button
                    onClick={() => setShowIneligible(!showIneligible)}
                    className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Ineligible Facilities for this Emergency ({ineligibleHosps.length})</span>
                    </span>
                    {showIneligible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showIneligible && (
                    <div className="p-4 pt-1 space-y-2 border-t border-slate-800">
                      <p className="text-[11px] text-slate-500">
                        These facilities were evaluated but excluded based on clinical criteria (e.g. lack of ICU beds for critical accident):
                      </p>
                      <div className="space-y-1.5">
                        {ineligibleHosps.map((inh, iIdx) => (
                          <div key={iIdx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-300">{inh.hospitalName}</span>
                              <span className="text-[10px] text-slate-500 ml-2 font-mono">({inh.hospitalId})</span>
                            </div>
                            <span className="text-xs font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/60">
                              {inh.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Profile Modal */}
      {inspectingHospital && (
        <HospitalDetailsModal
          hospital={inspectingHospital}
          onClose={() => setInspectingHospital(null)}
          onAssign={(h) => handleStartAssignment(h, h.rank !== 1)}
          isAssigned={activeIncident.assignedHospitalId === inspectingHospital.hospitalId}
        />
      )}

      {/* Hospital Assignment Confirmation & Override Modal */}
      {assigningHospital && (
        <HospitalAssignmentModal
          hospital={assigningHospital}
          incidentId={activeIncident.incidentId}
          isOverride={isAssignOverride}
          onConfirm={handleConfirmAssignment}
          onClose={() => setAssigningHospital(null)}
        />
      )}

      {/* Complete Hospital Registry Directory Modal */}
      {showAllHospitalsModal && (
        <div className="fixed inset-0 z-[1250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400 block mb-0.5">
                  Platform Registry Override
                </span>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  <span>Assign from Full Hospital Directory</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select any registered healthcare facility in the system to assign to incident <span className="font-mono text-cyan-300 font-bold">{activeIncident.incidentId}</span>.
                </p>
              </div>
              <button
                onClick={() => setShowAllHospitalsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  placeholder="Search facility by name, address, or ID..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Hospitals List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredAllHospitals.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No matching facilities found in the platform registry.
                </div>
              ) : (
                filteredAllHospitals.map((hosp: any) => {
                  const isCurrentAssigned = activeIncident.assignedHospitalId === hosp.id;
                  return (
                    <div
                      key={hosp.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrentAssigned
                          ? 'bg-emerald-950/30 border-emerald-600/80'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{hosp.name}</h4>
                          {(hosp.traumaCapable || hosp.traumaCenter) && (
                            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800/60">
                              Trauma Center
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span>{hosp.address || 'Address registered'}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1 font-mono">
                          <span>Dist: <strong className="text-white">{hosp.calculatedDistance} km</strong></span>
                          <span>ETA: <strong className="text-cyan-400">{hosp.estimatedEta} mins</strong></span>
                          <span>ICU: <strong className="text-indigo-400">{hosp.icuBedsAvailable ?? hosp.beds?.icu ?? 0} free</strong></span>
                          <span>Emerg: <strong className="text-emerald-400">{hosp.emergencyBedsAvailable ?? hosp.beds?.emergency ?? 0} free</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isCurrentAssigned ? (
                          <span className="px-3 py-1.5 bg-emerald-800 text-emerald-100 font-bold rounded-xl text-xs flex items-center gap-1 border border-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Currently Assigned</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAssignCustomHospital(hosp)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <HeartPulse className="w-3.5 h-3.5" />
                            <span>Assign Hospital</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
              <button
                onClick={() => setShowAllHospitalsModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
