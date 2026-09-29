import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HospitalRecommendationItem } from '../../types/emergency';
import { MapPin, Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';

// Fix Leaflet marker icons in React/Vite
const createCustomIcon = (color: string, label: string, isPulsing: boolean = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: ${color};
        color: white;
        font-weight: 900;
        font-size: 13px;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        cursor: pointer;
        ${isPulsing ? 'animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;' : ''}
      ">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

interface EmergencyMapProps {
  accidentLat: number | null;
  accidentLng: number | null;
  accidentLocationText: string;
  recommendations: HospitalRecommendationItem[];
  assignedHospitalId?: string | null;
  ambulanceLocation?: { lat: number; lng: number; speed?: number; etaText?: string } | null;
  onSelectHospital?: (hospital: HospitalRecommendationItem) => void;
}

// Helper component to auto-pan/fit map bounds
const MapBoundsController: React.FC<{
  accidentLat: number | null;
  accidentLng: number | null;
  hospitals: HospitalRecommendationItem[];
}> = ({ accidentLat, accidentLng, hospitals }) => {
  const map = useMap();

  useEffect(() => {
    if (accidentLat !== null && accidentLng !== null) {
      const bounds = L.latLngBounds([[accidentLat, accidentLng]]);
      
      hospitals.forEach(h => {
        if (h.coordinates?.lat && h.coordinates?.lng) {
          bounds.extend([h.coordinates.lat, h.coordinates.lng]);
        }
      });

      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, accidentLat, accidentLng, hospitals]);

  return null;
};

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  accidentLat,
  accidentLng,
  accidentLocationText,
  recommendations,
  assignedHospitalId,
  ambulanceLocation,
  onSelectHospital
}) => {
  const hasValidLocation = accidentLat !== null && accidentLng !== null && !isNaN(accidentLat) && !isNaN(accidentLng);

  const assignedHospital = useMemo(() => {
    if (!assignedHospitalId) return recommendations[0] || null;
    return recommendations.find(h => h.hospitalId === assignedHospitalId) || recommendations[0] || null;
  }, [recommendations, assignedHospitalId]);

  if (!hasValidLocation) {
    return (
      <div className="w-full h-72 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-200">GPS Location Unavailable</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Accident report did not transmit valid telemetry coordinates. Emergency dispatched based on reported location: <span className="text-cyan-400 font-medium">{accidentLocationText}</span>.
        </p>
      </div>
    );
  }

  const accidentIcon = createCustomIcon('#dc2626', '🚨', true);
  const ambulanceIcon = createCustomIcon('#0284c7', '🚑', false);

  // Route between accident and assigned hospital
  const routePolyline = (assignedHospital && assignedHospital.coordinates) ? [
    [accidentLat!, accidentLng!],
    [assignedHospital.coordinates.lat, assignedHospital.coordinates.lng]
  ] as [number, number][] : [];

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner bg-slate-950">
      <MapContainer
        center={[accidentLat!, accidentLng!]}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsController 
          accidentLat={accidentLat} 
          accidentLng={accidentLng} 
          hospitals={recommendations} 
        />

        {/* Accident Pulse Circle */}
        <Circle
          center={[accidentLat!, accidentLng!]}
          radius={800}
          pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, weight: 1.5 }}
        />

        {/* Accident Marker */}
        <Marker position={[accidentLat!, accidentLng!]} icon={accidentIcon}>
          <Popup className="custom-leaflet-popup">
            <div className="p-1 space-y-1 text-slate-900 font-sans">
              <span className="text-[10px] font-bold uppercase text-red-600 tracking-wider">Incident Ground Zero</span>
              <p className="text-xs font-bold leading-tight">{accidentLocationText}</p>
              <p className="text-[10px] text-slate-600 font-mono">
                {accidentLat!.toFixed(4)}, {accidentLng!.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Live Ambulance Marker */}
        {ambulanceLocation && (
          <Marker position={[ambulanceLocation.lat, ambulanceLocation.lng]} icon={ambulanceIcon}>
            <Popup className="custom-leaflet-popup">
              <div className="p-1 text-slate-900 font-sans">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Emergency Ambulance</span>
                <p className="text-xs font-bold">Speed: {ambulanceLocation.speed || 55} km/h</p>
                <p className="text-xs text-slate-600">ETA: {ambulanceLocation.etaText || '8 mins'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Recommended & Alternative Hospital Markers */}
        {recommendations.map((hosp, idx) => {
          if (!hosp.coordinates?.lat || !hosp.coordinates?.lng) return null;
          
          const isRank1 = hosp.rank === 1;
          const isAssigned = hosp.hospitalId === assignedHospitalId;
          const markerColor = isAssigned 
            ? '#10b981' // Green
            : isRank1 
              ? '#f59e0b' // Gold
              : '#3b82f6'; // Blue

          const hospIcon = createCustomIcon(
            markerColor, 
            isRank1 ? '1' : hosp.rank === 2 ? '2' : '3', 
            isAssigned
          );

          return (
            <Marker 
              key={hosp.hospitalId} 
              position={[hosp.coordinates.lat, hosp.coordinates.lng]} 
              icon={hospIcon}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 space-y-2 text-slate-900 font-sans min-w-[200px]">
                  <div className="flex items-center justify-between gap-2 border-b pb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      {isRank1 ? '🥇 Primary Match' : `Rank #${hosp.rank}`}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      {hosp.distanceKm} km • {hosp.etaText}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{hosp.hospitalName}</h5>
                    <p className="text-[10px] text-slate-500 truncate">{hosp.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">ICU Beds:</span>
                      <span className="font-bold text-indigo-700">{hosp.resourcesSnapshot.icuBedsAvailable} free</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Emergency:</span>
                      <span className="font-bold text-emerald-700">{hosp.resourcesSnapshot.emergencyBedsAvailable} free</span>
                    </div>
                  </div>

                  {onSelectHospital && (
                    <button
                      onClick={() => onSelectHospital(hosp)}
                      className="w-full mt-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold text-center transition-colors"
                    >
                      {isAssigned ? 'Assigned Facility' : 'Select Facility'}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Line to Assigned Hospital */}
        {routePolyline.length === 2 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: '#38bdf8',
              weight: 3.5,
              dashArray: '8, 8',
              opacity: 0.85
            }}
          />
        )}
      </MapContainer>

      {/* Map Overlay Badge */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] font-medium text-slate-300 flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Live Emergency Geofence • Dynamic ETA Routing</span>
      </div>
    </div>
  );
};
