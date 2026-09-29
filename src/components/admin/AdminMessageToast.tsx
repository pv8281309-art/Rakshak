import React from 'react';
import { useAdminMessages } from '../../contexts/AdminMessageContext';
import { Building2, X, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react';

export const AdminMessageToast: React.FC = () => {
  const { activeNotification, dismissNotification, openDrawer } = useAdminMessages();

  if (!activeNotification) return null;

  const isCritical = activeNotification.priority === 'CRITICAL' || activeNotification.priority === 'HIGH';

  return (
    <div className="fixed bottom-6 right-6 z-[160] max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-start gap-3 transition-all ${
        isCritical 
          ? 'bg-red-950/90 border-red-500/50 shadow-red-950/50 text-white' 
          : 'bg-slate-900/95 border-cyan-500/40 shadow-slate-950/60 text-white'
      }`}>
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
          isCritical 
            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
            : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
        }`}>
          {isCritical ? <AlertTriangle size={20} /> : <MessageSquare size={20} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <h4 className="font-bold text-xs truncate">
              {activeNotification.hospitalName}
            </h4>
            <span className="text-[10px] font-mono opacity-60">
              {activeNotification.hospitalId}
            </span>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {activeNotification.message}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => {
                openDrawer(activeNotification.hospitalId);
                dismissNotification();
              }}
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>Open Conversation</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={dismissNotification}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
