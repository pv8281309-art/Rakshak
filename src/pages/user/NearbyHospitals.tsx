import React, { useState, useEffect } from 'react';
import { PlusSquare, Phone, Navigation, MapPin, Loader2, AlertCircle, ShieldCheck, Building2 } from 'lucide-react';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface PartnerHospital {
  id: string;
  name: string;
  address: string;
  mobile: string;
  lat: number;
  lng: number;
  distance: number;
  type: string;
  traumaLevel?: string;
  totalBeds?: number;
}

export default function NearbyHospitals() {
  const [hospitals, setHospitals] = useState<PartnerHospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  // Haversine formula to calculate distance in km
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const fetchPartnerHospitals = async (userLat: number, userLng: number) => {
      try {
        let rawHospitals: any[] = [];

        // 1. Fetch from Firestore hospitals collection
        if (isFirebaseConfigured && db) {
          try {
            const snap = await getDocs(collection(db, 'hospitals'));
            if (!snap.empty) {
              rawHospitals = snap.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  name: data.hospitalName || data.name || 'Accredited Trauma Center',
                  address: data.address || data.location || 'New Delhi NCR',
                  mobile: data.phone || data.emergencyPhone || data.contactNumber || '+91 11 2658 8500',
                  lat: data.lat || data.latitude || 28.5355,
                  lng: data.lng || data.longitude || 77.3910,
                  type: data.type || 'Super Speciality & Trauma Center',
                  traumaLevel: data.traumaLevel || 'Level 1 Trauma Center',
                  totalBeds: data.totalBeds || 250
                };
              });
            }
          } catch (e) {
            console.warn('Firestore hospitals fetch fallback:', e);
          }
        }

        // 2. Fallback to default seed partner hospitals if none found in Firestore
        if (rawHospitals.length === 0) {
          rawHospitals = [
            {
              id: 'HOSP-AIIMS',
              name: 'AIIMS Trauma Center, New Delhi',
              address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
              mobile: '+91 11 2658 8500',
              lat: 28.5672,
              lng: 77.2100,
              type: 'Apex Trauma & Emergency Hub',
              traumaLevel: 'Level 1 Trauma Center',
              totalBeds: 500
            },
            {
              id: 'HOSP-APOLLO',
              name: 'Indraprastha Apollo Hospitals',
              address: 'Mathura Rd, Sarita Vihar, New Delhi',
              mobile: '+91 11 2692 5858',
              lat: 28.5395,
              lng: 77.2841,
              type: 'Super Speciality Hospital',
              traumaLevel: 'Level 1 Trauma Center',
              totalBeds: 350
            },
            {
              id: 'HOSP-FORTIS',
              name: 'Fortis Hospital, Noida',
              address: 'B-22, Sector 62, Noida, Uttar Pradesh',
              mobile: '+91 120 430 0222',
              lat: 28.6280,
              lng: 77.3640,
              type: 'Advanced Emergency & Trauma Center',
              traumaLevel: 'Level 2 Trauma Center',
              totalBeds: 200
            },
            {
              id: 'HOSP-MAX',
              name: 'Max Super Speciality Hospital, Vaishali',
              address: 'W-3, Near Vaishali Metro Station, Ghaziabad',
              mobile: '+91 120 417 3000',
              lat: 28.6498,
              lng: 77.3482,
              type: 'Multi-Speciality Trauma Center',
              traumaLevel: 'Level 1 Trauma Center',
              totalBeds: 300
            }
          ];
        }

        // Calculate distance for each hospital from user location
        const mapped: PartnerHospital[] = rawHospitals.map(h => ({
          ...h,
          distance: getDistance(userLat, userLng, h.lat, h.lng)
        }));

        // Sort by distance (closest first)
        mapped.sort((a, b) => a.distance - b.distance);
        setHospitals(mapped);
      } catch (err) {
        setError('Failed to load registered partner hospitals.');
      } finally {
        setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      // Default to New Delhi center if geolocation unavailable
      setUserLoc({ lat: 28.5355, lng: 77.3910 });
      fetchPartnerHospitals(28.5355, 77.3910);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLoc({ lat: latitude, lng: longitude });
        fetchPartnerHospitals(latitude, longitude);
      },
      () => {
        // Fallback to New Delhi if permission denied
        setUserLoc({ lat: 28.5355, lng: 77.3910 });
        fetchPartnerHospitals(28.5355, 77.3910);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Building2 className="text-blue-500" /> Rakshak Verified Partner Hospitals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing nearby accredited trauma centers connected with live operation points & automated ambulance dispatch.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
          <ShieldCheck size={14} />
          <span>Admin Accredited & Integrated Network</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
          <p className="text-xs font-mono">Querying registered partner hospitals & calculating distance...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-3 text-xs">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="p-8 text-center text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/50 text-xs">
          No partner hospitals available in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((h, idx) => (
            <div key={h.id} className="bg-[#0D1527] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-xl relative overflow-hidden">
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-mono font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-md">
                  Closest Hub ⚡
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20 shadow-inner">
                    <PlusSquare size={24} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    🟢 Operational
                  </span>
                </div>
                
                <h3 className="font-bold text-white text-base mb-1 line-clamp-2">{h.name}</h3>
                <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider mb-3">{h.type} • {h.traumaLevel || 'Level 1'}</p>
                
                <div className="space-y-2 mb-6 text-xs">
                  <div className="flex items-start gap-2 text-slate-400">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-slate-500" />
                    <p className="line-clamp-2">{h.address}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 font-mono">
                    <Navigation size={14} className="shrink-0 text-amber-400" />
                    <p className="font-bold text-white">{h.distance.toFixed(1)} km away from you</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
                {h.mobile ? (
                  <a
                    href={`tel:${h.mobile}`}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
                  >
                    <Phone size={14} />
                    <span>Emergency Line</span>
                  </a>
                ) : (
                  <div className="flex-1 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold text-center">
                    Emergency Line N/A
                  </div>
                )}
                
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + h.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center"
                  title="Open in Maps"
                >
                  <Navigation size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
