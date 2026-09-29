import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  Megaphone, 
  AlertTriangle, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminSettings() {
  const { signOut } = useAuth();
  const useNavigateInstance = useNavigate();

  const [noticeText, setNoticeText] = useState('');
  const [activeNotice, setActiveNotice] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('rakshak_system_notice');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [successMsg, setSuccessMsg] = useState('');

  const handleBroadcastNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeText.trim()) return;

    const payload = {
      message: noticeText.trim(),
      priority: 'URGENT',
      timestamp: Date.now(),
      author: 'System Administrator'
    };

    try {
      localStorage.setItem('rakshak_system_notice', JSON.stringify(payload));
      setActiveNotice(payload);
      window.dispatchEvent(new Event('storage'));

      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'system_notices', 'active'), payload);
      }
      setNoticeText('');
      setSuccessMsg('Notice successfully broadcasted to all connected panels (Users, Families, Hospitals).');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      console.error('Error broadcasting notice:', e);
    }
  };

  const handleClearNotice = async () => {
    try {
      localStorage.removeItem('rakshak_system_notice');
      setActiveNotice(null);
      window.dispatchEvent(new Event('storage'));

      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'system_notices', 'active'), { message: '', timestamp: 0 });
      }
      setSuccessMsg('Active notice cleared by admin command.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      console.error('Error clearing notice:', e);
    }
  };

  const handleLogoutCommand = async () => {
    if (window.confirm('Are you sure you want to execute Logout Command and terminate current admin session?')) {
      await signOut();
      useNavigateInstance('/');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={13} /> System Administration & Command Gate
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            System Admin Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage global emergency broadcasts, persistent sticky notifications, and session security.
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold shadow-md">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Notice Section (Sticky Notification for all connected panels) */}
      <div className="bolt-card p-6 rounded-2xl border border-slate-800 space-y-4 bg-slate-900/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center">
              <Megaphone size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">System-Wide Notice Broadcast</h3>
              <p className="text-xs text-slate-400">
                Write a persistent sticky notification visible across all connected user, family, and hospital panels. Cannot be dismissed by clients; removable only by admin command.
              </p>
            </div>
          </div>
          {activeNotice && (
            <button
              onClick={handleClearNotice}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer shrink-0"
            >
              Clear Notice (Admin Only)
            </button>
          )}
        </div>

        <form onSubmit={handleBroadcastNotice} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Notice Content & Instructions for Connected Panels
            </label>
            <textarea
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              placeholder="Type urgent notice for all users, families, and hospitals (e.g., Highway emergency response drill on NH-48 in progress)..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
            >
              Broadcast Notice Across All Panels
            </button>
          </div>
        </form>

        {activeNotice && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-xs font-mono text-red-200 space-y-1 mt-3">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span>Currently Active Sticky Notice (Visible to All Panels):</span>
            </div>
            <p className="text-white font-sans text-sm pl-4">{activeNotice.message}</p>
            <p className="text-[10px] text-slate-400 pl-4 pt-1">Broadcasted at: {new Date(activeNotice.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Logout Command Section */}
      <div className="bolt-card p-6 rounded-2xl border border-slate-800 space-y-4 bg-slate-900/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Admin Session & Logout Command</h3>
              <p className="text-xs text-slate-400">
                Securely terminate the active administrator session and return to the main portal.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogoutCommand}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout Command</span>
          </button>
        </div>
      </div>
    </div>
  );
}
