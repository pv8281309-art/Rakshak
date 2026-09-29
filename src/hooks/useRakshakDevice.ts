import { useState, useEffect } from 'react';
import { RakshakRTDBService, RTDBDeviceData } from '../services/RakshakRTDBService';

export function useRakshakDevice() {
  const [deviceData, setDeviceData] = useState<RTDBDeviceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = RakshakRTDBService.subscribeToDevice((data) => {
      setDeviceData(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { deviceData, loading };
}
