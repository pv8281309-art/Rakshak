import React, { useState } from 'react';
import { useHotspotClustering, Cluster } from '../../hooks/useHotspotClustering';
import { Circle, Popup } from 'react-leaflet';
import { calculateDistance } from '../../lib/geo';


interface HotspotLayerProps {
  alerts: any[];
  radius: number;
  threshold: number;
  timeWindowHours: number;
}

export const HotspotLayer: React.FC<HotspotLayerProps> = ({ alerts, radius, threshold, timeWindowHours }) => {
  const [selectedHotspot, setSelectedHotspot] = useState<Cluster | null>(null);

  const hotspots = useHotspotClustering(alerts, radius, threshold, timeWindowHours);

  return (
    <>
      {hotspots.map(cluster => {
        // Density visualization logic
        const ratio = cluster.intensityScore;
        const intensity = cluster.intensityLabel;
        
        let color = '#ef4444'; // Red for threshold reached
        let fillColor = '#ef4444';
        let fillOpacity = 0.4 + (ratio * 0.4);

        if (intensity === 'high-density') {
          color = '#b91c1c'; // Darker red for high density
          fillColor = '#b91c1c';
          fillOpacity = 0.6 + (ratio * 0.3);
        }

        const activeCount = cluster.points.filter(p => p.data.status !== 'resolved').length;
        const resolvedCount = cluster.points.length - activeCount;
        
        // Calculate severities
        let critical = 0, high = 0, medium = 0, low = 0;
        cluster.points.forEach(p => {
          const sev = p.data.severity?.toLowerCase();
          if (sev === 'critical' || p.data.status === 'sos') critical++;
          else if (sev === 'high') high++;
          else if (sev === 'medium') medium++;
          else low++;
        });

        // Calculate average frequency (events per day over the time window)
        const days = timeWindowHours > 0 ? timeWindowHours / 24 : 30; // default to 30 if all time
        const avgFrequency = (cluster.points.length / days).toFixed(1);

        const firstDetected = cluster.points.reduce((oldest, p) => {
          const time = p.data.createdAt?.seconds ? p.data.createdAt.toDate() : new Date(p.data.createdAt || p.data.timestamp);
          return time < oldest ? time : oldest;
        }, new Date());
        
        const lastSOS = cluster.points.reduce((newest, p) => {
          const time = p.data.createdAt?.seconds ? p.data.createdAt.toDate() : new Date(p.data.createdAt || p.data.timestamp);
          return time > newest ? time : newest;
        }, new Date(0));

        return (
          <Circle
            key={cluster.id}
            center={[cluster.lat, cluster.lng]}
            radius={radius}
            pathOptions={{ color, fillColor, fillOpacity, weight: 2 }}
          >
            <Popup className="custom-popup min-w-[280px]">
              <div className="text-slate-100 p-2 space-y-3">
                <div className="border-b border-slate-700 pb-2">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rakshak-red animate-pulse"></div>
                    Accident Hotspot
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Status: <span className="text-rakshak-red font-bold uppercase">{intensity === 'high-density' ? 'HIGH-DENSITY HOTSPOT' : 'HOTSPOT DETECTED'}</span></p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/50 p-2 rounded">
                    <p className="text-slate-400 mb-0.5">SOS Events</p>
                    <p className="font-bold text-lg">{cluster.points.length}</p>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded">
                    <p className="text-slate-400 mb-0.5">Area Radius</p>
                    <p className="font-bold text-lg">{radius}m</p>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded">
                    <p className="text-slate-400 mb-0.5">Active</p>
                    <p className="font-bold text-rakshak-red">{activeCount}</p>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded">
                    <p className="text-slate-400 mb-0.5">Resolved</p>
                    <p className="font-bold text-rakshak-green">{resolvedCount}</p>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <p className="flex justify-between"><span className="text-slate-400">First Detected:</span> <span>{firstDetected.toLocaleDateString()}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Last SOS:</span> <span>{lastSOS.toLocaleDateString()} {lastSOS.toLocaleTimeString()}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Avg. Frequency:</span> <span>{avgFrequency} / day</span></p>
                </div>

                <div className="text-xs">
                  <p className="text-slate-400 mb-1">Severity Distribution:</p>
                  <div className="flex gap-2">
                    {critical > 0 && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">Critical: {critical}</span>}
                    {high > 0 && <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded">High: {high}</span>}
                    {medium > 0 && <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">Med: {medium}</span>}
                    {low > 0 && <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">Low: {low}</span>}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700">
                  <p className="text-[10px] text-slate-500 italic leading-tight mb-2">
                    This hotspot was detected automatically from real SOS activity.
                  </p>
                  <button 
                    onClick={() => console.log('View SOS Events for cluster:', cluster.id)}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-semibold text-white transition-colors"
                  >
                    VIEW SOS EVENTS
                  </button>
                </div>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </>
  );
};
