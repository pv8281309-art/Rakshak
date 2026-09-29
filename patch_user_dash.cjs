const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

const triggerSOSRegex = /const triggerSOS = async \(\) => \{[\s\S]*?lastSosTrigger: new Date\(\)\.toISOString\(\)\s*\}\);\s*\} catch\(e\)\s*\{\s*\}\s*\}/m;

const triggerSOSReplacement = `const triggerSOS = async () => {
    if (userData?.status === 'emergency' || userData?.status === 'responding') {
       return;
    }

    const fireSos = async (lat: number, lng: number) => {
      if (isFirebaseConfigured && db && userData && userData.id) {
        try {
          const sosId = \`SOS-\${Math.floor(1000 + Math.random() * 9000)}\`;
          
          const newSOS = {
            id: sosId,
            customerId: userData.customerId,
            user: userData.name,
            vehicle: userData.vehicle?.regNo || 'Unknown',
            mobile: userData.emergencyContacts?.[0]?.mobile || 'Unknown',
            type: 'Manual Panic (User Dash)',
            severity: 'critical',
            loc: 'Live User GPS Location',
            lat: lat,
            lng: lng,
            status: 'new',
            timestamp: Date.now(),
            createdAt: serverTimestamp()
          };

          await setDoc(doc(db, 'sos_alerts', sosId), newSOS);
          
          await updateDoc(doc(db, 'customers', userData.id), {
            status: 'emergency',
            lastSosTrigger: new Date().toISOString()
          });
        } catch(e) {
            console.error("SOS Trigger Error", e);
        }
      }
    };

    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => fireSos(pos.coords.latitude, pos.coords.longitude),
         (err) => fireSos(28.6139, 77.2090) // Fallback if denied
       );
    } else {
       fireSos(28.6139, 77.2090);
    }
  };`;

content = content.replace(triggerSOSRegex, triggerSOSReplacement);
fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
