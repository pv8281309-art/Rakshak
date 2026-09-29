const fs = require('fs');

const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target1 = `          localStorage.setItem('rakshak_user_session', JSON.stringify({ role: 'user', id: userId }));
          navigate('/user/dashboard');`;
const replace1 = `          const session = { role: 'user', id: userId };
          localStorage.setItem('rakshak_user_session', JSON.stringify(session));
          setSession(session);
          navigate('/user/dashboard');`;

content = content.replace(target1, replace1);

const target2 = `            localStorage.setItem('rakshak_user_session', JSON.stringify({ role: 'family', id: userId, car: carNumber }));
            navigate('/family/dashboard');`;
const replace2 = `            const session = { role: 'family', id: userId, car: carNumber };
            localStorage.setItem('rakshak_user_session', JSON.stringify(session));
            setSession(session);
            navigate('/family/dashboard');`;

content = content.replace(target2, replace2);

const target3 = `        if (userId === 'HOSP-001' && password === 'admin123') {
          localStorage.setItem('rakshak_user_session', JSON.stringify({ role: 'hospital', id: userId }));
          navigate('/hospital/dashboard');`;
const replace3 = `        if (userId === 'HOSP-001' && password === 'admin123') {
          const session = { role: 'hospital', id: userId };
          localStorage.setItem('rakshak_user_session', JSON.stringify(session));
          setSession(session);
          navigate('/hospital/dashboard');`;

content = content.replace(target3, replace3);

const hookTarget = `  const { login } = useAuth(); // if you had login logic`;
const hookReplace = `  const { login, setSession } = useAuth(); // if you had login logic`;

content = content.replace(hookTarget, hookReplace);

// if not found, we just append setSession to useAuth()
if (!content.includes('setSession')) {
   content = content.replace(`const { auth, isFirebaseConfigured } = useAuth();`, `const { auth, isFirebaseConfigured, setSession } = useAuth();`);
   // or if not there:
   content = content.replace(`const { isFirebaseConfigured } = useAuth();`, `const { isFirebaseConfigured, setSession } = useAuth();`);
}

fs.writeFileSync(filePath, content);
