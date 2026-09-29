export type Role = 'admin' | 'user' | 'operator';

export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  phone?: string;
  status: 'active' | 'disabled';
  lastActive: string;
  createdAt: string;
}

export interface Family {
  id: string;
  primaryUserId: string;
  memberIds: string[];
  emergencyContacts: string[];
  linkedVehicleIds: string[];
  status: 'active' | 'inactive';
}

export interface Vehicle {
  id: string;
  ownerId: string;
  registrationNumber: string;
  deviceId: string;
  status: 'online' | 'offline' | 'warning' | 'emergency';
  lastLocation: { lat: number; lng: number };
  lastConnection: string;
  riskStatus: 'low' | 'medium' | 'high' | 'critical';
}

export interface Journey {
  id: string;
  userId: string;
  vehicleId: string;
  startLocation: string;
  destination: string;
  startTime: string;
  status: 'scheduled' | 'active' | 'completed' | 'interrupted' | 'emergency';
  riskScore: number;
  duration?: string;
}

export interface Alert {
  id: string;
  type: string;
  userId: string;
  vehicleId: string;
  location: { lat: number; lng: number };
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'responding' | 'resolved';
}

export interface SosEvent {
  id: string;
  userId: string;
  vehicleId: string;
  location: { lat: number; lng: number };
  timestamp: string;
  emergencyType: string;
  responseStatus: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
  nearestHospitalId?: string;
  assignedTeam?: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  address: string;
  emergencyAvailability: boolean;
  beds: number;
  ambulances: number;
  contact: string;
  status: 'available' | 'busy' | 'emergency' | 'offline';
}

export type HospitalType = 
  | 'Government' 
  | 'Private' 
  | 'Trauma Center' 
  | 'Multi-Specialty' 
  | 'Specialty Hospital' 
  | 'Other';

export type HospitalAccountStatus = 
  | 'PENDING_ACTIVATION' 
  | 'ACTIVE' 
  | 'SUSPENDED' 
  | 'REVOKED';

export interface HospitalDoctor {
  id?: string;
  name: string;
  specialization: string;
  department: string;
  qualification: string;
  experience: string;
  availability: string;
  contact?: string;
  emergencyAvailability: boolean;
  shiftTiming: string;
}

export interface HospitalBedCapacity {
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  icuBeds: number;
  availableIcuBeds: number;
  emergencyBeds: number;
  availableEmergencyBeds: number;
  ventilators: number;
}

export interface HospitalAmbulanceCapacity {
  total: number;
  available: number;
  emergency: number;
  contactNumber?: string;
  status: 'Available' | 'On Duty' | 'Standby' | 'Unavailable';
}

export interface HospitalEmergencyCapabilities {
  emergency24x7: boolean;
  traumaCenter: boolean;
  icuAvailable: boolean;
  ambulanceAvailable: boolean;
  emergencySurgery: boolean;
  bloodBank: boolean;
  ventilatorAvailable: boolean;
  physiotherapyRehab: boolean;
  accidentTreatment: boolean;
  notes?: string;
}

export interface HospitalRecord {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalType: HospitalType | string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  emergencyContact: string;
  email: string;
  website?: string;
  capacity: HospitalBedCapacity;
  ambulances: HospitalAmbulanceCapacity;
  doctors: HospitalDoctor[];
  specializations: string[];
  services: string[];
  coverageAreas: string[];
  serviceRadiusKm?: number;
  emergencyCapabilities: HospitalEmergencyCapabilities;
  account: {
    status: HospitalAccountStatus;
    mustChangePassword: boolean;
    createdAt: string;
    lastLogin: string | null;
    lastUpdated?: string;
    lastPasswordChange?: string | null;
  };
}

export interface Device {
  id: string;
  vehicleId: string;
  userId: string;
  connection: 'online' | 'offline' | 'error';
  battery: number;
  lastSync: string;
  firmware: string;
  status: 'online' | 'offline' | 'low_battery' | 'error';
}

export interface SystemLog {
  id: string;
  adminUid: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  metadata?: any;
}

export interface Customer {
  id: string; // The Customer ID like RR-YYYY-XXXXX
  uid: string;
  name: string;
  mobile: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  deviceId: string;
  vehicleReg: string;
  role: 'Customer Owner' | 'Family Member' | 'Driver';
  status: 'Active' | 'Suspended';
  forcePasswordReset: boolean;
  createdAt: any;
  lastLogin?: any;
}
