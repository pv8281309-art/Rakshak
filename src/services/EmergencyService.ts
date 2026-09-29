import { EmergencyIncident, IncidentLifecycleStatus } from '../types/emergency';

export interface AssignHospitalParams {
  incidentId: string;
  hospitalId: string;
  hospitalName?: string;
  department?: string;
  patientName?: string;
  requiredResources?: string[];
  assignmentReason?: string;
  isManualOverride?: boolean;
  adminId?: string;
}

export const EmergencyService = {
  // 1. Fetch all emergency incidents
  async getIncidents(): Promise<EmergencyIncident[]> {
    const res = await fetch('/api/emergency/incidents');
    if (!res.ok) throw new Error('Failed to fetch emergency incidents');
    const data = await res.json();
    return data.incidents || [];
  },

  // 2. Fetch specific emergency incident
  async getIncident(incidentId: string): Promise<EmergencyIncident> {
    const res = await fetch(`/api/emergency/incidents/${incidentId}`);
    if (!res.ok) throw new Error('Failed to fetch emergency incident');
    const data = await res.json();
    return data.incident;
  },

  // 3. Trigger recalculation of hospital recommendations
  async recalculateRecommendations(incidentId: string): Promise<EmergencyIncident> {
    const res = await fetch(`/api/emergency/incidents/${incidentId}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to recompute hospital recommendations');
    }
    const data = await res.json();
    return data.incident;
  },

  // 4. Admin Assigns Hospital
  async assignHospital(params: AssignHospitalParams): Promise<{ success: boolean; incident: EmergencyIncident }> {
    const res = await fetch(`/api/emergency/incidents/${params.incidentId}/assign-hospital`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to assign hospital');
    }
    return data;
  },

  // 5. Hospital Acknowledges Incoming Emergency
  async acknowledgeEmergency(incidentId: string, hospitalId: string): Promise<boolean> {
    const res = await fetch(`/api/emergency/incidents/${incidentId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospitalId })
    });
    return res.ok;
  },

  // 5b. Hospital Dispatches Ambulance from its own fleet
  async dispatchHospitalAmbulance(params: {
    incidentId: string;
    hospitalId: string;
    ambulanceId: string;
    ambulanceName?: string;
    vehicleNumber: string;
    driverName?: string;
    driverPhone?: string;
    paramedicName?: string;
    etaMinutes?: number;
    notes?: string;
  }): Promise<{ success: boolean; incident: any }> {
    const res = await fetch(`/api/emergency/incidents/${params.incidentId}/dispatch-ambulance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to dispatch ambulance');
    return data;
  },

  // Hospital Ambulance Fleet API
  async getHospitalAmbulances(hospitalId: string): Promise<any[]> {
    const res = await fetch(`/api/hospitals/${hospitalId}/ambulances`);
    if (!res.ok) throw new Error('Failed to fetch hospital ambulances');
    const data = await res.json();
    return data.ambulances || [];
  },

  async addHospitalAmbulance(hospitalId: string, ambulanceData: any): Promise<any> {
    const res = await fetch(`/api/hospitals/${hospitalId}/ambulances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ambulanceData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add ambulance');
    return data.ambulance;
  },

  async updateHospitalAmbulance(hospitalId: string, ambulanceId: string, updates: any): Promise<boolean> {
    const res = await fetch(`/api/hospitals/${hospitalId}/ambulances/${ambulanceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.ok;
  },

  async deleteHospitalAmbulance(hospitalId: string, ambulanceId: string): Promise<boolean> {
    const res = await fetch(`/api/hospitals/${hospitalId}/ambulances/${ambulanceId}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  // 6. Advance Incident Lifecycle Status
  async updateStatus(
    incidentId: string, 
    status: IncidentLifecycleStatus, 
    extraPayload: Record<string, any> = {}
  ): Promise<boolean> {
    const res = await fetch(`/api/emergency/incidents/${incidentId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...extraPayload })
    });
    return res.ok;
  },

  // 7. Trigger simulated/device accident event (for testing all 9 scenarios)
  async reportAccidentEvent(eventData: {
    vehicleId: string;
    latitude?: number;
    longitude?: number;
    speed?: number;
    severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    locationText?: string;
    impactForceG?: number;
    sensorSeverity?: string;
  }): Promise<{ incidentId: string; incident: EmergencyIncident }> {
    const res = await fetch('/api/emergency/accident-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create accident event');
    return data;
  }
};
