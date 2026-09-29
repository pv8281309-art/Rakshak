const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const oldTileLayer = `<TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="dark-map-tiles"
              />`;
const newTileLayerGeo = `<TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="dark-map-tiles"
              />
              {indiaGeoJSON && (
                <GeoJSON 
                  data={indiaGeoJSON} 
                  style={{ color: '#ef4444', weight: 2, fillOpacity: 0.0, fillColor: 'transparent' }} 
                />
              )}`;
              
content = content.replace(oldTileLayer, newTileLayerGeo);
fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
