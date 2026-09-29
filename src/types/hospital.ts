import { HospitalRecord, HospitalType } from './index';

export type BedCategory = 
  | 'general'
  | 'emergency'
  | 'icu'
  | 'hdu'
  | 'pediatric'
  | 'isolation'
  | 'other';

export interface BedCategoryData {
  category: BedCategory;
  name: string;
  total: number;
  occupied: number;
  available: number;
  occupancyRate: number; // percentage
}

export interface HospitalBedsData {
  general: BedCategoryData;
  emergency: BedCategoryData;
  icu: BedCategoryData;
  hdu: BedCategoryData;
  pediatric: BedCategoryData;
  isolation: BedCategoryData;
  other: BedCategoryData;
  totalBeds: number;
  totalOccupied: number;
  totalAvailable: number;
  overallOccupancyRate: number;
  lastUpdated: string;
  updatedBy: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type BloodStockStatus = 'AVAILABLE' | 'LOW' | 'CRITICAL';

export interface BloodInventoryItem {
  bloodGroup: BloodGroup;
  units: number;
  status: BloodStockStatus;
  minThreshold: number; // e.g. 15 units = Low
  criticalThreshold: number; // e.g. 5 units = Critical
  lastUpdated: string;
  updatedBy?: string;
}

export type EmergencySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AmbulanceDispatchStatus = 
  | 'PENDING_DISPATCH'
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'NEAR_HOSPITAL'
  | 'ARRIVED'
  | 'PATIENT_HANDED_OVER';

export type PatientAdmissionStatus = 
  | 'PENDING_DISPATCH'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'HANDED_OVER'
  | 'ADMITTED'
  | 'TRANSFERRED'
  | 'DISCHARGED';

export type AmbulanceVehicleStatus = 'AVAILABLE' | 'ON_DUTY' | 'DISPATCHED' | 'MAINTENANCE';

export type AmbulanceType = 
  | 'ALS (Advanced Life Support)' 
  | 'BLS (Basic Life Support)' 
  | 'Patient Transport (PTS)' 
  | 'Neonatal / ICU';

export interface HospitalAmbulance {
  id: string; // e.g. AMB-HOSP001-1
  hospitalId: string; // e.g. HOSP001
  name: string; // e.g. "Ambulance 1", "Ambulance 2", "Trauma Unit 1"
  vehicleNumber: string; // e.g. "DL 01 AX 4589"
  type: AmbulanceType;
  driverName: string; // e.g. "Ramesh Kumar"
  driverPhone: string; // e.g. "+91 98765 43210"
  paramedicName?: string; // e.g. "Dr. Sneha Patel"
  equipment: string[]; // e.g. ["Oxygen", "Ventilator", "Defibrillator", "Stretcher"]
  status: AmbulanceVehicleStatus;
  currentIncidentId?: string | null;
  baseLocation?: string;
  lat?: number;
  lng?: number;
  lastUpdated?: string;
}

export interface IncomingPatient {
  id: string; // Document ID
  incidentId: string;
  patientId: string;
  patientName: string;
  age?: number;
  gender?: string;
  mobile?: string;
  vehicle?: string;
  severity: EmergencySeverity;
  condition: string;
  type: string;
  ambulanceAssigned?: boolean;
  ambulanceId: string;
  ambulanceNumber?: string;
  driverName?: string;
  driverPhone?: string;
  paramedicName?: string;
  ambulanceStatus: AmbulanceDispatchStatus;
  location: string;
  lat?: number;
  lng?: number;
  eta: string;
  currentSpeed?: number;
  heading?: number;
  assignedHospitalId: string;
  hospitalName: string;
  department: string;
  requiredResources: string[];
  assignedAt: string;
  lastUpdated: string;
  admissionStatus: PatientAdmissionStatus;
  hospitalAcknowledged?: boolean;
  hospitalAcknowledgedAt?: string;
  emergencyNotes?: string;
  dispatchedAt?: string;
  arrivedAt?: string;
  handoverAt?: string;
  admittedAt?: string;
  transferredAt?: string;
  dischargedAt?: string;
}

export type CommandMessageType = 
  | 'request_ambulance'
  | 'request_support'
  | 'bed_shortage'
  | 'blood_shortage'
  | 'escalation'
  | 'arrival_update'
  | 'general';

export type CommandMessagePriority = 'CRITICAL' | 'IMPORTANT' | 'HIGH' | 'MEDIUM' | 'NORMAL';
export type MessageDeliveryStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface CommandMessage {
  id: string;
  messageId: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'HOSPITAL' | 'ADMIN' | 'SYSTEM';
  receiverId: string;
  receiverRole: 'HOSPITAL' | 'ADMIN' | 'SYSTEM';
  hospitalId: string;
  hospitalName?: string;
  incidentId?: string | null;
  message: string;
  type: CommandMessageType | string;
  priority: CommandMessagePriority;
  status?: MessageDeliveryStatus;
  createdAt?: string;
  timestamp: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  read: boolean;
}

export interface HospitalAlert {
  id: string;
  type: 'incoming_patient' | 'critical_patient' | 'ambulance_status' | 'bed_capacity' | 'blood_stock' | 'command_message' | 'escalation';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  incidentId?: string;
  metadata?: any;
}

export type AmbulanceUnitStatus = 'AVAILABLE' | 'ON_DUTY' | 'DISPATCHED' | 'MAINTENANCE';
export type AmbulanceUnitType = 'ALS' | 'BLS' | 'ICU_MOBILE' | 'NEONATAL';

export interface HospitalAmbulanceUnit {
  id: string; // e.g. AMB-01, AMB-02
  vehicleNumber: string; // e.g. DL 01 AB 1234
  name: string; // e.g. Ambulance 1 (Trauma ALS)
  type: AmbulanceUnitType;
  status: AmbulanceUnitStatus;
  driverName: string;
  driverPhone: string;
  paramedicName: string;
  paramedicPhone?: string;
  equipment: string[];
  currentIncidentId?: string | null;
  lat?: number;
  lng?: number;
  speed?: number;
  lastUpdated?: string;
}

export interface HospitalDispatchAmbulanceParams {
  incidentId: string;
  ambulanceUnitId: string;
  driverName?: string;
  driverPhone?: string;
  paramedicName?: string;
  notes?: string;
}
