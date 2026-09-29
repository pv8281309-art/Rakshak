import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Bell, ShieldAlert, CheckCircle, Navigation, Info } from 'lucide-react';

export default function MyAlerts() {
  const { clientSession } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientSession?.id) return;
    let unsubscribe: any = null;

    if (isFirebaseConfigured && db) {
      // Find alerts where customerId == clientSession.id
      const q = query(collection(db, 'sos_alerts'), where('customerId', '==', clientSession.id));
      unsubscribe = onSnapshot(q, (snap) => {
        const fireAlerts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        fireAlerts.sort((a: any, b: any) => {
          const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.timestamp || 0);
          const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.timestamp || 0);
          return tB - tA;
        });

        setAlerts(fireAlerts);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [clientSession]);

  const getAlertIcon = (status: string) => {
    switch(status) {
      case 'new': return <ShieldAlert size={20} className="text-red-500" />;
      case 'responding': 
      case 'dispatched': return <Navigation size={20} className="text-blue-500" />;
      case 'resolved': return <CheckCircle size={20} className="text-emerald-500" />;
      default: return <Info size={20} className="text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="text-blue-500" /> My Alerts
        </h1>
        <p className="text-slate-400 mt-1">History of your emergency reports and notifications.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-4">
            <Bell size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Alerts Found</h2>
          <p className="text-slate-400">You have no emergency history on record.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-[#020617]/50 rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  {getAlertIcon(alert.status)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{alert.type || 'Emergency Report'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      alert.status === 'new' ? 'bg-red-500/10 text-red-500' :
                      alert.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {alert.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{alert.id}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{alert.loc}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reported At</p>
                <p className="text-sm font-medium text-slate-300">
                  {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Recently'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
