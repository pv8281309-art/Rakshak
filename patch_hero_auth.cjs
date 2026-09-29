const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStart = `else if (activeTab === 'user' || activeTab === 'family' || activeTab === 'hospital') {`;
const targetEnd = `        }
        
        if (validLogin) {
          const session = { 
             role: activeTab, 
             id: userId, 
             ...(activeTab === 'family' && { car: carNumber }) 
           };
          localStorage.setItem('rakshak_user_session', JSON.stringify(session));
          setSession(session);
          navigate(\`/\${activeTab}/dashboard\`);
        } else {
          setError('Invalid credentials.');
        }
      }`;

const startIdx = content.indexOf(targetStart);
const endIdx = content.indexOf(targetEnd) + targetEnd.length;

if (startIdx !== -1 && endIdx !== -1) {
  const fixed = `else if (activeTab === 'user' || activeTab === 'family' || activeTab === 'hospital') {
        try {
          const result = await signIn(userId.trim(), password.trim(), activeTab, { carNumber });
          if (result && result.success) {
            if (result.requiresPasswordChange) {
              navigate('/user/change-password', { replace: true });
            } else {
              navigate(\`/\${activeTab}/dashboard\`);
            }
          }
        } catch (err: any) {
          setError(err.message || 'Invalid credentials or account disabled.');
        }
      }`;
  content = content.substring(0, startIdx) + fixed + content.substring(endIdx);
  fs.writeFileSync(filePath, content);
  console.log("Patched HeroSection login block successfully");
} else {
  console.log("Failed to find block boundaries");
}
