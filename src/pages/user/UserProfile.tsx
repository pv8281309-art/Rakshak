import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { getDocs, collection, query } from 'firebase/firestore';
import { User, Shield, Car, Phone } from 'lucide-react';

export default function UserProfile() {
  const { clientSession } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientSession?.id) return;
    const fetchUser = async () => {
      if (isFirebaseConfigured && db) {
        try {
          const q = query(collection(db, 'customers'));
          const snapshot = await getDocs(q);
          const matchingDoc = snapshot.docs.find(d => d.data().customerId === clientSession.id);
          if (matchingDoc) {
            setUserData({ id: matchingDoc.id, ...matchingDoc.data() });
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [clientSession]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;

  if (!userData) {
    return (
      <div className="p-8 text-center text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
        <p>Your profile data could not be retrieved.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="text-blue-500" /> My Profile
        </h1>
        <p className="text-slate-400 mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="bg-[#020617]/50 rounded-2xl border border-slate-800 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl font-bold text-white shrink-0">
            {userData.name ? userData.name.substring(0, 2).toUpperCase() : 'US'}
          </div>
          
          <div className="flex-1 space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Full Name</p>
                <p className="font-medium text-white text-lg">{userData.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">User ID</p>
                <p className="font-mono text-slate-300">{userData.customerId}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Status</p>
                <div className="inline-block px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                  Active Account
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-800 w-full"></div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Car size={16} /> Registered Vehicle & Transponder Details
              </h3>
              {userData.vehicle ? (
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Registration No</p>
                    <p className="font-bold text-white font-mono">{userData.vehicle.regNo}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Vehicle Category</p>
                    <p className="font-medium text-cyan-400">{userData.vehicle.vehicleType || 'Four-Wheeler'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Company</p>
                    <p className="font-medium text-white">{userData.vehicle.company || 'Not Specified'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Brand / Series</p>
                    <p className="font-medium text-white">{userData.vehicle.brand || 'Not Specified'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Model</p>
                    <p className="font-medium text-white">{userData.vehicle.model || 'Connected Vehicle'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Color</p>
                    <p className="font-medium text-white">{userData.vehicle.color || 'Standard'}</p>
                  </div>
                  <div className="col-span-full pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Assigned OBD Hardware Device ID:</span>
                    <span className="font-mono text-xs text-cyan-400 font-bold">{userData.device?.id || 'OBD-3.0-ONLINE'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No vehicle registered.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
