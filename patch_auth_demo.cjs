const fs = require('fs');
const filePath = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetLogic = `  const signIn = async (userId: string, password: string, activeRole: string, extra?: any): Promise<boolean> => {
    let validLogin = false;
    
    if (isFirebaseConfigured && db) {`;

const fixedLogic = `  const signIn = async (userId: string, password: string, activeRole: string, extra?: any): Promise<boolean> => {
    let validLogin = false;
    
    // DEMO OVERRIDE
    if (userId.toLowerCase() === 'demo' && password === 'demo') {
        validLogin = true;
    }

    if (!validLogin && isFirebaseConfigured && db) {`;

content = content.replace(targetLogic, fixedLogic);

fs.writeFileSync(filePath, content);
console.log("Patched AuthContext with Demo override");
