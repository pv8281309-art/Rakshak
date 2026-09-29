const fs = require('fs');

const filePath = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target1 = `  isMock: boolean;
}`;
const replace1 = `  isMock: boolean;
  setSession: (session: any) => void;
}`;

content = content.replace(target1, replace1);

const target2 = `  isMock: false,
});`;
const replace2 = `  isMock: false,
  setSession: () => {},
});`;

content = content.replace(target2, replace2);

const target3 = `  const role = adminUser ? 'admin' : clientSession ? clientSession.role : null;

  return (
    <AuthContext.Provider value={{ currentUser, adminUser, clientSession, role, loading, signOut, isFirebaseConfigured, isMock }}>`;

const replace3 = `  const setSession = (session: any) => {
    setClientSession(session);
  };

  const role = adminUser ? 'admin' : clientSession ? clientSession.role : null;

  return (
    <AuthContext.Provider value={{ currentUser, adminUser, clientSession, role, loading, signOut, isFirebaseConfigured, isMock, setSession }}>`;

content = content.replace(target3, replace3);

fs.writeFileSync(filePath, content);
