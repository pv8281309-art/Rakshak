const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AlertsSOS.tsx', 'utf8');

// 1. Add imports at the top
const imports = `import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';`;
content = content.replace("import React, { useState, useEffect } from 'react';", imports);

// 2. Add icon definitions right before `const AlertsSOS = () => {`
const icons = `
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const sosIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: \`<div class="animate-ping" style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);"></div>\`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const safeIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: \`<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);"></div>\`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});
`;
content = content.replace("const AlertsSOS = () => {", icons + "\nconst AlertsSOS = () => {");

// 3. Replace iframe with MapContainer
const mapAreaRegex = /<iframe[\s\S]*?><\/iframe>/;
const newMapArea = `
<MapContainer
  center={[activeMapAlert.lat, activeMapAlert.lng]}
  zoom={16}
  className="w-full h-full z-0"
  zoomControl={false}
>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  />
  <Marker position={[activeMapAlert.lat, activeMapAlert.lng]} icon={activeMapAlert.status === 'resolved' ? safeIcon : sosIcon}>
  </Marker>
</MapContainer>
`;
content = content.replace(mapAreaRegex, newMapArea);

fs.writeFileSync('src/pages/admin/AlertsSOS.tsx', content);
