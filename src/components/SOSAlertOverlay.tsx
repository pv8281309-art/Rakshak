import React, { useEffect, useRef } from 'react';
import { ShieldAlert, BellRing, MapPin, Navigation, CheckCircle2 } from 'lucide-react';

interface SOSAlertOverlayProps {
  activeAlert: any;
  onDismiss: () => void;
  onViewTracking: () => void;
  userName?: string;
  vehicleReg?: string;
}

export const SOSAlertOverlay: React.FC<SOSAlertOverlayProps> = ({
  activeAlert,
  onDismiss,
  onViewTracking,
  userName = 'Primary Driver',
  vehicleReg = 'DL 01 AX 4589'
}) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<any>(null);

  const isActiveSos = Boolean(
    activeAlert && 
    (activeAlert.status === 'active' || 
     activeAlert.sos_status === 'active' || 
     activeAlert.status === 'new' || 
     activeAlert.status === 'responding' || 
     activeAlert.status === 'dispatched' || 
     activeAlert.status === 'en_route') &&
    activeAlert.status !== 'resolved' &&
    activeAlert.status !== 'cancelled' &&
    activeAlert.status !== 'false_alarm' &&
    activeAlert.active !== false
  );

  useEffect(() => {
    if (isActiveSos) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContextClass();
          }
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') {
            ctx.resume();
          }

          const playPersistentTone = () => {
            try {
              if (!audioCtxRef.current) return;
              const osc = audioCtxRef.current.createOscillator();
              const gain = audioCtxRef.current.createGain();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(920, audioCtxRef.current.currentTime);
              osc.frequency.exponentialRampToValueAtTime(1450, audioCtxRef.current.currentTime + 0.3);
              
              gain.gain.setValueAtTime(1.0, audioCtxRef.current.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.3);

              osc.connect(gain);
              gain.connect(audioCtxRef.current.destination);
              osc.start();
              osc.stop(audioCtxRef.current.currentTime + 0.3);
            } catch (e) {}
          };

          playPersistentTone();
          intervalRef.current = setInterval(playPersistentTone, 550);
        }
      } catch (e) {}
    } else {
      // Stop sound immediately if not active
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [isActiveSos]);

  if (!isActiveSos || !activeAlert) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="max-w-lg w-full bg-[#0D1527] border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.4)] text-slate-100 space-y-6 relative overflow-hidden">
        {/* Pulsing Glow Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0 animate-bounce">
            <ShieldAlert size={34} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold mb-1">
              <BellRing size={12} className="animate-ping" />
              <span>CRITICAL EMERGENCY SOS ACTIVE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Accident / Impact Detected</h2>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-400">Driver & Vehicle</span>
            <span className="font-bold text-white">{userName} ({vehicleReg})</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-400">Alert Status</span>
            <span className="font-bold text-red-400 uppercase font-mono">
              {activeAlert.status || activeAlert.sos_status || 'ACTIVE'}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-400">Alert Message</span>
            <span className="font-semibold text-red-300 text-right max-w-[220px] truncate">
              {activeAlert.message || 'Collision detected. Automatic dispatch requested.'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">GPS Location</span>
            <span className="font-mono text-blue-400 flex items-center gap-1">
              <MapPin size={12} /> {activeAlert.lat?.toFixed(4) || '28.5355'}, {activeAlert.lng?.toFixed(4) || '77.3910'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center leading-relaxed">
          An emergency response unit has been notified and dispatched. Click <strong className="text-white">View Live Tracking</strong> to monitor the exact ambulance route or <strong className="text-white">Dismiss & Archive</strong> once acknowledged.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onViewTracking}
            className="w-full sm:flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
          >
            <Navigation size={16} />
            <span>View Live Tracking</span>
          </button>
          
          <button
            onClick={onDismiss}
            className="w-full sm:flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Dismiss & Archive</span>
          </button>
        </div>
      </div>
    </div>
  );
};
