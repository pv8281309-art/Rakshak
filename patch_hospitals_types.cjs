const fs = require('fs');
let content = fs.readFileSync('src/pages/user/NearbyHospitals.tsx', 'utf8');

content = content.replace(
  "const { Place } = await window.google.maps.importLibrary(\"places\") as google.maps.PlacesLibrary;",
  "const { Place } = await (window as any).google.maps.importLibrary(\"places\");"
);

content = content.replace("if (!window.google || !window.google.maps) {", "if (!(window as any).google || !(window as any).google.maps) {");

fs.writeFileSync('src/pages/user/NearbyHospitals.tsx', content);
