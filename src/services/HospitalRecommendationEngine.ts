import { 
  AccidentSeverity, 
  EmergencyEngineConfig, 
  HospitalRecommendationItem, 
  HospitalSuitabilityFactor 
} from '../types/emergency';
import { DEFAULT_EMERGENCY_CONFIG, RELEVANT_TRAUMA_SPECIALIZATIONS } from './emergencyConfig';

export interface EvaluationInputHospital {
  id?: string;
  hospitalId: string;
  hospitalName: string;
  latitude?: number;
  longitude?: number;
  location?: { lat: number; lng: number };
  contactNumber?: string;
  emergencyContact?: string;
  address?: string;
  city?: string;
  state?: string;
  serviceRadiusKm?: number;
  account?: {
    status?: string;
  };
  capacity?: {
    totalBeds?: number;
    availableBeds?: number;
    occupiedBeds?: number;
    emergencyBeds?: number;
    availableEmergencyBeds?: number;
    icuBeds?: number;
    availableIcuBeds?: number;
    ventilators?: number;
  };
  ambulances?: {
    total?: number;
    available?: number;
    emergency?: number;
    status?: string;
  };
  emergencyCapabilities?: {
    emergency24x7?: boolean;
    traumaCenter?: boolean;
    icuAvailable?: boolean;
    ambulanceAvailable?: boolean;
    emergencySurgery?: boolean;
    bloodBank?: boolean;
    ventilatorAvailable?: boolean;
    physiotherapyRehab?: boolean;
    accidentTreatment?: boolean;
    notes?: string;
  };
  specializations?: string[];
  services?: string[];
  resourceLastUpdated?: string;
  rating?: number;
}

export interface EvaluationResult {
  recommendations: HospitalRecommendationItem[];
  ineligibleHospitals: Array<{
    hospitalId: string;
    hospitalName: string;
    reason: string;
    distanceKm: number;
    etaMinutes: number;
  }>;
  totalEvaluated: number;
  calculatedAt: string;
}

// Calculate Haversine distance in KM
export function calculateHaversineDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

// Estimate Travel Time / ETA (minutes) based on distance and average emergency ambulance response
export function calculateAmbulanceETA(distanceKm: number, speedKmh: number = 48): number {
  if (distanceKm <= 0) return 3;
  // Account for urban traffic coefficient (1.25x straight distance) + fixed dispatch ramp-up (2 min)
  const roadDistance = distanceKm * 1.25;
  const transitMinutes = (roadDistance / speedKmh) * 60;
  const totalMinutes = Math.round(transitMinutes + 2);
  return Math.max(3, totalMinutes);
}

// Check Data Freshness
export function evaluateDataFreshness(lastUpdatedStr?: string, staleThresholdMinutes: number = 15): {
  isStale: boolean;
  minutesAgo: number;
  label: string;
} {
  if (!lastUpdatedStr) {
    return { isStale: true, minutesAgo: 999, label: 'Never updated' };
  }
  const updatedTime = new Date(lastUpdatedStr).getTime();
  const diffMinutes = Math.max(0, Math.floor((Date.now() - updatedTime) / (1000 * 60)));
  
  const isStale = diffMinutes > staleThresholdMinutes;
  let label = '';
  if (diffMinutes < 1) {
    label = 'Updated just now';
  } else if (diffMinutes === 1) {
    label = 'Updated 1 min ago';
  } else if (diffMinutes < 60) {
    label = `Updated ${diffMinutes}m ago`;
  } else {
    const hours = Math.floor(diffMinutes / 60);
    label = `Updated ${hours}h ago`;
  }

  return { isStale, minutesAgo: diffMinutes, label };
}

/**
 * Intelligent Hospital Recommendation & Eligibility Filtering Engine
 */
export function evaluateAndRankHospitals(
  accidentLat: number | null,
  accidentLng: number | null,
  severity: AccidentSeverity = 'CRITICAL',
  hospitals: EvaluationInputHospital[],
  config: EmergencyEngineConfig = DEFAULT_EMERGENCY_CONFIG
): EvaluationResult {
  const calculatedAt = new Date().toISOString();
  const isCritical = severity === 'CRITICAL';
  const isHigh = severity === 'HIGH';
  const icuRequired = isCritical || config.criticalIcuRequired;

  const eligibleCandidates: HospitalRecommendationItem[] = [];
  const ineligibleHospitals: EvaluationResult['ineligibleHospitals'] = [];

  hospitals.forEach(hosp => {
    const hLat = hosp.latitude ?? hosp.location?.lat ?? null;
    const hLng = hosp.longitude ?? hosp.location?.lng ?? null;
    
    // 1. Location Validation
    if (hLat === null || hLng === null || isNaN(hLat) || isNaN(hLng)) {
      ineligibleHospitals.push({
        hospitalId: hosp.hospitalId,
        hospitalName: hosp.hospitalName || 'Unknown Hospital',
        reason: '❌ Invalid hospital GPS coordinates',
        distanceKm: 999,
        etaMinutes: 999
      });
      return;
    }

    const distanceKm = (accidentLat !== null && accidentLng !== null) 
      ? calculateHaversineDistance(accidentLat, accidentLng, hLat, hLng)
      : 0;

    const etaMinutes = calculateAmbulanceETA(distanceKm, config.defaultAmbulanceSpeedKmh);

    // 2. Operational Account Status Check
    const accountStatus = (hosp.account?.status || 'ACTIVE').toUpperCase();
    if (accountStatus !== 'ACTIVE') {
      ineligibleHospitals.push({
        hospitalId: hosp.hospitalId,
        hospitalName: hosp.hospitalName,
        reason: `❌ Facility account ${accountStatus.toLowerCase()}`,
        distanceKm,
        etaMinutes
      });
      return;
    }

    // 3. Service Radius Check
    const maxRadius = hosp.serviceRadiusKm || config.maxSearchRadiusKm;
    if (accidentLat !== null && accidentLng !== null && distanceKm > maxRadius) {
      ineligibleHospitals.push({
        hospitalId: hosp.hospitalId,
        hospitalName: hosp.hospitalName,
        reason: `❌ Beyond service radius (${distanceKm} km > ${maxRadius} km limit)`,
        distanceKm,
        etaMinutes
      });
      return;
    }

    // 4. 24/7 Emergency Availability Check
    const emergency24x7 = hosp.emergencyCapabilities?.emergency24x7 ?? true;
    if (!emergency24x7) {
      ineligibleHospitals.push({
        hospitalId: hosp.hospitalId,
        hospitalName: hosp.hospitalName,
        reason: '❌ 24/7 emergency department closed',
        distanceKm,
        etaMinutes
      });
      return;
    }

    // 5. Accident / Trauma Treatment Capability
    const accidentTreatment = hosp.emergencyCapabilities?.accidentTreatment ?? true;
    if (!accidentTreatment) {
      ineligibleHospitals.push({
        hospitalId: hosp.hospitalId,
        hospitalName: hosp.hospitalName,
        reason: '❌ Accident/trauma care unavailable',
        distanceKm,
        etaMinutes
      });
      return;
    }

    // 6. Bed Availability Check
    const availEmergency = hosp.capacity?.availableEmergencyBeds ?? 0;
    const totalEmergency = hosp.capacity?.emergencyBeds ?? 0;
    const availGeneral = hosp.capacity?.availableBeds ?? 0;
    const totalGeneral = hosp.capacity?.totalBeds ?? 0;
    const availIcu = hosp.capacity?.availableIcuBeds ?? 0;
    const totalIcu = hosp.capacity?.icuBeds ?? 0;
    const ventilators = hosp.capacity?.ventilators ?? 0;
    const availAmbulances = hosp.ambulances?.available ?? 0;
    const traumaCapable = Boolean(hosp.emergencyCapabilities?.traumaCenter);
    const bloodBankAvailable = Boolean(hosp.emergencyCapabilities?.bloodBank ?? true);

    // Bed eligibility check
    if (availEmergency <= 0 && availGeneral <= 0) {
      ineligibleHospitals.push({
        hospitalId: hosp.hospitalId,
        hospitalName: hosp.hospitalName,
        reason: '❌ Emergency beds at full capacity (0 available)',
        distanceKm,
        etaMinutes
      });
      return;
    }

    // 7. ICU Availability Check for Critical emergencies
    if (icuRequired && availIcu <= 0) {
      ineligibleHospitals.push({
        hospitalId: hosp.hospitalId,
        hospitalName: hosp.hospitalName,
        reason: '❌ ICU unavailable (0 available for critical case)',
        distanceKm,
        etaMinutes
      });
      return;
    }

    // Data freshness evaluation
    const freshness = evaluateDataFreshness(hosp.resourceLastUpdated, config.dataFreshnessStaleMinutes);

    // -------------------------------------------------------------
    // CALCULATE OPERATIONAL SUITABILITY SCORE (0 - 100)
    // -------------------------------------------------------------
    let operationalScore = 0;
    const suitabilityFactors: HospitalSuitabilityFactor[] = [];
    const whyRecommended: string[] = [];

    // Factor 1: Emergency & Trauma Capability (Weight: 30)
    const traumaScoreMax = config.rankingWeights.traumaCapability;
    let traumaScoreEarned = 0;
    if (traumaCapable) {
      traumaScoreEarned += traumaScoreMax * 0.7; // Level 1 / Trauma Center
      whyRecommended.push('Trauma Center verified');
    } else {
      traumaScoreEarned += traumaScoreMax * 0.35; // Standard Emergency
    }
    if (hosp.emergencyCapabilities?.emergencySurgery) {
      traumaScoreEarned += traumaScoreMax * 0.3;
    }
    traumaScoreEarned = Math.min(traumaScoreMax, traumaScoreEarned);
    operationalScore += traumaScoreEarned;
    suitabilityFactors.push({
      code: 'TRAUMA_CAPABILITY',
      label: 'Trauma & Emergency Capability',
      isMet: traumaCapable || emergency24x7,
      scoreImpact: Math.round(traumaScoreEarned),
      detail: traumaCapable ? 'Certified Level 1/Trauma bay' : 'Emergency care department'
    });

    // Factor 2: Required Resource Availability (Weight: 25)
    const resourceScoreMax = config.rankingWeights.requiredResources;
    let resourceScoreEarned = 0;
    if (availIcu > 0) {
      resourceScoreEarned += (Math.min(availIcu, 5) / 5) * (resourceScoreMax * 0.5);
      whyRecommended.push(`${availIcu} ICU beds available`);
    }
    if (availEmergency > 0) {
      resourceScoreEarned += (Math.min(availEmergency, 8) / 8) * (resourceScoreMax * 0.3);
      whyRecommended.push(`${availEmergency} emergency beds available`);
    }
    if (ventilators > 0) {
      resourceScoreEarned += resourceScoreMax * 0.1;
    }
    if (bloodBankAvailable) {
      resourceScoreEarned += resourceScoreMax * 0.1;
    }
    resourceScoreEarned = Math.min(resourceScoreMax, resourceScoreEarned);
    operationalScore += resourceScoreEarned;
    suitabilityFactors.push({
      code: 'REQUIRED_RESOURCES',
      label: 'Critical Resource Availability',
      isMet: availIcu > 0 && availEmergency > 0,
      scoreImpact: Math.round(resourceScoreEarned),
      detail: `ICU: ${availIcu}, Emergency Beds: ${availEmergency}, Ventilators: ${ventilators}`
    });

    // Factor 3: Estimated Travel Time / ETA (Weight: 25)
    // Priority over simple straight-line distance
    const etaScoreMax = config.rankingWeights.etaAndDistance;
    // Scaled curve: <= 8 min = 100%, 15 min = 70%, 25 min = 40%, >35 min = 10%
    let etaRatio = 1.0;
    if (etaMinutes <= 8) {
      etaRatio = 1.0;
    } else if (etaMinutes <= 15) {
      etaRatio = 0.85;
    } else if (etaMinutes <= 25) {
      etaRatio = 0.60;
    } else if (etaMinutes <= 40) {
      etaRatio = 0.35;
    } else {
      etaRatio = 0.15;
    }
    const etaScoreEarned = etaScoreMax * etaRatio;
    operationalScore += etaScoreEarned;
    whyRecommended.push(`Estimated arrival: ${etaMinutes} min (${distanceKm} km away)`);
    suitabilityFactors.push({
      code: 'ETA_TRAVEL_TIME',
      label: 'Rapid Transit ETA',
      isMet: etaMinutes <= 20,
      scoreImpact: Math.round(etaScoreEarned),
      detail: `${etaMinutes} min travel time (${distanceKm} km)`
    });

    // Factor 4: Total Bed Availability (Weight: 10)
    const bedScoreMax = config.rankingWeights.bedCapacity;
    const totalAvail = availEmergency + availGeneral;
    const bedRatio = Math.min(1.0, totalAvail / 20);
    const bedScoreEarned = bedScoreMax * bedRatio;
    operationalScore += bedScoreEarned;
    suitabilityFactors.push({
      code: 'BED_CAPACITY',
      label: 'Bed Capacity Buffer',
      isMet: totalAvail >= 5,
      scoreImpact: Math.round(bedScoreEarned),
      detail: `${totalAvail} total beds free (${availEmergency} emergency)`
    });

    // Factor 5: Available Ambulances (Weight: 5)
    const ambScoreMax = config.rankingWeights.ambulanceAvailability;
    let ambScoreEarned = 0;
    if (availAmbulances > 0) {
      ambScoreEarned = Math.min(ambScoreMax, availAmbulances * 1.5);
      whyRecommended.push(`${availAmbulances} response ambulances on standby`);
    }
    operationalScore += ambScoreEarned;
    suitabilityFactors.push({
      code: 'AMBULANCE_FLEET',
      label: 'Ambulance Standby',
      isMet: availAmbulances > 0,
      scoreImpact: Math.round(ambScoreEarned),
      detail: `${availAmbulances} units available`
    });

    // Factor 6: Specialization Match (Weight: 5)
    const specScoreMax = config.rankingWeights.specializationMatch;
    const specializations = hosp.specializations || [];
    const matchedSpecs = specializations.filter(s => 
      RELEVANT_TRAUMA_SPECIALIZATIONS.some(r => r.toLowerCase() === s.toLowerCase())
    );
    let specScoreEarned = 0;
    if (matchedSpecs.length > 0) {
      specScoreEarned = Math.min(specScoreMax, matchedSpecs.length * 2);
    }
    operationalScore += specScoreEarned;
    suitabilityFactors.push({
      code: 'SPECIALIZATION_MATCH',
      label: 'Accident Specialization Alignment',
      isMet: matchedSpecs.length > 0,
      scoreImpact: Math.round(specScoreEarned),
      detail: matchedSpecs.length > 0 ? matchedSpecs.join(', ') : 'General Care'
    });

    // Stale Data Penalty if data hasn't been updated recently
    if (freshness.isStale) {
      operationalScore = Math.max(20, operationalScore - config.staleDataPenalty);
      suitabilityFactors.push({
        code: 'STALE_DATA_PENALTY',
        label: 'Data Freshness Warning',
        isMet: false,
        scoreImpact: -config.staleDataPenalty,
        detail: `Resource update is ${freshness.minutesAgo}m old`
      });
    }

    const roundedScore = Math.min(99, Math.max(30, Math.round(operationalScore)));

    eligibleCandidates.push({
      hospitalId: hosp.hospitalId,
      hospitalName: hosp.hospitalName,
      rank: 1, // Will be set after sorting
      badge: 'RECOMMENDED',
      operationalScore: roundedScore,
      distanceKm,
      etaMinutes,
      etaText: `${etaMinutes} min`,
      isEligible: true,
      whyRecommended,
      suitabilityFactors,
      resourcesSnapshot: {
        emergencyBedsAvailable: availEmergency,
        emergencyBedsTotal: totalEmergency,
        icuBedsAvailable: availIcu,
        icuBedsTotal: totalIcu,
        generalBedsAvailable: availGeneral,
        generalBedsTotal: totalGeneral,
        availableAmbulances: availAmbulances,
        traumaCapable,
        emergency24x7,
        bloodBankAvailable,
        ventilators
      },
      dataFreshness: {
        resourceLastUpdated: hosp.resourceLastUpdated || new Date(Date.now() - 3600000).toISOString(),
        isStale: freshness.isStale,
        minutesAgo: freshness.minutesAgo,
        freshnessLabel: freshness.label
      },
      contactNumber: hosp.contactNumber || '',
      emergencyContact: hosp.emergencyContact || hosp.contactNumber || '+91 11 2658 8500',
      address: hosp.address || '',
      city: hosp.city || '',
      state: hosp.state || '',
      coordinates: {
        lat: hLat,
        lng: hLng
      },
      specializations
    });
  });

  // Sort eligible candidates primarily by operational score descending, then by ETA ascending
  eligibleCandidates.sort((a, b) => {
    if (b.operationalScore !== a.operationalScore) {
      return b.operationalScore - a.operationalScore;
    }
    return a.etaMinutes - b.etaMinutes;
  });

  // Assign ranks & badges
  eligibleCandidates.forEach((cand, idx) => {
    cand.rank = (idx + 1);
    cand.badge = idx === 0 ? 'RECOMMENDED' : (idx < 3 ? 'ALTERNATIVE' : 'ELIGIBLE');
  });

  return {
    recommendations: eligibleCandidates,
    ineligibleHospitals,
    totalEvaluated: hospitals.length,
    calculatedAt
  };
}
