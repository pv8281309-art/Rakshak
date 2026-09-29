import { EmergencyEngineConfig } from '../types/emergency';

export const DEFAULT_EMERGENCY_CONFIG: EmergencyEngineConfig = {
  maxSearchRadiusKm: 50,
  dataFreshnessStaleMinutes: 15,
  criticalIcuRequired: true,
  defaultAmbulanceSpeedKmh: 48,
  hospitalAckTimeoutSeconds: 180, // 3 minutes
  rankingWeights: {
    traumaCapability: 30,
    requiredResources: 25,
    etaAndDistance: 25,
    bedCapacity: 10,
    ambulanceAvailability: 5,
    specializationMatch: 5,
  },
  staleDataPenalty: 15,
};

export const RELEVANT_TRAUMA_SPECIALIZATIONS = [
  'Trauma',
  'Orthopedics',
  'Neurosurgery',
  'Cardiology',
  'Emergency Surgery',
  'Critical Care',
  'Physiotherapy/Rehabilitation'
];

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  ACCIDENT_DETECTED: ['HOSPITAL_RECOMMENDATIONS_READY', 'AWAITING_HOSPITAL_ASSIGNMENT', 'HOSPITAL_ASSIGNED'],
  HOSPITAL_RECOMMENDATIONS_READY: ['AWAITING_HOSPITAL_ASSIGNMENT', 'HOSPITAL_ASSIGNED'],
  AWAITING_HOSPITAL_ASSIGNMENT: ['HOSPITAL_ASSIGNED'],
  HOSPITAL_ASSIGNED: ['HOSPITAL_NOTIFIED', 'HOSPITAL_ACKNOWLEDGED', 'AMBULANCE_DISPATCHED'],
  HOSPITAL_NOTIFIED: ['HOSPITAL_ACKNOWLEDGED', 'AMBULANCE_DISPATCHED'],
  HOSPITAL_ACKNOWLEDGED: ['AMBULANCE_DISPATCHED', 'AMBULANCE_EN_ROUTE'],
  AMBULANCE_DISPATCHED: ['AMBULANCE_EN_ROUTE', 'AMBULANCE_NEAR_HOSPITAL'],
  AMBULANCE_EN_ROUTE: ['AMBULANCE_NEAR_HOSPITAL', 'PATIENT_ARRIVED'],
  AMBULANCE_NEAR_HOSPITAL: ['PATIENT_ARRIVED'],
  PATIENT_ARRIVED: ['PATIENT_HANDED_OVER'],
  PATIENT_HANDED_OVER: ['ADMITTED', 'TRANSFERRED', 'DISCHARGED'],
  ADMITTED: ['TRANSFERRED', 'DISCHARGED', 'INCIDENT_CLOSED'],
  TRANSFERRED: ['DISCHARGED', 'INCIDENT_CLOSED'],
  DISCHARGED: ['INCIDENT_CLOSED'],
  INCIDENT_CLOSED: [],
};
