const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

// 1. Import HotspotControls and HotspotLayer
content = content.replace("import { D3HeatLayer } from '../../components/map/D3HeatLayer';",
  "import { HotspotLayer } from '../../components/map/HotspotLayer';\nimport { HotspotControls, HotspotSettings } from '../../components/admin/HotspotControls';");

// 2. Add Settings state to LiveMonitoring component
const oldStates = `  const [activeLayer, setActiveLayer] = useState<keyof typeof mapLayers>('dark');
  const [filterMode, setFilterMode] = useState<'all' | 'alerts'>('all');
  const [indiaGeoJSON, setIndiaGeoJSON] = useState<any>(null);`;

const newStates = `  const [activeLayer, setActiveLayer] = useState<keyof typeof mapLayers>('dark');
  const [filterMode, setFilterMode] = useState<'all' | 'alerts'>('all');
  const [indiaGeoJSON, setIndiaGeoJSON] = useState<any>(null);
  
  const [hotspotSettings, setHotspotSettings] = useState<HotspotSettings>({
    threshold: 10,
    radius: 500,
    timeWindowHours: 720, // 30 days
    showHeatmap: true,
    showLiveSOS: true,
  });`;

content = content.replace(oldStates, newStates);

// 3. Add HotspotControls next to the Map Layer button
const oldControls = `<div className="flex gap-2 relative">
          <button 
            onClick={() => setFilterMode(filterMode === 'all' ? 'alerts' : 'all')}`;
const newControls = `<div className="flex gap-2 relative">
          <HotspotControls settings={hotspotSettings} onChange={setHotspotSettings} />
          <button 
            onClick={() => setFilterMode(filterMode === 'all' ? 'alerts' : 'all')}`;
content = content.replace(oldControls, newControls);

// 4. Update MapContainer layers based on settings
const oldMapLayers = `<TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={mapLayers[activeLayer].url}
                className={mapLayers[activeLayer].cls}
              />
              <D3HeatLayer />
              {indiaGeoJSON && (
                <GeoJSON 
                  data={indiaGeoJSON} 
                  style={{ color: '#ef4444', weight: 2, fillOpacity: 0.0, fillColor: 'transparent' }} 
                />
              )}
              {filteredVehicles.map((v) => (`;

const newMapLayers = `<TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={mapLayers[activeLayer].url}
                className={mapLayers[activeLayer].cls}
              />
              {hotspotSettings.showHeatmap && (
                <HotspotLayer 
                  alerts={realAlerts} 
                  radius={hotspotSettings.radius} 
                  threshold={hotspotSettings.threshold} 
                  timeWindowHours={hotspotSettings.timeWindowHours} 
                />
              )}
              {indiaGeoJSON && (
                <GeoJSON 
                  data={indiaGeoJSON} 
                  style={{ color: '#ef4444', weight: 2, fillOpacity: 0.0, fillColor: 'transparent' }} 
                />
              )}
              {hotspotSettings.showLiveSOS && filteredVehicles.map((v) => (`;
              
content = content.replace(oldMapLayers, newMapLayers);

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
