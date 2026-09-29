const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

if (!content.includes('MapContainer')) {
   content = content.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';\nimport L from 'leaflet';\nimport 'leaflet/dist/leaflet.css';\n");

   const amboIcon = `
// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const amboIcon = new L.DivIcon({
  className: 'custom-leaflet-icon',
  html: '<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(239, 68, 68, 0.8); animation: pulse 1s infinite;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});
`;
   content = content.replace("export default function UserDashboard() {", amboIcon + "\nexport default function UserDashboard() {");

   const mapStr = `
             <div className="absolute inset-0 bg-[#0B1120]">
                {/* Fake Map UI */}
   `;
   
   const newMapStr = `
             <div className="absolute inset-0 bg-[#0B1120] z-0">
                {isEmergencyActive ? (
                   <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '100%', width: '100%', background: '#020617' }}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                      <Marker position={[28.6139, 77.2090]} icon={amboIcon}>
                        <Popup>Ambulance En Route</Popup>
                      </Marker>
                   </MapContainer>
                ) : (
                   <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '100%', width: '100%', background: '#020617' }}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                   </MapContainer>
                )}
   `;
   
   content = content.replace(mapStr, newMapStr);
   
   fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
}
