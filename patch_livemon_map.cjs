const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

// 1. Add useMap
content = content.replace("import { MapContainer, TileLayer, Popup, GeoJSON } from 'react-leaflet';",
  "import { MapContainer, TileLayer, Popup, GeoJSON, useMap } from 'react-leaflet';");

// 2. Filter out resolved alerts and only show SOS
const oldDisplay = `  const displayVehicles = [
    ...realAlerts.filter(a => a.location?.lat && a.location?.lng).map(a => ({
      id: a.id,
      lat: a.location.lat,
      lng: a.location.lng,
      status: a.status === 'resolved' ? 'safe' : 'sos',
      speed: 0,
      loc: a.address || 'Unknown Location',
      userId: a.userId,
      contact: a.mobile || a.contactNumber || 'N/A',
      timestamp: a.createdAt || a.timestamp || null,
      reporterId: a.userId || a.user || 'Unknown'
    }))
  ];`;
  
const newDisplay = `  const displayVehicles = realAlerts
    .filter(a => a.location?.lat && a.location?.lng && a.status !== 'resolved')
    .map(a => ({
      id: a.id,
      lat: a.location.lat,
      lng: a.location.lng,
      status: 'sos',
      speed: 0,
      loc: a.address || 'Unknown Location',
      userId: a.userId,
      contact: a.mobile || a.contactNumber || 'N/A',
      timestamp: a.createdAt || a.timestamp || null,
      reporterId: a.userId || a.user || 'Unknown'
    }));`;
content = content.replace(oldDisplay, newDisplay);

// 3. Add MapController component inside the file
const mapControllerCode = `
// Auto-pan and zoom controller
const MapController = ({ geojson }: { geojson: any }) => {
  const map = useMap();
  useEffect(() => {
    if (geojson) {
      const bounds = L.geoJSON(geojson).getBounds();
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      map.setView([22.5937, 78.9629], 5); // Fallback to center of India
    }
  }, [geojson, map]);
  return null;
};
`;
// Insert before LiveMonitoring component
content = content.replace("const LiveMonitoring = () => {", mapControllerCode + "\nconst LiveMonitoring = () => {");

// 4. Inject MapController into MapContainer
const mapContainerStart = `<MapContainer 
              center={[22.5937, 78.9629]} // Center of India
              zoom={5} 
              className="w-full h-full"
              zoomControl={false}
            >`;
const mapContainerWithController = `<MapContainer 
              center={[22.5937, 78.9629]}
              zoom={5} 
              className="w-full h-full"
              zoomControl={false}
            >
              <MapController geojson={indiaGeoJSON} />`;
content = content.replace(mapContainerStart, mapContainerWithController);

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
