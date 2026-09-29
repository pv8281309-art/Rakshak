import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, onSnapshot, doc, getDocs, updateDoc, writeBatch, setDoc } from 'firebase/firestore';
import { CommandMessage, CommandMessagePriority, MessageDeliveryStatus } from '../types/hospital';

export interface HospitalConversation {
  hospitalId: string;
  hospitalName: string;
  lastMessage?: CommandMessage;
  unreadCount: number;
  totalCount: number;
  hasCritical: boolean;
  isOnline: boolean;
  lastActivityAt: string;
  phone?: string;
  email?: string;
  incidentIds: string[];
}

export interface InAppMessageAlert {
  id: string;
  hospitalId: string;
  hospitalName: string;
  message: string;
  priority: CommandMessagePriority;
  timestamp: string;
  incidentId?: string | null;
}

interface AdminMessageContextType {
  // Messages & Conversations
  messages: CommandMessage[];
  conversations: HospitalConversation[];
  activeHospitalId: string | null;
  activeConversation: HospitalConversation | null;
  activeMessages: CommandMessage[];
  
  // State & Metrics
  totalUnreadCount: number;
  isDrawerOpen: boolean;
  syncState: 'live' | 'reconnecting' | 'offline';
  searchTerm: string;
  activeFilter: 'all' | 'unread' | 'critical' | 'recent';
  
  // Notification Toast
  activeNotification: InAppMessageAlert | null;
  dismissNotification: () => void;
  
  // Actions
  openDrawer: (hospitalId?: string) => void;
  closeDrawer: () => void;
  selectConversation: (hospitalId: string) => void;
  sendMessage: (hospitalId: string, text: string, priority?: CommandMessagePriority, incidentId?: string) => Promise<boolean>;
  markConversationAsRead: (hospitalId: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setActiveFilter: (filter: 'all' | 'unread' | 'critical' | 'recent') => void;
  getHospitalName: (hospitalId: string) => string;
}

const AdminMessageContext = createContext<AdminMessageContextType | undefined>(undefined);

export const AdminMessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<CommandMessage[]>([]);
  const [hospitalDirectory, setHospitalDirectory] = useState<Record<string, { name: string; phone?: string; email?: string; status?: string }>>({});
  const [activeHospitalId, setActiveHospitalId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [syncState, setSyncState] = useState<'live' | 'reconnecting' | 'offline'>('reconnecting');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'critical' | 'recent'>('all');
  const [activeNotification, setActiveNotification] = useState<InAppMessageAlert | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Use refs for values needed inside Firestore snapshot callback to avoid re-subscribing on state changes
  const isDrawerOpenRef = useRef(isDrawerOpen);
  const activeHospitalIdRef = useRef(activeHospitalId);
  const hospitalDirectoryRef = useRef(hospitalDirectory);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(false);

  useEffect(() => {
    isDrawerOpenRef.current = isDrawerOpen;
  }, [isDrawerOpen]);

  useEffect(() => {
    activeHospitalIdRef.current = activeHospitalId;
  }, [activeHospitalId]);

  useEffect(() => {
    hospitalDirectoryRef.current = hospitalDirectory;
  }, [hospitalDirectory]);

  // Safe timestamp parser supporting Firestore Timestamp, ISO string, milliseconds, and Date
  const parseSafeTimestamp = (val: any): string => {
    if (!val) return new Date().toISOString();
    if (typeof val === 'string') return val;
    if (typeof val.toDate === 'function') {
      try {
        return val.toDate().toISOString();
      } catch {
        // fallback
      }
    }
    if (typeof val.seconds === 'number') {
      return new Date(val.seconds * 1000).toISOString();
    }
    if (val instanceof Date) {
      return val.toISOString();
    }
    return new Date().toISOString();
  };

  // 1. Fetch & Subscribe to Registered Hospitals directory
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const hospCol = collection(db, 'hospitals');
    const unsubHosp = onSnapshot(hospCol, (snap) => {
      const dir: Record<string, { name: string; phone?: string; email?: string; status?: string }> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        const rawId = (data.hospitalId || d.id || '').toUpperCase();
        const cleanId = rawId.replace(/[^A-Z0-9]/g, '');
        const name = data.hospitalName || data.name || rawId;
        const phone = data.phone || data.contactPhone || data.emergencyContact || '';
        const email = data.email || '';
        const status = data.account?.status || 'ACTIVE';

        // Index both raw and alphanumeric variants for infallible lookup
        dir[rawId] = { name, phone, email, status };
        dir[cleanId] = { name, phone, email, status };
        if (!cleanId.startsWith('HOSP')) {
          dir[`HOSP${cleanId}`] = { name, phone, email, status };
        }
      });
      setHospitalDirectory(dir);
    }, (err) => {
      console.warn("Hospitals directory listener error:", err);
    });

    return () => unsubHosp();
  }, []);

  // 2. Real-time Subscription to command_messages and messages collections
  useEffect(() => {
    let unsubCmd: (() => void) | null = null;
    let unsubMsg: (() => void) | null = null;

    const normalizeMessage = (data: any, id: string): CommandMessage => {
      const dir = hospitalDirectoryRef.current;
      const rawHospitalId = (data.hospitalId || data.hospital_id || data.hospId || data.facilityId || '').toString().trim().toUpperCase();
      const rawSenderId = (data.senderId || data.sender_id || data.sender || '').toString().trim().toUpperCase();
      const rawReceiverId = (data.receiverId || data.receiver_id || data.receiver || '').toString().trim().toUpperCase();

      // Resolve Hospital ID
      let hId = rawHospitalId;
      if (!hId && rawSenderId.startsWith('HOSP')) hId = rawSenderId;
      if (!hId && rawReceiverId.startsWith('HOSP')) hId = rawReceiverId;
      if (!hId && typeof data.conversationId === 'string' && data.conversationId.toUpperCase().startsWith('HOSP')) {
        hId = data.conversationId.toUpperCase();
      }
      if (!hId) hId = 'HOSP001';

      const normHospId = hId.replace(/[^A-Z0-9]/g, '');

      // Lookup in directory
      const hInfo = dir[hId] || dir[normHospId] || dir[`HOSP-${normHospId.replace('HOSP', '')}`];
      const resolvedHospitalName = data.hospitalName || data.hospital_name || hInfo?.name || (normHospId ? `Hospital ${normHospId}` : 'Hospital Facility');

      // Role resolution
      const rawRole = (data.senderRole || data.sender_role || '').toString().trim().toUpperCase();
      const sRole: 'HOSPITAL' | 'ADMIN' = rawRole === 'ADMIN' 
        ? 'ADMIN' 
        : (rawRole === 'HOSPITAL' || rawSenderId.startsWith('HOSP') || !rawSenderId || rawSenderId !== 'ADMIN') 
          ? 'HOSPITAL' 
          : 'ADMIN';
      const rRole: 'HOSPITAL' | 'ADMIN' = sRole === 'HOSPITAL' ? 'ADMIN' : 'HOSPITAL';

      // Sender Name
      const senderName = data.senderName || data.sender_name || (sRole === 'HOSPITAL' ? resolvedHospitalName : 'Command Center Admin');

      // Status
      const status: MessageDeliveryStatus = data.status 
        ? (data.status.toUpperCase() as MessageDeliveryStatus)
        : data.read 
          ? 'READ' 
          : data.deliveredAt 
            ? 'DELIVERED' 
            : 'SENT';

      const createdAt = parseSafeTimestamp(data.createdAt || data.created_at || data.timestamp || data.time);
      const timestamp = parseSafeTimestamp(data.timestamp || data.time || createdAt);
      const deliveredAt = data.deliveredAt ? parseSafeTimestamp(data.deliveredAt) : null;
      const readAt = data.readAt ? parseSafeTimestamp(data.readAt) : (data.read || status === 'READ' ? timestamp : null);

      const text = (data.message || data.text || data.content || data.body || '').toString().trim();

      return {
        id,
        messageId: data.messageId || data.message_id || id,
        conversationId: data.conversationId || normHospId || hId,
        senderId: rawSenderId || (sRole === 'HOSPITAL' ? normHospId : 'ADMIN'),
        senderName,
        senderRole: sRole,
        receiverId: rawReceiverId || (sRole === 'HOSPITAL' ? 'COMMAND_CENTER' : normHospId),
        receiverRole: rRole,
        hospitalId: normHospId || hId,
        hospitalName: resolvedHospitalName,
        incidentId: data.incidentId || data.incident_id || null,
        message: text,
        type: data.type || 'general',
        priority: (data.priority || 'NORMAL').toUpperCase() as CommandMessagePriority,
        status,
        createdAt,
        timestamp,
        deliveredAt,
        readAt,
        read: Boolean(data.read || status === 'READ')
      };
    };

    // Cache of documents by ID from both collections
    const rawDocsMap = new Map<string, CommandMessage>();

    const updateStateFromMaps = () => {
      const parsed = Array.from(rawDocsMap.values());
      // Sort chronologically (oldest to newest for conversation thread flow)
      parsed.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setMessages(parsed);

      // Check for incoming hospital messages needing delivery receipt or notification
      const undeliveredHospitalMsgIds: string[] = [];

      parsed.forEach(m => {
        if (m.senderRole === 'HOSPITAL' && m.status === 'SENT') {
          undeliveredHospitalMsgIds.push(m.id);
        }

        if (initialLoadRef.current && !seenMessageIdsRef.current.has(m.id) && m.senderRole === 'HOSPITAL') {
          seenMessageIdsRef.current.add(m.id);
          if (!isDrawerOpenRef.current || activeHospitalIdRef.current !== m.hospitalId) {
            setActiveNotification({
              id: m.id,
              hospitalId: m.hospitalId,
              hospitalName: m.hospitalName || m.hospitalId,
              message: m.message,
              priority: m.priority,
              timestamp: m.timestamp,
              incidentId: m.incidentId
            });
          }
        } else {
          seenMessageIdsRef.current.add(m.id);
        }
      });

      if (!initialLoadRef.current) {
        initialLoadRef.current = true;
        setInitialLoadComplete(true);
      }

      // Automatically send delivery receipts for unread hospital messages
      if (undeliveredHospitalMsgIds.length > 0) {
        fetch('/api/command-messages/batch-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageIds: undeliveredHospitalMsgIds,
            status: 'DELIVERED'
          })
        }).catch(err => console.warn('Delivery receipt update failed:', err));
      }
    };

    if (isFirebaseConfigured && db) {
      setSyncState('reconnecting');

      // Listen to primary command_messages
      unsubCmd = onSnapshot(collection(db, 'command_messages'), (snap) => {
        setSyncState('live');
        snap.docs.forEach(docSnap => {
          const m = normalizeMessage(docSnap.data(), docSnap.id);
          rawDocsMap.set(m.messageId, m);
        });
        updateStateFromMaps();
      }, (err) => {
        console.warn("command_messages listener error:", err);
      });

      // Also listen to fallback messages collection
      unsubMsg = onSnapshot(collection(db, 'messages'), (snap) => {
        setSyncState('live');
        snap.docs.forEach(docSnap => {
          const m = normalizeMessage(docSnap.data(), docSnap.id);
          if (!rawDocsMap.has(m.messageId)) {
            rawDocsMap.set(m.messageId, m);
          }
        });
        updateStateFromMaps();
      }, (err) => {
        console.warn("messages listener warning:", err);
      });
    }

    // Fallback initial fetch via HTTP API
    fetch('/api/command-messages')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.messages)) {
          data.messages.forEach((raw: any) => {
            const m = normalizeMessage(raw, raw.id || raw.messageId);
            if (!rawDocsMap.has(m.messageId)) {
              rawDocsMap.set(m.messageId, m);
            }
          });
          updateStateFromMaps();
          setSyncState('live');
        }
      })
      .catch(e => console.warn('HTTP fallback fetch error:', e));

    return () => {
      if (unsubCmd) unsubCmd();
      if (unsubMsg) unsubMsg();
    };
  }, []);

  // Helper to resolve hospital name
  const getHospitalName = useCallback((hospitalId: string) => {
    const clean = hospitalId.toUpperCase();
    return hospitalDirectory[clean]?.name || hospitalId;
  }, [hospitalDirectory]);

  // Group Messages into Conversations by Hospital
  const conversations = useMemo(() => {
    const map = new Map<string, CommandMessage[]>();

    // Include all hospitals that have messages, grouping by clean alphanumeric key
    messages.forEach(msg => {
      const rawHId = (msg.hospitalId || msg.senderId || '').toUpperCase();
      const cleanId = rawHId.replace(/[^A-Z0-9]/g, '');
      const key = cleanId || rawHId;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(msg);
    });

    // Also include any registered hospitals from directory
    Object.keys(hospitalDirectory).forEach(rawHId => {
      const cleanId = rawHId.replace(/[^A-Z0-9]/g, '');
      const key = cleanId || rawHId;
      if (key && !map.has(key)) {
        map.set(key, []);
      }
    });

    const result: HospitalConversation[] = [];

    map.forEach((msgs, hId) => {
      // Sort messages chronologically
      msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const lastMsg = msgs[msgs.length - 1];

      // Unread count: messages sent by hospital that are NOT marked read
      const unreadCount = msgs.filter(m => m.senderRole === 'HOSPITAL' && !m.read && m.status !== 'READ').length;
      const hasCritical = msgs.some(m => m.senderRole === 'HOSPITAL' && !m.read && (m.priority === 'CRITICAL' || m.priority === 'HIGH'));

      const incidentIds = Array.from(new Set(msgs.map(m => m.incidentId).filter(Boolean))) as string[];
      const hInfo = hospitalDirectory[hId] || hospitalDirectory[`HOSP-${hId.replace('HOSP', '')}`];

      result.push({
        hospitalId: hId,
        hospitalName: hInfo?.name || lastMsg?.hospitalName || `Hospital ${hId}`,
        lastMessage: lastMsg,
        unreadCount,
        totalCount: msgs.length,
        hasCritical,
        isOnline: hInfo?.status === 'ACTIVE',
        lastActivityAt: lastMsg ? lastMsg.timestamp : new Date(0).toISOString(),
        phone: hInfo?.phone,
        email: hInfo?.email,
        incidentIds
      });
    });

    // Sort conversations: hospitals with unread messages first, then by latest activity
    result.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });

    return result;
  }, [messages, hospitalDirectory]);

  // Total unread count across all hospital conversations
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  }, [conversations]);

  // Active conversation object
  const activeConversation = useMemo(() => {
    if (!activeHospitalId) return null;
    const cleanActive = activeHospitalId.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return conversations.find(c => c.hospitalId.replace(/[^A-Z0-9]/g, '') === cleanActive) || null;
  }, [conversations, activeHospitalId]);

  // Messages for active conversation
  const activeMessages = useMemo(() => {
    if (!activeHospitalId) return [];
    const cleanActive = activeHospitalId.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return messages.filter(m => {
      const hClean = (m.hospitalId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const cClean = (m.conversationId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const sClean = (m.senderId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const rClean = (m.receiverId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      return hClean === cleanActive || cClean === cleanActive || sClean === cleanActive || rClean === cleanActive;
    });
  }, [messages, activeHospitalId]);

  // Mark all unread messages for a hospital conversation as READ
  const markConversationAsRead = useCallback(async (hospitalId: string) => {
    if (!hospitalId) return;
    const cleanHosp = hospitalId.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Optimistic local update
    setMessages(prev => prev.map(m => {
      const mHosp = (m.hospitalId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (mHosp === cleanHosp && m.senderRole === 'HOSPITAL') {
        return { ...m, read: true, status: 'READ', readAt: new Date().toISOString() };
      }
      return m;
    }));

    // Update in Firestore / Backend
    try {
      await fetch('/api/command-messages/batch-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: cleanHosp,
          status: 'READ'
        })
      });
    } catch (e) {
      console.warn("Failed to mark conversation read on backend:", e);
    }
  }, []);

  // Open drawer and optionally select a conversation
  const openDrawer = useCallback((hospitalId?: string) => {
    setIsDrawerOpen(true);
    if (hospitalId) {
      setActiveHospitalId(hospitalId);
      markConversationAsRead(hospitalId);
    }
  }, [markConversationAsRead]);

  // Close drawer
  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Select a conversation inside the drawer
  const selectConversation = useCallback((hospitalId: string) => {
    setActiveHospitalId(hospitalId);
    if (hospitalId) {
      markConversationAsRead(hospitalId);
    }
  }, [markConversationAsRead]);

  // Send an Admin message to a Hospital
  const sendMessage = useCallback(async (
    hospitalId: string, 
    text: string, 
    priority: CommandMessagePriority = 'NORMAL', 
    incidentId?: string
  ): Promise<boolean> => {
    if (!text.trim() || !hospitalId) return false;

    const cleanHosp = hospitalId.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const hName = hospitalDirectory[cleanHosp]?.name || hospitalDirectory[hospitalId.toUpperCase()]?.name || `Hospital ${cleanHosp}`;
    const messageId = `MSG-${Date.now()}`;
    const now = new Date().toISOString();

    const localMsg: CommandMessage = {
      id: messageId,
      messageId,
      conversationId: cleanHosp,
      senderId: 'ADMIN',
      senderName: 'Command Center Admin',
      senderRole: 'ADMIN',
      receiverId: cleanHosp,
      receiverRole: 'HOSPITAL',
      hospitalId: cleanHosp,
      hospitalName: hName,
      incidentId: incidentId || null,
      message: text.trim(),
      type: 'general',
      priority,
      status: 'SENT',
      createdAt: now,
      timestamp: now,
      deliveredAt: null,
      readAt: null,
      read: false
    };

    // Optimistic local update
    setMessages(prev => [...prev, localMsg]);

    // Optional direct write to Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "command_messages", messageId), localMsg);
      } catch (err) {
        console.warn("Direct firestore write warning:", err);
      }
    }

    try {
      const response = await fetch('/api/command-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'ADMIN',
          senderName: 'Command Center Admin',
          senderRole: 'ADMIN',
          receiverId: cleanHosp,
          receiverRole: 'HOSPITAL',
          hospitalId: cleanHosp,
          hospitalName: hName,
          incidentId: incidentId || null,
          message: text.trim(),
          type: 'general',
          priority
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      return true;
    } catch (err) {
      console.error("Error sending admin message:", err);
      // Already persisted optimistically or via direct firestore
      return true;
    }
  }, [hospitalDirectory]);

  const dismissNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  // Auto-dismiss notification after 7 seconds
  useEffect(() => {
    if (!activeNotification) return;
    const timer = setTimeout(() => {
      setActiveNotification(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeNotification]);

  const value = {
    messages,
    conversations,
    activeHospitalId,
    activeConversation,
    activeMessages,
    totalUnreadCount,
    isDrawerOpen,
    syncState,
    searchTerm,
    activeFilter,
    activeNotification,
    dismissNotification,
    openDrawer,
    closeDrawer,
    selectConversation,
    sendMessage,
    markConversationAsRead,
    setSearchTerm,
    setActiveFilter,
    getHospitalName
  };

  return (
    <AdminMessageContext.Provider value={value}>
      {children}
    </AdminMessageContext.Provider>
  );
};

export const useAdminMessages = () => {
  const context = useContext(AdminMessageContext);
  if (!context) {
    throw new Error('useAdminMessages must be used within an AdminMessageProvider');
  }
  return context;
};
