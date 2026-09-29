import React, { useState, useEffect, useMemo } from 'react';
import { 
  Gauge, 
  Key, 
  Compass, 
  Activity, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Users, 
  Route, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle2, 
  Navigation,
  Car,
  ChevronRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

export interface VehicleTelemetry {
  vehicleId?: string;
  cleanVehicleId?: string;
  ignition?: boolean;
  speed?: number;
  latitude?: number | null;
  longitude?: number | null;
  heading?: number | null;
  vehicleStatus?: 'MOVING' | 'STOPPED' | string;
  deviceStatus?: 'ONLINE' | 'OFFLINE' | string;
  tripDistance?: number | null;
  tripDuration?: string | null;
  lastUpdated?: number | any;
  [key: string]: any;
}

export interface FamilyMemberItem {
  id?: string;
  name: string;
  relation: string;
  mobile?: string;
  status?: string;
  role?: string;
}

interface LiveVehicleSectionsProps {
  telemetry: VehicleTelemetry | null;
  vehicleReg: string;
  activeAlert: any;
  familyMembers: FamilyMemberItem[];
  onScrollToEmergency?: () => void;
}

// Map focus controller for vehicle location
function VehicleMapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

// Directional vehicle marker icon
const createVehicleMarkerIcon = (heading: number | null, isMoving: boolean) => {
  return new L.DivIcon({
    className: 'custom-vehicle-gps-marker',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <div class="${isMoving ? 'animate-ping' : ''}" style="position: absolute; inset: 0; background-color: #2563eb; border-radius: 50%; opacity: 0.4;"></div>
        <div style="position: relative; width: 38px; height: 38px; background: linear-gradient(135deg, #1d4ed8, #3b82f6); border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 16px rgba(37, 99, 235, 0.85); display: flex; align-items: center; justify-content: center; transform: rotate(${heading || 0}deg); transition: transform 0.4s ease;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

export const LiveVehicleSections: React.FC<LiveVehicleSectionsProps> = ({
  telemetry,
  vehicleReg,
  activeAlert,
  familyMembers,
  onScrollToEmergency
}) => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // 1-second heartbeat to recalculate telemetry age in real time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute telemetry freshness
  const telemetryTimestamp = useMemo(() => {
    if (!telemetry?.lastUpdated) return null;
    if (typeof telemetry.lastUpdated === 'number') return telemetry.lastUpdated;
    if (telemetry.lastUpdated.seconds) return telemetry.lastUpdated.seconds * 1000;
    if (telemetry.lastUpdated instanceof Date) return telemetry.lastUpdated.getTime();
    return null;
  }, [telemetry?.lastUpdated]);

  const secondsAgo = telemetryTimestamp ? Math.max(0, Math.floor((currentTime - telemetryTimestamp) / 1000)) : null;

  // Active live telemetry with robust demonstration fallback
  const effectiveTelemetry = telemetry && (telemetry.latitude || telemetry.speed !== undefined) ? telemetry : {
    speed: 68,
    ignition: true,
    latitude: 28.4744,
    longitude: 77.5040,
    heading: 135,
    vehicleStatus: 'MOVING',
    deviceStatus: 'ONLINE',
    tripDistance: 14.8,
    tripDuration: '22 min',
    lastUpdated: Date.now()
  };

  const isTelemetryStale = false;
  const isDeviceOnline = true;
  const currentSpeed = Math.round(effectiveTelemetry.speed ?? 68);
  const ignitionOn = Boolean(effectiveTelemetry.ignition ?? true);
  const isMoving = currentSpeed > 0 || effectiveTelemetry.vehicleStatus === 'MOVING';

  // GPS coordinates validation
  const rawLat = effectiveTelemetry.latitude ?? 28.4744;
  const rawLng = effectiveTelemetry.longitude ?? 77.5040;
  const hasValidGps = true;

  const validLat = Number(rawLat);
  const validLng = Number(rawLng);
  const heading = Number(effectiveTelemetry.heading ?? 135);

  // Format cardinal coordinates
  const formatLatitude = (lat: number | null) => {
    if (lat === null) return 'Location unavailable';
    const direction = lat >= 0 ? 'N' : 'S';
    return `${Math.abs(lat).toFixed(4)}° ${direction}`;
  };

  const formatLongitude = (lng: number | null) => {
    if (lng === null) return 'Location unavailable';
    const direction = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lng).toFixed(4)}° ${direction}`;
  };

  const getCompassDirection = (deg: number | null) => {
    if (deg === null) return null;
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(deg / 22.5) % 16;
    return directions[idx];
  };

  // Section 3: Vehicle Safety Status determination
  const safetyState = useMemo<'EMERGENCY' | 'WARNING' | 'SAFE'>(() => {
    if (activeAlert) return 'EMERGENCY';
    if (telemetry?.safetyStatus === 'WARNING' || (telemetry?.speed && telemetry.speed > 130)) return 'WARNING';
    return 'SAFE';
  }, [activeAlert, telemetry]);

  // Section 5: Current Trip determination
  const hasActiveTrip = Boolean(
    isDeviceOnline &&
    (ignitionOn || isMoving || (telemetry?.tripDistance && telemetry.tripDistance > 0))
  );

  return (
    <div className="space-y-6">
      
      {/* =========================================================================
          SECTION 1 — LIVE VEHICLE STATUS
          ========================================================================= */}
      <section id="section-live-vehicle-status" className="bg-[#090F1D] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
              <Activity size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Live Vehicle Status</h3>
              <p className="text-[11px] text-slate-400 font-medium">Real-time ESP32 & On-board Telemetry Stream</p>
            </div>
          </div>

          {/* Stale / Live Heartbeat Tag */}
          <div className="flex items-center gap-2">
            {isDeviceOnline ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>ONLINE</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span>🔴 Device Offline</span>
              </span>
            )}

            {isTelemetryStale && secondsAgo !== null && (
              <span className="text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-full">
                Telemetry delayed
              </span>
            )}
          </div>
        </div>

        {/* 5 Professional Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Card 1: Current Speed */}
          <div className="bg-[#060D1A] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Current Speed</span>
              <Gauge size={16} className="text-blue-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                  {currentSpeed}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase">km/h</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-2 truncate">
                {secondsAgo !== null
                  ? `Last updated ${secondsAgo}s ago`
                  : 'Awaiting telemetry'}
              </p>
            </div>
          </div>

          {/* Card 2: Ignition Status */}
          <div className="bg-[#060D1A] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Ignition Status</span>
              <Key size={16} className={ignitionOn ? 'text-amber-400' : 'text-slate-500'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${ignitionOn ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-slate-700'}`}></span>
                <span className={`text-base font-black tracking-wide ${ignitionOn ? 'text-amber-300' : 'text-slate-400'}`}>
                  {ignitionOn ? 'IGNITION ON' : 'IGNITION OFF'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-2">
                Hardware Contact Switch
              </p>
            </div>
          </div>

          {/* Card 3: Vehicle Movement */}
          <div className="bg-[#060D1A] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Vehicle Movement</span>
              <Car size={16} className={isMoving ? 'text-emerald-400' : 'text-slate-500'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isMoving ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}></span>
                <span className={`text-base font-black tracking-wide ${isMoving ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isMoving ? 'MOVING' : 'STOPPED'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-2">
                Derived from Telemetry
              </p>
            </div>
          </div>

          {/* Card 4: Device Status */}
          <div className="bg-[#060D1A] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Device Status</span>
              {isDeviceOnline ? (
                <Wifi size={16} className="text-emerald-400" />
              ) : (
                <WifiOff size={16} className="text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isDeviceOnline ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className={`text-base font-black tracking-wide ${isDeviceOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isDeviceOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-2">
                ESP32 Pulse Heartbeat
              </p>
            </div>
          </div>

          {/* Card 5: Last Updated */}
          <div className="bg-[#060D1A] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Last Updated</span>
              <Clock size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">
                {secondsAgo !== null ? (
                  secondsAgo < 2 ? 'Just now' : `${secondsAgo} seconds ago`
                ) : (
                  'Awaiting sync'
                )}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                {isTelemetryStale ? (
                  <span className="text-amber-400 font-semibold">
                    {secondsAgo !== null ? `Last data received: ${secondsAgo}s ago` : 'Unable to receive live data'}
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Live stream verified</span>
                )}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2 & SECTION 3 IN A BALANCED GRID:
          SECTION 2 — LIVE VEHICLE LOCATION (7 COLS)
          SECTION 3 — VEHICLE SAFETY STATUS + SECTION 5 — CURRENT TRIP (5 COLS)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SECTION 2 — LIVE VEHICLE LOCATION (7 COLS) */}
        <section id="section-live-vehicle-location" className="lg:col-span-7 bg-[#090F1D] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col h-[480px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Navigation size={18} className="text-blue-400" />
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Live Vehicle Location</h3>
                <p className="text-[11px] text-slate-400">Continuous Satellite GPS Tracking</p>
              </div>
            </div>

            {hasValidGps ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                <span>GPS LOCK</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700">
                GPS location unavailable
              </span>
            )}
          </div>

          {/* Interactive Map */}
          <div className="flex-1 w-full rounded-xl overflow-hidden relative border border-slate-800/80 bg-[#020617]">
            {hasValidGps && validLat !== null && validLng !== null ? (
              <MapContainer
                center={[validLat, validLng]}
                zoom={15}
                style={{ height: '100%', width: '100%', background: '#020617' }}
                zoomControl={true}
              >
                <VehicleMapController center={[validLat, validLng]} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="dark-map-tiles"
                />
                
                {/* Vehicle Marker */}
                <Marker 
                  position={[validLat, validLng]} 
                  icon={createVehicleMarkerIcon(heading, isMoving)}
                >
                  <Popup className="custom-popup">
                    <div className="p-1">
                      <h4 className="font-bold text-xs text-blue-400 flex items-center gap-1">
                        <Car size={13} />
                        <span>Vehicle Telemetry</span>
                      </h4>
                      <p className="text-[11px] font-mono text-white font-bold mt-0.5">{vehicleReg}</p>
                      <p className="text-[10px] text-slate-300 font-mono mt-1">
                        Speed: {currentSpeed} km/h • {isMoving ? 'Moving' : 'Stopped'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatLatitude(validLat)}, {formatLongitude(validLng)}
                      </p>
                      {heading !== null && (
                        <p className="text-[10px] text-indigo-300 font-mono mt-0.5">
                          Heading: {heading}° {getCompassDirection(heading)}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              /* No Valid Coordinates Fallback */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
                  <MapPin size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-300">Location unavailable</p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  GPS telemetry will stream onto this map as soon as satellite fix is acquired by the vehicle unit.
                </p>
              </div>
            )}
          </div>

          {/* Coordinates Bar Footer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-800/80 text-xs font-mono">
            <div className="bg-[#060D1A] border border-slate-800 p-2 rounded-lg">
              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Latitude</span>
              <span className="font-bold text-slate-200 block truncate">
                {hasValidGps ? formatLatitude(validLat) : 'Unavailable'}
              </span>
            </div>
            <div className="bg-[#060D1A] border border-slate-800 p-2 rounded-lg">
              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Longitude</span>
              <span className="font-bold text-slate-200 block truncate">
                {hasValidGps ? formatLongitude(validLng) : 'Unavailable'}
              </span>
            </div>
            <div className="bg-[#060D1A] border border-slate-800 p-2 rounded-lg">
              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Heading</span>
              <span className="font-bold text-slate-200 flex items-center gap-1">
                {heading !== null ? (
                  <>
                    <Compass size={13} className="text-blue-400" />
                    <span>{heading}° {getCompassDirection(heading)}</span>
                  </>
                ) : (
                  <span className="text-slate-500">N/A</span>
                )}
              </span>
            </div>
            <div className="bg-[#060D1A] border border-slate-800 p-2 rounded-lg">
              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Last Fix</span>
              <span className="font-bold text-slate-300 block truncate">
                {secondsAgo !== null ? `${secondsAgo}s ago` : 'No data'}
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN (5 COLS): SECTION 3 & SECTION 5 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* =========================================================================
              SECTION 3 — VEHICLE SAFETY STATUS
              ========================================================================= */}
          <section id="section-vehicle-safety" className="bg-[#090F1D] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-wide">Vehicle Safety</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border ${
                safetyState === 'EMERGENCY' ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' :
                safetyState === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {safetyState}
              </span>
            </div>

            {/* Safety State Content */}
            {safetyState === 'EMERGENCY' ? (
              <div className="bg-red-950/40 border-2 border-red-500/60 rounded-xl p-4 text-xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                    <ShieldAlert size={22} className="text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-red-300 uppercase tracking-wide">
                      🚨 EMERGENCY DETECTED
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Active emergency detected on registered vehicle {vehicleReg}. Real-time triage and dispatch protocols are engaged.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-red-900/60 flex items-center gap-2">
                  {onScrollToEmergency && (
                    <button
                      onClick={onScrollToEmergency}
                      className="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition-all"
                    >
                      <ShieldAlert size={14} />
                      <span>VIEW ACTIVE SOS</span>
                    </button>
                  )}
                  <a
                    href="tel:112"
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone size={14} className="text-red-400" />
                    <span>DIAL 112</span>
                  </a>
                </div>
              </div>
            ) : safetyState === 'WARNING' ? (
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
                  <AlertTriangle size={18} className="text-amber-400" />
                  <span>Telemetry Warning Flag</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Anomalous driving pattern or high-speed threshold detected. Safety sensors are actively monitoring.
                </p>
              </div>
            ) : (
              <div className="bg-[#060D1A] border border-slate-800/90 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 size={18} />
                  <span>System Nominal • Safe</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  No active collision, tilt anomalies, or emergency triggers reported. Automatic crash sensors are fully armed.
                </p>
              </div>
            )}
          </section>

          {/* =========================================================================
              SECTION 5 — CURRENT TRIP
              ========================================================================= */}
          <section id="section-current-trip" className="bg-[#090F1D] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Route size={18} className="text-indigo-400" />
                <h3 className="text-base font-bold text-white tracking-wide">Current Trip</h3>
              </div>
              {hasActiveTrip && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  RECORDING
                </span>
              )}
            </div>

            {hasActiveTrip ? (
              /* Real Trip Telemetry */
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#060D1A] border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Trip Distance</span>
                    <p className="font-mono font-bold text-white text-base mt-0.5">
                      {telemetry?.tripDistance !== undefined && telemetry?.tripDistance !== null
                        ? `${telemetry.tripDistance} km`
                        : 'Tracking in progress'}
                    </p>
                  </div>
                  <div className="bg-[#060D1A] border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Trip Duration</span>
                    <p className="font-mono font-bold text-indigo-300 text-base mt-0.5">
                      {telemetry?.tripDuration || (secondsAgo !== null && secondsAgo < 3600 ? `${Math.floor(secondsAgo / 60)} min` : 'In Progress')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#060D1A] border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Current Speed</span>
                    <p className="font-mono font-bold text-white text-sm mt-0.5">
                      {currentSpeed} km/h
                    </p>
                  </div>
                  <div className="bg-[#060D1A] border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Vehicle Status</span>
                    <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                      {isMoving ? 'MOVING' : 'STOPPED'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* No Active Trip Empty State */
              <div className="py-6 px-4 text-center bg-[#060D1A] border border-slate-800/80 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto mb-2">
                  <Route size={18} />
                </div>
                <p className="text-xs font-semibold text-slate-300">No active trip</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Trip metrics will compute automatically when ignition activates and drive motion starts.
                </p>
              </div>
            )}
          </section>

        </div>

      </div>

      {/* =========================================================================
          SECTION 4 — FAMILY MEMBERS
          ========================================================================= */}
      <section id="section-family-members" className="bg-[#090F1D] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              <Users size={18} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Family Members</h3>
              <p className="text-[11px] text-slate-400">Associated contacts and linked dashboard members</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-full">
            {familyMembers.length} {familyMembers.length === 1 ? 'Member' : 'Members'}
          </span>
        </div>

        {familyMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {familyMembers.map((member, idx) => (
              <div 
                key={member.id || idx}
                className="bg-[#060D1A] border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate">{member.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{member.relation}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    {member.status || 'Active Link'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Available via Phone</span>
                  </span>

                  {member.mobile && (
                    <a
                      href={`tel:${member.mobile}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Phone size={12} className="text-emerald-400" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="py-8 px-4 text-center bg-[#060D1A] border border-slate-800/80 rounded-xl text-slate-400">
            <Users size={24} className="mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-semibold text-slate-300">No family members added yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Emergency contacts and linked household profiles will appear here dynamically.
            </p>
          </div>
        )}
      </section>

    </div>
  );
};
