const fs = require('fs');

// 1. Update App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  '<Route path="/admin/incidents" element={<AlertsSOS />} />',
  '<Route path="/admin/sos-notifications" element={<AlertsSOS />} />'
);
fs.writeFileSync('src/App.tsx', app);

// 2. Update AdminLayout.tsx
let layout = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf8');

// Change Sidebar Name
layout = layout.replace(
  "{ name: 'Incidents', path: '/admin/incidents', icon: AlertTriangle }",
  "{ name: 'SOS Notifications', path: '/admin/sos-notifications', icon: AlertTriangle }"
);
layout = layout.replace(
  "{item.name === 'Incidents' && sosCount > 0 && (",
  "{item.name === 'SOS Notifications' && sosCount > 0 && ("
);
layout = layout.replace(
  "{item.name === 'Incidents' && sosCount === 0 && (",
  "{item.name === 'SOS Notifications' && sosCount === 0 && ("
);

// Add Global Banner/Popup if there is an active SOS
const mainContentTarget = `<main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0A1122] p-4 sm:p-6 lg:p-8">`;
const mainContentReplacement = `<main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0A1122] p-4 sm:p-6 lg:p-8 relative">
          
          {/* GLOBAL SOS NOTIFICATION BANNER */}
          {sosCount > 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-top-4">
              <div className="bg-rakshak-red border-2 border-red-400 text-white p-4 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.5)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50"></span>
                    <AlertTriangle size={32} className="relative z-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider">Emergency SOS Received</h3>
                    <p className="text-sm text-red-100 font-medium">{sosCount} Active Request(s) Require Immediate Dispatch</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/admin/sos-notifications')}
                  className="bg-white text-rakshak-red px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-red-50 transition-colors"
                >
                  VIEW ALERTS
                </button>
              </div>
            </div>
          )}
`;
layout = layout.replace(mainContentTarget, mainContentReplacement);

fs.writeFileSync('src/layouts/AdminLayout.tsx', layout);
