const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "const matchingDoc = querySnapshot.docs.find(doc => doc.data().customerId === userId);",
  "const matchingDoc = querySnapshot.docs.find(doc => doc.data().customerId === userId.trim());"
);

content = content.replace(
  "if (customerDoc.password === password) {",
  "if (customerDoc.password === password.trim()) {"
);

fs.writeFileSync(filePath, content);
console.log("Patched HeroSection.tsx with trim()");
