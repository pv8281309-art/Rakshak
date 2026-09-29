const fs = require('fs');
const filePath = 'src/pages/admin/Dashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// I need to add the imports at the top
if (!content.includes("import { collection, onSnapshot, query } from 'firebase/firestore';")) {
  content = content.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { db, isFirebaseConfigured } from '../../lib/firebase';\nimport { collection, onSnapshot, query } from 'firebase/firestore';");
}

const badRequireStr = `      // Hook up Firebase for real-time dashboard alerts
      import('../../lib/firebase').then(({ db, isFirebaseConfigured }) => {
         if (isFirebaseConfigured && db) {
            const { collection, onSnapshot, query } = require('firebase/firestore');`;

const goodStr = `      // Hook up Firebase for real-time dashboard alerts
         if (isFirebaseConfigured && db) {`;

if (content.includes(badRequireStr)) {
  content = content.replace(badRequireStr, goodStr);
  
  // also need to clean up the closing brace of the dynamic import
  const badCloseStr = `         } else {
            setActivityData(defaultActivityData);
         }
      });
      setLoading(false);`;
      
  const goodCloseStr = `         } else {
            setActivityData(defaultActivityData);
         }
      setLoading(false);`;
      
  content = content.replace(badCloseStr, goodCloseStr);
  fs.writeFileSync(filePath, content);
  console.log("Fixed Require in Dashboard");
} else {
  console.log("No bad require found");
}
