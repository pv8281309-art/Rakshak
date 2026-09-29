import React, { useEffect, useState } from 'react';
import { useRakshakDevice } from '../hooks/useRakshakDevice';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RakshakAccidentNotifier: React.FC = () => {
  const { deviceData } = useRakshakDevice();
  const [showAlert, setShowAlert] = useState(false);
  const [lastAccidentState, setLastAccidentState] = useState(false);

  const isAccidentActive = deviceData?.status?.accident === true;
  const location = deviceData?.location;

  useEffect(() => {
    if (isAccidentActive && !lastAccidentState) {
      setShowAlert(true);
      // Play alert audio or trigger browser notification if allowed
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.8;
        audio.play().catch(() => {});
      } catch (e) {}
    } else if (!isAccidentActive) {
      setShowAlert(false);
    }
    setLastAccidentState(isAccidentActive);
  }, [isAccidentActive, lastAccidentState]);

  if (!showAlert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-xl px-4 pointer-events-auto"
      >
        <div className="bg-red-950/95 border-2 border-red-500 rounded-3xl p-5 shadow-2xl backdrop-blur-xl text-white flex items-start gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg">
            <ShieldAlert size={28} className="animate-bounce" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-red-200 text-base uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" /> CRITICAL ACCIDENT DETECTED!
              </h3>
              <button
                onClick={() => setShowAlert(false)}
                className="text-red-300 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-red-200 mt-1 font-mono">
              ESP32 hardware sensor confirmed G-force crash impact threshold exceeded on RAKSHAK_001.
            </p>
            {location?.address && (
              <p className="text-[11px] text-amber-300 mt-1.5 font-bold">
                📍 Location: {location.address}
              </p>
            )}
            <div className="mt-3 flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white uppercase tracking-wider">
                Admin Alert Triggered
              </span>
              <span className="text-[10px] text-red-300 font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
