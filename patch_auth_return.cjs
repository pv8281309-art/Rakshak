const fs = require('fs');
const filePath = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const fixed = `  const signIn = async (userId: string, password: string, activeRole: string, extra?: any): Promise<{success: boolean, requiresPasswordChange?: boolean}> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      if (data.success) {
        const session = { 
           role: activeRole, 
           id: userId,
           requiresPasswordChange: data.user.requiresPasswordChange,
          ...(activeRole === 'family' && extra?.carNumber ? { car: extra.carNumber.toUpperCase() } : {})
        };
        localStorage.setItem('rakshak_user_session', JSON.stringify(session));
        setClientSession(session);
        return { success: true, requiresPasswordChange: data.user.requiresPasswordChange };
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
    return { success: false };
  };`;

const regex = /const signIn = async \([\s\S]*?return false;\s*\n\s*};/;
content = content.replace(regex, fixed);
fs.writeFileSync(filePath, content);
console.log("Patched signIn logic for return object");
