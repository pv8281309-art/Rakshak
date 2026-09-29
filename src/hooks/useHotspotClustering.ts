import { useMemo } from 'react';
import { calculateDistance } from '../lib/geo';

export interface Point {
  lat: number;
  lng: number;
  id: string;
  data: any;
}

export interface Cluster {
  id: string;
  lat: number;
  lng: number;
  points: Point[];
  intensityScore: number;
  intensityLabel: 'monitoring' | 'hotspot' | 'high-density';
}

export const useHotspotClustering = (
  alerts: any[],
  radius: number = 500,
  threshold: number = 10,
  timeWindowHours: number = 720
): Cluster[] => {
  const hotspots = useMemo(() => {
    const now = Date.now();
    
    // Filter alerts by time window and ensure they have valid coordinates
    const validPoints: Point[] = alerts.filter(a => {
      if (!a.location?.lat || !a.location?.lng) return false;
      const timestamp = a.createdAt || a.timestamp;
      if (!timestamp) return false;
      
      const timeMs = timestamp.seconds ? timestamp.toDate().getTime() : new Date(timestamp).getTime();
      const hoursAgo = (now - timeMs) / (1000 * 60 * 60);
      
      if (timeWindowHours > 0 && hoursAgo > timeWindowHours) return false;
      return true;
    }).map(a => ({
      lat: a.location.lat,
      lng: a.location.lng,
      id: a.id,
      data: a
    }));

    const clusters: Cluster[] = [];
    const assigned = new Set<string>();

    const densities = validPoints.map(p => {
      let count = 0;
      const neighbors: Point[] = [];
      validPoints.forEach(q => {
        if (calculateDistance(p.lat, p.lng, q.lat, q.lng) <= radius) {
          count++;
          neighbors.push(q);
        }
      });
      return { point: p, count, neighbors };
    });

    densities.sort((a, b) => b.count - a.count);

    let clusterId = 0;
    for (const item of densities) {
      if (assigned.has(item.point.id)) continue;
      
      const unassignedNeighbors = item.neighbors.filter(n => !assigned.has(n.id));
      
      if (unassignedNeighbors.length >= threshold) {
        let sumLat = 0;
        let sumLng = 0;
        unassignedNeighbors.forEach(n => {
          sumLat += n.lat;
          sumLng += n.lng;
          assigned.add(n.id);
        });
        
        const numPoints = unassignedNeighbors.length;
        const ratio = Math.min(numPoints / (threshold * 3), 1);
        
        clusters.push({
          id: `hotspot-${clusterId++}`,
          lat: sumLat / numPoints,
          lng: sumLng / numPoints,
          points: unassignedNeighbors,
          intensityScore: ratio,
          intensityLabel: numPoints >= threshold * 2 ? 'high-density' : 'hotspot',
        });
      }
    }

    return clusters;
  }, [alerts, radius, threshold, timeWindowHours]);

  return hotspots;
};
