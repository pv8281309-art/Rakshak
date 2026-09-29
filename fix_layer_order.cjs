const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

content = content.replace("<D3HeatLayer />\n              <TileLayer", "<TileLayer");
content = content.replace("className={mapLayers[activeLayer].cls}\n              />", "className={mapLayers[activeLayer].cls}\n              />\n              <D3HeatLayer />");

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
