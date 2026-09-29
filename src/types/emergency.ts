export type AccidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentLifecycleStatus = 
  | 'ACCIDENT_DETECTED'
  | 'HOSPITAL_RECOMMENDATIONS_READY'
  | 'AWAITING_HOSPITAL_ASSIGNMENT'
  | 'HOSPITAL_ASSIGNED'
  | 'HOSPITAL_NOTIFIED'
  | 'HOSPITAL_ACKNOWLEDGED'
  | 'AMBULANCE_DISPATCHED'
  | 'AMBULANCE_EN_ROUTE'
  | 'AMBULANCE_NEAR_HOSPITAL'
  | 'PATIENT_ARRIVED'
  | 'PATIENT_HANDED_OVER'
  | 'ADMITTED'
  | 'TRANSFERRED'
  | 'DISCHARGED'
  | 'INCIDENT_CLOSED';

export interface HospitalSuitabilityFactor {
  code: string;
  label: string;
  isMet: boolean;
  scoreImpact: number;
  detail: string;
}

export interface HospitalRecommendationItem {
  hospitalId: string;
  hospitalName: string;
  rank: 1 | 2 | 3 | number;
  badge: 'RECOMMENDED' | 'ALTERNATIVE' | 'ELIGIBLE';
  operationalScore: number; // 0 - 100
  distanceKm: number;
  etaMinutes: number;
  etaText: string;
  isEligible: boolean;
  ineligibilityReason?: string;
  whyRecommended: string[];
  suitabilityFactors: HospitalSuitabilityFactor[];
  resourcesSnapshot: {
    emergencyBedsAvailable: number;
    emergencyBedsTotal: number;
    icuBedsAvailable: number;
    icuBedsTotal: number;
    generalBedsAvailable: number;
    generalBedsTotal: number;
    availableAmbulances: number;
    traumaCapable: boolean;
    emergency24x7: boolean;
    bloodBankAvailable: boolean;
    ventilators: number;
  };
  dataFreshness: {
    resourceLastUpdated: string;
    isStale: boolean;
    minutesAgo: number;
    freshnessLabel: string;
  };
  contactNumber: string;
  emergencyContact: string;
  address: string;
  city?: string;
  state?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  specializations: string[];
}

export interface IncidentAmbulanceTracking {
  id: string;
  number: string;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'NEAR_HOSPITAL' | 'ARRIVED' | 'PATIENT_HANDED_OVER';
  speed: number;
  etaMinutes: number;
  etaText: string;
  lat?: number;
  lng?: number;
  heading?: number;
  driverName?: string;
  driverPhone?: string;
  paramedicName?: string;
  assignedHospitalId?: string;
  lastUpdated?: string;
}

export interface EmergencyIncident {
  id: string; // Document ID / incidentId (e.g. INC-20260921-0001)
  incidentId: string;
  vehicleId: string;
  vehicleReg?: string;
  customerId?: string;
  patientId: string;
  patientName: string;
  mobile?: string;
  latitude: number | null;
  longitude: number | null;
  locationText: string;
  speed: number;
  severity: AccidentSeverity;
  deviceStatus: string;
  sensorData?: {
    impactForceG?: number;
    rollOver?: boolean;
    airbagDeployed?: boolean;
    sensorSeverity?: string;
    speedBeforeImpact?: number;
  };
  detectedAt: string;
  lastTelemetryUpdate: string;
  status: IncidentLifecycleStatus;
  statusLegacy?: 'new' | 'responding' | 'resolved';
  
  // Hospital Assignment Details
  assignedHospitalId: string | null;
  assignedHospitalName?: string | null;
  assignedBy?: string | null;
  assignedAt?: string | null;
  assignmentReason?: string | null;
  isManualOverride?: boolean;
  
  // Hospital Notification & Acknowledgement
  hospitalNotified: boolean;
  hospitalNotifiedAt?: string | null;
  hospitalAcknowledged: boolean;
  hospitalAcknowledgedAt?: string | null;
  
  // Ambulance Tracking
  ambulanceId?: string;
  ambulance?: IncidentAmbulanceTracking | null;
  
  // Recommendation snapshot
  hospitalRecommendations: HospitalRecommendationItem[];
  ineligibleHospitals?: Array<{
    hospitalId: string;
    hospitalName: string;
    reason: string;
    distanceKm: number;
  }>;
  recommendationsCalculatedAt?: string;
  
  // Hospital Treatment / Handover workflow
  admissionStatus?: 'EN_ROUTE' | 'ARRIVED' | 'HANDED_OVER' | 'ADMITTED' | 'TRANSFERRED' | 'DISCHARGED';
  handoverNotes?: string;
  resolvedAt?: string;
  lastUpdated: string;
}

export interface EmergencyEngineConfig {
  maxSearchRadiusKm: number;
  dataFreshnessStaleMinutes: number;
  criticalIcuRequired: boolean;
  defaultAmbulanceSpeedKmh: number;
  hospitalAckTimeoutSeconds: number;
  rankingWeights: {
    traumaCapability: number;      // 30
    requiredResources: number;     // 25
    etaAndDistance: number;        // 25
    bedCapacity: number;           // 10
    ambulanceAvailability: number; // 5
    specializationMatch: number;   // 5
  };
  staleDataPenalty: number;
}
