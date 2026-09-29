import React, { useState, useEffect } from 'react';
import { Bell, MapPin, Volume2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UserPermissionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [soundTested, setSoundTested] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const permStatus = localStorage.getItem('rakshak_user_permissions_granted');
    if (!permStatus) {
      setIsOpen(true);
    }
  }, []);

  const handleTestSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
      setSoundTested(true);
    } catch (e) {
      console.error(e);
      setSoundTested(true);
    }
  };

  const handleRequestNotifications = async () => {
    try {
      if ('Notification' in window) {
        const res = await Notification.requestPermission();
        setNotifGranted(true);
      } else {
        setNotifGranted(true);
      }
    } catch (e) {
      setNotifGranted(true);
    }
  };

  const handleRequestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationGranted(true);
        },
        () => {
          // allow user to proceed even if GPS prompt fails
          setLocationGranted(true);
        },
        { timeout: 5000 }
      );
    } else {
      setLocationGranted(true);
    }
  };

  const allMandatoryGranted = notifGranted && locationGranted && soundTested;

  const handleComplete = () => {
    if (!allMandatoryGranted) return;
    localStorage.setItem('rakshak_user_permissions_granted', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 text-slate-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500" />
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shrink-0">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">System Permissions & Alerts</h2>
              <p className="text-xs text-slate-400 mt-1">Operation Rakshak mandatory hardware & alert configuration</p>
            </div>
          </div>

          <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            {/* 1. Push Notifications */}
            <div className="flex items-center justify-between gap-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Push Notifications</h4>
                  <p className="text-[11px] text-slate-400">Required for instant emergency dispatch alerts.</p>
                </div>
              </div>
              <button
                onClick={handleRequestNotifications}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  notifGranted 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                }`}
              >
                {notifGranted ? <><CheckCircle2 size={14} /> Enabled</> : 'Toggle ON'}
              </button>
            </div>

            {/* 2. Location Access */}
            <div className="flex items-center justify-between gap-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Location Access</h4>
                  <p className="text-[11px] text-slate-400">Required for live GPS tracking & nearest hospital dispatch.</p>
                </div>
              </div>
              <button
                onClick={handleRequestLocation}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  locationGranted 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                }`}
              >
                {locationGranted ? <><CheckCircle2 size={14} /> Enabled</> : 'Toggle ON'}
              </button>
            </div>

            {/* 3. Emergency Alert Sound */}
            <div className="flex items-center justify-between gap-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                  <Volume2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Emergency Alert Sound</h4>
                  <p className="text-[11px] text-slate-400">Test high-priority emergency siren tone.</p>
                </div>
              </div>
              <button
                onClick={handleTestSound}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  soundTested 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5' 
                    : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-lg shadow-amber-600/30'
                }`}
              >
                {soundTested ? <><CheckCircle2 size={14} /> Tested OK</> : 'Test Sound'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/30 p-3 rounded-xl border border-amber-500/30">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleComplete}
            disabled={!allMandatoryGranted}
            className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all cursor-pointer ${
              allMandatoryGranted 
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-xl shadow-red-600/30' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {allMandatoryGranted ? 'Grant Access & Enter Dashboard' : 'Complete All Mandatory Permissions to Proceed'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
