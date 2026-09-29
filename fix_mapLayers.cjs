const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const oldMapLayers = `const mapLayers = {
  dark: { name: 'Dark Theme', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  street: { name: 'Street View', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
  satellite: { name: 'Satellite View', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' }
};`;

const newMapLayers = `const mapLayers = {
  dark: { name: 'Dark Theme', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', cls: 'dark-map-tiles' },
  street: { name: 'Street View', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', cls: '' },
  satellite: { name: 'Satellite View', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', cls: '' }
};`;

content = content.replace(oldMapLayers, newMapLayers);

const oldTileLayerGeo = `<TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="dark-map-tiles"
              />`;

const newTileLayerGeo = `<TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={mapLayers[activeLayer].url}
                className={mapLayers[activeLayer].cls}
              />`;

content = content.replace(oldTileLayerGeo, newTileLayerGeo);

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
