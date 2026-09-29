const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

// 1. Import D3HeatLayer
content = content.replace("import { EmergencyMarker } from '../../components/map/EmergencyMarker';",
  "import { EmergencyMarker } from '../../components/map/EmergencyMarker';\nimport { D3HeatLayer } from '../../components/map/D3HeatLayer';");

// 2. Add D3HeatLayer component to MapContainer
const oldMapContainer = `<MapContainer 
              center={[22.5937, 78.9629]}
              zoom={5} 
              className="w-full h-full"
              zoomControl={false}
            >
              <MapController geojson={indiaGeoJSON} />
              <TileLayer`;

const newMapContainer = `<MapContainer 
              center={[22.5937, 78.9629]}
              zoom={5} 
              className="w-full h-full"
              zoomControl={false}
            >
              <MapController geojson={indiaGeoJSON} />
              <D3HeatLayer />
              <TileLayer`;

content = content.replace(oldMapContainer, newMapContainer);

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
