import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const activePulseHtml = `
<div class="hover:scale-[1.3] transition-transform duration-300 ease-in-out origin-center" style="position: relative; width: 24px; height: 24px;">
  <div class="animate-ping" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #ef4444; border-radius: 50%; opacity: 0.8;"></div>
  <div style="position: relative; width: 24px; height: 24px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.9);"></div>
</div>
`;

const resolvedHtml = `
<div style="position: relative; width: 16px; height: 16px;">
  <div style="width: 16px; height: 16px; background-color: #10b981; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);"></div>
</div>
`;

const warningHtml = `
<div style="position: relative; width: 18px; height: 18px;">
  <div style="width: 18px; height: 18px; background-color: #f97316; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(249, 115, 22, 0.8);"></div>
</div>
`;

export const sosIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: activePulseHtml,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export const safeIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: resolvedHtml,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export const warningIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: warningHtml,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

interface EmergencyMarkerProps {
  position: [number, number];
  status: 'active' | 'resolved' | 'warning' | 'sos' | 'safe';
  children?: React.ReactNode;
  onClick?: () => void;
}

export const EmergencyMarker: React.FC<EmergencyMarkerProps> = ({ position, status, children, onClick }) => {
  let icon = safeIcon;
  if (status === 'active' || status === 'sos') {
    icon = sosIcon;
  } else if (status === 'warning') {
    icon = warningIcon;
  }

  return (
    <Marker position={position} icon={icon} eventHandlers={onClick ? { click: onClick } : undefined}>
      {children}
    </Marker>
  );
};
