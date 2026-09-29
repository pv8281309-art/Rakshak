const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AlertsSOS.tsx', 'utf8');

content = content.replace("import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';", "import { MapContainer, TileLayer } from 'react-leaflet';\nimport { EmergencyMarker } from '../../components/map/EmergencyMarker';");

const iconRegex = /delete \(L\.Icon\.Default\.prototype as any\)\._getIconUrl;[\s\S]*?iconAnchor: \[8, 8\]\n\}\);\n/g;
content = content.replace(iconRegex, "");

const markerRegex = /<Marker position=\{\[activeMapAlert\.lat, activeMapAlert\.lng\]\} icon=\{activeMapAlert\.status === 'resolved' \? safeIcon : sosIcon\}>\n\s*<\/Marker>/;
content = content.replace(markerRegex, `<EmergencyMarker position={[activeMapAlert.lat, activeMapAlert.lng]} status={activeMapAlert.status === 'resolved' ? 'resolved' : 'sos'} />`);

fs.writeFileSync('src/pages/admin/AlertsSOS.tsx', content);
