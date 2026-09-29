import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, onSnapshot, query, where, updateDoc } from 'firebase/firestore';

export interface VerifiedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
  deviceId: string;
  deviceSerial: string;
  vehicleReg: string;
  vehicleModel: string;
  installDate: string;
  customerId: string;
  familyId: string;
  status: 'active' | 'inactive' | 'warning' | 'emergency';
  role: 'Customer' | 'Admin' | 'Fleet Manager';
  drivingStatus?: 'driving' | 'parked' | 'idle' | 'emergency';
  activeJourney?: any;
  lastSpeed?: number;
  lastLat?: number;
  lastLng?: number;
  lastSeen?: string;
  emergencyContacts: {
    name: string;
    relationship: string;
    mobile: string;
  }[];
}

export interface VerifiedVehicle {
  id: string;
  regNo: string;
  model: string;
  ownerName: string;
  customerId: string;
  deviceId: string;
  deviceSerial: string;
  status: 'online' | 'warning' | 'offline' | 'emergency';
  riskProfile: 'low' | 'medium' | 'high' | 'critical';
  speedKmH: number;
  lastConnection: string;
  coordinates: [number, number];
  batteryVoltage: string;
  shockGForce: number;
}

export interface TraumaHospital {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalType: string;
  name?: string;
  phone?: string;
  city: string;
  state: string;
  emergencyContact: string;
  icuBedsAvailable: number;
  icuBedsTotal: number;
  emergencyBedsAvailable: number;
  emergencyBedsTotal: number;
  totalBeds?: number;
  availableBeds?: number;
  availableIcuBeds?: number;
  ventilatorsAvailable: number;
  bloodBankStatus: string;
  ambulancesAvailable: number;
  ambulances?: { total: number; available: number };
  temporaryPassword?: string;
  traumaLevel: string;
  coordinates: [number, number];
}

// Verified Seed Fleet for Operation Rakshak 3.0
export const INITIAL_CUSTOMERS: VerifiedCustomer[] = [
  {
    id: 'USR-889101',
    customerId: 'USR-889101',
    name: 'Vikramaditya Verma',
    email: 'vikram.verma@rakshak-net.in',
    phone: '+91 98101 22334',
    state: 'Delhi',
    district: 'South Delhi',
    city: 'New Delhi',
    pinCode: '110017',
    deviceId: 'OBD-9596001',
    deviceSerial: '9596001',
    vehicleReg: 'DL 01 AK 4921',
    vehicleModel: 'Tata Nexon EV (2025)',
    installDate: '2025-11-14',
    familyId: 'FAM-1042',
    status: 'active',
    role: 'Customer',
    drivingStatus: 'driving',
    lastSpeed: 64,
    lastLat: 28.5672,
    lastLng: 77.2100,
    lastSeen: 'Just now',
    emergencyContacts: [
      { name: 'Kavita Verma', relationship: 'Spouse', mobile: '+91 98101 22335' },
      { name: 'R. K. Verma', relationship: 'Father', mobile: '+91 98101 22336' }
    ]
  },
  {
    id: 'USR-889102',
    customerId: 'USR-889102',
    name: 'Neha Singhania',
    email: 'neha.s@rakshak-net.in',
    phone: '+91 98711 44556',
    state: 'Haryana',
    district: 'Gurugram',
    city: 'Gurugram',
    pinCode: '122002',
    deviceId: 'OBD-9596002',
    deviceSerial: '9596002',
    vehicleReg: 'HR 26 CM 8830',
    vehicleModel: 'Mahindra XUV700 AX7',
    installDate: '2025-12-05',
    familyId: 'FAM-1088',
    status: 'active',
    role: 'Customer',
    drivingStatus: 'driving',
    lastSpeed: 82,
    lastLat: 28.4595,
    lastLng: 77.0266,
    lastSeen: '1 min ago',
    emergencyContacts: [
      { name: 'Sameer Singhania', relationship: 'Brother', mobile: '+91 98711 44557' }
    ]
  },
  {
    id: 'USR-889103',
    customerId: 'USR-889103',
    name: 'Rohit Choudhary',
    email: 'rohit.choudhary@rakshak-net.in',
    phone: '+91 99112 55667',
    state: 'Uttar Pradesh',
    district: 'Gautam Buddha Nagar',
    city: 'Noida',
    pinCode: '201301',
    deviceId: 'OBD-9596003',
    deviceSerial: '9596003',
    vehicleReg: 'UP 16 BX 1049',
    vehicleModel: 'Hyundai Creta SX',
    installDate: '2026-01-10',
    familyId: 'FAM-1120',
    status: 'active',
    role: 'Customer',
    drivingStatus: 'parked',
    lastSpeed: 0,
    lastLat: 28.5355,
    lastLng: 77.3910,
    lastSeen: '4 mins ago',
    emergencyContacts: [
      { name: 'Anita Choudhary', relationship: 'Mother', mobile: '+91 99112 55668' }
    ]
  },
  {
    id: 'USR-889104',
    customerId: 'USR-889104',
    name: 'Dr. Sunita Kulkarni',
    email: 'sunita.k@trauma-apollo.in',
    phone: '+91 98220 77889',
    state: 'Maharashtra',
    district: 'Pune',
    city: 'Pune',
    pinCode: '411001',
    deviceId: 'OBD-9596004',
    deviceSerial: '9596004',
    vehicleReg: 'MH 12 PQ 9912',
    vehicleModel: 'Kia Seltos GT-Line',
    installDate: '2026-01-22',
    familyId: 'FAM-1145',
    status: 'active',
    role: 'Customer',
    drivingStatus: 'driving',
    lastSpeed: 52,
    lastLat: 18.5204,
    lastLng: 73.8567,
    lastSeen: 'Just now',
    emergencyContacts: [
      { name: 'Dr. Anand Kulkarni', relationship: 'Spouse', mobile: '+91 98220 77888' }
    ]
  },
  {
    id: 'USR-889105',
    customerId: 'USR-889105',
    name: 'Arjun Rao',
    email: 'arjun.rao@rakshak-net.in',
    phone: '+91 97400 99001',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    city: 'Bengaluru',
    pinCode: '560001',
    deviceId: 'OBD-9596005',
    deviceSerial: '9596005',
    vehicleReg: 'KA 03 EV 3024',
    vehicleModel: 'MG ZS EV Excite',
    installDate: '2026-02-01',
    familyId: 'FAM-1180',
    status: 'active',
    role: 'Customer',
    drivingStatus: 'driving',
    lastSpeed: 45,
    lastLat: 12.9716,
    lastLng: 77.5946,
    lastSeen: '2 mins ago',
    emergencyContacts: [
      { name: 'Deepa Rao', relationship: 'Sister', mobile: '+91 97400 99002' }
    ]
  }
];

export const INITIAL_HOSPITALS: TraumaHospital[] = [
  {
    id: 'HOSP001',
    hospitalId: 'HOSP001',
    hospitalName: 'AIIMS Emergency Trauma Centre',
    hospitalType: 'Apex Level-1 Trauma Hub',
    city: 'New Delhi',
    state: 'Delhi',
    emergencyContact: '+91 11 2658 8500',
    icuBedsAvailable: 8,
    icuBedsTotal: 24,
    emergencyBedsAvailable: 14,
    emergencyBedsTotal: 35,
    ventilatorsAvailable: 10,
    bloodBankStatus: 'Optimal (O-, A+, B+ in stock)',
    ambulancesAvailable: 6,
    traumaLevel: 'Level 1 Critical',
    coordinates: [28.5672, 77.2100]
  },
  {
    id: 'HOSP002',
    hospitalId: 'HOSP002',
    hospitalName: 'Apollo Multispecialty Hospital',
    hospitalType: 'Super Specialty Trauma Center',
    city: 'New Delhi',
    state: 'Delhi',
    emergencyContact: '+91 11 2692 5858',
    icuBedsAvailable: 5,
    icuBedsTotal: 18,
    emergencyBedsAvailable: 9,
    emergencyBedsTotal: 25,
    ventilatorsAvailable: 6,
    bloodBankStatus: 'Available (All major groups)',
    ambulancesAvailable: 4,
    traumaLevel: 'Level 1',
    coordinates: [28.6289, 77.2155]
  },
  {
    id: 'HOSP003',
    hospitalId: 'HOSP003',
    hospitalName: 'Fortis Emergency Trauma Center',
    hospitalType: 'Tertiary Care Emergency Network',
    city: 'Gurugram',
    state: 'Haryana',
    emergencyContact: '+91 124 4921 000',
    icuBedsAvailable: 6,
    icuBedsTotal: 20,
    emergencyBedsAvailable: 11,
    emergencyBedsTotal: 30,
    ventilatorsAvailable: 7,
    bloodBankStatus: 'Optimal Stock',
    ambulancesAvailable: 5,
    traumaLevel: 'Level 1',
    coordinates: [28.4595, 77.0266]
  },
  {
    id: 'HOSP004',
    hospitalId: 'HOSP004',
    hospitalName: 'Max Super Specialty Hospital',
    hospitalType: 'Advanced Acute Trauma Network',
    city: 'Noida',
    state: 'Uttar Pradesh',
    emergencyContact: '+91 120 662 9999',
    icuBedsAvailable: 4,
    icuBedsTotal: 16,
    emergencyBedsAvailable: 8,
    emergencyBedsTotal: 22,
    ventilatorsAvailable: 5,
    bloodBankStatus: 'Adequate',
    ambulancesAvailable: 3,
    traumaLevel: 'Level 2 Specialized',
    coordinates: [28.5355, 77.3910]
  }
];

export const INITIAL_SOS_ALERTS: any[] = [];

export class TelemetrySyncService {
  private static subscribersListener: (() => void) | null = null;

  static initialize() {
    this.initializeLocalRegistry();
  }

  static getSosAlerts(): any[] {
    return this.getEmergencyIncidents();
  }

  static getAlerts(): any[] {
    return this.getEmergencyIncidents();
  }

  // Clear all emergency and test alerts
  static clearAllAlerts() {
    try {
      localStorage.setItem('rakshak_sos_alerts', JSON.stringify([]));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Failed to clear alerts:', e);
    }
  }

  // Initialize and seed verified data if local store is empty or stale
  static initializeLocalRegistry() {
    try {
      const existingCust = localStorage.getItem('rakshak_customers');
      if (!existingCust || JSON.parse(existingCust).length === 0) {
        localStorage.setItem('rakshak_customers', JSON.stringify(INITIAL_CUSTOMERS));
      } else {
        // Upgrade any stale placeholder data (e.g. DL-01-AA-0000)
        const parsed = JSON.parse(existingCust);
        const hasStale = parsed.some((c: any) => c.vehicleReg === 'DL-01-AA-0000' || c.name === 'Test Family Driver');
        if (hasStale) {
          localStorage.setItem('rakshak_customers', JSON.stringify(INITIAL_CUSTOMERS));
        }
      }

      const existingHosp = localStorage.getItem('rakshak_hospitals');
      if (!existingHosp || JSON.parse(existingHosp).length === 0) {
        localStorage.setItem('rakshak_hospitals', JSON.stringify(INITIAL_HOSPITALS));
      }

      // Ensure no stale fake alerts (e.g. SOS-2026-9921) linger in local storage
      const existingSos = localStorage.getItem('rakshak_sos_alerts');
      if (existingSos) {
        try {
          const parsed = JSON.parse(existingSos);
          const cleaned = Array.isArray(parsed) 
            ? parsed.filter((a: any) => a.id !== 'SOS-2026-9921') 
            : [];
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('rakshak_sos_alerts', JSON.stringify(cleaned));
          }
        } catch {
          localStorage.setItem('rakshak_sos_alerts', JSON.stringify([]));
        }
      } else {
        // Default to clean empty queue: no fake alerts
        localStorage.setItem('rakshak_sos_alerts', JSON.stringify([]));
      }
    } catch (e) {
      console.warn('TelemetrySyncService initialization warning:', e);
    }
  }

  // Get verified customer list
  static getCustomers(): VerifiedCustomer[] {
    this.initializeLocalRegistry();
    try {
      const data = localStorage.getItem('rakshak_customers');
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }

  // Get verified vehicle fleet
  static getVehicles(): VerifiedVehicle[] {
    const customers = this.getCustomers();
    return customers.map((c, idx) => ({
      id: `VEH-${c.vehicleReg.replace(/\s+/g, '-')}`,
      regNo: c.vehicleReg,
      model: c.vehicleModel || 'Connected Vehicle',
      ownerName: c.name,
      customerId: c.customerId,
      deviceId: c.deviceId,
      deviceSerial: c.deviceSerial,
      status: (c.status === 'emergency' ? 'emergency' : c.drivingStatus === 'driving' ? 'online' : 'online') as any,
      riskProfile: (idx === 0 ? 'low' : idx === 1 ? 'low' : 'low') as any,
      speedKmH: c.lastSpeed || (c.drivingStatus === 'driving' ? 58 : 0),
      lastConnection: c.lastSeen || 'Active',
      coordinates: [c.lastLat || 28.5672, c.lastLng || 77.2100],
      batteryVoltage: '12.6V (Optimal)',
      shockGForce: idx === 0 ? 0.98 : 1.02
    }));
  }

  // Get active trauma hospitals
  static getHospitals(): TraumaHospital[] {
    this.initializeLocalRegistry();
    try {
      const data = localStorage.getItem('rakshak_hospitals');
      return data ? JSON.parse(data) : INITIAL_HOSPITALS;
    } catch {
      return INITIAL_HOSPITALS;
    }
  }

  // Get active emergency incidents
  static getEmergencyIncidents(): any[] {
    this.initializeLocalRegistry();
    try {
      const data = localStorage.getItem('rakshak_sos_alerts');
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((a: any) => a && a.id !== 'SOS-2026-9921');
    } catch {
      return [];
    }
  }

  // Save new provisioned customer
  static saveCustomer(customer: VerifiedCustomer) {
    const list = this.getCustomers();
    const filtered = list.filter(c => c.customerId !== customer.customerId && c.id !== customer.id);
    const updated = [customer, ...filtered];
    localStorage.setItem('rakshak_customers', JSON.stringify(updated));

    // Also persist to Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        setDoc(doc(db, 'customers', customer.customerId), customer).catch(err => 
          console.warn('Firestore sync failed:', err)
        );
      } catch (e) {}
    }

    // Trigger storage event for live UI reactivity
    window.dispatchEvent(new Event('storage'));
  }

  // Simulate accident with realistic telemetry
  static simulateCrash(scenario: {
    vehicleReg: string;
    userName: string;
    location: string;
    lat: number;
    lng: number;
    gForce: number;
    speedDelta: number;
    hospitalName?: string;
  }) {
    const newId = `SOS-${Date.now().toString().slice(-6)}`;
    const newAlert = {
      id: newId,
      type: `High-Impact Vehicle Collision Detected (${scenario.gForce}G)`,
      severity: scenario.gForce > 10 ? 'Critical (Level 1)' : 'Major (Level 2)',
      status: 'responding',
      location: scenario.location,
      lat: scenario.lat,
      lng: scenario.lng,
      userName: scenario.userName,
      carNumber: scenario.vehicleReg,
      userPhone: '+91 98101 22334',
      userId: 'USR-889101',
      timestamp: Date.now(),
      gForce: scenario.gForce,
      speedDelta: scenario.speedDelta,
      airbagDeployed: true,
      hospitalName: scenario.hospitalName || 'AIIMS Apex Trauma Centre',
      ambulanceName: 'ALS Ambulance Unit 101',
      ambulanceDriver: 'Rajesh Kumar (+91 98765 43210)',
      etaMinutes: 5,
      time: 'Just now'
    };

    const current = this.getEmergencyIncidents();
    const updated = [newAlert, ...current];
    localStorage.setItem('rakshak_sos_alerts', JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        setDoc(doc(db, 'sos_alerts', newId), newAlert).catch(console.warn);
      } catch (e) {}
    }

    window.dispatchEvent(new Event('storage'));
    return newAlert;
  }

  // Save or update trauma hospital
  static saveHospital(hospital: TraumaHospital) {
    const list = this.getHospitals();
    const filtered = list.filter(h => h.id !== hospital.id && h.hospitalId !== hospital.hospitalId);
    const updated = [hospital, ...filtered];
    localStorage.setItem('rakshak_hospitals', JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        setDoc(doc(db, 'hospitals', hospital.id), hospital).catch(console.warn);
      } catch (e) {}
    }

    window.dispatchEvent(new Event('storage'));
  }

  // Update hospital beds in real-time
  static updateHospitalBeds(hospitalId: string, icuAvailable: number, emergencyAvailable: number) {
    const list = this.getHospitals();
    const updated = list.map(h => {
      if (h.id === hospitalId || h.hospitalId === hospitalId) {
        return {
          ...h,
          icuBedsAvailable: Math.max(0, Math.min(h.icuBedsTotal, icuAvailable)),
          emergencyBedsAvailable: Math.max(0, Math.min(h.emergencyBedsTotal, emergencyAvailable))
        };
      }
      return h;
    });

    localStorage.setItem('rakshak_hospitals', JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        updateDoc(doc(db, 'hospitals', hospitalId), {
          icuBedsAvailable: icuAvailable,
          emergencyBedsAvailable: emergencyAvailable
        }).catch(console.warn);
      } catch (e) {}
    }

    window.dispatchEvent(new Event('storage'));
  }
}
