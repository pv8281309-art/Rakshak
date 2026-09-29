const fs = require('fs');
const filePath = 'src/lib/firebase.ts';
let content = fs.readFileSync(filePath, 'utf8');

const target = `export const db = app ? getFirestore(app) : null;`;
const fixed = `export const db = app ? getFirestore(app, "ai-studio-8461df94-4cda-4418-a901-1f7ca7c273f3") : null;`;

content = content.replace(target, fixed);
fs.writeFileSync(filePath, content);
console.log("Patched firebase.ts with explicit databaseId");
