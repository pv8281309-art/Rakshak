const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /const handleLogin = async \([\s\S]*?\] as const;/;
// Let's just find the start of handleLogin and the end of it.
const startStr = 'const handleLogin = async (e: React.FormEvent) => {';
const startIndex = content.indexOf(startStr);
if (startIndex !== -1) {
  // Find the end of handleLogin. It ends before `return (`
  const endIndex = content.indexOf('return (', startIndex);
  if (endIndex !== -1) {
    const fixedHandleLogin = `const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'admin') {
        // Master Admin Account
        if (email === 'pv8281309@gmail.com' && password === '@Std1352qpsb24') {
          if (typeof window !== 'undefined') (window as any).enableMockAdmin?.();
          navigate('/admin/dashboard');
          return;
        }
        
        // Demo Admin Account
        if (email === 'admin@rakshak.in' && password === 'admin123') {
          if (typeof window !== 'undefined') (window as any).enableMockAdmin?.();
          navigate('/admin/dashboard');
          return;
        }

        if (isFirebaseConfigured && auth) {
          try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin/dashboard');
          } catch (err: any) {
            console.error("Auth Error:", err);
            if (err.code === 'auth/invalid-credential' || err.message?.includes('invalid-credential')) {
              setError('Invalid email or password.');
            } else {
              setError('Login failed. Please check your credentials.');
            }
          }
        } else {
          setError('Invalid credentials.');
        }
      } 
      else if (activeTab === 'user' || activeTab === 'family' || activeTab === 'hospital') {
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
      }
    } catch (err: any) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  `;
    content = content.substring(0, startIndex) + fixedHandleLogin + content.substring(endIndex);
    fs.writeFileSync(filePath, content);
    console.log("Fixed handleLogin completely");
  }
}
