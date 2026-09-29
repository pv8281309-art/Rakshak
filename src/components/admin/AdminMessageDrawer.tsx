import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAdminMessages, HospitalConversation } from '../../contexts/AdminMessageContext';
import { 
  X, 
  Search, 
  ArrowLeft, 
  Send, 
  Building2, 
  Clock, 
  AlertTriangle, 
  Check, 
  CheckCheck, 
  Phone, 
  Radio, 
  ShieldAlert, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react';
import { CommandMessage, CommandMessagePriority } from '../../types/hospital';

// Helper for relative timestamps
const formatMessageTime = (isoString?: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  }
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const AdminMessageDrawer: React.FC = () => {
  const {
    conversations,
    activeHospitalId,
    activeConversation,
    activeMessages,
    isDrawerOpen,
    closeDrawer,
    selectConversation,
    sendMessage,
    syncState,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter
  } = useAdminMessages();

  const [replyText, setReplyText] = useState('');
  const [priority, setPriority] = useState<CommandMessagePriority>('NORMAL');
  const [incidentIdInput, setIncidentIdInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll conversation to bottom
  useEffect(() => {
    if (activeHospitalId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, activeHospitalId]);

  // Focus input on opening conversation
  useEffect(() => {
    if (activeHospitalId && isDrawerOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [activeHospitalId, isDrawerOpen]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      // 1. Filter tabs
      if (activeFilter === 'unread' && conv.unreadCount === 0) return false;
      if (activeFilter === 'critical' && !conv.hasCritical) return false;
      
      // 2. Search query
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchName = conv.hospitalName.toLowerCase().includes(term);
      const matchId = conv.hospitalId.toLowerCase().includes(term);
      const matchLastMsg = conv.lastMessage?.message.toLowerCase().includes(term);
      const matchIncidents = conv.incidentIds.some(id => id.toLowerCase().includes(term));

      return matchName || matchId || matchLastMsg || matchIncidents;
    });
  }, [conversations, activeFilter, searchTerm]);

  // Quick preset dispatch replies
  const quickReplies = [
    "Command Center has been notified. Trauma team alerted.",
    "Ambulance unit dispatched. En route with telemetry.",
    "State dispatch confirms bed divert authorization.",
    "Request acknowledged. Operating protocol active."
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || replyText;
    if (!text.trim() || !activeHospitalId || sending) return;

    setSending(true);
    try {
      const ok = await sendMessage(
        activeHospitalId, 
        text.trim(), 
        priority, 
        incidentIdInput.trim() || undefined
      );
      if (ok && !textToSend) {
        setReplyText('');
        setIncidentIdInput('');
        setPriority('NORMAL');
      }
    } finally {
      setSending(false);
    }
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" 
        onClick={closeDrawer}
      />

      {/* Slide-in Drawer */}
      <div className="relative w-full max-w-lg md:max-w-xl h-full bg-[#060D1A]/95 border-l border-slate-700/70 shadow-2xl backdrop-blur-2xl flex flex-col z-10 text-white animate-in slide-in-from-right duration-300">
        
        {/* TOP HEADER */}
        <div className="h-16 px-4 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          {activeHospitalId ? (
            <div className="flex items-center gap-3 min-w-0">
              <button 
                onClick={() => selectConversation('')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Back to conversations"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center shrink-0 text-cyan-400">
                <Building2 size={20} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-white truncate">
                    {activeConversation?.hospitalName || activeHospitalId}
                  </h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {activeHospitalId}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {syncState === 'live' ? 'Online' : 'Reconnecting...'}
                  </span>
                  {activeConversation?.phone && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      • <Phone size={10} /> {activeConversation.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-white tracking-wide">
                    Hospital Messages
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {conversations.length} Facilities
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${syncState === 'live' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  {syncState === 'live' ? 'Live State Command Link' : 'Connecting to Radio stream...'}
                </p>
              </div>
            </div>
          )}

          {/* Close button */}
          <button 
            onClick={closeDrawer}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT AREA: LIST vs CONVERSATION */}
        {!activeHospitalId ? (
          /* CONVERSATION LIST VIEW */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search & Filters */}
            <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-900/40">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search hospital, ID, message or incident..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(['all', 'unread', 'critical', 'recent'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${
                      activeFilter === filter 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm' 
                        : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {filter === 'critical' && <AlertTriangle size={12} className="text-red-400" />}
                    <span>{filter}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 p-2 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                    <MessageSquare size={28} />
                  </div>
                  <h3 className="font-bold text-white text-sm">No hospital messages yet.</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Messages from registered hospitals and emergency intake alerts will appear here in real time.
                  </p>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const hasUnread = conv.unreadCount > 0;
                  const isCritical = conv.hasCritical;

                  return (
                    <div
                      key={conv.hospitalId}
                      onClick={() => selectConversation(conv.hospitalId)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 relative border ${
                        hasUnread 
                          ? 'bg-cyan-950/20 border-cyan-900/40 hover:bg-cyan-950/30' 
                          : 'bg-slate-900/30 border-transparent hover:bg-slate-800/40 hover:border-slate-700/40'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                        isCritical 
                          ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                          : hasUnread
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        <Building2 size={20} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h4 className="font-bold text-xs text-white truncate">
                              {conv.hospitalName}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1 rounded">
                              {conv.hospitalId}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                            {formatMessageTime(conv.lastActivityAt)}
                          </span>
                        </div>

                        {/* Last Message Snippet */}
                        <p className={`text-xs truncate ${hasUnread ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                          {conv.lastMessage ? (
                            <>
                              <span className="text-slate-500 text-[11px] font-medium mr-1">
                                {conv.lastMessage.senderRole === 'HOSPITAL' ? 'Hospital:' : 'Admin:'}
                              </span>
                              {conv.lastMessage.message}
                            </>
                          ) : (
                            <span className="italic text-slate-500">No active messages</span>
                          )}
                        </p>

                        {/* Badges / Incident reference */}
                        <div className="flex items-center gap-2 mt-1.5">
                          {isCritical && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                              Critical
                            </span>
                          )}
                          {conv.incidentIds.length > 0 && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {conv.incidentIds[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unread Pill */}
                      {hasUnread && (
                        <div className="shrink-0 flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white font-bold text-[10px] shadow-lg shadow-red-500/30">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* CONVERSATION DETAIL VIEW */
          <div className="flex-1 flex flex-col min-h-0 bg-[#040813]">
            {/* Quick Status Bar */}
            <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Radio size={14} className="text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono">
                  Channel: <strong className="text-white">{activeHospitalId}</strong> &harr; State Admin Command
                </span>
              </div>
              {activeConversation?.incidentIds.length ? (
                <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
                  Incident: {activeConversation.incidentIds[0]}
                </span>
              ) : null}
            </div>

            {/* Quick Dispatch Presets */}
            <div className="px-3 py-2 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-500 flex items-center gap-1 text-[10px] uppercase font-bold shrink-0">
                <Zap size={12} className="text-amber-400" /> Presets:
              </span>
              {quickReplies.map((preset, idx) => (
                <button
                  key={idx}
                  disabled={sending}
                  onClick={() => handleSend(preset)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg shrink-0 transition-colors text-[10px]"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {activeMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-2">
                    <Radio size={24} />
                  </div>
                  <h4 className="font-bold text-white text-xs">No messages in this conversation.</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                    Begin communication with {activeConversation?.hospitalName || activeHospitalId} using the dispatch console below.
                  </p>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isAdmin = msg.senderRole === 'ADMIN';
                  const isCritical = msg.priority === 'CRITICAL' || msg.priority === 'HIGH';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs shadow-md transition-all ${
                        isAdmin
                          ? 'ml-auto bg-gradient-to-br from-cyan-950/70 to-blue-950/70 border border-cyan-600/50 text-cyan-50'
                          : isCritical
                            ? 'mr-auto bg-red-950/40 border border-red-700/60 text-red-50'
                            : 'mr-auto bg-slate-900/90 border border-slate-700/80 text-slate-100'
                      }`}
                    >
                      {/* Sender Header */}
                      <div className="flex items-center justify-between gap-3 mb-1 text-[10px]">
                        <span className={`font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isAdmin ? 'text-cyan-400' : isCritical ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {isAdmin ? 'State Command Admin' : (msg.senderName || msg.hospitalName || 'Hospital Staff')}
                          <span className="text-[9px] opacity-70 font-mono">({msg.senderRole})</span>
                        </span>
                        {isCritical && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/40 uppercase">
                            CRITICAL
                          </span>
                        )}
                      </div>

                      {/* Incident Link */}
                      {msg.incidentId && (
                        <div className="mb-1.5 px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-cyan-300 flex items-center gap-1 w-fit">
                          <span>Related Incident:</span>
                          <strong className="text-white">{msg.incidentId}</strong>
                        </div>
                      )}

                      {/* Body */}
                      <p className="leading-relaxed whitespace-pre-wrap text-xs select-text">
                        {msg.message}
                      </p>

                      {/* Footer: Timestamp + Status Ticks */}
                      <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[10px] text-slate-400 font-mono">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>

                        {/* Delivery Status Indicator */}
                        {isAdmin && (
                          <span className="flex items-center ml-0.5" title={`Status: ${msg.status || 'SENT'}`}>
                            {msg.status === 'READ' ? (
                              <span className="flex items-center text-cyan-400 font-bold" title="Read by Hospital">
                                <CheckCheck size={14} className="stroke-[2.5]" />
                              </span>
                            ) : msg.status === 'DELIVERED' ? (
                              <span className="flex items-center text-slate-400" title="Delivered to Hospital">
                                <CheckCheck size={14} />
                              </span>
                            ) : (
                              <span className="flex items-center text-slate-400" title="Sent">
                                <Check size={14} />
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

            {/* Dispatch Composer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800/80 space-y-2">
              {/* Controls Bar: Priority & Incident ID */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Priority:</span>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as CommandMessagePriority)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="IMPORTANT">IMPORTANT</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div className="flex-1 flex items-center gap-1">
                  <input 
                    type="text"
                    value={incidentIdInput}
                    onChange={(e) => setIncidentIdInput(e.target.value)}
                    placeholder="Link Incident (e.g. INC-2026-001)..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Message Input & Send */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input 
                  ref={inputRef}
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${activeConversation?.hospitalName || activeHospitalId}...`}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 transition-all shrink-0"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
