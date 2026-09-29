import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { 
  Layers, 
  Clock, 
  User, 
  ShieldAlert, 
  Satellite, 
  CheckCircle2, 
  Trash2, 
  MapPin, 
  Car, 
  Building2, 
  Ambulance, 
  PhoneCall, 
  AlertTriangle,
  Radio,
  ExternalLink
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Polyline, useMap } from 'react-leaflet';
import { INDIA_GEOJSON } from '../../data/indiaGeoJSON';
import { TelemetrySyncService } from '../../services/TelemetrySyncService';
import { cn } from '../../lib/utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { RakshakRTDBService, RTDBDeviceData } from '../../services/RakshakRTDBService';

const mapLayers = {
  dark: { name: 'Command Dark', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', cls: 'dark-map-tiles' },
  street: { name: 'Street Grid', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', cls: '' },
  satellite: { name: 'Satellite Imagery', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', cls: '' }
};

// Known accredited trauma hubs for routing
const TRAUMA_HUBS = [
  { id: 'HOSP001', name: 'AIIMS Apex Trauma Centre, New Delhi', lat: 28.5672, lng: 77.2100, phone: '+91 11 2658 8500' },
  { id: 'HOSP002', name: 'Apollo Multispecialty Hospital, Sarita Vihar', lat: 28.5412, lng: 77.2831, phone: '+91 11 2692 5858' },
  { id: 'HOSP003', name: 'Fortis Emergency Trauma Center, Gurugram', lat: 28.4595, lng: 77.0726, phone: '+91 124 4921 000' },
  { id: 'HOSP004', name: 'Max Super Speciality Hospital, Noida', lat: 28.5701, lng: 77.3218, phone: '+91 120 662 9999' }
];

// Leaflet custom marker icons
const crashIncidentIcon = L.divIcon({
  className: 'custom-crash-marker',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(239, 68, 68, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 32px; height: 32px; border-radius: 50%; background: #dc2626; color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.6); z-index: 10;">
        🚨
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const esp32DeviceMarkerIcon = L.divIcon({
  className: 'custom-esp32-marker',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: pulse 2s infinite;"></div>
      <div style="width: 34px; height: 34px; border-radius: 50%; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 3px 14px rgba(37, 99, 235, 0.7); z-index: 10;">
        🛰️
      </div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const hospitalMarkerIcon = L.divIcon({
  className: 'custom-hosp-marker',
  html: `
    <div style="width: 30px; height: 30px; border-radius: 50%; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(37, 99, 235, 0.5);">
      🏥
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const ambulanceDispatchedIcon = L.divIcon({
  className: 'custom-amb-marker',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(249, 115, 22, 0.3); animation: pulse 2s infinite;"></div>
      <div style="width: 30px; height: 30px; border-radius: 50%; background: #ea580c; color: white; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(234, 88, 12, 0.6); z-index: 10;">
        🚑
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Auto-pan and zoom controller
const MapController = ({ focusLocation, activeCrashesCount }: { focusLocation: [number, number] | null; activeCrashesCount: number }) => {
  const map = useMap();
  
  useEffect(() => {
    if (focusLocation) {
      map.flyTo(focusLocation, 14, { duration: 1.5 });
    } else if (activeCrashesCount === 0) {
      // Fit to all India outer bounds
      try {
        const bounds = L.geoJSON(INDIA_GEOJSON).getBounds();
        map.fitBounds(bounds, { padding: [30, 30] });
      } catch {
        map.setView([22.5937, 78.9629], 5);
      }
    }
  }, [map, focusLocation, activeCrashesCount]);

  return null;
};

export default function LiveMonitoring() {
  const [realAlerts, setRealAlerts] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Record<string, any>>({});
  const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);
  const [activeLayer, setActiveLayer] = useState<keyof typeof mapLayers>('dark');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [selectedCrash, setSelectedCrash] = useState<any>(null);
  const [deviceData, setDeviceData] = useState<RTDBDeviceData | null>(null);

  useEffect(() => {
    const unsubRtdb = RakshakRTDBService.subscribeToDevice((data) => {
      setDeviceData(data);
      if (data?.location?.latitude && data?.location?.longitude) {
        setFocusLocation([data.location.latitude, data.location.longitude]);
      }
    });
    return () => {
      unsubRtdb();
    };
  }, []);

  const getCleanLocalAlerts = () => {
    try {
      const stored = localStorage.getItem('rakshak_sos_alerts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((a: any) => a && a.status !== 'resolved' && a.id !== 'SOS-2026-9921');
        }
      }
      return [];
    } catch {
      return [];
    }
  };

  const loadAssignments = () => {
    try {
      const data = JSON.parse(localStorage.getItem('rakshak_ambulance_assignments') || '{}');
      setAssignments(data);
    } catch {
      setAssignments({});
    }
  };

  useEffect(() => {
    TelemetrySyncService.initialize();
    setRealAlerts(getCleanLocalAlerts());
    loadAssignments();

    let unsub: any = null;
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'sos_alerts'));
      unsub = onSnapshot(q, (snap) => {
        const active = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((a: any) => a && a.status !== 'resolved' && a.id !== 'SOS-2026-9921');
        setRealAlerts(active);
      }, () => {
        setRealAlerts(getCleanLocalAlerts());
      });
    }

    const onStorage = () => {
      setRealAlerts(getCleanLocalAlerts());
      loadAssignments();
    };
    window.addEventListener('storage', onStorage);

    // Periodic simulation to advance dispatched ambulance position along the vector
    const interval = setInterval(() => {
      loadAssignments();
    }, 3000);

    return () => {
      if (unsub) unsub();
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  const handleClearAlerts = async () => {
    TelemetrySyncService.clearAllAlerts();
    setRealAlerts([]);
    setSelectedCrash(null);

    // If connected to Firestore, resolve them
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'sos_alerts'));
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
          try {
            await updateDoc(doc(db, 'sos_alerts', d.id), { status: 'resolved' });
          } catch {}
        });
      } catch {}
    }
  };

  // Build active crashes list
  const activeCrashes = useMemo(() => {
    return realAlerts
      .filter(a => a && a.status !== 'resolved' && a.id !== 'SOS-2026-9921')
      .map(a => {
        const assign = assignments[a.id] || {};
        const isDispatched = !!assign.ambulanceAssigned || a.status === 'responding' || !!a.assignedAmbulance;
        const hospId = assign.hospitalId || a.assignedHospitalId || 'HOSP001';
        const matchedHosp = TRAUMA_HUBS.find(h => h.id === hospId) || TRAUMA_HUBS[0];

        return {
          id: a.id,
          lat: Number(a.location?.lat || a.lat || 28.3541),
          lng: Number(a.location?.lng || a.lng || 77.5382),
          loc: a.address || a.loc || a.location || 'Yamuna Expressway KM 44.8',
          userId: a.customerId || a.userId || 'USR-IN-150001',
          vehicle: a.vehicle || a.carNumber || 'DL 01 AK 4921',
          contact: a.mobile || a.userPhone || '+91 98110 24890',
          timestamp: a.createdAt || a.timestamp || null,
          reporterId: a.user || a.userName || 'Verified Driver',
          gForce: a.gForce ? (typeof a.gForce === 'number' ? `${a.gForce}G` : a.gForce) : '14.2G',
          isDispatched,
          assignment: assign,
          hospital: matchedHosp
        };
      });
  }, [realAlerts, assignments]);

  return (
    <div className="flex flex-col h-full space-y-4 font-sans max-w-7xl mx-auto w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Satellite size={13} /> Satellite Highway Emergency Radar
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Live India Emergency Radar</h1>
          <p className="text-xs text-slate-400">
            Real-time outer-boundary GPS monitoring valid strictly for the Republic of India.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeCrashes.length > 0 && (
            <button
              onClick={handleClearAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Resolve all active emergency alerts"
            >
              <Trash2 size={13} className="text-red-400" />
              <span>Clear Active Alerts</span>
            </button>
          )}

          {/* Layer Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold hover:text-white transition-colors"
            >
              <Layers size={14} /> 
              <span>{mapLayers[activeLayer].name}</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 mt-2 w-44 bolt-card border border-slate-700 rounded-xl shadow-2xl z-[1000] overflow-hidden p-1">
                {Object.entries(mapLayers).map(([key, layer]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveLayer(key as keyof typeof mapLayers);
                      setShowLayerMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                      activeLayer === key ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                    )}
                  >
                    {layer.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area - Map and Sidebar */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[580px]">
        
        {/* Map Area */}
        <div className="lg:col-span-3 bolt-card rounded-2xl overflow-hidden relative flex flex-col z-0 border border-slate-800">
          
          {/* Top Status Indicators inside Map */}
          <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            
            {/* Red India Outer Boundary Indication Badge */}
            <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-red-950/90 backdrop-blur-md border-2 border-red-500/80 rounded-full text-xs font-bold text-red-300 shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="font-mono uppercase tracking-wider text-[11px]">
                Valid Only For India • Red Outer Boundary Active
              </span>
            </div>

            {/* Crash / Standby Status */}
            <div className="pointer-events-auto">
              {activeCrashes.length > 0 ? (
                <div className="px-3 py-1.5 bg-red-950/90 backdrop-blur-md border border-red-500/60 rounded-xl flex items-center gap-2 text-xs font-bold text-red-300 shadow-md animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> 
                  <span>Active Crash Alerts ({activeCrashes.length})</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-400 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div> 
                  <span>Radar Standby • Zero Active Accidents</span>
                </div>
              )}
            </div>
          </div>

          {/* Map Canvas */}
          <div className="flex-1 w-full h-full min-h-[520px] relative z-0">
            <MapContainer 
              center={[22.5937, 78.9629]}
              zoom={5} 
              className="w-full h-full"
              zoomControl={false}
              style={{ background: '#070b14' }}
            >
              <MapController focusLocation={focusLocation} activeCrashesCount={activeCrashes.length} />
              
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url={mapLayers[activeLayer].url}
                className={mapLayers[activeLayer].cls}
              />

              {/* OUTLINE OF INDIA BY RED COLOR - INDICATES VALID ONLY FOR INDIA */}
              <GeoJSON
                data={INDIA_GEOJSON}
                style={{
                  color: '#ef4444', // Red border line
                  weight: 3.5,
                  opacity: 0.95,
                  fillColor: '#ef4444',
                  fillOpacity: 0.04
                }}
              />

              {/* LIVE ESP32 HARDWARE DEVICE LOCATION FROM /devices/RAKSHAK_001/location */}
              {deviceData?.location?.latitude !== undefined && deviceData?.location?.longitude !== undefined && (
                <Marker 
                  position={[deviceData.location.latitude, deviceData.location.longitude]} 
                  icon={esp32DeviceMarkerIcon}
                >
                  <Popup className="custom-popup">
                    <div className="text-slate-900 p-2 min-w-[220px]">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-xs font-mono text-blue-600">🛰️ RAKSHAK_001 Live HW</h4>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                          {deviceData.online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">ESP32 Hardware Tracker</p>
                      <p className="text-[11px] text-slate-600 mt-1">Lat: {deviceData.location.latitude}, Lng: {deviceData.location.longitude}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{deviceData.location.address || 'Real-time GPS coordinate stream'}</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* ONLY RENDER WHEN ACCIDENTS ARE ALIVE / TRIGGERED */}
              {activeCrashes.map((crash) => {
                const assign = crash.assignment || {};
                const hosp = crash.hospital;
                const isDispatched = crash.isDispatched;

                return (
                  <React.Fragment key={crash.id}>
                    {/* 1. Crash Incident Marker */}
                    <Marker 
                      position={[crash.lat, crash.lng]} 
                      icon={crashIncidentIcon}
                      eventHandlers={{ click: () => setSelectedCrash(crash) }}
                    >
                      <Popup className="custom-popup">
                        <div className="text-slate-900 p-2 min-w-[220px]">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-xs font-mono text-red-600">🚨 Crash Trigger: {crash.id}</h4>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                              {crash.gForce}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">{crash.vehicle}</p>
                          <p className="text-[11px] text-slate-600 mt-1">Driver: {crash.reporterId}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{crash.loc}</p>
                          
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            {isDispatched ? (
                              <p className="text-[11px] font-bold text-orange-600 flex items-center gap-1">
                                🚑 Ambulance Dispatched: {assign.ambulanceName || 'ALS Unit'}
                              </p>
                            ) : (
                              <p className="text-[11px] font-bold text-amber-600">
                                ⚠️ Awaiting Hospital Ambulance Dispatch
                              </p>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>

                    {/* 2. Hospital & Ambulance Vectoring - ONLY SHOWN WHEN DISPATCHED BY HOSPITAL */}
                    {isDispatched && hosp && (
                      <>
                        {/* Assigned Trauma Hospital Marker */}
                        <Marker position={[hosp.lat, hosp.lng]} icon={hospitalMarkerIcon}>
                          <Popup>
                            <div className="p-1 text-slate-900 font-sans">
                              <h3 className="font-bold text-blue-600 text-xs">🏥 {hosp.name}</h3>
                              <p className="text-[11px] mt-0.5 text-slate-600">Emergency Trauma Reception</p>
                              <p className="text-[11px] font-semibold text-emerald-600">Dispatched Rescue Ambulance</p>
                            </div>
                          </Popup>
                        </Marker>

                        {/* Real-time Tracking Dispatched Ambulance */}
                        {assign.currentLat && assign.currentLng && (
                          <>
                            <Marker position={[assign.currentLat, assign.currentLng]} icon={ambulanceDispatchedIcon}>
                              <Popup>
                                <div className="p-1 text-slate-900 font-sans">
                                  <h3 className="font-bold text-orange-600 text-xs">🚑 {assign.ambulanceName || 'ALS Emergency Ambulance'}</h3>
                                  <p className="text-[11px]">Driver: {assign.driver || 'Rescue Officer'} ({assign.phone || hosp.phone})</p>
                                  <p className="text-[11px] text-blue-600 font-bold">En Route to Crash Site</p>
                                </div>
                              </Popup>
                            </Marker>

                            {/* Active Corridor Route Vector */}
                            <Polyline 
                              positions={[
                                [hosp.lat, hosp.lng],
                                [assign.currentLat, assign.currentLng],
                                [crash.lat, crash.lng]
                              ]}
                              pathOptions={{ color: '#ea580c', weight: 4, dashArray: '6, 8' }}
                            />
                          </>
                        )}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Sidebar Data Panel */}
        <div className="bolt-card rounded-2xl flex flex-col overflow-hidden border border-slate-800">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex justify-between items-center">
            {activeCrashes.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Active Crash Triage ({activeCrashes.length})
                </h3>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Radar Standby Status
                </h3>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeCrashes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">No Active Accidents</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Continuous telematics listening active across national corridors.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Sensors Active & Standing By</span>
                </div>
              </div>
            ) : (
              activeCrashes.map(alert => (
                <div 
                  key={alert.id}
                  onClick={() => {
                    setSelectedCrash(alert);
                    setFocusLocation([alert.lat, alert.lng]);
                  }}
                  className="p-3.5 rounded-xl border border-red-500/40 bg-red-950/20 hover:bg-red-950/40 cursor-pointer transition-all flex flex-col gap-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-red-400 animate-pulse" />
                      <span className="font-bold text-white text-xs font-mono">{alert.id}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-900/60 text-red-300 border border-red-500/30">
                      {alert.gForce}
                    </span>
                  </div>

                  <div className="text-xs">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Car size={13} className="text-slate-400" />
                      {alert.vehicle}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                      <User size={12} /> {alert.reporterId}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-1.5">
                    <MapPin size={13} className="text-red-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{alert.loc}</span>
                  </div>

                  {/* Dispatch status */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    {alert.isDispatched ? (
                      <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                        <Ambulance size={12} /> Ambulance Dispatched
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Clock size={12} /> Awaiting Dispatch
                      </span>
                    )}

                    <Link
                      to="/admin/ambulance"
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <span>Dispatch Console</span>
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
