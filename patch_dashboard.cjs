const fs = require('fs');
const filePath = 'src/pages/admin/Dashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetEffect = `  useEffect(() => {
    const fetchData = async () => {
      // Simulate network delay for initial fetch
      await new Promise(resolve => setTimeout(resolve, 1500));
      setKpiData(defaultKpiData);
      setActivityData(defaultActivityData);
      setLoading(false);
    };
    fetchData();
  }, []);`;

const fixedEffect = `  useEffect(() => {
    let unsubscribe: any = null;
    const fetchData = async () => {
      // Simulate network delay for initial fetch
      await new Promise(resolve => setTimeout(resolve, 1500));
      setKpiData(defaultKpiData);
      
      // Hook up Firebase for real-time dashboard alerts
      import('../../lib/firebase').then(({ db, isFirebaseConfigured }) => {
         if (isFirebaseConfigured && db) {
            const { collection, onSnapshot, query } = require('firebase/firestore');
            // Using a simple query without orderBy to avoid index issues
            const q = query(collection(db, 'sos_alerts'));
            unsubscribe = onSnapshot(q, (snap) => {
               const alerts = snap.docs.map(d => ({id: d.id, ...d.data()}));
               // sort descending
               alerts.sort((a: any, b: any) => {
                 const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.timestamp || 0);
                 const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.timestamp || 0);
                 return tB - tA;
               });
               
               // Take top 4 recent
               const recent = alerts.slice(0, 4).map((a: any) => ({
                  id: a.id,
                  type: 'sos',
                  msg: a.type || 'Manual Panic',
                  loc: a.loc || 'Unknown',
                  time: 'Just now',
                  status: a.status
               }));
               
               if (recent.length > 0) {
                 // Merge with defaults for missing slots
                 const merged = [...recent];
                 let i = 0;
                 while(merged.length < 4 && i < defaultActivityData.length) {
                    merged.push(defaultActivityData[i]);
                    i++;
                 }
                 setActivityData(merged);
               } else {
                 setActivityData(defaultActivityData);
               }
            });
         } else {
            setActivityData(defaultActivityData);
         }
      });
      setLoading(false);
    };
    fetchData();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);`;

if(content.includes(targetEffect)) {
  content = content.replace(targetEffect, fixedEffect);
  fs.writeFileSync(filePath, content);
  console.log("Patched Dashboard successfully");
} else {
  console.log("Target string not found in Dashboard");
}
