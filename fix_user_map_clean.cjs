const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

// Imports
content = content.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';\nimport L from 'leaflet';\nimport 'leaflet/dist/leaflet.css';\n");

// Ambo Icon
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

// Replace fake map
const fakeMapStart = '{/* Fake Map UI */}';
const fakeMapEnd = '{/* Action Strip */}';

const fakeMapIndex = content.indexOf(fakeMapStart);
const actionStripIndex = content.indexOf(fakeMapEnd);

if (fakeMapIndex !== -1 && actionStripIndex !== -1) {
  const before = content.substring(0, fakeMapIndex);
  // Need to find the end of the fake map div. The fake map is wrapped in:
  // <div className="flex-1 min-h-[400px] bg-[#020617] border-slate-800 rounded-2xl border overflow-hidden relative shadow-2xl transition-colors duration-500">
  // { /* Fake Map UI */ }
  // ...
  // </div>
  // {/* Action Strip */}
  // The '</div>' right before Action Strip is closing the flex-1 div, but actually it's closing the fake map UI! Wait, no.
  // The structure is:
  // <div className="flex-1...">
  //   {/* Fake Map UI */}
  //   <div className="absolute inset-0 bg-[#0B1120]">
  //     ...
  //   </div>
  // </div>
  // {/* Action Strip */}
  
  // Actually, I can just slice the substring accurately.
  
  const mapStr = `{/* Leaflet Map UI */}
             <div className="absolute inset-0 bg-[#020617] z-0">
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
                <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none z-[1000]">
                   <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 text-xs font-medium text-slate-300 shadow-lg">
                     Last updated: Just now
                   </div>
                   <div className={\`px-4 py-2 \${isEmergencyActive ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'} backdrop-blur-md rounded-xl border text-xs font-bold shadow-lg uppercase tracking-wider\`}>
                     {isEmergencyActive ? 'EMERGENCY MODE' : 'Tracking Active'}
                   </div>
                </div>
             </div>
          </div>
          `;
          
  // Find the exact slice:
  // From fakeMapStart to actionStripIndex. But actionStripIndex is prefixed by `</div>`.
  // Let's just find the `</div>` that precedes actionStripIndex.
  const partBeforeAction = content.substring(0, actionStripIndex);
  let divCount = 0;
  // I will just replace `content` directly.
  content = content.replace(/\{\/\* Fake Map UI \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Action Strip \*\/\}/, mapStr + '\n          {/* Action Strip */}');
  
  fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
  console.log("Replaced cleanly.");
} else {
  console.log("Indexes not found");
}
