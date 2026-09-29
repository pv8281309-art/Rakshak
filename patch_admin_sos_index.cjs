const fs = require('fs');
const filePath = 'src/pages/admin/AlertsSOS.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `      const q = query(collection(db, 'sos_alerts'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {`;

const fixedStr = `      // Bypass orderBy index missing issue by fetching all and sorting client-side
      const q = query(collection(db, 'sos_alerts'));
      unsubscribe = onSnapshot(q, (snapshot) => {`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, fixedStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched AlertsSOS onSnapshot index issue");
} else {
  console.log("Target string not found, it might already be patched.");
}
