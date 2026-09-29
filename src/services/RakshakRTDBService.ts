import { rtdb } from '../lib/firebase';
import { ref, onValue, off } from 'firebase/database';

export interface RTDBDeviceData {
  deviceId?: string;
  online?: boolean;
  wifiConnected?: boolean;
  simConnected?: boolean;
  signalStrength?: string | number;
  sensor?: {
    ax?: number;
    ay?: number;
    az?: number;
    totalG?: number;
    dynamicG?: number;
    tilt?: number;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    mapsUrl?: string;
    type?: string;
  };
  status?: {
    system?: string;
    accident?: boolean;
    sos?: boolean;
    smsSent?: boolean;
    callsStarted?: boolean;
    lastUpdate?: string | number;
  };
}

export class RakshakRTDBService {
  /**
   * Subscribes to real-time updates from Firebase Realtime Database at /devices/RAKSHAK_001
   */
  public static subscribeToDevice(callback: (data: RTDBDeviceData | null) => void): () => void {
    if (!rtdb) {
      callback(null);
      return () => {};
    }

    const deviceRef = ref(rtdb, 'devices/RAKSHAK_001');
    
    const unsubscribe = onValue(deviceRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val() as RTDBDeviceData;
        callback(val);
      } else {
        callback(null);
      }
    }, (error) => {
      console.warn("RTDB subscription error:", error);
      callback(null);
    });

    return () => {
      off(deviceRef);
    };
  }
}
