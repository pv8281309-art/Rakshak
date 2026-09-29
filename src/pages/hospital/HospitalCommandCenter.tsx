import React, { useState, useRef, useEffect } from 'react';
import { useHospital } from '../../contexts/HospitalContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Radio, 
  Send, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Zap, 
  Building2, 
  PhoneCall, 
  AlertTriangle,
  Check,
  CheckCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const HospitalCommandCenter: React.FC = () => {
  const { commandMessages, sendCommandMessage, hospitalId, hospital } = useHospital();
  const { clientSession } = useAuth();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-mark incoming Admin messages as READ when Hospital views Command Center
  useEffect(() => {
    if (hospitalId) {
      fetch('/api/command-messages/batch-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: hospitalId,
          status: 'READ'
        })
      }).catch(err => console.warn('Failed to mark messages read on hospital view:', err));
    }
  }, [hospitalId]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commandMessages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendCommandMessage(text.trim());
      if (!textToSend) {
        setInputText('');
      }
    } finally {
      setSending(false);
    }
  };

  const quickBroadcasts = [
    'Trauma Bay 1 & Resus Ready',
    'Emergency CT & Neurosurgeon on Standby',
    'Bed Capacity Constrained — Divert Minor Trauma',
    'Blood Bank O- Units Replenished',
    'OT 2 Active for Polytrauma Intake',
    'Mass Casualty Protocol Activated'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Direct State Command Link
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Operation Rakshak Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Two-way encrypted tactical communication with State Emergency Dispatch and Admin Control.
          </p>
        </div>

        {/* Operational Disclaimer */}
        <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-[11px] text-slate-300 max-w-sm">
          <span className="font-bold text-cyan-400 block mb-0.5">Tactical Channel</span>
          Operational coordination channel with Operation Rakshak State Emergency Control.
        </div>
      </div>

      {/* QUICK STATUS BROADCASTS */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Quick Status Update Broadcasts
        </span>
        <div className="flex flex-wrap gap-2">
          {quickBroadcasts.map((preset, idx) => (
            <button
              key={idx}
              disabled={sending}
              onClick={() => handleSend(preset)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-500 rounded-xl text-xs transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT LOG & INPUT BOX */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col h-[520px] shadow-2xl">
        {/* Chat Header */}
        <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Channel: {hospitalId} &harr; State Dispatch
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            Encrypted Radio Stream
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {commandMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Radio className="w-10 h-10 text-slate-700 mb-2" />
              <p className="text-xs font-semibold text-slate-400">Tactical Channel Initialized</p>
              <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                Dispatch announcements and hospital status broadcasts will appear here in real time.
              </p>
            </div>
          ) : (
            commandMessages.map((msg) => {
              const isMine = msg.senderRole === 'HOSPITAL';

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%] rounded-2xl p-3.5 text-xs shadow-sm",
                    isMine
                      ? "ml-auto bg-cyan-950/40 border border-cyan-700/60 text-cyan-100"
                      : "mr-auto bg-slate-800/80 border border-slate-700/80 text-slate-100"
                  )}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px]">
                    <span className={cn(
                      "font-bold uppercase tracking-wider",
                      isMine ? "text-cyan-400" : "text-amber-400"
                    )}>
                      {msg.senderName} ({msg.senderRole})
                    </span>
                    <span className="text-slate-500 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {msg.incidentId && (
                    <div className="mb-1 px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-700/60 text-[9px] font-mono text-cyan-300 w-fit">
                      Incident: {msg.incidentId}
                    </div>
                  )}

                  <p className="leading-relaxed whitespace-pre-wrap select-text">{msg.message}</p>

                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                    {isMine && (
                      <span className="flex items-center" title={`Status: ${msg.status || 'SENT'}`}>
                        {msg.status === 'READ' ? (
                          <span className="flex items-center text-cyan-400 font-bold" title="Read by State Command Admin">
                            <CheckCheck size={13} className="stroke-[2.5]" />
                          </span>
                        ) : msg.status === 'DELIVERED' ? (
                          <span className="flex items-center text-slate-400" title="Delivered to Command Center">
                            <CheckCheck size={13} />
                          </span>
                        ) : (
                          <span className="flex items-center text-slate-400" title="Sent">
                            <Check size={13} />
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type tactical message or advisory to State Command Center..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
