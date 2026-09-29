const fs = require('fs');
let content = fs.readFileSync('src/components/map/HotspotLayer.tsx', 'utf8');

const hookImport = `import { useHotspotClustering, Cluster } from '../../hooks/useHotspotClustering';`;
content = content.replace("import React, { useMemo, useState } from 'react';", "import React, { useState } from 'react';\n" + hookImport);

// Remove local Point, Cluster, and findHotspots
content = content.replace(/interface Point \{[\s\S]*?interface Cluster \{[\s\S]*?export const findHotspots = \([\s\S]*?return clusters;\n};\n/m, '');

// Replace the useMemo inside HotspotLayer with the hook
const oldHotspotsLogic = `  const hotspots = useMemo(() => {
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

    return findHotspots(validPoints, radius, threshold);
  }, [alerts, radius, threshold, timeWindowHours]);`;

const newHotspotsLogic = `  const hotspots = useHotspotClustering(alerts, radius, threshold, timeWindowHours);`;

content = content.replace(oldHotspotsLogic, newHotspotsLogic);

// Replace the intensity ratio calculations with the ones provided by the hook
const oldIntensityLogic = `        const ratio = Math.min(cluster.points.length / (threshold * 3), 1); // Max out color at 3x threshold
        const intensity = cluster.points.length >= threshold * 2 ? 'high' : 'medium';
        
        let color = '#ef4444'; // Red for threshold reached
        let fillColor = '#ef4444';
        let fillOpacity = 0.4 + (ratio * 0.4);

        if (cluster.points.length >= threshold * 2) {
          color = '#b91c1c'; // Darker red for high density
          fillColor = '#b91c1c';
          fillOpacity = 0.6 + (ratio * 0.3);
        }`;

const newIntensityLogic = `        const ratio = cluster.intensityScore;
        const intensity = cluster.intensityLabel;
        
        let color = '#ef4444'; // Red for threshold reached
        let fillColor = '#ef4444';
        let fillOpacity = 0.4 + (ratio * 0.4);

        if (intensity === 'high-density') {
          color = '#b91c1c'; // Darker red for high density
          fillColor = '#b91c1c';
          fillOpacity = 0.6 + (ratio * 0.3);
        }`;

content = content.replace(oldIntensityLogic, newIntensityLogic);

// update intensity label in HTML
content = content.replace(/intensity === 'high' \? 'HIGH-DENSITY HOTSPOT' : 'HOTSPOT DETECTED'/g, "intensity === 'high-density' ? 'HIGH-DENSITY HOTSPOT' : 'HOTSPOT DETECTED'");


fs.writeFileSync('src/components/map/HotspotLayer.tsx', content);
