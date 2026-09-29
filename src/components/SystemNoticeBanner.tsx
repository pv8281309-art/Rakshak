import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const SystemNoticeBanner: React.FC<{ isAdmin?: boolean; onClearNotice?: () => void }> = ({ isAdmin, onClearNotice }) => {
  const [notice, setNotice] = useState<{ message: string; priority: string; timestamp: number } | null>(() => {
    try {
      const saved = localStorage.getItem('rakshak_system_notice');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let unsubscribe: any = null;
    const updateNotice = (data: any) => {
      if (data && data.message) {
        setNotice(data);
        try {
          localStorage.setItem('rakshak_system_notice', JSON.stringify(data));
        } catch {}
      } else {
        setNotice(null);
        try {
          localStorage.removeItem('rakshak_system_notice');
        } catch {}
      }
    };

    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('rakshak_system_notice');
        setNotice(saved ? JSON.parse(saved) : null);
      } catch {
        setNotice(null);
      }
    };

    window.addEventListener('storage', handleStorage);

    if (isFirebaseConfigured && db) {
      unsubscribe = onSnapshot(doc(db, 'system_notices', 'active'), (docSnap) => {
        if (docSnap.exists()) {
          updateNotice(docSnap.data());
        } else {
          updateNotice(null);
        }
      }, () => {
        handleStorage();
      });
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!notice) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-700 text-white px-4 py-2.5 shadow-lg relative z-50 flex items-center justify-between gap-3 font-sans border-b border-white/20">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
          <Megaphone size={14} className="text-white" />
        </div>
        <div className="text-xs font-bold tracking-wide uppercase truncate">
          <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] font-mono mr-2">SYSTEM NOTICE</span>
          {notice.message}
        </div>
      </div>

      {isAdmin && onClearNotice && (
        <button
          onClick={onClearNotice}
          className="px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 text-white text-[11px] font-bold font-mono tracking-wider transition-colors shrink-0 cursor-pointer border border-white/30"
          title="Clear Notice from all panels"
        >
          Clear Notice (Admin)
        </button>
      )}
    </div>
  );
};
