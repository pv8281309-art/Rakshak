const fs = require('fs');

let hero = fs.readFileSync('src/components/landing/HeroSection.tsx', 'utf8');

// Replace imports
hero = hero.replace(
  `import { AdminLoginCard } from './AdminLoginCard';`,
  `import { useNavigate } from 'react-router-dom';\nimport { useAuth } from '../../contexts/AuthContext';\nimport { signInWithEmailAndPassword } from 'firebase/auth';\nimport { auth, isFirebaseConfigured } from '../../lib/firebase';\nimport { AnimatePresence } from 'framer-motion';`
);

hero = hero.replace(
  `import { Shield, AlertTriangle, Users, BarChart3, ChevronRight } from 'lucide-react';`,
  `import { Shield, AlertTriangle, Users, BarChart3, ChevronRight, Mail, Fingerprint, Lock, Eye, EyeOff, Car, ArrowRight } from 'lucide-react';`
);

// We already injected the handleLogin code inside HeroSection in the previous step! Let's check it.
