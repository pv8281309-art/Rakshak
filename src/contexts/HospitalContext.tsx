import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where,
  getDoc
} from 'firebase/firestore';
import { 
  HospitalBedsData, 
  BloodInventoryItem, 
  BloodGroup,
  IncomingPatient, 
  CommandMessage, 
  HospitalAlert,
  PatientAdmissionStatus,
  CommandMessageType,
  CommandMessagePriority,
  HospitalAmbulance
} from '../types/hospital';
import { HospitalRecord } from '../types';
import { EmergencyService } from '../services/EmergencyService';

interface HospitalContextType {
  hospitalId: string;
  hospital: HospitalRecord | null;
  beds: HospitalBedsData | null;
  bloodBank: Record<BloodGroup, BloodInventoryItem> | null;
  incomingPatients: IncomingPatient[];
  activeEmergencies: IncomingPatient[];
  commandMessages: CommandMessage[];
  alerts: HospitalAlert[];
  unreadMessagesCount: number;
  unreadAlertsCount: number;
  loading: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  lastTelemetryUpdate: Date | null;
  // KPI Metrics
  kpis: {
    criticalIncoming: number;
    incomingAmbulances: number;
    availableBeds: number;
    totalBeds: number;
    occupancyRate: number;
    availableIcuBeds: number;
    totalIcuBeds: number;
    bloodCriticalCount: number;
    bloodLowCount: number;
    patientsToday: number;
    activeEmergencies: number;
  };
  // Ambulance Fleet
  ambulances: HospitalAmbulance[];
  addAmbulance: (ambulanceData: Omit<HospitalAmbulance, 'id' | 'hospitalId'>) => Promise<boolean>;
  updateAmbulance: (ambulanceId: string, updates: Partial<HospitalAmbulance>) => Promise<boolean>;
  deleteAmbulance: (ambulanceId: string) => Promise<boolean>;
  dispatchAmbulance: (
    incidentId: string, 
    ambulanceId: string, 
    details?: { driverName?: string; driverPhone?: string; paramedicName?: string; etaMinutes?: number; notes?: string }
  ) => Promise<boolean>;
  // Actions
  updateBeds: (beds: any) => Promise<boolean>;
  updateBloodBank: (inventory: any) => Promise<boolean>;
  updatePatientStatus: (
    incidentId: string, 
    admissionStatus: PatientAdmissionStatus, 
    department?: string, 
    notes?: string
  ) => Promise<boolean>;
  sendMessage: (
    type: CommandMessageType, 
    priority: CommandMessagePriority, 
    message: string, 
    incidentId?: string
  ) => Promise<boolean>;
  sendCommandMessage: (message: string) => Promise<boolean>;
  markMessageRead: (messageId: string) => Promise<void>;
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;
  refreshHospitalData: () => Promise<void>;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

// Default beds data helper
const defaultBedsData = (existingCapacity?: any): HospitalBedsData => {
  const genTotal = Math.max(existingCapacity?.generalBeds || 40, 20);
  const genOcc = Math.round(genTotal * 0.7);
  const icuTotal = Math.max(existingCapacity?.icuBeds || 10, 5);
  const icuOcc = Math.max(0, icuTotal - (existingCapacity?.availableIcuBeds ?? 3));
  const emTotal = Math.max(existingCapacity?.emergencyBeds || 15, 8);
  const emOcc = Math.max(0, emTotal - (existingCapacity?.availableEmergencyBeds ?? 4));
  const hduTotal = 10;
  const hduOcc = 7;
  const pedTotal = 10;
  const pedOcc = 5;
  const isoTotal = 5;
  const isoOcc = 2;
  const othTotal = 5;
  const othOcc = 1;

  const totalBeds = genTotal + icuTotal + emTotal + hduTotal + pedTotal + isoTotal + othTotal;
  const totalOccupied = genOcc + icuOcc + emOcc + hduOcc + pedOcc + isoOcc + othOcc;
  const totalAvailable = totalBeds - totalOccupied;

  return {
    general: { category: 'general', name: 'General Ward', total: genTotal, occupied: genOcc, available: genTotal - genOcc, occupancyRate: Math.round((genOcc / genTotal) * 100) },
    emergency: { category: 'emergency', name: 'Emergency Trauma Beds', total: emTotal, occupied: emOcc, available: emTotal - emOcc, occupancyRate: Math.round((emOcc / emTotal) * 100) },
    icu: { category: 'icu', name: 'Intensive Care Unit (ICU)', total: icuTotal, occupied: icuOcc, available: icuTotal - icuOcc, occupancyRate: Math.round((icuOcc / icuTotal) * 100) },
    hdu: { category: 'hdu', name: 'High Dependency Unit (HDU)', total: hduTotal, occupied: hduOcc, available: hduTotal - hduOcc, occupancyRate: Math.round((hduOcc / hduTotal) * 100) },
    pediatric: { category: 'pediatric', name: 'Pediatric Care', total: pedTotal, occupied: pedOcc, available: pedTotal - pedOcc, occupancyRate: Math.round((pedOcc / pedTotal) * 100) },
    isolation: { category: 'isolation', name: 'Isolation Ward', total: isoTotal, occupied: isoOcc, available: isoTotal - isoOcc, occupancyRate: Math.round((isoOcc / isoTotal) * 100) },
    other: { category: 'other', name: 'Specialty Care / Day Care', total: othTotal, occupied: othOcc, available: othTotal - othOcc, occupancyRate: Math.round((othOcc / othTotal) * 100) },
    totalBeds,
    totalOccupied,
    totalAvailable,
    overallOccupancyRate: Math.round((totalOccupied / totalBeds) * 100),
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System Auto-Init'
  };
};

// Default blood inventory helper
const defaultBloodInventory = (): Record<BloodGroup, BloodInventoryItem> => {
  const groups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const res: any = {};
  groups.forEach(grp => {
    // Standard baseline distribution
    const units = grp === 'O+' ? 18 : grp === 'B+' ? 22 : grp === 'A+' ? 15 : grp === 'AB+' ? 10 : grp === 'O-' ? 4 : 6;
    const status = units <= 5 ? 'CRITICAL' : units <= 15 ? 'LOW' : 'AVAILABLE';
    res[grp] = {
      bloodGroup: grp,
      units,
      status,
      minThreshold: 15,
      criticalThreshold: 5,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'System Initializer'
    };
  });
  return res;
};

// Web Audio API emergency chime synthesizer
const playEmergencyTone = (type: 'critical' | 'normal' = 'normal') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type === 'critical' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(type === 'critical' ? 880 : 587.33, ctx.currentTime); // A5 or D5
    if (type === 'critical') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
    }

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (type === 'critical' ? 0.6 : 0.4));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (type === 'critical' ? 0.6 : 0.4));
  } catch {
    // Audio contexts may be blocked by browser autoplay policies until user interaction
  }
};

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { clientSession } = useAuth();
  const hospitalId = (clientSession?.hospitalId || clientSession?.id || 'HOSP001').toUpperCase();

  const [hospital, setHospital] = useState<HospitalRecord | null>(null);
  const [ambulances, setAmbulances] = useState<HospitalAmbulance[]>([]);

  // Ambulance Fleet Subscription
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !hospitalId) return;
    const ambColRef = collection(db, `hospitals/${hospitalId}/ambulances`);
    const unsubscribe = onSnapshot(ambColRef, (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, hospitalId, ...d.data() } as HospitalAmbulance));
        setAmbulances(list);
      } else {
        EmergencyService.getHospitalAmbulances(hospitalId).then(res => {
          setAmbulances(res);
        }).catch(() => {});
      }
    }, (err) => {
      console.error("Ambulance subscription error:", err);
    });
    return () => unsubscribe();
  }, [hospitalId]);

  const addAmbulance = async (ambulanceData: Omit<HospitalAmbulance, 'id' | 'hospitalId'>): Promise<boolean> => {
    try {
      await EmergencyService.addHospitalAmbulance(hospitalId, ambulanceData);
      const updated = await EmergencyService.getHospitalAmbulances(hospitalId);
      setAmbulances(updated);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateAmbulance = async (ambulanceId: string, updates: Partial<HospitalAmbulance>): Promise<boolean> => {
    try {
      await EmergencyService.updateHospitalAmbulance(hospitalId, ambulanceId, updates);
      setAmbulances(prev => prev.map(a => a.id === ambulanceId ? { ...a, ...updates } : a));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteAmbulance = async (ambulanceId: string): Promise<boolean> => {
    try {
      await EmergencyService.deleteHospitalAmbulance(hospitalId, ambulanceId);
      setAmbulances(prev => prev.filter(a => a.id !== ambulanceId));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const dispatchAmbulance = async (
    incidentId: string, 
    ambulanceId: string, 
    details?: { driverName?: string; driverPhone?: string; paramedicName?: string; etaMinutes?: number; notes?: string }
  ): Promise<boolean> => {
    try {
      const amb = ambulances.find(a => a.id === ambulanceId);
      await EmergencyService.dispatchHospitalAmbulance({
        incidentId,
        hospitalId,
        ambulanceId,
        ambulanceName: amb?.name || ambulanceId,
        vehicleNumber: amb?.vehicleNumber || 'DL 01 AX 4589',
        driverName: details?.driverName || amb?.driverName || 'Ramesh Kumar',
        driverPhone: details?.driverPhone || amb?.driverPhone || '+91 98765 43210',
        paramedicName: details?.paramedicName || amb?.paramedicName || 'On-duty Paramedic',
        etaMinutes: details?.etaMinutes || 8,
        notes: details?.notes
      });
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
  const [beds, setBeds] = useState<HospitalBedsData | null>(null);
  const [bloodBank, setBloodBank] = useState<Record<BloodGroup, BloodInventoryItem> | null>(null);
  const [incomingPatients, setIncomingPatients] = useState<IncomingPatient[]>([]);
  const [activeEmergencies, setActiveEmergencies] = useState<IncomingPatient[]>([]);
  const [commandMessages, setCommandMessages] = useState<CommandMessage[]>([]);
  const [alerts, setAlerts] = useState<HospitalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('rakshak_hospital_sound') !== 'false';
  });
  const [lastTelemetryUpdate, setLastTelemetryUpdate] = useState<Date | null>(new Date());
  const [readAlertIds, setReadAlertIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`rakshak_read_alerts_${hospitalId}`) || '[]');
    } catch {
      return [];
    }
  });

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('rakshak_hospital_sound', String(enabled));
  };

  // 1. Subscribe to Hospital Document (Capacity, Bed Matrix, Blood Bank, Info)
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !hospitalId) return;

    const hospitalRef = doc(db, 'hospitals', hospitalId);
    const unsubscribe = onSnapshot(hospitalRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        setHospital({ id: snap.id, ...data });

        // Bed breakdown
        if (data.beds && data.beds.general) {
          setBeds(data.beds);
        } else {
          // Initialize beds structure
          const initBeds = defaultBedsData(data.capacity);
          setBeds(initBeds);
        }

        // Blood bank inventory
        if (data.bloodBank && data.bloodBank['O+']) {
          setBloodBank(data.bloodBank);
        } else {
          const initBlood = defaultBloodInventory();
          setBloodBank(initBlood);
        }
      } else {
        // Fallback placeholder profile while loading
        setBeds(defaultBedsData());
        setBloodBank(defaultBloodInventory());
      }
      setLoading(false);
    }, (err) => {
      console.error("Hospital snapshot error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hospitalId]);

  // 2. Real-time Emergency / Incoming Patients Subscription (`sos_alerts`)
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !hospitalId) return;

    // Listen to sos_alerts collection
    const sosColRef = collection(db, 'sos_alerts');
    const unsubscribe = onSnapshot(sosColRef, (snapshot) => {
      const nowTime = new Date();
      setLastTelemetryUpdate(nowTime);

      const allAlerts: IncomingPatient[] = [];
      const previousCount = incomingPatients.length;

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const docHospitalId = (data.assignedHospitalId || data.hospitalId || '').toUpperCase();
        
        // Match hospital assignment (or unassigned emergency in active monitoring for local triage fallback)
        const isAssignedToUs = docHospitalId === hospitalId;
        
        if (isAssignedToUs) {
          const admissionStatus: PatientAdmissionStatus = 
            data.admissionStatus || 
            (data.status === 'resolved' ? 'DISCHARGED' : 
             data.ambulanceStatus === 'PATIENT_HANDED_OVER' ? 'HANDED_OVER' : 
             data.ambulanceStatus === 'ARRIVED' ? 'ARRIVED' : 'EN_ROUTE');

          const severity = (data.severity || 'high').toUpperCase();
          const cleanSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 
            severity === 'CRITICAL' ? 'CRITICAL' : 
            severity === 'HIGH' ? 'HIGH' : 
            severity === 'LOW' ? 'LOW' : 'MEDIUM';

          const eta = data.eta || (cleanSeverity === 'CRITICAL' ? '6 mins' : '12 mins');
          const speed = data.speed || data.currentSpeed || (cleanSeverity === 'CRITICAL' ? 68 : 52);

          const patientRecord: IncomingPatient = {
            id: docSnap.id,
            incidentId: data.incidentId || docSnap.id,
            patientId: data.patientId || data.customerId || `P-${docSnap.id.replace(/\D/g, '') || '1024'}`,
            patientName: data.user || data.userName || 'Emergency Patient',
            age: data.age || (data.gender ? 34 : undefined),
            gender: data.gender || 'Not specified',
            mobile: data.mobile,
            vehicle: data.vehicle,
            severity: cleanSeverity,
            condition: data.condition || (cleanSeverity === 'CRITICAL' ? 'Severe Trauma / Unconscious' : 'Stabilized with Paramedic'),
            type: data.type || 'Accident Alert',
            ambulanceId: data.ambulanceId || 'AMB-108',
            ambulanceNumber: data.ambulanceNumber || 'DL 01 AX 4589',
            driverName: data.driverName || 'Vikas Sharma',
            driverPhone: data.driverPhone || '+91 98112 04512',
            paramedicName: data.paramedicName || 'Nurse Rajesh Kumar',
            ambulanceStatus: data.ambulanceStatus || 'EN_ROUTE',
            location: data.loc || data.location || 'NH-48 Corridor, Sector 29',
            lat: data.lat || 28.6139,
            lng: data.lng || 77.2090,
            eta,
            currentSpeed: speed,
            heading: data.heading || 45,
            assignedHospitalId: hospitalId,
            hospitalName: hospital?.hospitalName || data.hospitalName || 'Emergency Center',
            department: data.hospitalDepartment || 'Trauma Care Unit',
            requiredResources: Array.isArray(data.requiredResources) ? data.requiredResources : ['Trauma Team', 'ICU Bed', 'Emergency OT'],
            assignedAt: data.hospitalAssignedAt || data.dispatchedAt || new Date().toISOString(),
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            admissionStatus,
            emergencyNotes: data.emergencyNotes || '',
            dispatchedAt: data.dispatchedAt,
            arrivedAt: data.hospitalArrivedAt || data.arrivedAt,
            handoverAt: data.patientHandoverAt,
            admittedAt: data.admittedAt,
            transferredAt: data.transferredAt,
            dischargedAt: data.dischargedAt || data.resolvedAt
          };

          allAlerts.push(patientRecord);
        }
      });

      // Sort by arrival priority: CRITICAL first, then ETA
      allAlerts.sort((a, b) => {
        const pOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        const diff = (pOrder[a.severity] ?? 2) - (pOrder[b.severity] ?? 2);
        if (diff !== 0) return diff;
        return a.admissionStatus === 'EN_ROUTE' ? -1 : 1;
      });

       // Filter active incoming (only when dispatched or arrived)
      const incoming = allAlerts.filter(p => p.dispatchedAt && (p.admissionStatus === 'EN_ROUTE' || p.admissionStatus === 'ARRIVED'));
      const active = allAlerts.filter(p => p.dispatchedAt && p.admissionStatus !== 'DISCHARGED');

      // Audio notification if new incoming emergency assigned by Admin
      const assignedUnassigned = allAlerts.filter(p => !p.dispatchedAt);
      if (soundEnabled && assignedUnassigned.length > previousCount) {
        const hasCritical = assignedUnassigned.some(p => p.severity === 'CRITICAL');
        playEmergencyTone(hasCritical ? 'critical' : 'normal');
      }

      setIncomingPatients(incoming);
      setActiveEmergencies(active);

      // Generate dynamic alerts feed for assigned incidents awaiting hospital ambulance dispatch
      const dynamicAlerts: HospitalAlert[] = [];
      allAlerts.forEach(p => {
        if (!p.dispatchedAt) {
          dynamicAlerts.push({
            id: `alert-assign-${p.id}`,
            type: 'critical_patient',
            severity: p.severity,
            title: `Admin Assigned Incident: ${p.incidentId}`,
            message: `Patient ${p.patientId} (${p.patientName}) at ${p.location}. Severity: ${p.severity}. Please assign fleet ambulance & dispatch.`,
            timestamp: p.assignedAt || p.lastUpdated,
            read: readAlertIds.includes(`alert-assign-${p.id}`),
            incidentId: p.incidentId
          });
        }
      });
      incoming.forEach(p => {
        dynamicAlerts.push({
          id: `alert-${p.id}`,
          type: p.severity === 'CRITICAL' ? 'critical_patient' : 'incoming_patient',
          severity: p.severity,
          title: `Ambulance Dispatched: ${p.ambulanceNumber}`,
          message: `${p.ambulanceNumber} en route with ${p.condition}. ETA: ${p.eta}.`,
          timestamp: p.lastUpdated,
          read: readAlertIds.includes(`alert-${p.id}`),
          incidentId: p.incidentId
        });
      });

      setAlerts(dynamicAlerts);
    }, (err) => {
      console.error("SOS collection snapshot error:", err);
    });

    return () => unsubscribe();
  }, [hospitalId, hospital?.hospitalName, soundEnabled, readAlertIds]);

  // 3. Real-time Command Messages Subscription (`command_messages`)
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !hospitalId) return;

    const msgCol = collection(db, 'command_messages');
    const unsubscribe = onSnapshot(msgCol, (snap) => {
      const msgs: CommandMessage[] = [];
      const undeliveredAdminMsgIds: string[] = [];

      snap.docs.forEach(d => {
        const data = d.data();
        const mHosp = (data.hospitalId || '').toUpperCase();
        const mRec = (data.receiverId || '').toUpperCase();
        const mSend = (data.senderId || '').toUpperCase();

        if (mHosp === hospitalId || mRec === hospitalId || mSend === hospitalId) {
          const status = data.status || (data.read ? 'READ' : data.deliveredAt ? 'DELIVERED' : 'SENT');
          const createdAt = data.createdAt || data.timestamp || new Date().toISOString();
          const timestamp = data.timestamp || createdAt;

          const msg: CommandMessage = {
            id: d.id,
            messageId: data.messageId || d.id,
            conversationId: data.conversationId || mHosp || hospitalId,
            senderId: data.senderId,
            senderName: data.senderName || (data.senderRole === 'ADMIN' ? 'Command Center' : (hospital?.hospitalName || hospitalId)),
            senderRole: data.senderRole || (data.senderId?.startsWith('HOSP') ? 'HOSPITAL' : 'ADMIN'),
            receiverId: data.receiverId || (data.senderRole === 'ADMIN' ? hospitalId : 'COMMAND_CENTER'),
            receiverRole: data.receiverRole || (data.senderRole === 'ADMIN' ? 'HOSPITAL' : 'ADMIN'),
            hospitalId: data.hospitalId || hospitalId,
            hospitalName: data.hospitalName || hospital?.hospitalName,
            incidentId: data.incidentId,
            message: data.message,
            type: data.type || 'general',
            priority: data.priority || 'NORMAL',
            status,
            createdAt,
            timestamp,
            deliveredAt: data.deliveredAt || null,
            readAt: data.readAt || (data.read ? timestamp : null),
            read: Boolean(data.read || status === 'READ')
          };

          msgs.push(msg);

          // If message is from admin and still in SENT status, send DELIVERED receipt
          if (msg.senderRole === 'ADMIN' && msg.status === 'SENT') {
            undeliveredAdminMsgIds.push(msg.id);
          }
        }
      });

      // Sort chronological
      msgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setCommandMessages(msgs);

      if (undeliveredAdminMsgIds.length > 0) {
        fetch('/api/command-messages/batch-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageIds: undeliveredAdminMsgIds,
            status: 'DELIVERED'
          })
        }).catch(err => console.warn('Delivery receipt failed on hospital client:', err));
      }
    });

    return () => unsubscribe();
  }, [hospitalId, hospital?.hospitalName]);

  // Compute Unread Counts
  const unreadMessagesCount = commandMessages.filter(m => !m.read && m.senderRole === 'ADMIN').length;
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  // Compute Real-time KPIs
  const criticalIncoming = incomingPatients.filter(p => p.severity === 'CRITICAL').length;
  const incomingAmbulances = incomingPatients.filter(p => p.admissionStatus === 'EN_ROUTE').length;
  const availableBeds = beds?.totalAvailable ?? 24;
  const totalBeds = beds?.totalBeds ?? 80;
  const occupancyRate = beds?.overallOccupancyRate ?? 70;
  const availableIcuBeds = beds?.icu?.available ?? 3;
  const totalIcuBeds = beds?.icu?.total ?? 10;

  let bloodCriticalCount = 0;
  let bloodLowCount = 0;
  if (bloodBank) {
    Object.values(bloodBank).forEach(b => {
      if (b.status === 'CRITICAL') bloodCriticalCount++;
      if (b.status === 'LOW') bloodLowCount++;
    });
  }

  // Count patients received today
  const todayStr = new Date().toISOString().slice(0, 10);
  const patientsToday = activeEmergencies.filter(p => {
    const t = p.assignedAt ? p.assignedAt.slice(0, 10) : '';
    return t === todayStr;
  }).length;

  const kpis = {
    criticalIncoming,
    incomingAmbulances,
    availableBeds,
    totalBeds,
    occupancyRate,
    availableIcuBeds,
    totalIcuBeds,
    bloodCriticalCount,
    bloodLowCount,
    patientsToday: Math.max(patientsToday, incomingPatients.length),
    activeEmergencies: activeEmergencies.length
  };

  // Action: Update Bed Availability
  const updateBeds = async (newBedsData: any): Promise<boolean> => {
    try {
      const response = await fetch(`/api/hospital/${hospitalId}/beds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beds: newBedsData,
          updatedBy: clientSession?.name || hospitalId
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update beds');
      if (data.beds) setBeds(data.beds);
      return true;
    } catch (err) {
      console.error("Error updating beds:", err);
      return false;
    }
  };

  // Action: Update Blood Bank Inventory
  const updateBloodBank = async (inventoryData: any): Promise<boolean> => {
    try {
      const response = await fetch(`/api/hospital/${hospitalId}/blood-bank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory: inventoryData,
          updatedBy: clientSession?.name || hospitalId
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update blood bank');
      if (data.bloodBank) setBloodBank(data.bloodBank);
      return true;
    } catch (err) {
      console.error("Error updating blood bank:", err);
      return false;
    }
  };

  // Action: Update Patient Status (Workflow: Arrived -> Handover -> Admitted / Transferred / Discharged)
  const updatePatientStatus = async (
    incidentId: string, 
    admissionStatus: PatientAdmissionStatus, 
    department?: string, 
    notes?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/hospital/${hospitalId}/patient-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          admissionStatus,
          department,
          notes,
          updatedBy: clientSession?.name || hospitalId
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update patient status');
      return true;
    } catch (err) {
      console.error("Error updating patient status:", err);
      return false;
    }
  };

  // Action: Send Command Center Message
  const sendMessage = async (
    type: CommandMessageType, 
    priority: CommandMessagePriority, 
    message: string, 
    incidentId?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/command-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: hospitalId,
          senderName: hospital?.hospitalName || `Hospital ${hospitalId}`,
          senderRole: 'HOSPITAL',
          receiverId: 'COMMAND_CENTER',
          receiverRole: 'ADMIN',
          hospitalId,
          hospitalName: hospital?.hospitalName || '',
          incidentId,
          message,
          type,
          priority
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send message');
      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      return false;
    }
  };

  // Action: Mark Message Read
  const markMessageRead = async (messageId: string) => {
    try {
      await fetch(`/api/command-messages/${messageId}/read`, { method: 'PUT' });
      setCommandMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Mark Alert Read
  const markAlertRead = (alertId: string) => {
    const updated = Array.from(new Set([...readAlertIds, alertId]));
    setReadAlertIds(updated);
    try {
      localStorage.setItem(`rakshak_read_alerts_${hospitalId}`, JSON.stringify(updated));
    } catch {}
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  // Action: Mark All Alerts Read
  const markAllAlertsRead = () => {
    const allIds = alerts.map(a => a.id);
    const updated = Array.from(new Set([...readAlertIds, ...allIds]));
    setReadAlertIds(updated);
    try {
      localStorage.setItem(`rakshak_read_alerts_${hospitalId}`, JSON.stringify(updated));
    } catch {}
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  // Action: Quick Send Command Message
  const sendCommandMessage = async (messageText: string) => {
    return sendMessage('general', 'NORMAL', messageText);
  };

  // Action: Refresh Hospital Data
  const refreshHospitalData = async () => {
    try {
      const res = await fetch(`/api/hospital/${hospitalId}`);
      const data = await res.json();
      if (data.hospital) {
        setHospital(data.hospital);
        if (data.hospital.beds) setBeds(data.hospital.beds);
        if (data.hospital.bloodBank) setBloodBank(data.hospital.bloodBank);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <HospitalContext.Provider value={{
      hospitalId,
      hospital,
      beds,
      bloodBank,
      incomingPatients,
      activeEmergencies,
      commandMessages,
      alerts,
      unreadMessagesCount,
      unreadAlertsCount,
      loading,
      soundEnabled,
      setSoundEnabled: toggleSound,
      lastTelemetryUpdate,
      kpis,
      updateBeds,
      updateBloodBank,
      updatePatientStatus,
      sendMessage,
      sendCommandMessage,
      markMessageRead,
      markAlertRead,
      markAllAlertsRead,
      refreshHospitalData,
      ambulances,
      addAmbulance,
      updateAmbulance,
      deleteAmbulance,
      dispatchAmbulance
    }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
