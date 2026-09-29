const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const oldStr = `            {filterMode === 'alerts' ? <AlertTriangle size={16} />
              {indiaGeoJSON && (
                <GeoJSON 
                  data={indiaGeoJSON} 
                  style={{ color: '#ef4444', weight: 2, fillOpacity: 0.02, fillColor: '#ef4444' }} 
                />
              )} : <Filter size={16} />}`;
const newStr = `            {filterMode === 'alerts' ? <AlertTriangle size={16} /> : <Filter size={16} />}`;
content = content.replace(oldStr, newStr);

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
