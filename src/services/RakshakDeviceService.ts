import { db, isFirebaseConfigured } from '../lib/firebase';
import { doc, setDoc, getDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface DeviceTelemetryPayload {
  speed?: number;
  lat?: number;
  lng?: number;
  connected?: boolean;
  batteryLevel?: number;
}

export class RakshakDeviceService {
  /**
   * Pings Firestore with a heartbeat timestamp for the Rakshak device.
   * This updates 'lastSeen' and telemetry in deviceStatus/{customerId}.
   */
  public static async sendHeartbeat(customerId: string, telemetry: DeviceTelemetryPayload = {}): Promise<void> {
    const now = Date.now();
    const payload = {
      customerId,
      lastSeen: now,
      timestamp: now,
      connected: telemetry.connected ?? true,
      speed: telemetry.speed ?? 0,
      ...(telemetry.lat !== undefined && { lat: telemetry.lat }),
      ...(telemetry.lng !== undefined && { lng: telemetry.lng }),
      ...(telemetry.batteryLevel !== undefined && { batteryLevel: telemetry.batteryLevel })
    };

    // 1. Always save to localStorage as fallback
    try {
      localStorage.setItem(`rakshak_device_${customerId}`, JSON.stringify(payload));
    } catch {}

    // 2. Sync to Firebase Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'deviceStatus', customerId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, payload);
        } else {
          await setDoc(docRef, payload);
        }
      } catch (err) {
        console.warn('RakshakDeviceService heartbeat sync warning:', err);
      }
    }
  }

  /**
   * Subscribes to real-time device heartbeat from Firestore and evaluates 60s timeout.
   */
  public static subscribeToDeviceStatus(
    customerId: string, 
    onStatusChange: (status: { isOnline: boolean; speed: number; lat?: number; lng?: number; lastSeen: number }) => void
  ): () => void {
    let active = true;

    const checkStatus = () => {
      try {
        const stored = localStorage.getItem(`rakshak_device_${customerId}`);
        if (stored) {
          const data = JSON.parse(stored);
          const lastSeen = data.lastSeen || data.timestamp || 0;
          const isOnline = Date.now() - lastSeen < 60000;
          if (active) {
            onStatusChange({
              isOnline,
              speed: isOnline ? (data.speed || 0) : 0,
              lat: data.lat,
              lng: data.lng,
              lastSeen
            });
          }
        } else {
          if (active) {
            onStatusChange({ isOnline: false, speed: 0, lastSeen: 0 });
          }
        }
      } catch {
        if (active) {
          onStatusChange({ isOnline: false, speed: 0, lastSeen: 0 });
        }
      }
    };

    let unsubFirestore: (() => void) | null = null;

    if (isFirebaseConfigured && db) {
      try {
        unsubFirestore = onSnapshot(doc(db, 'deviceStatus', customerId), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const lastSeen = data.lastSeen || data.timestamp || 0;
            const isOnline = Date.now() - lastSeen < 60000 && (data.connected !== false);
            if (active) {
              onStatusChange({
                isOnline,
                speed: isOnline ? (data.speed || 0) : 0,
                lat: data.lat,
                lng: data.lng,
                lastSeen
              });
            }
          } else {
            checkStatus();
          }
        }, () => {
          checkStatus();
        });
      } catch {
        checkStatus();
      }
    } else {
      checkStatus();
    }

    // Interval check every 5 seconds to evaluate 60s timeout without waiting for DB push
    const interval = setInterval(checkStatus, 5000);

    return () => {
      active = false;
      if (unsubFirestore) unsubFirestore();
      clearInterval(interval);
    };
  }
}
