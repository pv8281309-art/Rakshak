const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const heroStart = content.indexOf('export const HeroSection = () => {');
const beforeHero = content.substring(0, heroStart);

const secondHeroStart = content.indexOf('export const HeroSection = () => {', heroStart + 1);

let restOfFile = '';
if (secondHeroStart !== -1) {
   const handleLoginEnd = content.indexOf('return (', secondHeroStart);
   restOfFile = content.substring(handleLoginEnd);
} else {
   const handleLoginEnd = content.indexOf('return (', heroStart);
   restOfFile = content.substring(handleLoginEnd);
}

const fixedHero = `export const HeroSection = () => {
  const navigate = useNavigate();
  const { isMock, setSession, signIn } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'admin' | 'user' | 'family' | 'hospital'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [carNumber, setCarNumber] = useState('');

  const tabs = [
    { id: 'admin', label: 'Admin' },
    { id: 'user', label: 'User' },
    { id: 'family', label: 'Family' },
    { id: 'hospital', label: 'Hospital' },
  ] as const;

  const handleLogin = async (e: React.FormEvent) => {
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

fs.writeFileSync(filePath, beforeHero + fixedHero + restOfFile);
console.log("Fixed HeroSection structure");
