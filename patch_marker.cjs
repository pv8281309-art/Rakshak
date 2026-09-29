const fs = require('fs');
let content = fs.readFileSync('src/components/map/EmergencyMarker.tsx', 'utf8');

const oldHtml = `const activePulseHtml = \`
<div style="position: relative; width: 24px; height: 24px;">
  <div class="animate-ping" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #ef4444; border-radius: 50%; opacity: 0.8;"></div>
  <div style="position: relative; width: 24px; height: 24px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.9);"></div>
</div>
\`;`;

const newHtml = `const activePulseHtml = \`
<div class="hover:scale-[1.3] transition-transform duration-300 ease-in-out origin-center" style="position: relative; width: 24px; height: 24px;">
  <div class="animate-ping" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #ef4444; border-radius: 50%; opacity: 0.8;"></div>
  <div style="position: relative; width: 24px; height: 24px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.9);"></div>
</div>
\`;`;

content = content.replace(oldHtml, newHtml);
fs.writeFileSync('src/components/map/EmergencyMarker.tsx', content);
