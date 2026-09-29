import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, query, doc, setDoc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { EmergencyIncident, IncidentLifecycleStatus, HospitalRecommendationItem } from '../types/emergency';
import { EmergencyService, AssignHospitalParams } from '../services/EmergencyService';
import { evaluateAndRankHospitals, EvaluationInputHospital } from '../services/HospitalRecommendationEngine';
import { DEFAULT_EMERGENCY_CONFIG } from '../services/emergencyConfig';

const FALLBACK_HOSPITALS: EvaluationInputHospital[] = [
  {
    id: 'HOSP001',
    hospitalId: 'HOSP001',
    hospitalName: 'Apollo Multispecialty Hospital',
    address: 'Sarita Vihar, Mathura Road, Central Corridor',
    city: 'New Delhi',
    state: 'Delhi',
    latitude: 28.6289,
    longitude: 77.2155,
    contactNumber: '+91 11 2692 5858',
    emergencyContact: '+91 11 2692 5800',
    serviceRadiusKm: 35,
    account: { status: 'ACTIVE' },
    capacity: { totalBeds: 120, availableBeds: 45, emergencyBeds: 16, availableEmergencyBeds: 8, icuBeds: 18, availableIcuBeds: 5, ventilators: 12 },
    ambulances: { total: 5, available: 3, emergency: 3 },
    emergencyCapabilities: { emergency24x7: true, traumaCenter: true, icuAvailable: true, ambulanceAvailable: true, emergencySurgery: true, bloodBank: true, accidentTreatment: true },
    specializations: ['Trauma', 'Orthopedics', 'Emergency Surgery', 'Critical Care', 'Cardiology'],
    resourceLastUpdated: new Date().toISOString()
  },
  {
    id: 'HOSP002',
    hospitalId: 'HOSP002',
    hospitalName: 'Fortis Emergency Trauma Center',
    address: 'B-22, Sector 62, Expressway Junction',
    city: 'Noida',
    state: 'Uttar Pradesh',
    latitude: 28.6180,
    longitude: 77.2300,
    contactNumber: '+91 120 430 0222',
    emergencyContact: '+91 120 430 0108',
    serviceRadiusKm: 30,
    account: { status: 'ACTIVE' },
    capacity: { totalBeds: 100, availableBeds: 30, emergencyBeds: 12, availableEmergencyBeds: 6, icuBeds: 14, availableIcuBeds: 3, ventilators: 8 },
    ambulances: { total: 4, available: 2, emergency: 2 },
    emergencyCapabilities: { emergency24x7: true, traumaCenter: true, icuAvailable: true, ambulanceAvailable: true, emergencySurgery: true, bloodBank: true, accidentTreatment: true },
    specializations: ['Trauma', 'Neurosurgery', 'Critical Care', 'Orthopedics'],
    resourceLastUpdated: new Date().toISOString()
  },
  {
    id: 'HOSP003',
    hospitalId: 'HOSP003',
    hospitalName: 'Max Super Speciality Hospital',
    address: '1, 2, Press Enclave Marg, Saket',
    city: 'New Delhi',
    state: 'Delhi',
    latitude: 28.5283,
    longitude: 77.2115,
    contactNumber: '+91 11 2651 5050',
    emergencyContact: '+91 11 2651 5000',
    serviceRadiusKm: 25,
    account: { status: 'ACTIVE' },
    capacity: { totalBeds: 150, availableBeds: 50, emergencyBeds: 20, availableEmergencyBeds: 9, icuBeds: 22, availableIcuBeds: 7, ventilators: 15 },
    ambulances: { total: 6, available: 4, emergency: 3 },
    emergencyCapabilities: { emergency24x7: true, traumaCenter: true, icuAvailable: true, ambulanceAvailable: true, emergencySurgery: true, bloodBank: true, accidentTreatment: true },
    specializations: ['Trauma', 'Cardiac Emergencies', 'Critical Care', 'Emergency Surgery'],
    resourceLastUpdated: new Date().toISOString()
  },
  {
    id: 'HOSP004',
    hospitalId: 'HOSP004',
    hospitalName: 'AIIMS Apex Trauma Center',
    address: 'Ring Road, Safdarjung Enclave, Ansari Nagar',
    city: 'New Delhi',
    state: 'Delhi',
    latitude: 28.5672,
    longitude: 77.2100,
    contactNumber: '+91 11 2658 8500',
    emergencyContact: '+91 11 2659 4405',
    serviceRadiusKm: 40,
    account: { status: 'ACTIVE' },
    capacity: { totalBeds: 200, availableBeds: 60, emergencyBeds: 30, availableEmergencyBeds: 12, icuBeds: 35, availableIcuBeds: 10, ventilators: 25 },
    ambulances: { total: 10, available: 6, emergency: 5 },
    emergencyCapabilities: { emergency24x7: true, traumaCenter: true, icuAvailable: true, ambulanceAvailable: true, emergencySurgery: true, bloodBank: true, accidentTreatment: true },
    specializations: ['Level 1 Trauma', 'Neurosurgery', 'Poly-trauma', 'Emergency Surgery', 'Critical Care'],
    resourceLastUpdated: new Date().toISOString()
  }
];

interface EmergencyResponseContextType {
  incidents: EmergencyIncident[];
  activeIncident: EmergencyIncident | null;
  selectedIncidentId: string | null;
  isDrawerOpen: boolean;
  unassignedIncidents: EmergencyIncident[];
  criticalCount: number;
  allHospitals: EvaluationInputHospital[];
  openEmergency: (incidentId: string) => void;
  closeEmergency: () => void;
  assignHospital: (params: AssignHospitalParams) => Promise<boolean>;
  acknowledgeEmergency: (incidentId: string, hospitalId: string) => Promise<boolean>;
  recalculateRecommendations: (incidentId: string) => Promise<void>;
  updateIncidentStatus: (incidentId: string, status: IncidentLifecycleStatus, extra?: any) => Promise<boolean>;
  resolveEmergency: (incidentId: string, notes?: string) => Promise<boolean>;
  markResponding: (incidentId: string) => Promise<boolean>;
  triggerSimulatedAccident: (payload: any) => Promise<string>;
  loading: boolean;
  error: string | null;
}

const EmergencyResponseContext = createContext<EmergencyResponseContextType | undefined>(undefined);

export const EmergencyResponseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [hospitals, setHospitals] = useState<EvaluationInputHospital[]>(FALLBACK_HOSPITALS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Raw states to merge
  const [firestoreIncidents, setFirestoreIncidents] = useState<Record<string, any>>({});
  const [firestoreSosAlerts, setFirestoreSosAlerts] = useState<Record<string, any>>({});
  const [localSosAlerts, setLocalSosAlerts] = useState<Record<string, any>>({});

  // 1. Fetch & Subscribe to Hospitals Collection
  useEffect(() => {
    let unsubHosp: (() => void) | null = null;
    if (isFirebaseConfigured && db) {
      try {
        const hospCol = collection(db, 'hospitals');
        unsubHosp = onSnapshot(hospCol, (snap) => {
          if (!snap.empty) {
            const list: EvaluationInputHospital[] = snap.docs.map(d => ({
              id: d.id,
              hospitalId: d.data().hospitalId || d.id,
              hospitalName: d.data().hospitalName || d.data().name || 'Partner Hospital',
              latitude: d.data().latitude ?? d.data().location?.lat,
              longitude: d.data().longitude ?? d.data().location?.lng,
              address: d.data().address || '',
              city: d.data().city || '',
              state: d.data().state || '',
              contactNumber: d.data().contactNumber || '',
              emergencyContact: d.data().emergencyContact || d.data().contactNumber || '',
              serviceRadiusKm: d.data().serviceRadiusKm || 30,
              account: d.data().account || { status: 'ACTIVE' },
              capacity: d.data().capacity || {},
              ambulances: d.data().ambulances || {},
              emergencyCapabilities: d.data().emergencyCapabilities || { emergency24x7: true, traumaCenter: true },
              specializations: d.data().specializations || ['Trauma', 'Emergency Surgery'],
              resourceLastUpdated: d.data().resourceLastUpdated || new Date().toISOString()
            }));
            setHospitals(list);
          }
        }, (err) => console.warn('Hospitals listener warning:', err));
      } catch (e) {
        console.warn('Hospitals init error:', e);
      }
    }
    return () => {
      if (unsubHosp) unsubHosp();
    };
  }, []);

  // 2. Real-time Firestore subscription to BOTH 'incidents' AND 'sos_alerts'
  useEffect(() => {
    let unsubscribeIncidents: (() => void) | null = null;
    let unsubscribeSos: (() => void) | null = null;

    const readLocal = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
        const map: Record<string, any> = {};
        if (Array.isArray(stored)) {
          stored.forEach((item: any) => {
            if (item && item.id) map[item.id] = item;
          });
        }
        setLocalSosAlerts(map);
      } catch (e) {}
    };

    readLocal();
    window.addEventListener('storage', readLocal);

    if (isFirebaseConfigured && db) {
      try {
        // Listener on 'incidents'
        const incCol = collection(db, 'incidents');
        unsubscribeIncidents = onSnapshot(incCol, (snapshot) => {
          const map: Record<string, any> = {};
          snapshot.forEach((docSnap) => {
            map[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
          });
          setFirestoreIncidents(map);
          setLoading(false);
        }, (err) => {
          console.warn('Incidents snapshot listener error:', err);
          setLoading(false);
        });

        // Listener on 'sos_alerts'
        const sosCol = collection(db, 'sos_alerts');
        unsubscribeSos = onSnapshot(sosCol, (snapshot) => {
          const map: Record<string, any> = {};
          snapshot.forEach((docSnap) => {
            map[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
          });
          setFirestoreSosAlerts(map);
          setLoading(false);
        }, (err) => {
          console.warn('sos_alerts snapshot listener error:', err);
          setLoading(false);
        });

      } catch (e: any) {
        console.error('Failed to setup emergency subscription:', e);
        setError(e.message);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    return () => {
      if (unsubscribeIncidents) unsubscribeIncidents();
      if (unsubscribeSos) unsubscribeSos();
      window.removeEventListener('storage', readLocal);
    };
  }, []);

  // 3. Merge and compute recommendations automatically
  useEffect(() => {
    // Combine all IDs
    const allKeys = Array.from(new Set([
      ...Object.keys(firestoreIncidents),
      ...Object.keys(firestoreSosAlerts),
      ...Object.keys(localSosAlerts)
    ]));

    const mergedList: EmergencyIncident[] = [];
    const evaluationHospitals = hospitals.length > 0 ? hospitals : FALLBACK_HOSPITALS;

    allKeys.forEach((key) => {
      const incData = firestoreIncidents[key] || {};
      const sosData = firestoreSosAlerts[key] || {};
      const locData = localSosAlerts[key] || {};

      // Merged payload (incidents priority, then sos_alerts, then local)
      const data = { ...locData, ...sosData, ...incData };

      const incidentId = data.incidentId || data.id || key;
      const lat = typeof data.latitude === 'number' ? data.latitude : (typeof data.lat === 'number' ? data.lat : 28.6139);
      const lng = typeof data.longitude === 'number' ? data.longitude : (typeof data.lng === 'number' ? data.lng : 77.2090);
      const severityStr = String(data.severity || 'CRITICAL').toUpperCase();
      const severity = (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(severityStr) ? severityStr : 'CRITICAL') as any;

      // Ensure recommendations exist or compute on-the-fly
      let recommendations = Array.isArray(data.hospitalRecommendations) && data.hospitalRecommendations.length > 0 
        ? data.hospitalRecommendations 
        : null;
      let ineligibles = Array.isArray(data.ineligibleHospitals) 
        ? data.ineligibleHospitals 
        : [];

      if (!recommendations || recommendations.length === 0) {
        try {
          const evalResult = evaluateAndRankHospitals(lat, lng, severity, evaluationHospitals, DEFAULT_EMERGENCY_CONFIG);
          recommendations = evalResult.recommendations.slice(0, 3);
          ineligibles = evalResult.ineligibleHospitals;
        } catch (e) {
          recommendations = [];
        }
      }

      // Map status
      const rawStatus = data.status || (data.assignedHospitalId ? 'HOSPITAL_ASSIGNED' : 'AWAITING_HOSPITAL_ASSIGNMENT');
      let status: IncidentLifecycleStatus = 'AWAITING_HOSPITAL_ASSIGNMENT';
      if (rawStatus === 'resolved' || rawStatus === 'RESOLVED' || rawStatus === 'INCIDENT_CLOSED') {
        status = 'INCIDENT_CLOSED';
      } else if (rawStatus === 'HOSPITAL_ACKNOWLEDGED' || data.hospitalAcknowledged) {
        status = 'HOSPITAL_ACKNOWLEDGED';
      } else if (data.assignedHospitalId || rawStatus === 'HOSPITAL_ASSIGNED') {
        status = 'HOSPITAL_ASSIGNED';
      } else if (rawStatus === 'responding' || rawStatus === 'RESPONDING') {
        status = 'AWAITING_HOSPITAL_ASSIGNMENT';
      }

      mergedList.push({
        id: incidentId,
        incidentId: incidentId,
        vehicleId: data.vehicleId || data.vehicleReg || data.vehicle || 'Vehicle',
        patientId: data.patientId || data.customerId || 'P-101',
        patientName: data.patientName || data.userName || data.user || 'Emergency Patient',
        mobile: data.mobile || data.contact || '',
        latitude: lat,
        longitude: lng,
        locationText: data.locationText || data.location || data.loc || 'Reported Incident Location',
        speed: data.speed || data.currentSpeed || 0,
        severity: severity,
        deviceStatus: data.deviceStatus || 'ONLINE',
        sensorData: data.sensorData || {},
        detectedAt: data.detectedAt || data.timestamp || data.createdAt || new Date().toISOString(),
        lastTelemetryUpdate: data.lastTelemetryUpdate || data.lastUpdated || new Date().toISOString(),
        status: status,
        statusLegacy: data.status === 'resolved' ? 'resolved' : (data.status === 'responding' ? 'responding' : 'new'),
        assignedHospitalId: data.assignedHospitalId || data.hospitalId || null,
        assignedHospitalName: data.assignedHospitalName || data.hospitalName || null,
        assignedBy: data.assignedBy || null,
        assignedAt: data.assignedAt || data.hospitalAssignedAt || null,
        assignmentReason: data.assignmentReason || null,
        isManualOverride: Boolean(data.isManualOverride),
        hospitalNotified: Boolean(data.hospitalNotified || data.assignedHospitalId),
        hospitalNotifiedAt: data.hospitalNotifiedAt || null,
        hospitalAcknowledged: Boolean(data.hospitalAcknowledged),
        hospitalAcknowledgedAt: data.hospitalAcknowledgedAt || null,
        ambulanceId: data.ambulanceId || null,
        ambulance: data.ambulance || null,
        hospitalRecommendations: recommendations || [],
        ineligibleHospitals: ineligibles,
        recommendationsCalculatedAt: data.recommendationsCalculatedAt || new Date().toISOString(),
        admissionStatus: data.admissionStatus || undefined,
        handoverNotes: data.handoverNotes || undefined,
        resolvedAt: data.resolvedAt || undefined,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      });
    });

    // Sort descending by detection timestamp
    mergedList.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
    setIncidents(mergedList);
  }, [firestoreIncidents, firestoreSosAlerts, localSosAlerts, hospitals]);

  const activeIncident = useMemo(() => {
    if (!selectedIncidentId) return incidents[0] || null;
    return incidents.find(i => i.incidentId === selectedIncidentId || i.id === selectedIncidentId) || null;
  }, [incidents, selectedIncidentId]);

  const unassignedIncidents = useMemo(() => {
    return incidents.filter(i => 
      !i.assignedHospitalId && 
      i.status !== 'INCIDENT_CLOSED' &&
      i.status !== 'DISCHARGED'
    );
  }, [incidents]);

  const criticalCount = useMemo(() => {
    return incidents.filter(i => 
      i.severity === 'CRITICAL' && 
      !i.assignedHospitalId &&
      i.status !== 'INCIDENT_CLOSED'
    ).length;
  }, [incidents]);

  const openEmergency = useCallback((incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setIsDrawerOpen(true);
  }, []);

  const closeEmergency = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const assignHospital = useCallback(async (params: AssignHospitalParams): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      // 1. Try API
      let apiSuccess = false;
      try {
        const res = await EmergencyService.assignHospital(params);
        if (res && res.success) apiSuccess = true;
      } catch (e) {
        console.warn('API assign-hospital endpoint fallback to Firestore direct update:', e);
      }

      // 2. Direct Firestore update to BOTH incidents and sos_alerts
      if (isFirebaseConfigured && db) {
        const payload = {
          assignedHospitalId: params.hospitalId,
          assignedHospitalName: params.hospitalName,
          status: 'HOSPITAL_ASSIGNED',
          hospitalStatus: 'HOSPITAL_ASSIGNED',
          hospitalNotified: true,
          hospitalNotifiedAt: now,
          hospitalAcknowledged: false,
          assignedAt: now,
          assignmentReason: params.assignmentReason || 'Admin Assigned Hospital',
          ambulanceAssigned: false,
          ambulanceStatus: 'PENDING_DISPATCH',
          admissionStatus: 'PENDING_DISPATCH',
          ambulanceId: null,
          ambulanceNumber: null,
          ambulance: null
        };

        try {
          // Update incidents doc
          const incRef = doc(db, 'incidents', params.incidentId);
          await updateDoc(incRef, payload).catch(() => setDoc(incRef, payload, { merge: true }));
        } catch (err) {}

        try {
          // Update sos_alerts doc
          const sosRef = doc(db, 'sos_alerts', params.incidentId);
          await updateDoc(sosRef, payload).catch(() => setDoc(sosRef, payload, { merge: true }));
        } catch (err) {}

        try {
          // Create / update incoming patient in incoming_patients
          const incPatRef = doc(db, 'incoming_patients', `INC-PAT-${params.incidentId}`);
          await setDoc(incPatRef, {
            id: `INC-PAT-${params.incidentId}`,
            incidentId: params.incidentId,
            hospitalId: params.hospitalId,
            hospitalName: params.hospitalName,
            patientName: params.patientName || 'Emergency Victim',
            condition: 'Critical Trauma',
            eta: 'Awaiting Dispatch',
            status: 'PENDING_DISPATCH',
            admissionStatus: 'PENDING_DISPATCH',
            ambulanceAssigned: false,
            ambulanceStatus: 'PENDING_DISPATCH',
            hospitalAcknowledged: false,
            timestamp: now,
            assignedAt: now
          }, { merge: true });
        } catch (err) {}
      }

      // 3. Update localStorage rakshak_sos_alerts
      try {
        const stored = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
        if (Array.isArray(stored)) {
          const updated = stored.map((item: any) => {
            if (item.id === params.incidentId) {
              return {
                ...item,
                assignedHospitalId: params.hospitalId,
                assignedHospitalName: params.hospitalName,
                status: 'HOSPITAL_ASSIGNED',
                hospitalStatus: 'HOSPITAL_ASSIGNED',
                hospitalAcknowledged: false,
                assignedAt: now,
                ambulanceAssigned: false,
                ambulanceStatus: 'PENDING_DISPATCH'
              };
            }
            return item;
          });
          localStorage.setItem('rakshak_sos_alerts', JSON.stringify(updated));
        }
      } catch (e) {}

      // 4. Update local state
      setIncidents(prev => prev.map(inc => {
        if (inc.incidentId === params.incidentId || inc.id === params.incidentId) {
          return {
            ...inc,
            assignedHospitalId: params.hospitalId,
            assignedHospitalName: params.hospitalName || inc.assignedHospitalName,
            status: 'HOSPITAL_ASSIGNED',
            statusLegacy: 'responding',
            hospitalNotified: true,
            hospitalNotifiedAt: now,
            hospitalAcknowledged: false,
            assignedAt: now,
            assignmentReason: params.assignmentReason || 'Admin Assigned Hospital',
            ambulanceAssigned: false,
            ambulanceStatus: 'PENDING_DISPATCH',
            ambulance: undefined
          };
        }
        return inc;
      }));

      return true;
    } catch (err: any) {
      console.error('Failed to assign hospital:', err);
      alert(err.message || 'Error assigning hospital');
      return false;
    }
  }, []);

  const acknowledgeEmergency = useCallback(async (incidentId: string, hospitalId: string): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      try {
        await EmergencyService.acknowledgeEmergency(incidentId, hospitalId);
      } catch (e) {}

      if (isFirebaseConfigured && db) {
        const ackPayload = {
          hospitalAcknowledged: true,
          hospitalAcknowledgedAt: now,
          status: 'HOSPITAL_ACKNOWLEDGED',
          hospitalStatus: 'HOSPITAL_ACKNOWLEDGED'
        };

        try {
          await updateDoc(doc(db, 'incidents', incidentId), ackPayload).catch(() => {});
        } catch (e) {}
        try {
          await updateDoc(doc(db, 'sos_alerts', incidentId), ackPayload).catch(() => {});
        } catch (e) {}
        try {
          await updateDoc(doc(db, 'incoming_patients', `INC-PAT-${incidentId}`), {
            hospitalAcknowledged: true,
            status: 'PREPARING_BAY',
            acknowledgedAt: now
          }).catch(() => {});
        } catch (e) {}
      }

      setIncidents(prev => prev.map(inc => {
        if (inc.incidentId === incidentId || inc.id === incidentId) {
          return {
            ...inc,
            hospitalAcknowledged: true,
            hospitalAcknowledgedAt: now,
            status: 'HOSPITAL_ACKNOWLEDGED'
          };
        }
        return inc;
      }));

      return true;
    } catch (err) {
      console.error('Failed to acknowledge emergency:', err);
      return false;
    }
  }, []);

  const resolveEmergency = useCallback(async (incidentId: string, notes?: string): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const payload = {
        status: 'resolved',
        statusLegacy: 'resolved',
        hospitalStatus: 'RESOLVED',
        resolvedAt: now,
        resolutionNotes: notes || 'Resolved by Admin'
      };

      if (isFirebaseConfigured && db) {
        try {
          await updateDoc(doc(db, 'sos_alerts', incidentId), payload).catch(() => {});
        } catch (e) {}
        try {
          await updateDoc(doc(db, 'incidents', incidentId), {
            status: 'INCIDENT_CLOSED',
            statusLegacy: 'resolved',
            resolvedAt: now,
            resolutionNotes: notes || 'Resolved by Admin'
          }).catch(() => {});
        } catch (e) {}
      }

      // Update localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
        if (Array.isArray(stored)) {
          const updated = stored.map((item: any) => {
            if (item.id === incidentId) {
              return { ...item, ...payload };
            }
            return item;
          });
          localStorage.setItem('rakshak_sos_alerts', JSON.stringify(updated));
        }
      } catch (e) {}

      // Update state
      setIncidents(prev => prev.map(inc => {
        if (inc.incidentId === incidentId || inc.id === incidentId) {
          return {
            ...inc,
            status: 'INCIDENT_CLOSED',
            statusLegacy: 'resolved',
            resolvedAt: now
          };
        }
        return inc;
      }));

      return true;
    } catch (err) {
      console.error('Failed to resolve emergency:', err);
      return false;
    }
  }, []);

  const markResponding = useCallback(async (incidentId: string): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const payload = {
        status: 'responding',
        statusLegacy: 'responding',
        respondedAt: now
      };

      if (isFirebaseConfigured && db) {
        try {
          await updateDoc(doc(db, 'sos_alerts', incidentId), payload).catch(() => {});
        } catch (e) {}
        try {
          await updateDoc(doc(db, 'incidents', incidentId), {
            statusLegacy: 'responding',
            respondedAt: now
          }).catch(() => {});
        } catch (e) {}
      }

      // Update localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
        if (Array.isArray(stored)) {
          const updated = stored.map((item: any) => {
            if (item.id === incidentId) {
              return { ...item, ...payload };
            }
            return item;
          });
          localStorage.setItem('rakshak_sos_alerts', JSON.stringify(updated));
        }
      } catch (e) {}

      setIncidents(prev => prev.map(inc => {
        if (inc.incidentId === incidentId || inc.id === incidentId) {
          return {
            ...inc,
            statusLegacy: 'responding'
          };
        }
        return inc;
      }));

      return true;
    } catch (err) {
      console.error('Failed to mark responding:', err);
      return false;
    }
  }, []);

  const recalculateRecommendations = useCallback(async (incidentId: string): Promise<void> => {
    try {
      const updated = await EmergencyService.recalculateRecommendations(incidentId);
      setIncidents(prev => prev.map(inc => {
        if (inc.incidentId === incidentId || inc.id === incidentId) {
          return { ...inc, ...updated };
        }
        return inc;
      }));
    } catch (err: any) {
      console.error('Failed to recalculate recommendations:', err);
      // Fallback: recompute client-side using hospitals
      setIncidents(prev => prev.map(inc => {
        if (inc.incidentId === incidentId || inc.id === incidentId) {
          const evalResult = evaluateAndRankHospitals(
            inc.latitude, 
            inc.longitude, 
            inc.severity, 
            hospitals.length > 0 ? hospitals : FALLBACK_HOSPITALS, 
            DEFAULT_EMERGENCY_CONFIG
          );
          return {
            ...inc,
            hospitalRecommendations: evalResult.recommendations.slice(0, 3),
            ineligibleHospitals: evalResult.ineligibleHospitals,
            recommendationsCalculatedAt: new Date().toISOString()
          };
        }
        return inc;
      }));
    }
  }, [hospitals]);

  const updateIncidentStatus = useCallback(async (
    incidentId: string, 
    status: IncidentLifecycleStatus, 
    extra?: any
  ): Promise<boolean> => {
    try {
      const ok = await EmergencyService.updateStatus(incidentId, status, extra);
      if (ok) {
        setIncidents(prev => prev.map(inc => {
          if (inc.incidentId === incidentId || inc.id === incidentId) {
            return { ...inc, status, ...extra };
          }
          return inc;
        }));
      }
      return ok;
    } catch (err) {
      console.error('Failed to update status:', err);
      return false;
    }
  }, []);

  const triggerSimulatedAccident = useCallback(async (payload: any): Promise<string> => {
    const res = await EmergencyService.reportAccidentEvent(payload);
    openEmergency(res.incidentId);
    return res.incidentId;
  }, [openEmergency]);

  return (
    <EmergencyResponseContext.Provider value={{
      incidents,
      activeIncident,
      selectedIncidentId,
      isDrawerOpen,
      unassignedIncidents,
      criticalCount,
      allHospitals: hospitals,
      openEmergency,
      closeEmergency,
      assignHospital,
      acknowledgeEmergency,
      recalculateRecommendations,
      updateIncidentStatus,
      resolveEmergency,
      markResponding,
      triggerSimulatedAccident,
      loading,
      error
    }}>
      {children}
    </EmergencyResponseContext.Provider>
  );
};

export const useEmergencyResponse = () => {
  const context = useContext(EmergencyResponseContext);
  if (!context) {
    throw new Error('useEmergencyResponse must be used within an EmergencyResponseProvider');
  }
  return context;
};
