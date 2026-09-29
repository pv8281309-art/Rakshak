const fs = require('fs');

const files = [
  'src/pages/admin/AlertsSOS.tsx',
  'src/pages/admin/AmbulanceTracking.tsx',
  'src/pages/user/UserDashboard.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace Carto CDN URLs with OSM + class
    content = content.replace(/url="https:\/\/\{s\}\.basemaps\.cartocdn\.com\/dark_all\/\{z\}\/\{x\}\/\{y\}\{r\}\.png"/g, 
      'url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="dark-map-tiles"');
      
    fs.writeFileSync(file, content);
  }
});
