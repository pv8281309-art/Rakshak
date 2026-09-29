const fs = require('fs');

const filePath = 'src/pages/LandingPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const importReplacement = `import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';`;

content = content.replace(`import React from 'react';`, importReplacement);

const componentStart = `export default function LandingPage() {
  const { isDark } = useTheme();
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && role) {
      navigate(\`/\${role}/dashboard\`);
    }
  }, [role, loading, navigate]);

  if (loading || role) {
     return null; // or a spinner
  }`;

content = content.replace(`export default function LandingPage() {\n  const { isDark } = useTheme();`, componentStart);

fs.writeFileSync(filePath, content);
